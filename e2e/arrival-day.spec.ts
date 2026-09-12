import { test, expect } from '@playwright/test'

test.describe('Arrival Day: manual check-in against the live API', () => {
  test('checking in a worker by manual ID shows the success toast', async ({ page }) => {
    const workerId = process.env.E2E_ARRIVAL_WORKER_ID
    if (!workerId) {
      throw new Error(
        'E2E_ARRIVAL_WORKER_ID must be set to a real internalId of a worker whose ' +
          "stay is EXPECTED_TODAY on the pilot-safe test account's property.",
      )
    }

    await page.goto('/ops/arrivals')
    await expect(page).toHaveURL(/\/ops\/arrivals/)

    const propertySelect = page.getByRole('combobox')
    await expect(propertySelect).toBeVisible()
    await propertySelect.selectOption({ index: 1 })

    // Manual-ID fallback is used instead of QR: it renders outside the
    // camera-permission branch, so it works headlessly without mocking
    // getUserMedia.
    await page.getByRole('button', { name: 'Scan QR' }).click()
    await page.getByPlaceholder('Worker internal ID').fill(workerId)
    await page.getByRole('button', { name: 'Confirm' }).click()

    // Structural-success signal: the app's own toast, not a hardcoded row —
    // real per ArrivalsToday.vue's toast.success(t('arrivals.checkInSuccess'))
    // call on both check-in paths.
    await expect(page.getByText('Checked in successfully.')).toBeVisible()
  })
})
