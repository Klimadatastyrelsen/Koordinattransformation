// kds-auth sign-in as a public pkce client; one session in indexeddb, shared by all tabs

import { config } from './runtimeConfig.js'

const TRANSACTION = 'koord.auth.transaction'
const REFRESH_LOCK = 'koord.auth.refresh'
const EXPIRY_MARGIN_MS = 60_000

const redirectUri = () => `${location.origin}/callback`

let discovered
const discovery = () => discovered ??= fetch(`${config.authUrl}/.well-known/openid-configuration`)
  .then((response) => {
    if (!response.ok) throw new Error(`[auth] discovery failed: ${response.status}`)
    return response.json()
  })
  .catch((error) => {
    discovered = undefined
    throw error
  })

// must be indexeddb: firefox may grant the lock before another tab's localStorage write is visible
let opened
const database = () => opened ??= new Promise((resolve, reject) => {
  const request = indexedDB.open('koord-auth', 1)
  request.onupgradeneeded = () => request.result.createObjectStore('session')
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

// resolves on commit, so writes are visible to other tabs before the lock is released
const transact = async (mode, operation) => {
  const transaction = (await database()).transaction('session', mode)
  const request = operation(transaction.objectStore('session'))
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(request.result)
    transaction.onerror = transaction.onabort = () => reject(transaction.error)
  })
}
const read = async () => (await transact('readonly', (store) => store.get('current'))) ?? null
const write = (session) => transact('readwrite', (store) => store.put(session, 'current'))
const clear = () => transact('readwrite', (store) => store.delete('current'))

// expires_in instead of the jwt exp, so a skewed client clock does not matter
const toSession = (tokens, previous) => ({
  access_token: tokens.access_token,
  refresh_token: tokens.refresh_token ?? previous?.refresh_token,
  id_token: tokens.id_token ?? previous?.id_token,
  expires_at: Date.now() + tokens.expires_in * 1000,
})
const isFresh = (session) => session && session.expires_at - EXPIRY_MARGIN_MS > Date.now()

const base64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const randomString = () => base64url(crypto.getRandomValues(new Uint8Array(32)))

const post = async (endpoint, params) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    body: new URLSearchParams({ client_id: config.authClientId, ...params }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw Object.assign(new Error(`[auth] ${body.error ?? response.status}`), { code: body.error })
  }
  return body
}

const tokenRequest = async (params) => post((await discovery()).token_endpoint, params)

export const isSignedIn = async () => (await read()) !== null

export async function login(returnTo = location.pathname + location.search) {
  const { authorization_endpoint } = await discovery()
  const verifier = randomString()
  const state = randomString()
  sessionStorage.setItem(TRANSACTION, JSON.stringify({ verifier, state, returnTo }))
  const challenge = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  const url = new URL(authorization_endpoint)
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: config.authClientId,
    redirect_uri: redirectUri(),
    scope: 'openid offline_access',
    // without a resource the access token is opaque, and the gateway and bifrost reject it
    resource: config.authAudience,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  })
  location.assign(url)
}

export async function handleCallback({ code, state, error }) {
  const transaction = JSON.parse(sessionStorage.getItem(TRANSACTION) ?? 'null')
  sessionStorage.removeItem(TRANSACTION)
  if (!transaction || !code || state !== transaction.state) {
    throw new Error(`[auth] sign-in failed: ${error ?? 'state mismatch'}`)
  }
  await write(toSession(await tokenRequest({
    grant_type: 'authorization_code',
    code,
    code_verifier: transaction.verifier,
    redirect_uri: redirectUri(),
    resource: config.authAudience,
  })))
  return transaction.returnTo
}

async function signInAgain() {
  await clear()
  await login()
  throw new Error('[auth] session expired, signing in again')
}

export async function getAccessToken() {
  const current = await read()
  if (isFresh(current)) return current.access_token
  // kds-auth revokes every refresh token of the user on reuse, so tabs must never refresh concurrently
  return navigator.locks.request(REFRESH_LOCK, async () => {
    const session = await read()
    if (isFresh(session)) return session.access_token
    if (!session?.refresh_token) return signInAgain()
    let renewed
    try {
      renewed = toSession(await tokenRequest({ grant_type: 'refresh_token', refresh_token: session.refresh_token }), session)
    } catch (error) {
      if (error.code === 'invalid_grant') return signInAgain()
      throw error
    }
    await write(renewed)
    return renewed.access_token
  })
}

export async function authFetch(url, init = {}) {
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${await getAccessToken()}`)
  return fetch(url, { ...init, headers })
}

export async function logout() {
  const session = await read()
  await clear()
  const { revocation_endpoint, end_session_endpoint } = await discovery()
  // end-session leaves offline_access refresh tokens alive, so revoke ours explicitly
  if (session?.refresh_token) {
    await post(revocation_endpoint, { token: session.refresh_token, token_type_hint: 'refresh_token' })
      .catch((error) => console.error('[auth] refresh token revocation failed', error))
  }
  const url = new URL(end_session_endpoint)
  url.search = new URLSearchParams({ client_id: config.authClientId, post_logout_redirect_uri: `${location.origin}/` })
  if (session?.id_token) url.searchParams.set('id_token_hint', session.id_token)
  location.assign(url)
}
