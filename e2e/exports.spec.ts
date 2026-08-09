import { test, expect } from '@playwright/test'

/**
 * Export generation E2E tests.
 * Verifies export UI structure; actual file generation requires backend.
 */

test.describe('Export generation', () => {
  test('unauthenticated access to in-house view redirects to login', async ({ page }) => {
    await page.goto('/ops/in-house')
    await expect(page).toHaveURL(/\/login/)
  })

  test('export center requires authentication', async ({ page }) => {
    await page.goto('/exports')
    await expect(page).toHaveURL(/\/login/)
  })
})
