import { test, expect } from "./fixtures";

test.describe("Admin onboarding (P1 — usersControllerCreate)", () => {
  test("admin sees Users + Doctors + All Prescriptions in nav", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    // Icon ligatures appear in the link's accessible name (e.g. "monitoring
    // Analytics"), so we match against the visible label text inside <nav>.
    const nav = page.locator("aside nav");
    for (const label of ["Analytics", "Prescriptions", "Users", "Doctors"]) {
      await expect(nav.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("admin can open the New User form", async ({ loginAs, page }) => {
    await loginAs("admin");
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin\/users$/);
    await page.getByRole("link", { name: /new user/i }).click();
    await expect(page).toHaveURL(/\/admin\/users\/new$/);
    await expect(
      page.getByRole("heading", { name: /Onboard new user/i }),
    ).toBeVisible();
  });

  test("admin can create a fresh patient and the row appears in /admin/users", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    await page.goto("/admin/users/new");

    const email = `e2e-patient-${Date.now()}@clinic.com`;
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("Password123!");
    // PATIENT is the default role; no need to change.

    const created = page.waitForResponse(
      (res) =>
        res.url().endsWith("/users") &&
        res.request().method() === "POST" &&
        res.status() === 201,
      { timeout: 30_000 },
    );
    await page.getByRole("button", { name: /create user/i }).click();
    await created;
    await expect(page).toHaveURL(/\/admin\/users$/);

    // Pagination defaults newest-first; the new email should be on page 1.
    // Use a cell-scoped selector since the success toast also surfaces the
    // email and would trigger strict-mode violations.
    await expect(page.getByRole("cell", { name: email })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("admin can browse all prescriptions with filters", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    await page.goto("/admin/prescriptions");
    await expect(page).toHaveURL(/\/admin\/prescriptions$/);
    await expect(
      page.getByRole("heading", { name: /All Prescriptions/i }),
    ).toBeVisible();

    // Filters bar present.
    await expect(page.getByLabel("Search")).toBeVisible();
    await expect(page.getByLabel("Status")).toBeVisible();
  });

  test("admin doctors page lists ≥ 1 doctor row", async ({ loginAs, page }) => {
    await loginAs("admin");
    await page.goto("/admin/doctors");
    await expect(page).toHaveURL(/\/admin\/doctors$/);
    await expect(page.getByTestId("doctor-row").first()).toBeVisible();
  });
});
