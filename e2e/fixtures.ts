import {
  test as base,
  expect,
  request,
  type APIRequestContext,
  type ConsoleMessage,
  type Page,
} from "@playwright/test";
import type { UserProfileResponseDto } from "../src/lib/api/generated/schemas";
import { BACKEND_URL, SEED, type SeededRole } from "./data";

interface ConsoleErrorCollector {
  errors: string[];
}

interface CreatePrescriptionOptions {
  patientEmail: string;
  medicationName: string;
  dosage?: string;
  quantity?: string;
  unit?: string;
  instructions?: string;
}

interface AppFixtures {
  loginAs: (role: SeededRole) => Promise<UserProfileResponseDto>;
  createPrescriptionUI: (options: CreatePrescriptionOptions) => Promise<void>;
  apiRequest: APIRequestContext;
  consoleErrors: ConsoleErrorCollector;
}

// Console messages that we tolerate (e.g. dev-time HMR noise).
const IGNORED_CONSOLE_PATTERNS: RegExp[] = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
];

export const test = base.extend<AppFixtures>({
  consoleErrors: async ({ page }, fixtureUse, testInfo) => {
    const collector: ConsoleErrorCollector = { errors: [] };
    const onMsg = (msg: ConsoleMessage) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (IGNORED_CONSOLE_PATTERNS.some((p) => p.test(text))) return;
      collector.errors.push(text);
    };
    page.on("console", onMsg);
    page.on("pageerror", (err) =>
      collector.errors.push(`pageerror: ${err.message}`),
    );
    await fixtureUse(collector);
    page.off("console", onMsg);
    if (collector.errors.length > 0 && testInfo.status === "passed") {
      throw new Error(
        `Unexpected console errors during ${testInfo.title}:\n  - ${collector.errors.join(
          "\n  - ",
        )}`,
      );
    }
  },

  apiRequest: async ({}, fixtureUse) => {
    const ctx = await request.newContext({ baseURL: BACKEND_URL });
    await fixtureUse(ctx);
    await ctx.dispose();
  },

  loginAs: async ({ page }, fixtureUse) => {
    const fn = async (role: SeededRole): Promise<UserProfileResponseDto> => {
      const creds = SEED[role];

      const profileResponse = page.waitForResponse(
        (res) =>
          res.url().endsWith("/auth/profile") &&
          res.request().method() === "GET",
      );

      await page.goto("/login");
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole("heading", { name: "RX-OS" })).toBeVisible();

      const emailInput = page.getByLabel(/operator identity/i);
      const passwordInput = page.getByLabel(/security key/i);
      const submitButton = page.getByRole("button", { name: /sign in/i });

      await expect(emailInput).toBeEnabled({ timeout: 15_000 });
      await expect(passwordInput).toBeEnabled({ timeout: 15_000 });
      await expect(submitButton).toBeEnabled({ timeout: 15_000 });

      await emailInput.fill(creds.email);
      await passwordInput.fill(creds.password);
      await submitButton.click();

      await page.waitForURL(
        /\/(admin\/metrics|doctor\/prescriptions|patient\/prescriptions)$/,
      );
      const profileResult = await profileResponse;
      expect(profileResult.status()).toBe(200);
      const profile = (await profileResult.json()) as UserProfileResponseDto;

      // Verify role-based visual elements to confirm state
      if (profile.role === "ADMIN") {
        await expect(page.getByTestId("metrics-overview")).toBeVisible();
      } else if (profile.role === "DOCTOR") {
        await expect(
          page.getByRole("heading", { name: /active prescriptions/i }),
        ).toBeVisible();
      } else if (profile.role === "PATIENT") {
        await expect(
          page.getByRole("heading", { name: /my prescriptions/i }),
        ).toBeVisible();
      }

      return profile;
    };
    await fixtureUse(fn);
  },

  createPrescriptionUI: async ({ page }, fixtureUse) => {
    const fn = async (options: CreatePrescriptionOptions) => {
      await page.goto("/doctor/prescriptions/new");
      await expect(
        page.getByRole("heading", { name: /issue new prescription/i }),
      ).toBeVisible();

      // Patient Selection
      const combobox = page.getByRole("combobox", { name: /patient/i });
      await combobox.click();
      await page.getByRole("option", { name: options.patientEmail }).click();

      // Medication Details
      await page
        .getByLabel("Medication name")
        .first()
        .fill(options.medicationName);

      if (options.unit) {
        const unitSelect = page.getByLabel(/unit/i).first();
        await unitSelect.click();
        await page.getByRole("option", { name: options.unit }).click();
      }

      if (options.dosage) {
        await page.getByLabel("Dosage").first().fill(options.dosage);
      }

      if (options.quantity) {
        await page
          .getByLabel("Dispense quantity")
          .first()
          .fill(options.quantity);
      }

      if (options.instructions) {
        await page
          .getByLabel(/Patient instructions/i)
          .first()
          .fill(options.instructions);
      }

      const createResponse = page.waitForResponse(
        (res) =>
          res.url().endsWith("/prescriptions") &&
          res.request().method() === "POST",
      );

      await page.getByRole("button", { name: /issue prescription/i }).click();
      const res = await createResponse;
      expect(res.status()).toBe(201);

      await page.waitForURL(/\/doctor\/prescriptions$/);
    };
    await fixtureUse(fn);
  },
});

export { expect };
export type { Page };
