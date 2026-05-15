import { test, expect } from "./fixtures";
import { LANDING_PATH, SEED, type SeededRole } from "./data";

test.describe("Auth & route guards", () => {
  test("unauthenticated / redirects to /login", async ({
    page,
    consoleErrors,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "RX-OS" })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    expect(consoleErrors.errors).toHaveLength(0);
  });

  for (const path of [
    "/admin/metrics",
    "/doctor/prescriptions",
    "/doctor/prescriptions/new",
    "/patient/prescriptions",
    "/patient/prescriptions/00000000-0000-0000-0000-000000000000",
  ]) {
    test(`unauthenticated ${path} redirects to /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    });
  }

  test("login with bad credentials surfaces error and stays on /login", async ({
    page,
  }) => {
    await page.goto("/login");
    const errorResponse = page.waitForResponse(
      (res) => res.url().endsWith("/auth/login") && res.status() === 401,
    );
    await page.getByLabel("Operator Identity").fill("admin@clinic.com");
    await page.getByLabel("Security Key").fill("definitely-wrong");
    await page.getByRole("button", { name: /sign in/i }).click();
    await errorResponse;
    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  for (const role of ["admin", "doctor", "patient"] as const) {
    test(`login as ${role} lands on the documented route + sidebar reflects role`, async ({
      loginAs,
      page,
    }) => {
      const profile = await loginAs(role);
      expect(profile.email).toBe(SEED[role].email);
      await expect(page).toHaveURL(
        new RegExp(`${LANDING_PATH[profile.role]}$`),
      );
      await expect(page.getByTestId("sidebar-user-role")).toHaveText(
        profile.role,
      );
      await expect(page.getByTestId("sidebar-user-email")).toHaveText(
        profile.email,
      );
    });
  }

  test("logout clears the cookie and protected pages redirect again", async ({
    page,
    loginAs,
    apiRequest,
  }) => {
    await loginAs("doctor");
    // The doctor's landing route appends `?page=1` for the list pagination.
    // Allow an optional query string so the assertion isn't tied to URL params.
    await expect(page).toHaveURL(/\/doctor\/prescriptions(?:\?.*)?$/);

    // Verify presence of authenticated elements
    await expect(page.getByTestId("sidebar-logout")).toBeVisible();

    const logoutResponse = page.waitForResponse(
      (res) =>
        res.url().endsWith("/auth/logout") && res.request().method() === "POST",
    );
    await page.getByTestId("sidebar-logout").click();
    const logoutRes = await logoutResponse;
    expect(logoutRes.status()).toBe(200);
    await expect(page).toHaveURL(/\/login$/);

    // Verify session is cleared: Login page elements visible, authenticated elements hidden
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByTestId("sidebar-logout")).not.toBeVisible();

    // Visiting a protected route after logout must redirect — this is the
    // server-side guard, exercised through a fresh navigation.
    await page.goto("/doctor/prescriptions");
    await expect(page).toHaveURL(/\/login$/);

    // Sanity: the backend, contacted directly with the now-cleared cookies,
    // also returns 401.
    const profileRes = await apiRequest.get("/auth/profile");
    expect(profileRes.status()).toBe(401);
  });

  const crossRoleScenarios = [
    { role: "doctor", target: "/admin/metrics" },
    { role: "patient", target: "/admin/metrics" },
    { role: "patient", target: "/doctor/prescriptions" },
    { role: "admin", target: "/doctor/prescriptions" },
    { role: "admin", target: "/patient/prescriptions" },
  ] as const;

  for (const { role, target } of crossRoleScenarios) {
    test(`cross-role: ${role} hitting ${target} redirects to /login`, async ({
      page,
      loginAs,
    }) => {
      await loginAs(role as SeededRole);
      await page.goto(target);
      // Backend/Frontend should identify unauthorized role and boot to login
      await expect(page).toHaveURL(/\/login$/);
    });
  }

  // The refresh-token rotation contract is exercised in
  // `src/lib/api/refresh.test.ts` via msw — a true unit test of the
  // axios response interceptor's 401 → POST /auth/refresh → replay
  // behaviour. An E2E variant attempted here did not produce useful
  // signal: Next.js' server middleware runs the auth-cookie check on
  // every route navigation and redirects to `/login` before the
  // client-side interceptor can issue its refresh call, so the
  // rotation contract is masked by middleware-first redirect
  // semantics. Keeping coverage at the unit layer; this comment is the
  // documented reason an E2E version was deliberately omitted.
});
