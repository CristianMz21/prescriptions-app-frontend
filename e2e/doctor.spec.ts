import { test, expect } from './fixtures'
import { SEED, uniqueMedName } from './data'

test.describe('Doctor prescription flows', () => {
  test('seeded prescriptions render in a table with monochrome status badges', async ({
    page,
    loginAs,
  }) => {
    await loginAs('doctor')
    const rows = page.getByTestId('prescription-row')
    await expect(rows.first()).toBeVisible()
    expect(await rows.count()).toBeGreaterThanOrEqual(1)

    const badges = page.getByTestId('status-badge')
    const count = await badges.count()
    expect(count).toBeGreaterThanOrEqual(1)
    for (let i = 0; i < count; i += 1) {
      const status = await badges.nth(i).getAttribute('data-status')
      expect(['PENDING', 'CONSUMED']).toContain(status)
    }
  })

  test('"New Prescription" link navigates to /doctor/prescriptions/new', async ({
    page,
    loginAs,
  }) => {
    await loginAs('doctor')
    await page.getByRole('link', { name: /new prescription/i }).click()
    await expect(page).toHaveURL(/\/doctor\/prescriptions\/new$/)
    await expect(page.getByRole('heading', { name: /Issue New Prescription/i })).toBeVisible()
  })

  test('end-to-end create flow: pick patient → add med → submit → row appears', async ({
    page,
    loginAs,
  }) => {
    await loginAs('doctor')
    await page.getByRole('link', { name: /new prescription/i }).click()
    await expect(page).toHaveURL(/\/doctor\/prescriptions\/new$/)

    // Open the shadcn Select trigger, then pick the seeded patient.
    await page.getByRole('combobox').click()
    // shadcn/base-ui select renders items as listitem-like nodes; matching by
    // visible text is the most resilient selector across primitive versions.
    await page.getByText(SEED.patient.email, { exact: true }).first().click()

    const medName = uniqueMedName()
    await page.getByLabel('Medication name').first().fill(medName)
    await page.getByLabel('Dosage').first().fill('100mg')
    await page.getByLabel('Dispense quantity').first().fill('30')
    await page.getByLabel(/Patient instructions/i).first().fill('Once daily')

    const createResponse = page.waitForResponse(
      (res) =>
        res.url().endsWith('/prescriptions') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    )
    await page.getByRole('button', { name: /issue prescription/i }).click()
    await createResponse

    await expect(page).toHaveURL(/\/doctor\/prescriptions$/)
    const newRow = page.getByTestId('prescription-row').filter({ hasText: medName })
    await expect(newRow).toHaveCount(1)
    await expect(newRow.getByTestId('status-badge')).toHaveAttribute('data-status', 'PENDING')
  })

  test('validation: missing patient blocks submission with visible error', async ({
    page,
    loginAs,
  }) => {
    await loginAs('doctor')
    await page.goto('/doctor/prescriptions/new')
    await page.getByLabel('Medication name').first().fill(uniqueMedName())

    // The shadcn Select uses combobox semantics; submit without selecting.
    await page.getByRole('button', { name: /issue prescription/i }).click()
    await expect(page.getByTestId('form-error')).toContainText('Please select a patient')
    await expect(page).toHaveURL(/\/doctor\/prescriptions\/new$/)
  })

  test('validation: missing medication name blocks submission', async ({ page, loginAs }) => {
    await loginAs('doctor')
    await page.goto('/doctor/prescriptions/new')
    await page.getByRole('combobox').click()
    // shadcn/base-ui select renders items as listitem-like nodes; matching by
    // visible text is the most resilient selector across primitive versions.
    await page.getByText(SEED.patient.email, { exact: true }).first().click()
    // Leave medication name blank — HTML5 required attribute will block submit
    // before our validation runs, so we assert the field invalidity directly.
    const nameInput = page.getByLabel('Medication name').first()
    await page.getByRole('button', { name: /issue prescription/i }).click()
    await expect(nameInput).toHaveJSProperty('validity.valueMissing', true)
    await expect(page).toHaveURL(/\/doctor\/prescriptions\/new$/)
  })

  test('add/remove medication item rows', async ({ page, loginAs }) => {
    await loginAs('doctor')
    await page.goto('/doctor/prescriptions/new')

    const items = page.getByTestId('medication-item')
    await expect(items).toHaveCount(1)

    await page.getByRole('button', { name: /add item/i }).click()
    await expect(items).toHaveCount(2)
    await page.getByRole('button', { name: /add item/i }).click()
    await expect(items).toHaveCount(3)

    // Remove the second item — there's a remove button on each row.
    const removeButtons = page.getByRole('button', { name: /remove medication/i })
    await removeButtons.nth(1).click()
    await expect(items).toHaveCount(2)

    await removeButtons.nth(0).click()
    await expect(items).toHaveCount(1)

    // The lone remaining row's remove button is disabled.
    await expect(page.getByRole('button', { name: /remove medication/i })).toBeDisabled()
  })
})
