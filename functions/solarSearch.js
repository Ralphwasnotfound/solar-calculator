import { randomUUID } from 'node:crypto'

// Never print arbitrary error text, stacks, URLs, or provider payloads.
const errorNames = new Set(['Error', 'TypeError', 'SyntaxError', 'AbortError', 'TimeoutError'])
const errorCodes = new Set(['ABORT_ERR', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ENETUNREACH', 'EHOSTUNREACH', 'EACCES', 'EPERM', 'CERT_HAS_EXPIRED', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT', 'UND_ERR_SOCKET', 'UND_ERR_ABORTED'])
const safeError = (error) => ({
  errorName: errorNames.has(error?.name) ? error.name : 'OtherError',
  errorCode: errorCodes.has(error?.code) ? error.code : null,
  causeCode: errorCodes.has(error?.cause?.code) ? error.cause.code : null,
})

const text = (value) => typeof value === 'string' && value.trim() ? value.trim() : null
const number = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
export function safeUrl(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch { return null }
}

// Deliberately conservative title screening; not a product authenticity guarantee.
export function isPanel(item) {
  const title = text(item?.title) || ''
  const positive = /\b(?:solar\s+(?:pv\s+)?(?:panels?|modules?)|photovoltaic\s+(?:panels?|modules?)|pv\s+(?:panels?|modules?))\b/i
  const excluded = /\b(?:batter(?:y|ies)|inverters?|controllers?|generators?|power\s*stations?|mount(?:ing|s)?|brackets?|cables?|connectors?|chargers?|lights?|lighting|accessor(?:y|ies)|kits?|bundles?|adapters?|extension|replacement\s+parts?|stands?|clamps?|rails?|wiring)\b/i
  return positive.test(title) && !excluded.test(title)
}

export function normalizeResults(items) {
  const seen = new Set()
  return items.filter(isPanel).flatMap((item) => {
    const productUrl = safeUrl(item.product_link) || safeUrl(item.link)
    const externalId = text(item.product_id) || productUrl || `${item.title}|${item.source || ''}`
    if (seen.has(externalId)) return []
    seen.add(externalId)
    return [{
      sourceType: 'online', provider: 'serpapi', externalId,
      title: text(item.title), brand: text(item.brand), image: safeUrl(item.thumbnail),
      priceText: text(item.price), priceValue: number(item.extracted_price),
      currency: text(item.currency), seller: text(item.source),
      rating: number(item.rating), reviews: number(item.reviews), productUrl,
      watt: null, voc: null, vmp: null, isc: null, imp: null, efficiency: null,
      specificationsVerified: false,
    }]
  }).slice(0, 12)
}

export function createSearchHandler({ getKey, fetchImpl = fetch, now = Date.now }) {
  const cache = new Map()
  const pending = new Map()
  let calls = []
  return async (req, res) => {
    const started = Date.now()
    const requestId = randomUUID()
    const checkpoint = (event, details = {}) => console.info(JSON.stringify({
      component: 'onlineSolarPanels', requestId, event, elapsedMs: Date.now() - started, ...details,
    }))
    const respond = (status, body) => {
      checkpoint('response_returning', { status })
      return res.status(status).json(body)
    }
    checkpoint('handler_entered')
    try {
    res.set('Cache-Control', 'no-store')
    if (req.method !== 'GET') {
      res.set('Allow', 'GET')
      return respond(405, { error: 'Method not allowed.' })
    }
    const query = typeof req.query.q === 'string' ? req.query.q.trim().replace(/\s+/g, ' ').toLowerCase() : ''
    const valid = query.length <= 120 && (query.match(/[\p{L}\p{N}]/gu) || []).length >= 3
    checkpoint('query_validation_completed', { valid })
    if (!valid) {
      return respond(400, { error: 'Enter 3–120 meaningful characters.' })
    }
    const cached = cache.get(query)
    if (cached && cached.expires > now()) {
      checkpoint('cache_hit')
      return respond(200, { results: cached.results })
    }
    try {
      if (!pending.has(query)) {
        calls = calls.filter((time) => now() - time < 60000)
        if (calls.length >= 5) return respond(429, { error: 'Please try again later.' })
        checkpoint('secret_read_starting')
        const key = getKey()
        checkpoint('secret_presence', { present: Boolean(key) })
        if (!key) return respond(503, { error: 'Online search is not configured.' })
        calls.push(now())
        const request = (async () => {
          const url = new URL('https://serpapi.com/search.json')
          url.search = new URLSearchParams({ engine: 'google_shopping', q: `${query} solar panel`, gl: 'ph', hl: 'en', api_key: key }).toString()
          checkpoint('provider_fetch_starting')
          const response = await fetchImpl(url, { signal: AbortSignal.timeout(20000), redirect: 'error' })
          checkpoint('provider_headers_received')
          checkpoint('provider_http_status', { status: Number.isInteger(response.status) ? response.status : null })
          if (!response.ok) throw new Error('Provider unavailable')
          const body = await response.json()
          checkpoint('provider_body_parsed')
          // SerpApi may return its normal no-results message in `error`.
          const empty = body.search_information?.shopping_results_state === 'Fully empty'
          if (body.error && !empty) throw new Error('Provider unavailable')
          if (!empty && !Array.isArray(body.shopping_results)) throw new Error('Invalid provider response')
          const results = normalizeResults(body.shopping_results || [])
          checkpoint('normalization_completed', { resultCount: results.length })
          if (cache.size >= 30) cache.delete(cache.keys().next().value)
          cache.set(query, { results, expires: now() + 15 * 60000 })
          return results
        })()
        pending.set(query, request)
      } else {
        checkpoint('pending_request_joined')
      }
      return respond(200, { results: await pending.get(query) })
    } catch (error) {
      checkpoint('catch_entered', safeError(error))
      // Never return or log provider errors/URLs: they can contain credentials.
      return respond(502, { error: 'Online search is unavailable. Please try again later.' })
    } finally {
      pending.delete(query)
    }
    } finally {
      checkpoint('finally_cleanup_reached')
    }
  }
}
