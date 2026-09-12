import { test, expect } from '@playwright/test'

test.describe('Nightly List: roster occupancy and checkout against the live API', () => {
  test.beforeEach(({ page }) => {
    // The check-out flow goes through a native confirm() dialog.
    page.on('dialog', (dialog) => dialog.accept())
  })

  test('a known-occupied room genuinely shows its occupants, and checkout succeeds', async ({
    page,
  }) => {
    const roomNumber = process.env.E2E_OCCUPIED_ROOM_NUMBER
    if (!roomNumber) {
      throw new Error(
        'E2E_OCCUPIED_ROOM_NUMBER must be set to a real room number that is currently ' +
          "occupied on the pilot-safe test account's property.",
      )
    }

    await page.goto('/ops/in-house')
    await expect(page).toHaveURL(/\/ops\/in-house/)

    const propertySelect = page.getByRole('combobox')
    await expect(propertySelect).toBeVisible()
    await propertySelect.selectOption({ index: 1 })

    // This is the load-bearing assertion, not a tolerant either/or: a
    // fully tolerant "empty room or occupied room, either is fine" check
    // would silently pass in exactly the failure mode this journey exists
    // to catch (occupants[] coming back empty from the live API). We
    // assert a specific, known-occupied fixture room genuinely shows a
    // nonzero occupant count.
    const roomCard = page
      .getByTestId('room-card')
      .filter({ has: page.getByTestId('room-number').getByText(roomNumber) })
    await expect(roomCard).toBeVisible()
    await expect(roomCard.getByTestId('occupant')).not.toHaveCount(0)

    // Checkout is a tolerant structural-success check: any occupant in the
    // known-occupied room proves the action, not the roster's baseline
    // state.
    //
    // i18n.ts hardcodes locale: 'pl', so locators use the real Polish
    // strings — matching auth.setup.ts's own convention.
    await roomCard.getByRole('button', { name: 'Wymelduj' }).first().click()
    await expect(page.getByText('Wymeldowano pomyślnie.')).toBeVisible()
  })
})
