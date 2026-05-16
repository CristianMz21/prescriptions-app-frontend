import { test, expect } from "./fixtures";
import { backendLogin, BACKEND_URL, SEED, uniqueMedName } from "./data";
import { getRxByCode, getItemsByRxId, closeDb } from "./db-helpers";

test.afterAll(async () => {
  await closeDb();
});

interface PrescriptionItemApi {
  name: string;
  dosage?: string | null;
  quantity?: number | null;
  unit: string;
}

interface PrescriptionApi {
  id: string;
  authorId: string;
  patientId: string;
  status: string;
  items: PrescriptionItemApi[];
}

interface PrescriptionListApi {
  data: PrescriptionApi[];
  meta: { total: number };
}

test.describe("Doctor prescription flows", () => {
  test("seeded prescriptions render in a table with monochrome status badges", async ({
    page,
    loginAs,
  }) => {
    await loginAs("doctor");
    const rows = page.getByTestId("prescription-row");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThanOrEqual(1);

    const badges = page.getByTestId("status-badge");
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count; i += 1) {
      const status = await badges.nth(i).getAttribute("data-status");
      expect(["PENDING", "CONSUMED"]).toContain(status);
    }
  });

  test('"New Prescription" link navigates to /doctor/prescriptions/new', async ({
    page,
    loginAs,
  }) => {
    await loginAs("doctor");
    await page.getByRole("link", { name: /new prescription/i }).click();
    await expect(page).toHaveURL(/\/doctor\/prescriptions\/new$/);
    await expect(
      page.getByRole("heading", { name: /Issue New Prescription/i }),
    ).toBeVisible();
  });

  test("end-to-end create flow: pick patient → add med → submit → row appears", async ({
    page,
    loginAs,
    createPrescriptionUI,
  }) => {
    await loginAs("doctor");
    const medName = uniqueMedName();

    await createPrescriptionUI({
      patientEmail: SEED.patient.email,
      medicationName: medName,
      unit: "comprimidos",
      dosage: "100mg",
      quantity: "30",
      instructions: "Once daily",
    });

    // Assert row appears in list
    const newRow = page
      .getByTestId("prescription-row")
      .filter({ hasText: medName });
    await expect(newRow).toHaveCount(1);
    await expect(newRow.getByTestId("status-badge")).toHaveAttribute(
      "data-status",
      "PENDING",
    );

    // DB assertion: the created row exists in Postgres with the right
    // status, owner relations, and item. Reads the RX code rendered on
    // the new row, then verifies via direct DB query.
    const rxCode = await newRow.getAttribute("data-rx-code");
    expect(rxCode, "new row must expose data-rx-code").toBeTruthy();
    const dbRx = await getRxByCode(rxCode!);
    expect(dbRx, `rx ${rxCode} must exist in Postgres`).not.toBeNull();
    expect(dbRx!.status).toBe("PENDING");
    expect(dbRx!.consumedAt).toBeNull();
    const dbItems = await getItemsByRxId(dbRx!.id);
    expect(dbItems).toHaveLength(1);
    expect(dbItems[0].name).toBe(medName);
    expect(dbItems[0].dosage).toBe("100mg");
    expect(dbItems[0].quantity).toBe(30);
    expect(dbItems[0].unit).toBe("comprimidos");

    // Verify detail view. Read the href off the View link and navigate
    // directly — the Next.js <Link>'s client-side router push is flaky
    // on this list page (race between the doctor list React Query
    // hydration and the router; observed in run #25912374893 across
    // doctor.spec.ts:55 and :92). page.goto is deterministic and still
    // exercises the detail route's server-side render + auth guard.
    const viewLink = newRow.getByRole("link", { name: /view/i });
    const href = await viewLink.getAttribute("href");
    expect(href, "View link must have an href").toBeTruthy();
    await page.goto(href!);
    await expect(page.getByText(medName).first()).toBeVisible();
    await expect(page.getByText(/100mg/i).first()).toBeVisible();
    // Detail view renders quantity as "Quantity: 30" without the unit
    // label inline; the unit ("comprimidos") is shown elsewhere on the
    // page header. Assert the visible quantity format directly.
    await expect(page.getByText(/Quantity:\s*30/i).first()).toBeVisible();
    await expect(page.getByText(/Once daily/i).first()).toBeVisible();
  });

  test("doctor can download/view prescription PDF", async ({
    page,
    loginAs,
  }) => {
    await loginAs("doctor");
    const rows = page.getByTestId("prescription-row");
    // Direct navigation via href (see create-flow note above re: flaky
    // <Link> click on the doctor list).
    const href = await rows
      .first()
      .getByRole("link", { name: /view/i })
      .getAttribute("href");
    expect(href, "View link must have an href").toBeTruthy();
    await page.goto(href!);

    const downloadButton = page.getByRole("button", { name: /download pdf/i });
    await expect(downloadButton).toBeVisible();
  });

  test("doctor cannot consume prescriptions (action hidden)", async ({
    page,
    loginAs,
  }) => {
    await loginAs("doctor");
    const rows = page.getByTestId("prescription-row");
    await rows.first().getByRole("link", { name: /view/i }).click();

    // Verify "Mark as consumed" button is NOT present for doctors
    await expect(
      page.getByRole("button", { name: /mark as consumed/i }),
    ).not.toBeVisible();
  });

  test("validation: missing patient blocks submission with visible error", async ({
    page,
    loginAs,
  }) => {
    await loginAs("doctor");
    await page.goto("/doctor/prescriptions/new");
    await page.getByLabel("Medication name").first().fill(uniqueMedName());

    // Submit the form via JS to bypass the disabled-button guard. React's
    // onSubmit still fires because it uses synthetic events on the DOM node.
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form)
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await expect(page.getByTestId("form-error")).toContainText(
      "Please select a patient",
    );
    await expect(page).toHaveURL(/\/doctor\/prescriptions\/new$/);
  });

  test("validation: missing medication name blocks submission", async ({
    page,
    loginAs,
  }) => {
    await loginAs("doctor");
    await page.goto("/doctor/prescriptions/new");
    // Patient selector is an autocomplete textbox with <button> suggestions
    // (previously a combobox/option). Type the full email to narrow to one
    // match and click the matching button.
    const patientSearch = page.getByRole("textbox", {
      name: /search by patient/i,
    });
    await patientSearch.click();
    await patientSearch.fill(SEED.patient.email);
    await page
      .getByRole("button", { name: new RegExp(SEED.patient.email, "i") })
      .first()
      .click();
    // Leave medication name blank — HTML5 required attribute will block submit
    // before our validation runs, so we assert the field invalidity directly.
    const nameInput = page.getByLabel("Medication name").first();
    await page.getByRole("button", { name: /issue prescription/i }).click();
    await expect(nameInput).toHaveJSProperty("validity.valueMissing", true);
    await expect(page).toHaveURL(/\/doctor\/prescriptions\/new$/);
  });

  test("add/remove medication item rows", async ({ page, loginAs }) => {
    await loginAs("doctor");
    await page.goto("/doctor/prescriptions/new");

    const items = page.getByTestId("medication-item");
    await expect(items).toHaveCount(1);

    await page.getByRole("button", { name: /add item/i }).click();
    await expect(items).toHaveCount(2);
    await page.getByRole("button", { name: /add item/i }).click();
    await expect(items).toHaveCount(3);

    // Remove the second item — there's a remove button on each row.
    const removeButtons = page.getByRole("button", {
      name: /remove medication/i,
    });
    await removeButtons.nth(1).click();
    await expect(items).toHaveCount(2);

    await removeButtons.nth(0).click();
    await expect(items).toHaveCount(1);

    // The lone remaining row's remove button is disabled.
    await expect(
      page.getByRole("button", { name: /remove medication/i }),
    ).toBeDisabled();
  });

  // Closes a gap where the UI could render success without the DB reflecting
  // the new prescription. Verifies backend state directly after the UI flow.
  test("create flow: backend GET confirms the new prescription is persisted with the seeded doctor as author", async ({
    loginAs,
    createPrescriptionUI,
    apiRequest,
  }) => {
    await loginAs("doctor");
    const medName = uniqueMedName("StateCheck");

    await createPrescriptionUI({
      patientEmail: SEED.patient.email,
      medicationName: medName,
      unit: "comprimidos",
      dosage: "250mg",
      quantity: "20",
      instructions: "Twice daily",
    });

    // Drive the backend with the doctor's session and locate the just-created
    // RX by free-text search on medication name (?q=). Asserting authorId,
    // status, items, dosage, and quantity proves the UI did not silently swap
    // any field before persisting.
    await backendLogin({
      apiRequest,
      email: SEED.doctor.email,
      password: SEED.doctor.password,
    });
    // `Prescription.authorId` references `Doctor.id` (the profile id), not the
    // User id. Resolve it via /auth/profile.doctor.id so the equality assertion
    // catches an author mismatch precisely.
    const profileRes = await apiRequest.get(`${BACKEND_URL}/auth/profile`);
    expect(profileRes.status()).toBe(200);
    const profile = (await profileRes.json()) as {
      doctor?: { id: string };
    };
    expect(profile.doctor?.id).toBeTruthy();
    const doctorProfileId = profile.doctor?.id ?? "";

    const listRes = await apiRequest.get(
      `${BACKEND_URL}/prescriptions?q=${encodeURIComponent(medName)}&limit=10`,
    );
    expect(listRes.status()).toBe(200);
    const list = (await listRes.json()) as PrescriptionListApi;
    const created = list.data.find((p) =>
      p.items.some((i) => i.name === medName),
    );
    expect(created, `RX with med ${medName} not found in backend`).toBeDefined();
    if (!created) return; // narrow for TS
    expect(created.status).toBe("PENDING");
    expect(created.authorId).toBe(doctorProfileId);
    const item = created.items.find((i) => i.name === medName);
    expect(item?.dosage).toBe("250mg");
    expect(item?.quantity).toBe(20);
    expect(item?.unit).toBe("comprimidos");
  });
});
