import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { parse } from '@vue/compiler-sfc'
import { verifyOnlinePanel, technicalFields } from '../src/utils/verifiedOnlinePanel.js'

const panel = { id: 'trusted-1', brand: 'Jinko', model: 'Tiger Neo 550W', watt: 550, voc: 50, vmp: 42, isc: 14, imp: 13, efficiency: 21 }
const listing = { externalId: 'online-1', title: 'Jinko Tiger Neo 550W Solar Panel', image: 'https://example.com/image', priceText: '₱5,000', seller: 'Shop', productUrl: 'https://example.com/product' }

test('exact formatting matches preserve shopping metadata and use the original trusted object', () => {
  for (const title of [listing.title, '  JINKO / Tiger-Neo / 550 W / Solar Panel ', 'Jinko Tiger Neo 550 watts']) {
    const result = verifyOnlinePanel({ ...listing, title, watt: 999, specificationsVerified: true }, [panel])
    assert.equal(result.specificationsVerified, true)
    assert.equal(result.matchedPanel, panel)
    assert.equal(result.matchedPanelId, panel.id)
    assert.equal(result.priceText, listing.priceText)
    for (const field of technicalFields) assert.equal(result[field], panel[field])
  }
  assert.equal(listing.specificationsVerified, undefined)
  assert.equal(panel.sourceType, undefined)
})

test('family plus watts or full model code may match, but partial and conflicting variants do not', () => {
  assert.equal(verifyOnlinePanel(listing, [{ ...panel, model: 'Tiger Neo' }]).specificationsVerified, true)
  const code = { ...panel, model: 'JKM550M-72HL4-V' }
  assert.equal(verifyOnlinePanel({ ...listing, title: 'Jinko JKM550M 72HL4 V Solar Panel' }, [code]).specificationsVerified, true)
  for (const title of ['Jinko 550W', 'Jinko Tiger Neo', 'Jinko Tiger Neo 560W Solar Panel', 'Jinko Tiger Neo 550W bifacial Solar Panel', 'Jinko Tiger Neo 550W 600W', 'Jinko Tiger Neo 55.0W']) {
    assert.equal(verifyOnlinePanel({ ...listing, title }, [panel]).specificationsVerified, false, title)
  }
  assert.equal(verifyOnlinePanel({ ...listing, brand: 'Other' }, [panel]).specificationsVerified, false)
  assert.equal(verifyOnlinePanel({ ...listing, title: 'Jinko 550W Solar Panel' }, [{ ...panel, model: '550W' }]).specificationsVerified, false)
  assert.equal(verifyOnlinePanel({ ...listing, title: 'Jinko JKM550M 72HL4 V2 Solar Panel' }, [code]).specificationsVerified, false)
})

test('all identity duplicates are ambiguous, including incomplete duplicates', () => {
  for (const duplicate of [{ ...panel, id: 'other' }, { ...panel, id: 'other', voc: null }, { ...panel, id: 'other', model: 'Tiger-Neo 550 W' }]) {
    assert.equal(verifyOnlinePanel(listing, [panel, duplicate]).specificationsVerified, false)
  }
  assert.equal(verifyOnlinePanel(listing, [panel, { ...panel, id: 'other', model: 'Tiger Neo 560W', watt: 560 }]).specificationsVerified, true)
})

test('invalid technical data, missing IDs and upstream verification claims never grant selection', () => {
  for (const field of technicalFields) {
    for (const value of [undefined, null, '550', 0, -1, Infinity, NaN]) {
      const result = verifyOnlinePanel(listing, [{ ...panel, [field]: value }])
      assert.equal(result.specificationsVerified, false)
      assert.equal(result.matchedPanel, null)
      for (const f of technicalFields) assert.equal(result[f], null)
    }
  }
  assert.equal(verifyOnlinePanel(listing, [{ ...panel, id: null }]).specificationsVerified, false)
  const fake = verifyOnlinePanel({ ...listing, ...Object.fromEntries(technicalFields.map(f => [f, 123])), specificationsVerified: true }, [])
  assert.equal(fake.specificationsVerified, false)
  for (const field of technicalFields) assert.equal(fake[field], null)
})

test('selection revalidates current records and emits only the trusted panel', () => {
  const source = parse(fs.readFileSync(new URL('../src/components/modals/OnlinePanelSearch.vue', import.meta.url), 'utf8')).descriptor.script.content
  const component = new Function('verifyOnlinePanel', source.replace(/^import .*$/gm, '').replace('export default', 'return'))(verifyOnlinePanel)
  const emitted = []
  const ctx = { panels: [panel], results: [listing], panelsLoading: false, panelsError: '', $emit: (...args) => emitted.push(args) }
  const result = verifyOnlinePanel(listing, ctx.panels)
  component.methods.selectVerified.call(ctx, result)
  assert.equal(emitted[0][0], 'select')
  assert.equal(emitted[0][1], panel)
  ctx.panels = [panel, { ...panel, id: 'duplicate' }]
  component.methods.selectVerified.call(ctx, result)
  ctx.panels = [panel]; ctx.panelsError = 'unavailable'
  component.methods.selectVerified.call(ctx, result)
  ctx.panelsError = ''; ctx.panelsLoading = true
  component.methods.selectVerified.call(ctx, result)
  assert.equal(emitted.length, 1)
})
