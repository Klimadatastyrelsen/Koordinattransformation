import { test, expect } from '@playwright/test'
import { createHash } from 'node:crypto'

const AUTH = 'https://auth.test'
const CRS = {
  srid: 'EPSG:25832', country: 'DK', title: 'ETRS89 / UTM Zone 32 Nord', title_short: 'ETRS89/UTM32N',
  area_of_use: 'Denmark', bounding_box: [8, 54.5, 15.3, 57.8],
  v1: 'Easting', v1_short: 'x', v1_unit: 'metre', v2: 'Northing', v2_short: 'y', v2_unit: 'metre',
  v3: null, v3_short: null, v3_unit: null, v4: null, v4_short: null, v4_unit: null,
}

test.use({ storageState: { cookies: [], origins: [] } })

// the mocks sit on other origins than koord, so they answer cors themselves
function reply(route, json) {
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, content-type' }
  if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
  return route.fulfill({ headers, json })
}

async function mockServices(context, tokenResponses) {
  const tokenRequests = []
  await context.route('**/.well-known/openid-configuration', (route) => reply(route, {
    authorization_endpoint: `${AUTH}/authorize`,
    token_endpoint: `${AUTH}/token`,
    revocation_endpoint: `${AUTH}/revoke`,
    end_session_endpoint: `${AUTH}/end-session`,
  }))
  await context.route(`${AUTH}/authorize**`, (route) => route.fulfill({ body: 'kds-auth' }))
  await context.route(`${AUTH}/token`, async (route) => {
    const params = new URLSearchParams(route.request().postData())
    tokenRequests.push(params)
    // widens the window in which two tabs could race
    await new Promise((resolve) => setTimeout(resolve, 300))
    return reply(route, tokenResponses[params.get('grant_type')])
  })
  await context.route('**/crs/', (route) => reply(route, { DK: ['EPSG:25832'], GL: [], Global: [] }))
  await context.route('**/crs/EPSG:25832', (route) => reply(route, CRS))
  await context.route('**/trans/**', (route) => reply(route, { v1: 0, v2: 0, v3: null, v4: null }))
  await context.route('**/{resolve,search}', (route) => reply(route, { input: '', matches: [] }))
  return tokenRequests
}

test('signs in with pkce and sends the bearer to webproj and bifrost', async ({ page, context, baseURL }) => {
  const tokenRequests = await mockServices(context, {
    authorization_code: { access_token: 'at-1', refresh_token: 'rt-1', id_token: 'id-1', expires_in: 3600 },
  })

  const authorize = page.waitForRequest(`${AUTH}/authorize**`)
  await page.goto('/')
  const params = new URL((await authorize).url()).searchParams
  expect(params.get('code_challenge_method')).toBe('S256')
  expect(params.get('scope')).toBe('openid offline_access')
  expect(params.get('resource')).toBeTruthy()

  const crs = page.waitForRequest('**/crs/')
  await page.goto(`/callback?code=code-1&state=${params.get('state')}`)
  expect((await crs).headers().authorization).toBe('Bearer at-1')
  await expect(page).toHaveURL(new URL('/', baseURL).href)
  await expect(page.getByRole('button', { name: 'Log ud' })).toBeAttached()

  const [exchange] = tokenRequests
  expect(exchange.get('grant_type')).toBe('authorization_code')
  expect(exchange.get('code')).toBe('code-1')
  expect(createHash('sha256').update(exchange.get('code_verifier')).digest('base64url')).toBe(params.get('code_challenge'))

  const resolve = page.waitForRequest((request) => request.url().endsWith('/resolve') && request.method() === 'POST')
  await page.locator('#address-search').fill('Rådhuspladsen 1')
  expect((await resolve).headers().authorization).toBe('Bearer at-1')
})

test('two tabs with an expired token refresh it once', async ({ page, context }) => {
  const tokenRequests = await mockServices(context, {
    refresh_token: { access_token: 'at-2', refresh_token: 'rt-2', expires_in: 3600 },
  })
  await page.goto('/About')
  await page.evaluate((session) => new Promise((resolve, reject) => {
    const request = indexedDB.open('koord-auth', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('session')
    request.onsuccess = () => {
      const transaction = request.result.transaction('session', 'readwrite')
      transaction.objectStore('session').put(session, 'current')
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(transaction.error)
    }
  }), { access_token: 'at-1', refresh_token: 'rt-1', id_token: 'id-1', expires_at: 0 })
  await page.close()

  const pages = [await context.newPage(), await context.newPage()]
  const crs = pages.map((page) => page.waitForRequest('**/crs/'))
  await Promise.all(pages.map((page) => page.goto('/')))

  for (const request of await Promise.all(crs)) expect(request.headers().authorization).toBe('Bearer at-2')
  expect(tokenRequests.filter((params) => params.get('grant_type') === 'refresh_token').map((params) => params.get('refresh_token'))).toEqual(['rt-1'])
})
