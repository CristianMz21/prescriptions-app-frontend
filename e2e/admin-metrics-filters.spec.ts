import { test, expect } from "./fixtures";
import {
  computeDateRangeMetrics,
  closeDb,
} from "./db-helpers";

/**
 * Item #7 of the QA acceptance checklist: admin metrics + date filters.
 *
 * UI assertions:
 *   - Both date-input controls render with stable testids.
 *   - Setting from/to writes `?fromDate=…&toDate=…` to the URL.
 *
 * API assertions:
 *   - GET /api/backend/admin/metrics?fromDate=…&toDate=… returns 200.
 *
 * DB assertions (the ground-truth check):
 *   - The `totals.totalPrescriptions` value returned by the API for
 *     a given date range MUST equal the count computed by querying
 *     Postgres directly with the same date filter. Same for
 *     `pending` / `consumed`.
 *
 * Empty-range case: a window in the distant past returns zeros and
 * the API stays 200 (does not throw).
 */
test.afterAll(async () => {
  await closeDb();
});

test.describe("Admin metrics — date filters (UI + API + DB)", () => {
  test("UI exposes from/to date inputs and Clear button", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    await page.goto("/admin/metrics");

    await expect(page.getByTestId("metrics-from-date")).toBeVisible();
    await expect(page.getByTestId("metrics-to-date")).toBeVisible();
    await expect(page.getByTestId("metrics-filters-clear")).toBeVisible();
  });

  test("changing date inputs updates URL with fromDate/toDate", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    await page.goto("/admin/metrics");

    // Fill + wait for the URL to settle between writes. `useUrlFilters`
    // reads from `useSearchParams()`, which only re-renders once the
    // router.push lands; two back-to-back fills lose the first write
    // because the second one reads stale params.
    await page.getByTestId("metrics-from-date").fill("2026-01-01");
    await expect
      .poll(() => page.url(), { timeout: 5_000 })
      .toMatch(/fromDate=2026-01-01/);

    await page.getByTestId("metrics-to-date").fill("2026-12-31");
    await expect
      .poll(() => page.url(), { timeout: 5_000 })
      .toMatch(/toDate=2026-12-31/);

    // Final state has both.
    expect(page.url()).toMatch(/fromDate=2026-01-01/);
    expect(page.url()).toMatch(/toDate=2026-12-31/);
  });

  test("API totals for a date range match Postgres-computed totals", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    const fromDate = "2026-01-01";
    const toDate = "2026-12-31";

    const apiResponse = await page.request.get(
      `/api/backend/admin/metrics?fromDate=${fromDate}&toDate=${toDate}`,
    );
    expect(apiResponse.status()).toBe(200);
    const body = (await apiResponse.json()) as {
      totals: { prescriptions: number };
      byStatus: { pending: number; consumed: number };
    };

    const dbTotals = await computeDateRangeMetrics(fromDate, toDate);

    expect(body.totals.prescriptions).toBe(dbTotals.totalPrescriptions);
    expect(body.byStatus.pending).toBe(dbTotals.pending);
    expect(body.byStatus.consumed).toBe(dbTotals.consumed);
  });

  test("empty / distant-past date range returns 200 with zero totals", async ({
    loginAs,
    page,
  }) => {
    await loginAs("admin");
    const fromDate = "1990-01-01";
    const toDate = "1990-01-31";

    const apiResponse = await page.request.get(
      `/api/backend/admin/metrics?fromDate=${fromDate}&toDate=${toDate}`,
    );
    expect(apiResponse.status()).toBe(200);
    const body = (await apiResponse.json()) as {
      totals: { prescriptions: number };
    };

    const dbTotals = await computeDateRangeMetrics(fromDate, toDate);
    expect(body.totals.prescriptions).toBe(0);
    expect(dbTotals.totalPrescriptions).toBe(0);
  });

  test("invalid date format returns 400", async ({ loginAs, page }) => {
    await loginAs("admin");
    const response = await page.request.get(
      "/api/backend/admin/metrics?fromDate=not-a-date",
    );
    expect(response.status()).toBe(400);
  });
});
