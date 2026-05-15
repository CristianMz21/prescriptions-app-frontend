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

interface AppFixtures {
  loginAs: (role: SeededRole) => Promise<UserProfileResponseDto>;
  apiRequest: APIRequestContext;
  consoleErrors: ConsoleErrorCollector;
}

// Console messages that we tolerate (e.g. dev-time HMR noise).
const IGNORED_CONSOLE_PATTERNS: RegExp[] = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
];

export const test = base.extend<AppFixtures>({
  consoleErrors: async ({ page }, useFixture, testInfo) => {
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
    await useFixture(collector);
    page.off("console", onMsg);
    if (collector.errors.length > 0 && testInfo.status === "passed") {
      throw new Error(
        `Unexpected console errors during ${testInfo.title}:\n  - ${collector.errors.join(
          "\n  - ",
        )}`,
      );
    }
  },

  apiRequest: async ({}, useFixture) => {
    const ctx = await request.newContext({ baseURL: BACKEND_URL });
    await useFixture(ctx);
    await ctx.dispose();
  },

  loginAs: async ({ page }, useFixture) => {
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
      return profile;
    };
    await useFixture(fn);
  },
});

export { expect };
export type { Page };
