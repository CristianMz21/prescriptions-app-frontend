import { test, expect } from "./fixtures";

const ALL_REQUESTS_PATTERN = "**/*";
const PRESCRIPTIONS_API_PATHS = new Set([
  "/api/backend/prescriptions",
  "/prescriptions",
]);

function isPrescriptionsApiGetRequest(requestUrl: string, method: string) {
  if (method !== "GET") return false;
  const url = new URL(requestUrl);
  return PRESCRIPTIONS_API_PATHS.has(url.pathname);
}

test.describe("UI behavior under backend failure / empty data", () => {
  test("doctor list: 500 from /prescriptions surfaces ErrorState", async ({
    loginAs,
    page,
    context,
  }) => {
    await loginAs("doctor");

    await context.route(ALL_REQUESTS_PATTERN, (route) => {
      const request = route.request();
      if (isPrescriptionsApiGetRequest(request.url(), request.method())) {
        return route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ statusCode: 500, message: "forced failure" }),
        });
      }
      return route.continue();
    });

    const isolatedPage = await context.newPage();
    try {
      await isolatedPage.goto("/doctor/prescriptions");
      await expect(isolatedPage.getByTestId("error-state")).toBeVisible();
      await expect(isolatedPage.getByText(/forced failure/i)).toBeVisible();
    } finally {
      await isolatedPage.close();
      await context.unroute(ALL_REQUESTS_PATTERN);
      await page.bringToFront();
    }
  });

  test('patient list: empty array → EmptyState "No prescriptions found"', async ({
    loginAs,
    page,
    context,
  }) => {
    await loginAs("patient");

    await context.route(ALL_REQUESTS_PATTERN, (route) => {
      const request = route.request();
      if (isPrescriptionsApiGetRequest(request.url(), request.method())) {
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

    const isolatedPage = await context.newPage();
    try {
      await isolatedPage.goto("/patient/prescriptions");
      await expect(
        isolatedPage.getByText("No prescriptions found"),
      ).toBeVisible();
      await expect(isolatedPage.getByTestId("prescription-card")).toHaveCount(0);
    } finally {
      await isolatedPage.close();
      await context.unroute(ALL_REQUESTS_PATTERN);
      await page.bringToFront();
    }
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
