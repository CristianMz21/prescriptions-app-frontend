import { test, expect } from "./fixtures";

const PRESCRIPTIONS_REQUEST_PATTERN = "**/prescriptions*";

test.describe("UI behavior under backend failure / empty data", () => {
  test("doctor list: 500 from /prescriptions surfaces ErrorState", async ({
    loginAs,
    page,
    context,
  }) => {
    await loginAs("doctor");
    // Mock the next list fetch only — login already passed.
    await context.route(PRESCRIPTIONS_REQUEST_PATTERN, (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ statusCode: 500, message: "forced failure" }),
        });
      }
      return route.continue();
    });
    await page.goto("/doctor/prescriptions");
    await expect(page.getByTestId("error-state")).toBeVisible();
    await expect(page.getByText(/forced failure/i)).toBeVisible();
    await context.unroute(PRESCRIPTIONS_REQUEST_PATTERN);
  });

  test('patient list: empty array → EmptyState "No prescriptions found"', async ({
    loginAs,
    page,
    context,
  }) => {
    await loginAs("patient");
    await context.route(PRESCRIPTIONS_REQUEST_PATTERN, (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [],
            meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
          }),
        });
      }
      return route.continue();
    });
    await page.goto("/patient/prescriptions");
    await expect(page.getByText("No prescriptions found")).toBeVisible();
    await expect(page.getByTestId("prescription-card")).toHaveCount(0);
    await context.unroute(PRESCRIPTIONS_REQUEST_PATTERN);
  });

  test("patient detail: nonexistent id → ErrorState", async ({
    loginAs,
    page,
  }) => {
    await loginAs("patient");
    await page.goto(
      "/patient/prescriptions/00000000-0000-0000-0000-000000000000",
    );
    // The backend returns 404 → React Query error → ErrorState renders.
    // Some envs return 403 instead because the prescription isn't owned; either is acceptable
    // because the UI surfaces both as a backend error message.
    await expect(page.getByTestId("error-state")).toBeVisible();
  });
});
