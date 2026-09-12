import { test, expect } from '@playwright/test'

test.describe('Inspection Day: full walkthrough against the live API', () => {
  test.beforeEach(({ page }) => {
    // The "Complete inspection" action goes through a native confirm() dialog.
    page.on('dialog', (dialog) => dialog.accept())
  })

  test.afterEach(async ({ page }) => {
    // Accepted-risk cleanup: inspection.api.ts has no delete/cancel
    // endpoint, so a room-by-room failure could leave an inspection open
    // on the server with no way to remove it. Always attempt to complete
    // whatever inspection is still active, regardless of the test body's
    // outcome — only a hard crash (not a normal assertion failure) could
    // still leave one orphaned. A narrow, documented residual risk, not a
    // blocking one; see plan.md's Key Discoveries.
    const completeButton = page.getByRole('button', { name: 'Complete inspection' })
    if (await completeButton.isVisible().catch(() => false)) {
      await completeButton.click()
    }
  })

  test('completing a full room-by-room walkthrough shows the summary report', async ({
    page,
  }) => {
    await page.goto('/ops/inspection')
    await expect(page).toHaveURL(/\/ops\/inspection/)

    const propertySelect = page.getByRole('combobox')
    await expect(propertySelect).toBeVisible()
    await propertySelect.selectOption({ index: 1 })

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/inspections') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Start inspection' }).click(),
    ])

    // Data-driven walkthrough: never assume a fixed room/occupant count,
    // since this runs against whatever the live pilot property actually
    // has. Each state-changing click is paired with waitForResponse
    // rather than a toast-text race, since multiple toasts can stack for
    // rooms with several occupants.
    let hasNextRoom = true
    while (hasNextRoom) {
      let presentCount = await page.getByRole('button', { name: 'Present' }).count()
      while (presentCount > 0) {
        await Promise.all([
          page.waitForResponse((r) => r.url().includes('/presence') && r.request().method() === 'POST'),
          page.getByRole('button', { name: 'Present' }).first().click(),
        ])
        presentCount = await page.getByRole('button', { name: 'Present' }).count()
      }

      await Promise.all([
        page.waitForResponse((r) => r.url().includes('/verify') && r.request().method() === 'POST'),
        page.getByRole('button', { name: 'Mark as verified' }).click(),
      ])

      const nextRoomButton = page.getByRole('button', { name: 'Next room' })
      hasNextRoom = await nextRoomButton.isVisible().catch(() => false)
      if (hasNextRoom) {
        await nextRoomButton.click()
      }
    }

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/complete') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Complete inspection' }).click(),
    ])

    // Structural-success signal: the summary report becoming visible means
    // completedAt got set server-side, not a hardcoded assertion about
    // specific room/occupant data.
    await expect(page.getByText('Inspection completed.')).toBeVisible()
    await expect(page.getByText('Inspection summary')).toBeVisible()
  })
})
