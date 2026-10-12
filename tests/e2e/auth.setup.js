import { test as setup } from '@playwright/test'
import { AUTH_STATE } from '../../playwright.config.js'

setup('sign in at the idp', async ({ page, baseURL }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Log ind' }).click()
  await page.waitForURL((url) => url.origin === new URL(baseURL).origin && url.pathname !== '/callback')
  await page.context().storageState({ path: AUTH_STATE, indexedDB: true })
})
