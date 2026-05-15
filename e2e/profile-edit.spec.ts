import { test, expect } from "./fixtures";

test.describe("Profile editing", () => {
  test("patient can update their name and phone via ProfileCard", async ({
    loginAs,
    page,
  }) => {
    await loginAs("patient");
    await page.goto("/patient/profile");

    // Click Edit button
    await page.getByRole("button", { name: /edit/i }).click();

    const newName = `Patient Edited ${Date.now()}`;
    const newPhone = "+54 911 9999-8888";

    await page.getByLabel("Full Name").fill(newName);
    await page.getByLabel("Phone").fill(newPhone);

    const updateResponse = page.waitForResponse(
      (res) =>
        res.url().endsWith("/users/me") &&
        res.request().method() === "PATCH" &&
        res.status() === 200,
    );
    await page.getByRole("button", { name: /save changes/i }).click();
    await updateResponse;

    // Reload to be sure
    await page.goto("/patient/profile");

    // Verify UI updates
    await expect(page.getByRole("heading", { name: newName })).toBeVisible();
    await expect(page.getByText(newPhone)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /save changes/i }),
    ).toHaveCount(0);
  });
});
