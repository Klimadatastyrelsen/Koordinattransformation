// runtime config from window.__CONFIG__ (populated by index.html).
// new vars: add a placeholder in index.html and a key below.

const cfg = (typeof window !== 'undefined' && window.__CONFIG__) || {}

export const config = {
  apiBaseUrl: cfg.VITE_API_BASE_URL || '',
  apiBasePath: cfg.VITE_API_BASE_PATH || '',
  dataforsyningToken: cfg.VITE_DATAFORSYNING_TOKEN || '',
  datafordelerToken: cfg.VITE_DATAFORDELER_TOKEN || '',
  authUrl: cfg.VITE_AUTH_URL || '',
  authClientId: cfg.VITE_AUTH_CLIENT_ID || '',
  authAudience: cfg.VITE_AUTH_AUDIENCE || '',
  bifrostUrl: cfg.VITE_BIFROST_URL || '',
}
