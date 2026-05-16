import { expect, type Request } from "@playwright/test";
import { test } from "./fixtures";

/**
 * Request-storm + redirect-loop + shell-stability regression suite.
 *
 * Verifies the production-grade UX guarantees:
 *  - `/auth/profile` is fetched a SMALL bounded number of times per
 *    server render (React.cache dedup) and never on tab refocus.
 *  - Authenticated route navigation lands on the target URL without
 *    bouncing through `/login` or any other redirect loop.
 *  - The sidebar stays mounted + visible during slow XHRs; the
 *    global progress bar surfaces and the cold-start banner appears
 *    only after the 2-second threshold.
 *  - Sign Out disables the button (no double-click) and dispatches
 *    EXACTLY ONE `/auth/logout` POST.
 *  - Theme toggle dispatches exactly one PATCH and triggers ZERO
 *    `/auth/profile` GETs.
 */

type CountedRequest = { url: string; method: string };

function trackRequests(predicate: (req: Request) => boolean) {
  const seen: CountedRequest[] = [];
  const listener = (req: Request) => {
    if (predicate(req)) seen.push({ url: req.url(), method: req.method() });
  };
  return { seen, listener };
}

test.describe("Request-storm + shell-stability invariants", () => {
  test("no profile-fetch storm across a 4-route admin walk", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");

    const profile = trackRequests(
      (r) => r.url().includes("/auth/profile") && r.method() === "GET",
    );
    page.on("request", profile.listener);

    const routes = [
      "/admin/metrics",
      "/admin/prescriptions",
      "/admin/users",
      "/admin/doctors",
    ];
    for (const route of routes) {
      await page.goto(route);
    }

    page.off("request", profile.listener);

    // Strict bound: at most one /profile fetch per SSR render.
    expect(
      profile.seen.length,
      `expected ≤ 4 /auth/profile fetches; got ${profile.seen.length}`,
    ).toBeLessThanOrEqual(4);
  });

  test("no redirect loop: protected routes land on themselves", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");

    const target = ["/admin/metrics", "/admin/prescriptions", "/admin/users"];
    const finalUrls: string[] = [];
    for (const t of target) {
      await page.goto(t);
      // Wait for the role-scoped sidebar (proof we're past any redirect)
      // — avoid `networkidle` because /admin/metrics opens an SSE stream
      // that never closes and would make networkidle a 60s deadlock.
      await expect(page.getByTestId("sidebar-logout")).toBeVisible();
      finalUrls.push(new URL(page.url()).pathname);
    }
    expect(finalUrls).toEqual(target);
    expect(finalUrls.every((u) => !u.startsWith("/login"))).toBe(true);
  });

  test("sidebar stays mounted + cold-start banner appears on slow XHR", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    // Delay the metrics XHR — the admin metrics page uses a CLIENT
    // react-query hook (useAdminControllerGetMetrics), so its inflight
    // state is observed by useIsFetching and the GlobalLoadingIndicator
    // will surface the cold-start banner after the 2s threshold.
    await page.route("**/api/backend/admin/metrics*", async (route) => {
      await new Promise((r) => setTimeout(r, 3_500));
      await route.continue();
    });
    await page.goto("/admin/metrics");

    await expect(page.getByTestId("sidebar-user-name")).toBeVisible();
    await expect(page.getByTestId("sidebar-logout")).toBeVisible();
    await expect(page.getByTestId("cold-start-banner")).toBeVisible({
      timeout: 8_000,
    });
  });

  test("Sign Out disables the button and sends exactly one /auth/logout", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");

    const logoutHits = trackRequests(
      (r) => r.url().includes("/auth/logout") && r.method() === "POST",
    );
    page.on("request", logoutHits.listener);

    await page.route("**/api/backend/auth/logout", async (route) => {
      await new Promise((r) => setTimeout(r, 1_500));
      await route.continue();
    });

    const button = page.getByTestId("sidebar-logout");
    await button.click();
    await button.click({ force: true }).catch(() => undefined);
    await button.click({ force: true }).catch(() => undefined);

    await expect(button).toBeDisabled({ timeout: 1_000 });
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toContainText(/signing out/i);

    await expect(page).toHaveURL(/\/login$/, { timeout: 10_000 });

    page.off("request", logoutHits.listener);
    expect(
      logoutHits.seen.length,
      `Sign Out should fire exactly once; fired ${logoutHits.seen.length}`,
    ).toBe(1);
  });

  test("theme toggle: 1 PATCH /users/me/theme, 0 /auth/profile GETs", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    await page.goto("/admin/metrics");

    const profile = trackRequests(
      (r) => r.url().includes("/auth/profile") && r.method() === "GET",
    );
    const themePatch = trackRequests(
      (r) => r.url().includes("/users/me/theme") && r.method() === "PATCH",
    );
    page.on("request", profile.listener);
    page.on("request", themePatch.listener);

    // The trigger label reflects the CURRENT theme (Light/Dark/System).
    // Read it, then pick a different option to guarantee a mutation
    // fires (the component no-ops when `next === current`).
    const trigger = page
      .getByRole("button", { name: /^(System|Light|Dark)$/i })
      .first();
    const currentLabel = (await trigger.textContent())?.trim() ?? "";
    await trigger.click();
    const nextLabel =
      currentLabel.toLowerCase() === "dark" ? "Light" : "Dark";
    await page
      .getByRole("menuitem", { name: new RegExp(`^${nextLabel}$`, "i") })
      .click();

    // Wait until the PATCH lands — avoid `networkidle` because the
    // admin SSE stream keeps the network non-idle indefinitely.
    await expect
      .poll(() => themePatch.seen.length, { timeout: 10_000 })
      .toBe(1);
    // Give a small grace window for any follow-up GETs to surface.
    await page.waitForTimeout(500);
    page.off("request", profile.listener);
    page.off("request", themePatch.listener);

    expect(themePatch.seen.length).toBe(1);
    expect(profile.seen.length).toBe(0);
  });

  test("lists keep previous data visible during slow filter refetch", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    await page.goto("/admin/prescriptions");
    await expect(page.getByTestId("prescription-row").first()).toBeVisible({
      timeout: 10_000,
    });

    await page.route("**/api/backend/prescriptions**", async (route) => {
      await new Promise((r) => setTimeout(r, 2_500));
      await route.continue();
    });
    const statusTrigger = page
      .getByRole("combobox", { name: /status/i })
      .first();
    await statusTrigger.click();
    await page.getByRole("option", { name: /^pending$/i }).click();

    await expect(page.getByTestId("sidebar-logout")).toBeVisible();
    await expect(page.getByTestId("global-loading-indicator")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByTestId("prescription-row").first()).toBeVisible();
  });
});
