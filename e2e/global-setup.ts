import { request } from '@playwright/test'

const BACKEND = process.env.E2E_BACKEND_URL ?? 'http://localhost:3000'
const FRONTEND = process.env.E2E_FRONTEND_URL ?? 'http://localhost:3001'

export default async function globalSetup(): Promise<void> {
  const ctx = await request.newContext()
  try {
    // Backend up? /auth/profile without a cookie should be 401.
    const profile = await ctx.get(`${BACKEND}/auth/profile`)
    if (profile.status() !== 401) {
      throw new Error(
        `Backend at ${BACKEND}/auth/profile returned ${profile.status()} (expected 401). Is the backend running?`,
      )
    }

    // Seed login round-trip so test failures surface backend/credential issues
    // up front, not midway through a spec.
    const login = await ctx.post(`${BACKEND}/auth/login`, {
      data: { email: 'admin@clinic.com', password: 'Password123!' },
    })
    if (login.status() !== 201) {
      throw new Error(
        `Seed admin login at ${BACKEND}/auth/login returned ${login.status()} (expected 201). Are the seed credentials current?`,
      )
    }
  } finally {
    await ctx.dispose()
  }

  // Frontend `/login` is healthchecked by Playwright's webServer block; no
  // extra ping needed here.
  void FRONTEND
}
