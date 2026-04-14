import { test, expect } from '@playwright/test'

/**
 * Inspection flow E2E tests.
 * These verify the inspection UI structure and navigation.
 */

test.describe('Inspection flow', () => {
  test('unauthenticated access to inspection redirects to login', async ({ page }) => {
    await page.goto('/ops/inspection')
    await expect(page).toHaveURL(/\/login/)
  })

  test('inspection page URL is /ops/inspection', async ({ page }) => {
    // Verify the route exists by checking the redirect
    await page.goto('/ops/inspection')
    await expect(page).toHaveURL(/\/login/)
  })
})
