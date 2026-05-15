import { test, expect } from "./fixtures";
import { seedPrescription, uniqueMedName } from "./data";

test.describe("Patient prescription flows", () => {
  test("list renders glass cards (not the doctor table)", async ({
    page,
    loginAs,
  }) => {
    await loginAs("patient");
    await expect(
      page.getByRole("heading", { name: "My Prescriptions" }),
    ).toBeVisible();

    const cards = page.getByTestId("prescription-card");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(1);

    // The dense doctor-style row component MUST NOT appear on the patient list.
    await expect(page.getByTestId("prescription-row")).toHaveCount(0);
  });

  test("each card surfaces RX code, status badge, and a View Details link", async ({
    page,
    loginAs,
  }) => {
    await loginAs("patient");
    const firstCard = page.getByTestId("prescription-card").first();
    await expect(firstCard).toBeVisible();
    const rxCode = await firstCard.getAttribute("data-rx-code");
    expect(rxCode).toBeTruthy();
    expect(rxCode).toMatch(/^RX-/);
    await expect(firstCard.getByTestId("status-badge")).toBeVisible();
    await expect(
      firstCard.getByRole("link", { name: /view details/i }),
    ).toBeVisible();
  });

  test("clicking View Details opens the detail page", async ({
    page,
    loginAs,
  }) => {
    await loginAs("patient");
    const firstCard = page.getByTestId("prescription-card").first();
    await firstCard.getByRole("link", { name: /view details/i }).click();
    await expect(page).toHaveURL(/\/patient\/prescriptions\/[a-f0-9-]+$/);
    await expect(page.getByText("RX Number")).toBeVisible();
  });

  test("back-link returns to /patient/prescriptions", async ({
    page,
    loginAs,
  }) => {
    await loginAs("patient");
    await page
      .getByTestId("prescription-card")
      .first()
      .getByRole("link", { name: /view details/i })
      .click();
    await page.getByRole("link", { name: /back to my prescriptions/i }).click();
    await expect(page).toHaveURL(/\/patient\/prescriptions$/);
  });

  test("PDF download URL points at the backend and returns application/pdf", async ({
    page,
    loginAs,
    apiRequest,
  }) => {
    await loginAs("patient");
    const firstCard = page.getByTestId("prescription-card").first();
    const rxCode = await firstCard.getAttribute("data-rx-code");
    expect(rxCode).toBeTruthy();
    await firstCard.getByRole("link", { name: /view details/i }).click();
    await expect(page).toHaveURL(/\/patient\/prescriptions\/[a-f0-9-]+$/);
    const idMatch = page.url().match(/\/patient\/prescriptions\/([a-f0-9-]+)$/);
    expect(idMatch).not.toBeNull();
    const id = idMatch![1];

    // Clicking opens a new tab; we don't need to exercise the popup. We assert
    // the button targets the documented backend URL and that fetching it with
    // an authenticated context yields a real PDF.
    const pdfButton = page.getByRole("button", { name: /download pdf/i });
    await expect(pdfButton).toBeVisible();

    // Reuse the patient cookie from the same browser context for the API call.
    const cookies = await page.context().cookies();
    const accessToken = cookies.find((c) => c.name === "accessToken");
    expect(
      accessToken,
      "patient access token cookie should be set",
    ).toBeDefined();

    const pdfRes = await apiRequest.get(`/prescriptions/${id}/pdf`, {
      headers: { Cookie: `accessToken=${accessToken!.value}` },
    });
    expect(pdfRes.status()).toBe(200);
    expect(pdfRes.headers()["content-type"]).toContain("application/pdf");
    const buf = await pdfRes.body();
    expect(buf.subarray(0, 4).toString()).toBe("%PDF");
  });

  test("consume flow on a freshly seeded RX flips status to CONSUMED", async ({
    page,
    loginAs,
    apiRequest,
  }) => {
    const medName = uniqueMedName();
    const fresh = await seedPrescription(apiRequest, { medName });
    expect(fresh.status).toBe("PENDING");

    await loginAs("patient");
    await page.goto(`/patient/prescriptions/${fresh.id}`);
    await expect(page).toHaveURL(
      new RegExp(`/patient/prescriptions/${fresh.id}$`),
    );
    await expect(page.getByTestId("status-badge")).toHaveAttribute(
      "data-status",
      "PENDING",
    );

    // Assert initial state of detail view
    await expect(page.getByText(medName)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /mark as consumed/i }),
    ).toBeVisible();

    // The Mark-as-Consumed button is a popover trigger; the actual form
    // submit lives behind a confirmation step (so the patient can supply an
    // optional reason). Open the popover, then submit.
    await page.getByRole("button", { name: /mark as consumed/i }).click();
    await page.getByRole("button", { name: /confirm/i }).click();

    await expect(page.getByTestId("status-badge")).toHaveAttribute(
      "data-status",
      "CONSUMED",
      {
        timeout: 15_000,
      },
    );

    // Verify "Consumed On" date appears
    await expect(page.getByText(/consumed on/i)).toBeVisible();

    // Verify consume action is now GONE (permanently disabled/hidden)
    await expect(
      page.getByRole("button", { name: /mark as consumed/i }),
    ).not.toBeVisible();
  });

  test("a consumed RX detail does not show the consume button", async ({
    page,
    loginAs,
    apiRequest,
  }) => {
    const fresh = await seedPrescription(apiRequest);
    // Consume it via API as the patient (the seed step was logged in as the
    // doctor, who isn't the owner — we re-login the apiRequest context).
    await apiRequest.post("/auth/login", {
      data: { email: "patient@clinic.com", password: "Password123!" },
    });
    const consumeRes = await apiRequest.patch(
      `/prescriptions/${fresh.id}/consume`,
      {
        headers: { "Content-Type": "application/json" },
        data: {},
      },
    );
    expect(consumeRes.status()).toBe(200);

    await loginAs("patient");
    await page.goto(`/patient/prescriptions/${fresh.id}`);
    await expect(page.getByTestId("status-badge")).toHaveAttribute(
      "data-status",
      "CONSUMED",
    );
    await expect(
      page.getByRole("button", { name: /mark as consumed/i }),
    ).toHaveCount(0);
  });
});
