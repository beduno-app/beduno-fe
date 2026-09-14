import { defineConfig, devices } from '@playwright/test'

const STORAGE_STATE = 'e2e/.auth/user.json'
const AUTHENTICATED_SPECS = /(smoke|arrival-day|nightly-list|inspection-day|stay-lifecycle)\.spec\.ts$/

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: AUTHENTICATED_SPECS,
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: AUTHENTICATED_SPECS,
    },
    {
      name: 'chromium-authenticated',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      testMatch: AUTHENTICATED_SPECS,
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Chrome-authenticated',
      use: { ...devices['Pixel 5'], storageState: STORAGE_STATE },
      testMatch: AUTHENTICATED_SPECS,
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
