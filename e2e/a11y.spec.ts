import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";
import { seedPrescription } from "./data";

const SEVERE = ["serious", "critical"] as const;

async function scan(page: import("@playwright/test").Page, label: string) {
  const result = await new AxeBuilder({ page }).analyze();
  const blockers = result.violations.filter((v) =>
    SEVERE.includes(v.impact as (typeof SEVERE)[number]),
  );
  if (blockers.length > 0) {
    const detail = blockers
      .map(
        (v) => `[${v.impact}] ${v.id} (${v.nodes.length} node(s)): ${v.help}`,
      )
      .join("\n");
    throw new Error(
      `Axe found ${blockers.length} severe violations on ${label}:\n${detail}`,
    );
  }
  expect(blockers, `severe a11y violations on ${label}`).toHaveLength(0);
}

test.describe("@axe baseline accessibility", () => {
  test("login page: no serious/critical violations", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "RX-OS" })).toBeVisible();
    await scan(page, "/login");
  });

  test("admin metrics page", async ({ loginAs, page }) => {
    await loginAs("admin");
    await scan(page, "/admin/metrics");
  });

  test("doctor list page", async ({ loginAs, page }) => {
    await loginAs("doctor");
    await scan(page, "/doctor/prescriptions");
  });

  test("doctor new-prescription page", async ({ loginAs, page }) => {
    await loginAs("doctor");
    await page.goto("/doctor/prescriptions/new");
    await expect(
      page.getByRole("heading", { name: /Issue New Prescription/i }),
    ).toBeVisible();
    await scan(page, "/doctor/prescriptions/new");
  });

  test("patient list page", async ({ loginAs, page }) => {
    await loginAs("patient");
    await scan(page, "/patient/prescriptions");
  });

  test("patient detail page (freshly seeded RX)", async ({
    loginAs,
    page,
    apiRequest,
  }) => {
    const fresh = await seedPrescription(apiRequest);
    await loginAs("patient");
    await page.goto(`/patient/prescriptions/${fresh.id}`);
    await expect(page.getByTestId("status-badge")).toBeVisible();
    await scan(page, `/patient/prescriptions/${fresh.id}`);
  });
});
