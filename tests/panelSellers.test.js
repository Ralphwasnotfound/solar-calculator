import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse } from '@vue/compiler-sfc'
import { sellerQuery, exactModelInTitle, findPanelSellers } from '../src/services/panelSellers.js'
const panel = Object.freeze({ manufacturer: 'Jinko Solar Co Ltd', model: 'JKM550M-72HL4', watt: 550, voc: 49.62 })
test('exact model query and conservative suffix matching', () => {
  assert.equal(sellerQuery(panel), 'Jinko Solar Co Ltd JKM550M-72HL4')
  assert.ok(exactModelInTitle('Jinko JKM550M-72HL4 solar panel', panel.model))
  assert.ok(exactModelInTitle('Jinko jkm550m 72hl4', panel.model))
  for (const title of ['Jinko 550W', 'JKM550M-72HL4-TV', 'JKM550M-72HL4 TV', 'JKM550M-72HL4/V', 'JKM550M-72HL4B']) assert.equal(exactModelInTitle(title, panel.model), false)
})
test('shopping fields are isolated, malformed rows skipped, missing values and links safe', async () => {
  const rows = await findPanelSellers(panel, async () => [null, {}, { title: 'generic panel', productUrl: 'javascript:alert(1)' }, { title: 'JKM550M-72HL4', watt: 9999, voc: 900, productUrl: 'https://example.com/product', image: 'bad' }])
  assert.equal(rows.length, 2); assert.equal(rows[0].exact, true)
  assert.equal(rows[0].priceText, 'Price unavailable'); assert.equal(rows[0].seller, 'Seller unavailable')
  assert.equal(rows[0].image, null); assert.equal(rows[1].productUrl, null)
  assert.equal(rows[0].watt, undefined); assert.equal(panel.watt, 550)
})
test('component has no automatic calls; explicit action and failure cannot mutate panel', async () => {
  const source = parse(readFileSync(new URL('../src/components/modals/PanelSellers.vue', import.meta.url), 'utf8')).descriptor.script.content
  let calls = 0
  const c = new Function('findPanelSellers', source.replace(/^import .*$/gm, '').replace('export default', 'return'))(async () => { calls++; throw Error('private secret') })
  const ctx = { ...c.data(), panel }
  assert.equal(calls, 0); assert.equal(c.mounted, undefined); assert.equal(c.watch, undefined); assert.equal(c.emits, undefined)
  await c.methods.find.call(ctx)
  assert.equal(calls, 1); assert.equal(ctx.loading, false); assert.ok(!ctx.error.includes('secret')); assert.equal(ctx.panel, panel)
})
test('repeated seller searches reuse existing session cache', async () => {
  const original = globalThis.fetch; let calls = 0
  globalThis.fetch = async () => { calls++; return new Response(JSON.stringify({ results: [{ title: 'CACHEMODEL-123 solar panel' }] })) }
  try {
    const p = { manufacturer: 'Cache Test', model: 'CACHEMODEL-123' }
    await Promise.all([findPanelSellers(p), findPanelSellers(p)])
    await findPanelSellers(p)
    assert.equal(calls, 1)
  } finally { globalThis.fetch = original }
})
