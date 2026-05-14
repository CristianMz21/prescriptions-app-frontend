import { test, expect } from './fixtures'

test.describe('Admin metrics dashboard', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('admin')
  })

  test('overview wrapper + four metric cards render', async ({ page }) => {
    await expect(page.getByTestId('metrics-overview')).toBeVisible()
    const cards = page.getByTestId('metric-card')
    await expect(cards).toHaveCount(4)
    for (const label of ['Total Prescriptions', 'Active Patients', 'Active Doctors', 'Prescription Status']) {
      await expect(page.locator(`[data-metric-label="${label}"]`)).toBeVisible()
    }
  })

  test('numeric totals are non-negative integers', async ({ page }) => {
    for (const label of ['Total Prescriptions', 'Active Patients', 'Active Doctors']) {
      const card = page.locator(`[data-metric-label="${label}"]`)
      const valueText = await card.locator('.tabular-nums').first().textContent()
      const n = Number((valueText ?? '').trim())
      expect(Number.isInteger(n), `${label} value "${valueText}" should be an integer`).toBe(true)
      expect(n).toBeGreaterThanOrEqual(0)
    }
  })

  test('pending + consumed counts <= total prescriptions', async ({ page }) => {
    const total = Number(
      (await page.locator('[data-metric-label="Total Prescriptions"] .tabular-nums').first().textContent()) ?? 'NaN',
    )
    const statusCard = page.locator('[data-metric-label="Prescription Status"]')
    const pending = Number((await statusCard.getByText('Pending').locator('..').locator('.tabular-nums').textContent()) ?? 'NaN')
    const consumed = Number((await statusCard.getByText('Consumed').locator('..').locator('.tabular-nums').textContent()) ?? 'NaN')
    expect(pending).toBeGreaterThanOrEqual(0)
    expect(consumed).toBeGreaterThanOrEqual(0)
    expect(pending + consumed).toBeLessThanOrEqual(total)
  })

  test('top doctors table has at least one row', async ({ page }) => {
    const heading = page.getByRole('heading', { name: 'Top Doctors' })
    await expect(heading).toBeVisible()
    // The table is inside the same Card as the heading; scope down to that card.
    const card = heading.locator('xpath=ancestor::*[@data-slot="card"][1]')
    const dataRows = card.locator('tbody tr')
    await expect(dataRows.first()).toBeVisible()
    expect(await dataRows.count()).toBeGreaterThanOrEqual(1)
  })

  test('volume trends + status distribution panels visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Volume Trends/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Distribution by Status/i })).toBeVisible()
  })
})
