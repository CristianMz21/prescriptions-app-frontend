import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for the Prescriptions frontend E2E suite.
 *
 * Hostname coordination (test environment only):
 *   The backend's CORS allowlist accepts `Origin: http://localhost:3001`. To
 *   make `sameSite: lax` cookies flow between browser and backend XHRs, the
 *   browser origin and the API origin must share a registrable hostname. The
 *   suite therefore uses `localhost` everywhere:
 *     - Playwright baseURL: http://localhost:3001 (matches backend CORS)
 *     - NEXT_PUBLIC_API_URL: http://localhost:3000 (cookie domain matches)
 *   The application's env defaults are unchanged — these overrides apply only
 *   to the dev server spawned for the test suite, never to manual `pnpm dev`.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts/,
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // dev `next` cold-compiles each new page on first hit; parallel workers
  // can stack 5+ first-time compiles on the same worker thread and time out.
  workers: process.env.CI ? 2 : 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: { mode: 'on', size: { width: 1280, height: 800 } },
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
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
    command: 'pnpm exec next dev -H localhost -p 3001',
    url: 'http://localhost:3001/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:3000',
    },
  },
})
