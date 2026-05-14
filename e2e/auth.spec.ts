import { test, expect } from './fixtures'
import { LANDING_PATH, SEED } from './data'

test.describe('Auth & route guards', () => {
  test('unauthenticated / redirects to /login', async ({ page, consoleErrors }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'RX-OS' })).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    expect(consoleErrors.errors).toHaveLength(0)
  })

  for (const path of [
    '/admin/metrics',
    '/doctor/prescriptions',
    '/doctor/prescriptions/new',
    '/patient/prescriptions',
    '/patient/prescriptions/00000000-0000-0000-0000-000000000000',
  ]) {
    test(`unauthenticated ${path} redirects to /login`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login$/)
    })
  }

  test('login with bad credentials surfaces error and stays on /login', async ({ page }) => {
    await page.goto('/login')
    const errorResponse = page.waitForResponse(
      (res) => res.url().endsWith('/auth/login') && res.status() === 401,
    )
    await page.getByLabel('Operator Identity').fill('admin@clinic.com')
    await page.getByLabel('Security Key').fill('definitely-wrong')
    await page.getByRole('button', { name: /sign in/i }).click()
    await errorResponse
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  for (const role of ['admin', 'doctor', 'patient'] as const) {
    test(`login as ${role} lands on the documented route + sidebar reflects role`, async ({
      loginAs,
      page,
    }) => {
      const profile = await loginAs(role)
      expect(profile.email).toBe(SEED[role].email)
      await expect(page).toHaveURL(new RegExp(`${LANDING_PATH[profile.role]}$`))
      await expect(page.getByTestId('sidebar-user-role')).toHaveText(profile.role)
      await expect(page.getByTestId('sidebar-user-email')).toHaveText(profile.email)
    })
  }

  test('logout clears the cookie and protected pages redirect again', async ({
    page,
    loginAs,
    apiRequest,
  }) => {
    await loginAs('doctor')
    await expect(page).toHaveURL(/\/doctor\/prescriptions$/)

    const logoutResponse = page.waitForResponse(
      (res) => res.url().endsWith('/auth/logout') && res.request().method() === 'POST',
    )
    await page.getByTestId('sidebar-logout').click()
    const logoutRes = await logoutResponse
    expect(logoutRes.status()).toBe(200)
    await expect(page).toHaveURL(/\/login$/)

    // Visiting a protected route after logout must redirect — this is the
    // server-side guard, exercised through a fresh navigation.
    await page.goto('/doctor/prescriptions')
    await expect(page).toHaveURL(/\/login$/)

    // Sanity: the backend, contacted directly with the now-cleared cookies,
    // also returns 401.
    const profileRes = await apiRequest.get('/auth/profile')
    expect(profileRes.status()).toBe(401)
  })

  test('cross-role: doctor cookie hitting /admin/metrics redirects to /login', async ({
    page,
    loginAs,
  }) => {
    await loginAs('doctor')
    await page.goto('/admin/metrics')
    await expect(page).toHaveURL(/\/login$/)
  })
})
