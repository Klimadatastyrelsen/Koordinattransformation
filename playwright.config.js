import { defineConfig, devices } from '@playwright/test'

// written by auth.setup.js
const AUTH_STATE = 'tests/e2e/.auth/user.json'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 20 * 1000,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    screenshot: 'on',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    permissions: ['geolocation', 'notifications'],
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: AUTH_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'], storageState: AUTH_STATE },
      dependencies: ['setup'],
    },
    // Wait for stable version of Webkit for Linux or dockerize test environment to include this
    /*
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari']}
    },
    */
  ],
  webServer: {
    command: 'npm run build:test && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
})


