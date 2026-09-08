// Session-only cache; never stores credentials or calculator selections.
const cache = new Map()
const pending = new Map()
export const normalizeQuery = (query) => query.trim().replace(/\s+/g, ' ').toLowerCase()
export const validQuery = (query) => query.length <= 120 && (query.match(/[\p{L}\p{N}]/gu) || []).length >= 3

export async function searchOnlinePanels(query) {
  const key = normalizeQuery(query)
  if (!validQuery(key)) throw new Error('Enter at least 3 letters or numbers (maximum 120 characters).')
  if (cache.has(key)) return cache.get(key)
  if (pending.has(key)) return pending.get(key)
  const request = (async () => {
    try {
      const response = await fetch(`/api/solar-panels?q=${encodeURIComponent(key)}`, {
        signal: AbortSignal.timeout(25000),
      })
      const body = await response.json()
      if (!response.ok) {
        const messages = {
          429: 'Online search is busy or its quota is exhausted. Please try again later.',
          502: 'The product search provider is unavailable or returned an API error. Please try again later.',
          503: 'The online search backend is not configured. Please configure its SerpApi key.',
        }
        throw new Error(messages[response.status] || 'Online search is unavailable. Please try again later.')
      }
      if (!Array.isArray(body.results)) throw new Error('Online search returned an invalid response.')
      if (cache.size >= 30) cache.delete(cache.keys().next().value)
      cache.set(key, body.results)
      return body.results
    } catch (error) {
      if (error.name === 'TimeoutError') throw new Error('Online search timed out. Please try again.')
      if (error instanceof SyntaxError || error instanceof TypeError) {
        throw new Error('Online search is unavailable. Check that the backend is running.')
      }
      throw error
    } finally {
      pending.delete(key)
    }
  })()
  pending.set(key, request)
  return request
}
