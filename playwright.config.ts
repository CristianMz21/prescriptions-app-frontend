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
  // Aggressive but safe budgets — every assertion in this suite resolves in
  // under a second on a passing run, so the wide budgets were just hiding
  // flakes. Real failures surface fast; the suite no longer wedges for an
  // hour on retry storms (observed: run #25902797435 ran 66+ min before
  // being cancelled at default retries=2 + timeout=90s).
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // Cap the entire suite wall-time. If something pathologically hangs the
  // job aborts at 15 min instead of burning a full GitHub Actions hour.
  globalTimeout: 15 * 60 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // No retries in CI. Retries hide flakes and triple the wall-time when a
  // test is broken. Deterministic suites do not need retries; if a real
  // flake appears, fix it at the root.
  retries: 0,
  // Worker count is bounded by backend CPU, not by Next.js. The login flow
  // hits NestJS `/auth/login` which performs a bcrypt.compare (cost ~100ms
  // per call). On a 2-vCPU GitHub Actions runner with two Chromium browsers
  // + two `next start` processes + bcrypt all competing, parallel logins
  // serialise at the CPU and any 20s `waitForResponse(/auth/login)` times
  // out (observed: 57/67 tests timed out at workers=2 in run #25900726600).
  // Local dev (more cores) handles 2 fine. Keep CI at 1 worker — the
  // suite stays deterministic; tighten this only if backend bcrypt rounds
  // are lowered for the test fixture or runner CPU count increases.
  workers: process.env.CI ? 1 : 2,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.E2E_FRONTEND_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Video only on failure (was: always-on). Per-test always-on recording
    // was ~50% of wall-time per test on prior CI runs; retain-on-failure
    // keeps the debugging signal where it matters and halves test time.
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
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
