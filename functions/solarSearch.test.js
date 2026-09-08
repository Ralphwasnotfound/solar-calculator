import test from 'node:test'
import assert from 'node:assert/strict'
import { createSearchHandler, isPanel, normalizeResults, safeUrl } from './solarSearch.js'

const panel = { product_id: 'p1', title: 'Jinko Tiger Neo 550W Solar Panel', price: '₱5,000', extracted_price: 5000, source: 'Panel Store', thumbnail: 'https://example.com/panel.jpg', product_link: 'https://example.com/panel', rating: 4.5, reviews: 2 }
function response() {
  return { code: 200, headers: {}, set(k, v) { this.headers[k] = v; return this }, status(code) { this.code = code; return this }, json(body) { this.body = body; return this } }
}
const request = (q) => ({ method: 'GET', query: { q } })

test('conservative screening rejects accessories, kits and ambiguous products', () => {
  assert.equal(isPanel(panel), true)
  assert.equal(isPanel({ title: 'Jinko photovoltaic module' }), true)
  for (const title of ['Jinko 550W', 'battery', 'inverter', 'charge controller', 'solar generator', 'power station', 'mounting bracket', 'cable', 'connector', 'charger', 'solar light', 'accessory', 'kit', 'bundle', 'stand', 'clamp']) {
    assert.equal(isPanel({ title: title === 'Jinko 550W' ? title : `Solar panel ${title}` }), false, title)
  }
})

test('normalization retains actual fields, removes duplicates, and never infers specifications', () => {
  const rows = normalizeResults([panel, panel, { ...panel, product_id: 'p2', price: null, extracted_price: '5000', thumbnail: 'javascript:alert(1)', product_link: 'data:text/html,hello', watt: 550, efficiency: 21 }])
  assert.equal(rows.length, 2)
  assert.equal(rows[0].priceText, '₱5,000')
  assert.equal(rows[0].seller, 'Panel Store')
  assert.equal(rows[0].currency, null)
  assert.equal(rows[1].priceValue, null)
  assert.equal(rows[1].productUrl, null)
  assert.equal(rows[1].image, null)
  for (const row of rows) {
    for (const field of ['watt', 'voc', 'vmp', 'isc', 'imp', 'efficiency']) assert.equal(row[field], null)
    assert.equal(row.specificationsVerified, false)
  }
  assert.equal(safeUrl('https://user:pass@example.com'), null)
  assert.equal(normalizeResults(Array.from({ length: 20 }, (_, i) => ({ ...panel, product_id: String(i) }))).length, 12)
})

test('upstream request uses Philippines and English; cache coalesces concurrent and repeated queries', async () => {
  let calls = 0
  let release
  let time = 0
  const gate = new Promise((resolve) => { release = resolve })
  const handler = createSearchHandler({ getKey: () => 'TEST_ONLY', now: () => time, fetchImpl: async (url) => {
    calls++
    assert.equal(url.origin, 'https://serpapi.com')
    assert.equal(url.searchParams.get('engine'), 'google_shopping')
    assert.equal(url.searchParams.get('q'), 'jinko 550w solar panel')
    assert.equal(url.searchParams.get('gl'), 'ph')
    assert.equal(url.searchParams.get('hl'), 'en')
    await gate
    return { ok: true, json: async () => ({ shopping_results: [panel] }) }
  } })
  const a = response(), b = response()
  const first = handler(request(' Jinko   550W '), a)
  const second = handler(request('jinko 550w'), b)
  release()
  await Promise.all([first, second])
  await handler(request('JINKO 550W'), response())
  assert.equal(calls, 1)
  assert.deepEqual(a.body, b.body)
  assert.equal(JSON.stringify(a.body).includes('TEST_ONLY'), false)
  time = 16 * 60000
  await handler(request('jinko 550w'), response())
  assert.equal(calls, 2)
})

test('invalid queries, methods and missing key do not call provider', async () => {
  const handler = createSearchHandler({ getKey: () => '', fetchImpl: () => { assert.fail('unexpected provider call') } })
  for (const q of ['', '!!a', ['jinko'], 'x'.repeat(121)]) {
    const res = response(); await handler(request(q), res); assert.equal(res.code, 400)
  }
  const post = response(); await handler({ method: 'POST', query: {} }, post); assert.equal(post.code, 405)
  const missing = response(); await handler(request('jinko'), missing); assert.equal(missing.code, 503)
})

test('provider failures are sanitized and not cached; successful empty results are cached', async () => {
  let calls = 0
  const handler = createSearchHandler({ getKey: () => 'TEST_ONLY', fetchImpl: async () => {
    calls++
    return { ok: true, json: async () => calls === 1 ? { error: 'TEST_ONLY secret error' } : { shopping_results: [] } }
  } })
  const bad = response(); await handler(request('jinko'), bad)
  assert.equal(bad.code, 502); assert.equal(JSON.stringify(bad.body).includes('TEST_ONLY'), false)
  const good = response(); await handler(request('jinko'), good); assert.deepEqual(good.body, { results: [] })
  await handler(request('jinko'), response()); assert.equal(calls, 2)
})

test('uncached provider requests are throttled to five per minute per instance', async () => {
  let calls = 0
  const handler = createSearchHandler({ getKey: () => 'TEST_ONLY', fetchImpl: async () => {
    calls++; return { ok: true, json: async () => ({ shopping_results: [] }) }
  } })
  for (let i = 0; i < 5; i++) await handler(request(`jinko ${i}`), response())
  const res = response(); await handler(request('jinko six'), res)
  assert.equal(res.code, 429); assert.equal(calls, 5)
})

test('browser session cache shares repeated requests and retries after failure', async () => {
  const { searchOnlinePanels } = await import('../src/services/onlinePanels.js')
  const original = globalThis.fetch
  let calls = 0
  globalThis.fetch = async (url) => {
    calls++; assert.ok(url.startsWith('/api/solar-panels?q='))
    return { ok: true, json: async () => ({ results: normalizeResults([panel]) }) }
  }
  try {
    await Promise.all([searchOnlinePanels('Jinko 550W'), searchOnlinePanels(' jinko   550w ')])
    await searchOnlinePanels('JINKO 550W'); assert.equal(calls, 1)
    globalThis.fetch = async () => ({ ok: false, status: 502, json: async () => ({ error: 'provider detail' }) })
    await assert.rejects(searchOnlinePanels('trina solar'), /unavailable/)
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ results: [] }) })
    assert.deepEqual(await searchOnlinePanels('trina solar'), [])
  } finally { globalThis.fetch = original }
})
