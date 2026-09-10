import { test, expect } from '@playwright/test'

test.describe('Smoke: authenticated arrivals journey', () => {
  test('an authenticated session reaches live arrivals data', async ({ page }) => {
    await page.goto('/ops/arrivals')

    // The guard now passes with a real session — no redirect to /login.
    await expect(page).toHaveURL(/\/ops\/arrivals/)

    // Nothing fetches until a property is selected (arrivals.store.ts:25's
    // empty default), so pick the test account's one property.
    const propertySelect = page.getByRole('combobox')
    await expect(propertySelect).toBeVisible()
    await propertySelect.selectOption({ index: 1 })

    // The component cleanly separates "API failed" (error state) from
    // "API succeeded" (table rows or the empty message) — reaching either
    // non-error branch is a true live-GET proof that doesn't depend on a
    // specific fixture row still existing.
    const arrivalsLoaded = page
      .getByRole('columnheader', { name: 'Pracownik' })
      .or(page.getByText('Brak przyjazdów na wybrany dzień.'))
    await expect(arrivalsLoaded).toBeVisible()
  })
})
