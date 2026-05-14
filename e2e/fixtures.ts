import {
  test as base,
  expect,
  request,
  type APIRequestContext,
  type ConsoleMessage,
  type Page,
} from '@playwright/test'
import type { UserProfileResponseDto } from '../src/lib/api/generated/schemas'
import { BACKEND_URL, LANDING_PATH, SEED, type SeededRole } from './data'

interface ConsoleErrorCollector {
  errors: string[]
}

interface AppFixtures {
  loginAs: (role: SeededRole) => Promise<UserProfileResponseDto>
  apiRequest: APIRequestContext
  consoleErrors: ConsoleErrorCollector
}

// Console messages that we tolerate (e.g. dev-time HMR noise).
const IGNORED_CONSOLE_PATTERNS: RegExp[] = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
]

export const test = base.extend<AppFixtures>({
  consoleErrors: async ({ page }, use, testInfo) => {
    const collector: ConsoleErrorCollector = { errors: [] }
    const onMsg = (msg: ConsoleMessage) => {
      if (msg.type() !== 'error') return
      const text = msg.text()
      if (IGNORED_CONSOLE_PATTERNS.some((p) => p.test(text))) return
      collector.errors.push(text)
    }
    page.on('console', onMsg)
    page.on('pageerror', (err) => collector.errors.push(`pageerror: ${err.message}`))
    await use(collector)
    page.off('console', onMsg)
    if (collector.errors.length > 0 && testInfo.status === 'passed') {
      throw new Error(
        `Unexpected console errors during ${testInfo.title}:\n  - ${collector.errors.join(
          '\n  - ',
        )}`,
      )
    }
  },

  apiRequest: async ({}, use) => {
    const ctx = await request.newContext({ baseURL: BACKEND_URL })
    await use(ctx)
    await ctx.dispose()
  },

  loginAs: async ({ page }, use) => {
    const fn = async (role: SeededRole): Promise<UserProfileResponseDto> => {
      const creds = SEED[role]
      await page.goto('/login')
      await expect(page).toHaveURL(/\/login$/)
      await expect(page.getByRole('heading', { name: 'RX-OS' })).toBeVisible()

      // Wait for backend response so the assertion errors point at API failure
      // rather than a UI timeout when login breaks.
      const loginResponse = page.waitForResponse(
        (res) => res.url().endsWith('/auth/login') && res.request().method() === 'POST',
      )
      await page.getByLabel('Operator Identity').fill(creds.email)
      await page.getByLabel('Security Key').fill(creds.password)
      await page.getByRole('button', { name: /sign in/i }).click()
      const loggedIn = await loginResponse
      expect(loggedIn.status()).toBe(201)

      // The role landing page is asserted by the role enum from the profile,
      // not hard-coded — keeps tests resilient to redirect-map changes.
      const profileResponse = await page.waitForResponse(
        (res) => res.url().endsWith('/auth/profile') && res.request().method() === 'GET',
      )
      expect(profileResponse.status()).toBe(200)
      const profile = (await profileResponse.json()) as UserProfileResponseDto
      const expectedPath = LANDING_PATH[profile.role]
      await expect(page).toHaveURL(new RegExp(`${expectedPath}$`))
      return profile
    }
    await use(fn)
  },
})

export { expect }
export type { Page }
