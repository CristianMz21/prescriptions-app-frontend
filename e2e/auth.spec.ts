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
    await expect(page).toHaveURL(/\/doctor\/prescriptions$/);

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

  // Refresh-token rotation: when the access cookie disappears but the refresh
  // cookie is still valid, the very next protected request must trigger a
  // POST /auth/refresh that succeeds (200) and the originally-attempted call
  // must replay and succeed without a /login redirect.
  test("refresh-token rotation: missing accessToken triggers /auth/refresh and replay succeeds", async ({
    page,
    loginAs,
  }) => {
    await loginAs("doctor");
    await expect(page).toHaveURL(/\/doctor\/prescriptions$/);

    // Drop only the access cookie. The refresh cookie is unchanged.
    const before = await page.context().cookies();
    const access = before.find((c) => c.name === "accessToken");
    const refresh = before.find((c) => c.name === "refreshToken");
    expect(access, "expected accessToken cookie after login").toBeDefined();
    expect(refresh, "expected refreshToken cookie after login").toBeDefined();

    await page.context().clearCookies({ name: "accessToken" });
    const afterClear = await page.context().cookies();
    expect(
      afterClear.find((c) => c.name === "accessToken"),
      "accessToken should be cleared",
    ).toBeUndefined();
    expect(
      afterClear.find((c) => c.name === "refreshToken"),
      "refreshToken must still be present",
    ).toBeDefined();

    // Watch for the silent refresh + the original /auth/profile retry.
    const refreshCall = page.waitForResponse(
      (res) =>
        res.url().endsWith("/auth/refresh") &&
        res.request().method() === "POST",
    );

    // Navigate to a protected page. The custom axios interceptor must see the
    // 401, fire POST /auth/refresh, then retransmit the original call.
    await page.goto("/doctor/prescriptions");

    const refreshRes = await refreshCall;
    expect(refreshRes.status()).toBe(200);

    // After rotation we must be on the protected page, NOT redirected to /login.
    await expect(page).toHaveURL(/\/doctor\/prescriptions$/);

    // And the access cookie is restored.
    const afterRefresh = await page.context().cookies();
    expect(
      afterRefresh.find((c) => c.name === "accessToken"),
      "accessToken cookie should be re-set by /auth/refresh",
    ).toBeDefined();
  });
});
