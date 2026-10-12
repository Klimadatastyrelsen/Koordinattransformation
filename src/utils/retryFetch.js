const {fetch: originalFetch} = window


//
const retryCriteria = (response) => {
  //magic number, retry on serverside error. Client Side errors (3xx and 4xx) are ignored
  return !response.ok && response.status >= 500
}
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))


/**
 * Wrapper for @function window.fetch
 * This function overwrites fetch to retry in case of a 5xx-based error-code. 
 * It is intended to add stability to koordinattransformation, in case webproj or another dependency of the site becomes unreliable
 * Solution is based on: https://www.fabiofranchino.com/log/how-to-override-fetch-in-javascript-to-intercept-it/
 * @param {Array} args  (same args as fetch: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
 */
window.fetch = async (...args) => {
  let [resource, config] = args

  const method = config?.method || 'GET'

  if(method !== 'GET') {
    return originalFetch(resource, config)
  }

  const maxAttempts = 3 
  const delay = 100 //100 ms delay ensures that application doesn't spam calls

  let attempt = 0
  let response 
  while(attempt < maxAttempts) {

    try {
      response = await originalFetch(resource, config)

      if(response.ok || !retryCriteria(response) ){
        return response
      }

    } catch (error) {
      console.error(`[retryFetch] error: ${error}`)
    }
    attempt++
    await wait(delay)
  }
  console.warn(`[retryFetch] warning: fetch failed ${maxAttempts} times. Application proceeds as if service is not available`)
  return response
}