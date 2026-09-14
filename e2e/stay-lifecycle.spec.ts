import { test, expect } from '@playwright/test'

// Extends testing-live-journey-beduno-be: that change proved Arrival Day, Nightly List,
// and Inspection Day each in isolation, but every one of those specs assumes its
// precondition already exists on the live pilot account (a worker already
// EXPECTED_TODAY, a room already occupied). This spec proves the app's own /stays/new
// creation flow produces a stay that flows correctly through check-in, check-out, and
// occupancy — one continuous loop, not three independently-true fragments.
//
// i18n.ts hardcodes locale: 'pl' with no browser-locale detection, so a fresh context
// always renders Polish labels — locators below use the real Polish strings, matching
// the other live specs' own convention.
test.describe('Stay Lifecycle: create, check in, check out against the live API', () => {
  test.beforeEach(({ page }) => {
    // Check-out goes through a native confirm() dialog, same as nightly-list.spec.ts.
    page.on('dialog', (dialog) => dialog.accept())
  })

  test('a stay created via the UI can be checked in, then checked out, with occupancy reflecting both', async ({
    page,
  }) => {
    const workerId = process.env.E2E_LIFECYCLE_WORKER_ID
    const workerInternalId = process.env.E2E_LIFECYCLE_WORKER_INTERNAL_ID
    if (!workerId || !workerInternalId) {
      throw new Error(
        'E2E_LIFECYCLE_WORKER_ID (the worker\'s UUID) and E2E_LIFECYCLE_WORKER_INTERNAL_ID ' +
          '(the same worker\'s internalId) must both be set to a real, stay-free worker on ' +
          "the pilot-safe test account's property. These are two different identifier " +
          'shapes for the same worker: the UUID is what /stays/new selects by, the ' +
          'internalId is what the arrivals manual-ID fallback takes.',
      )
    }

    // --- Step 1: create the stay via /stays/new ---
    await page.goto('/stays/new')
    await expect(page).toHaveURL(/\/stays\/new/)

    const [workerSelect, propertySelect, roomSelect] = await page.getByRole('combobox').all()
    await workerSelect.selectOption(workerId)
    await propertySelect.selectOption({ index: 1 })
    await roomSelect.selectOption({ index: 1 })

    // Capture the room number the app itself assigned, to find it again on /ops/in-house
    // later — never assume which room was picked.
    const selectedRoomLabel = await roomSelect
      .locator('option:checked')
      .textContent()
    const roomNumber = selectedRoomLabel?.split('(')[0]?.trim()
    if (!roomNumber) {
      throw new Error(`Could not read a room number from the selected room option: "${selectedRoomLabel}"`)
    }

    const today = new Date().toISOString().slice(0, 10)
    await page.locator('input[type="date"]').first().fill(today)

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/stays') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Zapisz' }).click(),
    ])

    // --- Step 2: capture the room's occupant-count BASELINE before check-in ---
    // /properties/{id}/occupancy lists every room regardless of occupancy, so the card
    // exists whether or not anyone is checked in yet — this baseline read works even for
    // an empty room. The stay we just created is EXPECTED_TODAY, not yet CHECKED_IN, so
    // it must not already be counted here; if it is, that's itself a real finding.
    await page.goto('/ops/in-house')
    await expect(page).toHaveURL(/\/ops\/in-house/)

    const inHousePropertySelect = page.getByRole('combobox')
    await expect(inHousePropertySelect).toBeVisible()
    await inHousePropertySelect.selectOption({ index: 1 })

    const roomCard = page
      .getByTestId('room-card')
      .filter({ has: page.getByTestId('room-number').getByText(roomNumber, { exact: true }) })
    await expect(roomCard).toBeVisible()
    const baselineOccupants = await roomCard.getByTestId('occupant').count()

    // --- Step 3: check the stay in via /ops/arrivals ---
    await page.goto('/ops/arrivals')
    await expect(page).toHaveURL(/\/ops\/arrivals/)

    const arrivalsPropertySelect = page.getByRole('combobox')
    await expect(arrivalsPropertySelect).toBeVisible()
    await arrivalsPropertySelect.selectOption({ index: 1 })

    await page.getByRole('button', { name: 'Skanuj QR' }).click()
    await page.getByPlaceholder('Wewnętrzny ID pracownika').fill(workerInternalId)
    await page.getByRole('button', { name: 'Potwierdź' }).click()
    await expect(page.getByText('Zameldowano pomyślnie.')).toBeVisible()

    // --- Step 4: verify occupancy went UP by exactly one on /ops/in-house ---
    // A delta assertion, not a "nonzero" one: it fails if check-in silently no-ops just
    // as reliably as it would if some *other* occupant already made the count nonzero.
    await page.goto('/ops/in-house')
    await expect(page).toHaveURL(/\/ops\/in-house/)

    const inHousePropertySelectAfterCheckIn = page.getByRole('combobox')
    await expect(inHousePropertySelectAfterCheckIn).toBeVisible()
    await inHousePropertySelectAfterCheckIn.selectOption({ index: 1 })

    const roomCardAfterCheckIn = page
      .getByTestId('room-card')
      .filter({ has: page.getByTestId('room-number').getByText(roomNumber, { exact: true }) })
    await expect(roomCardAfterCheckIn).toBeVisible()
    await expect(roomCardAfterCheckIn.getByTestId('occupant')).toHaveCount(baselineOccupants + 1)

    // --- Step 5: check the stay out from the same room card ---
    await roomCardAfterCheckIn.getByRole('button', { name: 'Wymelduj' }).first().click()
    await expect(page.getByText('Wymeldowano pomyślnie.')).toBeVisible()

    // --- Step 6: verify occupancy is back to BASELINE after check-out ---
    await page.reload()
    const inHousePropertySelectAfterCheckOut = page.getByRole('combobox')
    await expect(inHousePropertySelectAfterCheckOut).toBeVisible()
    await inHousePropertySelectAfterCheckOut.selectOption({ index: 1 })

    const roomCardAfterCheckOut = page
      .getByTestId('room-card')
      .filter({ has: page.getByTestId('room-number').getByText(roomNumber, { exact: true }) })
    await expect(roomCardAfterCheckOut).toBeVisible()
    await expect(roomCardAfterCheckOut.getByTestId('occupant')).toHaveCount(baselineOccupants)
  })
})
