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
  // Budgets sized for the actual bottleneck: backend `/auth/login` does
  // `bcrypt.compare` (~100ms-1s under runner load). actionTimeout=10s
  // was below the observed login P99 and caused every login-using test
  // to time out (run #25903226058). Restore the original 90s/20s/60s.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  // Cap the entire suite wall-time. With retries=0 below, a passing
  // suite finishes in ~5-6 min, a failing suite fails fast. The cap is
  // a backstop against a runner hang, not the normal wall-time.
  globalTimeout: 25 * 60 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // No retries. Retries hide flakes and triple wall-time on legit
  // failures (run #25902797435 wedged 66+ min at retries=2 with one
  // bad test). Fix flakes at the root, not by re-running.
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
    // adds wall-time overhead and is rarely needed when traces are
    // retained on failure.
    video: "retain-on-failure",
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
