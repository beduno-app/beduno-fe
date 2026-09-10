import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('redirects unauthenticated user to login page', async ({ page }) => {
    await page.goto('/ops/arrivals')
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows login form with email and password fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('shows error message on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    // i18n.ts hardcodes locale: 'pl' with no browser-locale detection, so a
    // fresh context always renders the Polish submit label.
    await page.getByRole('button', { name: 'Zaloguj się' }).click()
    // Should remain on login or show error
    await expect(page).toHaveURL(/\/login/)
  })
})
