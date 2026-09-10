import { test as setup } from '@playwright/test'

const authFile = 'e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  if (!email || !password) {
    throw new Error(
      'E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set to run the authenticated E2E suite.',
    )
  }

  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  // i18n.ts hardcodes locale: 'pl' with no browser-locale detection, so a
  // fresh context always renders the Polish submit label.
  await page.getByRole('button', { name: 'Zaloguj się' }).click()

  // Confirms the app itself (not just the request) considers the session valid.
  await page.waitForURL((url) => !url.pathname.startsWith('/login'))

  await page.context().storageState({ path: authFile })
})
