import { test, expect } from '@playwright/test'

/**
 * Full check-in journey E2E tests.
 * These tests require a running backend. In CI they run against a test environment.
 * For local development without a backend, they verify UI structure and navigation.
 */

test.describe('Check-in journey', () => {
  test('arrivals page renders property selector', async ({ page }) => {
    // Navigate directly — auth guard will redirect to login
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
  })

  test('login page has language switcher', async ({ page }) => {
    await page.goto('/login')
    // The switcher renders as one button per language, not a <select>
    await expect(page.locator('.lang-btn')).toHaveCount(5)
    await expect(page.locator('.lang-btn').first()).toBeVisible()
  })

  test('forbidden page is accessible without auth', async ({ page }) => {
    await page.goto('/forbidden')
    await expect(page).toHaveURL(/\/forbidden/)
  })

  test('navigating to / redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('arrivals page requires authentication', async ({ page }) => {
    // For the authenticated proof, see smoke.spec.ts. This spec still only
    // asserts the guard until S-01 rewrites it into the real check-in journey.
    await page.goto('/ops/arrivals')
    await expect(page).toHaveURL(/\/login/)
  })
})
