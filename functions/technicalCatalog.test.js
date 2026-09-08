import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createCatalogLoader, createTechnicalHandler, searchCatalog, SNAPSHOT_ID } from './technicalCatalog.js'

const load = createCatalogLoader()
async function request(query, method = 'GET', loader = load) {
  const res = { statusCode: 200, set() {}, status(n) { this.statusCode = n; return this }, json(body) { this.body = body; return this } }
  await createTechnicalHandler({ load: loader })({ query, method }, res)
  return res
}
test('real snapshot: exact model first, manufacturer searches and distinct variants', async () => {
  const c = await load()
  assert.equal(c.entries.length, 21601)
  for (const q of ['JKM550M-72HL4', 'Jinko JKM550M-72HL4']) assert.equal(searchCatalog(c, q).results[0].model, 'JKM550M-72HL4')
  for (const q of ['Jinko', 'Jinko 550W']) assert.ok(searchCatalog(c, q).total > 0)
  // This snapshot uses CSI Solar Co Ltd; no unverified manufacturer alias is inferred.
  assert.equal((await request({ q: 'Canadian Solar 550W' })).statusCode, 200)
  const variants = searchCatalog(c, 'JKM550M-72HL4', 50).results
  for (const model of ['JKM550M-72HL4', 'JKM550M-72HL4-BDVP', 'JKM550M-72HL4-TV']) assert.ok(variants.some(r => r.model === model))
  assert.ok(searchCatalog(c, 'Jinko 550W').results.every(r => r.watt === 550))
  assert.deepEqual(searchCatalog(c, '  JINKO   550w '), searchCatalog(c, 'Jinko 550W'))
  assert.equal(searchCatalog(c, 'JKM550M 72HL4').results[0].model, 'JKM550M-72HL4')
})
test('bounded pagination and no results', async () => {
  const first = await request({ q: 'Jinko', limit: '3' })
  const next = await request({ q: 'Jinko', limit: '3', offset: '3' })
  assert.equal(first.body.results.length, 3); assert.equal(first.body.nextOffset, 3)
  assert.ok(next.body.results.every(r => !first.body.results.some(x => x.id === r.id)))
  assert.equal((await request({ q: 'Jinko' })).body.results.length, 20)
  const none = await request({ q: 'notarealmanufacturerxyz' })
  assert.equal(none.statusCode, 200); assert.deepEqual(none.body.results, [])
})
test('invalid query, limit, offset and methods', async () => {
  for (const q of [undefined, '', ' ', '!', ['Jinko'], 'x'.repeat(161)]) assert.equal((await request({ q })).statusCode, 400)
  for (const limit of ['0', '-1', '51', '1.5', 'abc', ['2']]) assert.equal((await request({ q: 'Jinko', limit })).statusCode, 400)
  for (const offset of ['-1', '100001', 'x']) assert.equal((await request({ q: 'Jinko', offset })).statusCode, 400)
  assert.equal((await request({ q: 'Jinko' }, 'POST')).statusCode, 405)
})
test('defensive validation excludes unexpected invalid records', async () => {
  const c = await load()
  for (const field of ['watt', 'voc', 'vmp', 'isc', 'imp', 'efficiency']) for (const value of [null, 0, -1, NaN, Infinity, '550']) {
    const entry = c.entries.find(e => e.record.model === 'JKM550M-72HL4')
    const broken = { ...entry, record: { ...entry.record, [field]: value } }
    assert.equal(searchCatalog({ ...c, entries: [broken] }, 'Jinko').total, 0)
  }
})
test('unavailable, malformed and hash-corrupt catalogs yield sanitized errors', async () => {
  for (const read of [async () => { throw Error('/private/path secret') }, async () => Buffer.from('bad json'), async url => url.pathname.endsWith('manifest.json') ? Buffer.from(JSON.stringify({ snapshotId: SNAPSHOT_ID, schemaVersion: 1, snapshotSha256: 'bad' })) : Buffer.from('{}')]) {
    const res = await request({ q: 'Jinko' }, 'GET', createCatalogLoader({ read }))
    assert.equal(res.statusCode, 503)
    assert.deepEqual(res.body, { error: { code: 'CATALOG_UNAVAILABLE', message: 'Technical catalog is temporarily unavailable.' } })
  }
})
test('warm concurrent loads reused; quarantine never appears in returned catalog', async () => {
  let reads = 0
  const loader = createCatalogLoader({ read: async url => { reads++; return readFile(url) } })
  const [a, b] = await Promise.all([loader(), loader()])
  assert.equal(a, b); assert.equal(await loader(), a); assert.equal(reads, 2)
  const quarantine = JSON.parse(await readFile(new URL(`./data/cec/${SNAPSHOT_ID}/quarantine.json`, import.meta.url)))
  const names = new Set(a.entries.map(e => e.record.sourceRecordName))
  assert.ok(quarantine.every(r => !names.has(r.source.Name)))
})
