import { test as setup } from '@playwright/test'

setup('sign in at kds-auth', async ({ page, baseURL }) => {
  const { E2E_USER, E2E_PASSWORD } = process.env
  if (!E2E_USER || !E2E_PASSWORD) throw new Error('set E2E_USER and E2E_PASSWORD to a kds-auth test user')

  await page.goto('/')
  await page.locator('input[name="email"]').fill(E2E_USER)
  await page.locator('input[name="password"]').fill(E2E_PASSWORD)
  await page.locator('form:has(input[name="email"]) button[type="submit"]').click()
  await page.waitForURL((url) => url.origin === new URL(baseURL).origin && url.pathname !== '/callback')
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json', indexedDB: true })
})
