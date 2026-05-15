import {
  test as base,
  expect,
  request,
  type APIRequestContext,
  type BrowserContext,
  type ConsoleMessage,
  type Cookie,
  type Page,
} from "@playwright/test";
import type { UserProfileResponseDto } from "../src/lib/api/generated/schemas";
import { BACKEND_URL, LANDING_PATH, SEED, type SeededRole } from "./data";

// Module-level cache: once a worker has performed a UI login for a role we
// keep the resulting cookies + profile in memory. Subsequent `loginAs(role)`
// calls in the same worker skip the bcrypt-bound UI flow entirely and just
// hydrate the page context with the cached cookies, then navigate to the
// role's landing page. Bcrypt cost drops from N logins per worker to 1 per
// (role, worker) pair — a ~10x wall-time improvement for the suite.
interface CachedSession {
  cookies: Cookie[];
  profile: UserProfileResponseDto;
}
const sessionCache = new Map<SeededRole, CachedSession>();

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
    const performUiLogin = async (
      role: SeededRole,
    ): Promise<UserProfileResponseDto> => {
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

      // Cache cookies + profile so the next call for this role in the same
      // worker skips bcrypt entirely.
      const cookies = await page.context().cookies();
      sessionCache.set(role, { cookies, profile });
      return profile;
    };

    const hydrateFromCache = async (
      context: BrowserContext,
      cached: CachedSession,
    ): Promise<UserProfileResponseDto | null> => {
      await context.addCookies(cached.cookies);
      const landingPath = LANDING_PATH[cached.profile.role];
      await page.goto(landingPath);
      // If the cookies were invalidated server-side (e.g. an earlier test
      // logged this role out and rotated the refresh token), the frontend
      // middleware bounces to /login. Detect that and fall back.
      try {
        await page.waitForURL(new RegExp(`${landingPath}$`), {
          timeout: 5_000,
        });
        return cached.profile;
      } catch {
        sessionCache.delete(cached.profile.role as SeededRole);
        return null;
      }
    };

    const fn = async (role: SeededRole): Promise<UserProfileResponseDto> => {
      const cached = sessionCache.get(role);
      let profile: UserProfileResponseDto | null = null;
      if (cached) {
        profile = await hydrateFromCache(page.context(), cached);
      }
      if (!profile) {
        profile = await performUiLogin(role);
      }

      // Verify role-based visual elements to confirm state regardless of
      // login path — same assertions for both branches.
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
