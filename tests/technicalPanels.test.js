import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse, compileTemplate } from '@vue/compiler-sfc'
import { searchTechnicalPanels, toCalculatorPanel } from '../src/services/technicalPanels.js'
import { getSystemDesign, saveSystemDesign } from '../src/utils/systemStorage.js'

const panel = { sourceRecordName: 'Jinko Solar Co Ltd JKM550M-72HL4', id: 'cec-one', brand: 'Jinko Solar Co Ltd', manufacturer: 'Jinko Solar Co Ltd', model: 'JKM550M-72HL4', watt: 550, voc: 49.62, vmp: 40.9, isc: 14.03, imp: 13.45, efficiency: 22, specificationsVerified: true, provenance: { snapshotRevision: 'pinned' } }
const page = (results, nextOffset = null) => ({ results, total: results.length, nextOffset, snapshotId: 'snapshot' })
const source = readFileSync(new URL('../src/components/modals/TechnicalPanelSearch.vue', import.meta.url), 'utf8')
function component(search) {
  return new Function('searchTechnicalPanels', 'toCalculatorPanel', parse(source).descriptor.script.content.replace(/^import .*$/gm, '').replace('export default', 'return'))(search, toCalculatorPanel)
}
function context(c) { const ctx = { ...c.data(), $emit: (...args) => ctx.emitted.push(args), emitted: [] }; for (const [k, f] of Object.entries(c.methods)) ctx[k] = f.bind(ctx); return ctx }

test('service requests bounded technical endpoint and sanitizes failures', async () => {
  let url
  assert.deepEqual(await searchTechnicalPanels({ q: 'Jinko 550W', offset: 20 }, async u => { url = u; return new Response(JSON.stringify(page([panel]))) }), page([panel]))
  assert.ok(url.startsWith('/api/technical-panels?')); assert.ok(url.includes('offset=20'))
  for (const status of [400, 503, 500]) await assert.rejects(searchTechnicalPanels({ q: 'Jinko' }, async () => new Response('secret', { status })), error => !error.message.includes('secret'))
  await assert.rejects(searchTechnicalPanels({ q: 'Jinko' }, async () => { throw Error('private path') }), /Unable to reach/)
  await assert.rejects(searchTechnicalPanels({ q: 'Jinko' }, async () => new Response('{}')), /invalid response/)
})
test('technical search retains exact variants, paginates submitted query and emits validated panel', async () => {
  const variant = { ...panel, id: 'cec-two', model: 'JKM550M-72HL4-TV' }
  const calls = []
  const c = component(async args => { calls.push(args); return args.offset ? page([variant]) : page([panel], 20) })
  const ctx = context(c); ctx.query = 'Jinko 550W'
  await ctx.search(); ctx.query = 'edited but not submitted'; await ctx.search(true)
  assert.equal(calls[1].q, 'Jinko 550W'); assert.equal(calls[1].offset, 20)
  assert.deepEqual(ctx.results.map(r => r.model), [panel.model, variant.model])
  ctx.select(variant)
  assert.equal(ctx.emitted[0][0], 'select'); assert.equal(ctx.emitted[0][1].model, variant.model)
  assert.notEqual(ctx.emitted[0][1], variant)
  ctx.select({ ...variant }); assert.equal(ctx.emitted.length, 1)
  const compiled = compileTemplate({ source: parse(source).descriptor.template.content, filename: 'TechnicalPanelSearch.vue', id: 'test' })
  assert.deepEqual(compiled.errors, [])
  assert.match(compiled.code, /panel.model/)
})
test('invalid and unverified values never emit', () => {
  const ctx = context(component(async () => page([])))
  for (const field of ['watt', 'voc', 'vmp', 'isc', 'imp', 'efficiency']) for (const value of [0, -1, NaN, Infinity, '550', null]) {
    const bad = { ...panel, [field]: value }; ctx.results = [bad]; ctx.select(bad); assert.equal(toCalculatorPanel(bad), null)
  }
  assert.equal(toCalculatorPanel({ ...panel, specificationsVerified: false }), null)
  assert.equal(ctx.emitted.length, 0)
})
test('empty, error, loading and changed-snapshot states', async () => {
  const empty = context(component(async () => page([]))); empty.query = 'Jinko'; await empty.search()
  assert.equal(empty.searched, true); assert.deepEqual(empty.results, []); assert.equal(empty.loading, false)
  const failed = context(component(async () => { throw Error('Unavailable') })); failed.query = 'Jinko'; await failed.search()
  assert.equal(failed.error, 'Unavailable'); assert.equal(failed.loading, false)
  let finish
  const pending = context(component(() => new Promise(resolve => { finish = resolve }))); pending.query = 'Jinko'
  const task = pending.search(); assert.equal(pending.loading, true); finish(page([panel])); await task
  const changed = context(component(async () => ({ ...page([panel]), snapshotId: 'new' })))
  changed.submittedQuery = 'Jinko'; changed.nextOffset = 20; changed.snapshotId = 'old'; await changed.search(true)
  assert.match(changed.error, /updated/); assert.deepEqual(changed.results, [])
})
test('existing selection closes modal and persists/restores exact technical specifications', async () => {
  const s = parse(readFileSync(new URL('../src/components/steps/PanelSizing.vue', import.meta.url), 'utf8')).descriptor.script.content
  const c = new Function('getSystemDesign', 'saveSystemDesign', 'PanelSearchModal', 'PanelSellers', s.replace(/^import .*$/gm, '').replace('export default', 'return'))(getSystemDesign, saveSystemDesign, {}, {})
  const oldStorage = globalThis.localStorage, oldWindow = globalThis.window
  let stored = null
  globalThis.localStorage = { getItem: () => stored, setItem: (_, value) => { stored = value } }
  globalThis.window = { dispatchEvent() {} }
  try {
    const ctx = { ...c.data(), requiredSolar: 1, panelsNeeded: 3, totalPvPower: 1650, dailyWh: 4000, sunHours: 4 }
    const selected = toCalculatorPanel(panel)
    c.methods.selectPanel.call(ctx, selected)
    assert.equal(ctx.showModal, false); assert.equal(ctx.search, `${panel.brand} ${panel.model}`)
    c.watch.$data.handler.call(ctx)
    assert.deepEqual(getSystemDesign().solar.selectedPanel, selected)
    const restored = { ...c.data(), loadPanels: async () => {} }
    await c.mounted.call(restored)
    assert.deepEqual(restored.selectedPanel, selected)
  } finally { globalThis.localStorage = oldStorage; globalThis.window = oldWindow }
})

