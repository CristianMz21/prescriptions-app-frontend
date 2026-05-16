import { test, expect } from "./fixtures";
import { SEED } from "./data";

/**
 * Loading-UX regression suite.
 *
 * Uses Playwright route interception to ARTIFICIALLY DELAY the
 * backend response (NOT to mock business logic — the request still
 * hits the real backend, we just intercept the response on the way
 * back to insert a sleep). This is the only way to deterministically
 * verify that the UI shows loading states without relying on the
 * real backend being slow.
 *
 * Covered:
 *   1. Login button disables + spinner during slow /auth/login.
 *   2. GlobalLoadingIndicator progress bar appears under network load.
 *   3. "Cold-start" banner appears after >2s of activity.
 *   4. PDF download button flips to "Generating PDF…" + disabled.
 */

const DELAY_MS = 3_000;

test.describe("Loading UX — slow-backend simulation via route delay", () => {
  test("login: submit disables + shows spinner while /auth/login is slow", async ({
    page,
  }) => {
    // Delay the proxy route's response by 3 seconds, then resume so
    // the actual backend call still lands. This way we exercise the
    // real login flow but get to assert the in-flight UI.
    await page.route("**/api/backend/auth/login", async (route) => {
      await new Promise((r) => setTimeout(r, DELAY_MS));
      await route.continue();
    });

    await page.goto("/login");
    await page.getByLabel(/operator identity/i).fill(SEED.admin.email);
    await page.getByLabel(/security key/i).fill(SEED.admin.password);

    const submit = page.getByTestId("login-submit");
    await submit.click();

    // Submit must be disabled while the (delayed) login XHR is in
    // flight. Use a tight timeout because the post-success page
    // navigation will hide the button outright after ~3s — the
    // disabled assertion must land BEFORE that happens.
    await expect(submit).toBeDisabled({ timeout: 1_000 });
    await expect(submit).toHaveAttribute("aria-busy", "true");
    await expect(submit).toContainText(/signing in/i);
    // (Login goes through useAuth, not TanStack Query, so the
    //  GlobalLoadingIndicator bar isn't expected to light up here —
    //  the button's own disabled+spinner state IS the affordance.)

    // Sanity: eventually the real login completes and we leave /login.
    await expect(page).not.toHaveURL(/\/login$/, { timeout: 15_000 });
  });

  test("cold-start banner appears when activity exceeds 2 seconds", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    // Delay every subsequent backend call by 3s so the banner
    // threshold (2s) trips deterministically.
    await page.route("**/api/backend/admin/metrics**", async (route) => {
      await new Promise((r) => setTimeout(r, DELAY_MS));
      await route.continue();
    });

    // Navigate to metrics; the page issues an admin/metrics XHR which
    // is now slow.
    await page.goto("/admin/metrics");

    await expect(page.getByTestId("cold-start-banner")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByTestId("cold-start-banner")).toContainText(
      /server may be waking up/i,
    );

    // Banner auto-dismisses once the request lands.
    await expect(page.getByTestId("cold-start-banner")).toBeHidden({
      timeout: 10_000,
    });
  });

  test("pdf download button: disables + flips label to Generating PDF…", async ({
    loginAs,
    page,
  }) => {
    await loginAs("patient");
    await page.goto("/patient/prescriptions");
    // Open the first detail page.
    const firstCard = page
      .getByRole("link", { name: /view details/i })
      .first();
    const href = await firstCard.getAttribute("href");
    expect(href).toBeTruthy();
    await page.goto(href!);

    await page.route("**/api/backend/prescriptions/**/pdf", async (route) => {
      await new Promise((r) => setTimeout(r, DELAY_MS));
      await route.continue();
    });

    const button = page.getByTestId("pdf-download-button");
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    await button.click();

    // While the slow PDF call is in flight: disabled + label flipped +
    // aria-busy = true.
    await expect(button).toBeDisabled();
    await expect(button).toContainText(/generating pdf/i);
    await expect(button).toHaveAttribute("aria-busy", "true");

    // After the call completes (still within the delay+slack window),
    // the button returns to its enabled "Download PDF" label.
    await expect(button).toBeEnabled({ timeout: 15_000 });
    await expect(button).toContainText(/download pdf/i);
  });

  test("admin metrics list: global progress bar shows during slow filter change", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    await page.goto("/admin/metrics");

    await page.route("**/api/backend/admin/metrics**", async (route) => {
      await new Promise((r) => setTimeout(r, DELAY_MS));
      await route.continue();
    });

    // Trigger a refetch via filter change.
    await page.getByTestId("metrics-from-date").fill("2026-01-01");

    // Global bar should surface within the debounce window (~200ms).
    await expect(page.getByTestId("global-loading-indicator")).toBeVisible({
      timeout: 5_000,
    });
  });
});
