import { test, expect } from "./fixtures";
import { seedPrescription } from "./data";

test.describe("Prescription Expiry UX", () => {
  test("an expired prescription shows an 'Expired' indicator and hides actions", async ({
    page,
    loginAs,
    apiRequest,
  }) => {
    // Seed a prescription that expired yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const expiryDate = yesterday.toISOString().split("T")[0];

    const expiredRx = await seedPrescription(apiRequest, { expiryDate });
    expect(expiredRx.status).toBe("PENDING");
    const expiredRxWithExpiry = expiredRx as typeof expiredRx & {
      expiryDate?: string;
    };
    expect(expiredRxWithExpiry.expiryDate?.startsWith(expiryDate)).toBe(true);

    await loginAs("patient");
    await page.goto(`/patient/prescriptions/${expiredRx.id}`);

    // Verify "Expired" badge is visible
    await expect(page.getByText("Expired", { exact: true })).toBeVisible();

    // Verify "Mark as consumed" button is HIDDEN
    await expect(
      page.getByRole("button", { name: /mark as consumed/i }),
    ).toHaveCount(0);

    // Verify descriptive text
    await expect(
      page.getByText(/actions unavailable for expired prescriptions/i),
    ).toBeVisible();
  });

  test("a valid prescription (no expiry) shows actions", async ({
    page,
    loginAs,
    apiRequest,
  }) => {
    const fresh = await seedPrescription(apiRequest);
    await loginAs("patient");
    await page.goto(`/patient/prescriptions/${fresh.id}`);

    await expect(page.getByText(/expired/i)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /mark as consumed/i }),
    ).toBeVisible();
  });

  test("a prescription with future expiry shows actions", async ({
    page,
    loginAs,
    apiRequest,
  }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expiryDate = tomorrow.toISOString().split("T")[0];

    const validRx = await seedPrescription(apiRequest, { expiryDate });
    await loginAs("patient");
    await page.goto(`/patient/prescriptions/${validRx.id}`);

    await expect(page.getByText(/expired/i)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /mark as consumed/i }),
    ).toBeVisible();
    await expect(page.getByText(/valid until/i)).toBeVisible();
  });
});
