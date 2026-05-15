import { defineConfig, devices } from "@playwright/test";

// Professional environment configuration for E2E tests.
// These variables are required by e2e/global-setup.ts and fixtures.
process.env.E2E_BACKEND_URL = process.env.E2E_BACKEND_URL || "http://127.0.0.1:3000";
process.env.E2E_FRONTEND_URL = process.env.E2E_FRONTEND_URL || "http://127.0.0.1:3001";

/**
 * Playwright config for the Prescriptions frontend E2E suite.
 *
 * Hostname coordination (test environment only):
 *   The backend's CORS allowlist accepts `Origin: http://localhost:3001`. To
 *   make `sameSite: lax` cookies flow between browser and backend XHRs, the
 *   browser origin and the API origin must share a registrable hostname. The
 *   suite therefore uses `127.0.0.1` everywhere in CI/Test to avoid IPv6 issues:
 *     - Playwright baseURL: http://127.0.0.1:3001
 *     - NEXT_PUBLIC_API_URL: http://127.0.0.1:3000
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Local dev uses `next dev` which cold-compiles routes on first access —
  // more than 2 workers causes parallel cold-compilation pile-ups and
  // hydration/login timeouts. CI uses `next build && next start` (production
  // server, no cold-compile), so 2 workers there is safe and roughly halves
  // E2E wall-time. State-mutating tests (admin metrics, doctor create,
  // patient consume) use unique med names + per-RX backend GETs to remain
  // deterministic under parallelism.
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.E2E_FRONTEND_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: { mode: "on", size: { width: 1280, height: 800 } },
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: "pnpm exec next dev -H 127.0.0.1 -p 3001",
    url: "http://127.0.0.1:3001/login",
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      NEXT_PUBLIC_API_URL: process.env.E2E_BACKEND_URL,
    },
  },
});
