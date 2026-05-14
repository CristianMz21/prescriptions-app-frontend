import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for the Prescriptions frontend E2E suite.
 *
 * Why baseURL is 127.0.0.1 (not localhost):
 *   The backend issues HttpOnly cookies on `127.0.0.1:3000` with `sameSite: lax`.
 *   When the browser is pointed at `localhost:3001` (the dev default), browser XHRs
 *   to `127.0.0.1:3000` are cross-site and the cookie is dropped — login can't
 *   complete. Driving the test runner against `127.0.0.1:3001` keeps both
 *   origins under the same registrable name (`127.0.0.1`), so cookies flow
 *   normally without an env override, a Next rewrite, or manual cookie injection.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts/,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: 'pnpm dev -- -H 127.0.0.1 -p 3001',
    url: 'http://127.0.0.1:3001/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
