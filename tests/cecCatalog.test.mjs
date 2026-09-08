import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { normalizeCatalog, parseCsv, identityId, importCatalog, sha256, DEFAULT_REVISION } from '../scripts/importCecModules.mjs'

const header = ['Name', 'Manufacturer', 'STC', 'V_oc_ref', 'V_mp_ref', 'I_sc_ref', 'I_mp_ref', 'A_c', 'Version', 'Date']
const base = ['Jinko Solar Co Ltd JKM550M-72HL4', 'Jinko Solar Co Ltd', '550', '49.62', '40.9', '14.03', '13.45', '2.5', 'v1', '2026-06-23']
function csv(records = [base]) {
  return [header, ['Units', '', '', 'V', 'V', 'A', 'A', 'm2', '', ''], ['[0]', '', '', '', '', '', '', '', '', ''], ...records].map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n')
}
const download = text => async () => new Response(text)

test('SAM intro rows, numeric conversion, efficiency and exact identity', () => {
  const result = normalizeCatalog('\uFEFF' + csv())
  assert.equal(result.totalSourceRecords, 1)
  assert.equal(result.rejected.length, 0)
  const r = result.records[0]
  assert.equal(r.sourceRecordName, base[0]); assert.equal(r.manufacturer, base[1])
  assert.equal(r.model, 'JKM550M-72HL4'); assert.equal(r.watt, 550)
  assert.equal(r.efficiency, 22); assert.equal(r.areaM2, 2.5)
  assert.equal(r.id, identityId(base[0]))
})
test('CSV quoted commas, quotes and newlines; malformed input rejected', () => {
  assert.deepEqual(parseCsv('"a,b","c""d","x\ny"\r\n'), [['a,b', 'c"d', 'x\ny']])
  assert.throws(() => parseCsv('"unterminated'))
  assert.throws(() => parseCsv('"a"oops'))
  assert.throws(() => normalizeCatalog(csv().replace('Units', 'Products')))
  assert.throws(() => normalizeCatalog(csv().replace('"m2"', '"ft2"')))
})
test('suffix variants remain separate and IDs are deterministic across order', () => {
  const variant = [...base]; variant[0] += '-BDVP'
  const a = normalizeCatalog(csv([base, variant])).records
  const b = normalizeCatalog(csv([variant, base])).records
  assert.deepEqual(a, b); assert.equal(a.length, 2)
  assert.notEqual(a[0].id, a[1].id)
  const spaces = [...base]; spaces[0] += ' '
  assert.equal(normalizeCatalog(csv([spaces])).records[0].sourceRecordName, spaces[0])
})
test('all invalid required numeric values are quarantined, never repaired', () => {
  for (const index of [2, 3, 4, 5, 6, 7]) for (const value of ['', 'abc', 'NaN', 'Infinity', '0', '-1', '550W', '0x10', '1e999']) {
    const row = [...base]; row[index] = value
    const result = normalizeCatalog(csv([row]))
    assert.equal(result.records.length, 0, `${header[index]}=${value}`)
    assert.equal(result.rejected[0].source[header[index]], value)
  }
  const overflow = [...base]; overflow[2] = '1e308'
  assert.ok(normalizeCatalog(csv([overflow])).rejected[0].reasons.includes('invalid_efficiency'))
})
test('voltage and current consistency checks', () => {
  for (const v of ['49.62', '50']) {
    const row = [...base]; row[4] = v
    assert.ok(normalizeCatalog(csv([row])).rejected[0].reasons.includes('vmp_not_below_voc'))
  }
  const row = [...base]; row[6] = '15'
  assert.ok(normalizeCatalog(csv([row])).rejected[0].reasons.includes('imp_above_isc'))
  row[6] = row[5]
  assert.equal(normalizeCatalog(csv([row])).records.length, 1)
})
test('duplicates and hash collisions quarantine every candidate including invalid ones', () => {
  const bad = [...base]; bad[2] = '0'
  const duplicates = normalizeCatalog(csv([base, bad]))
  assert.equal(duplicates.records.length, 0)
  assert.ok(duplicates.rejected.every(r => r.reasons.includes('duplicate_identity')))
  const variant = [...base]; variant[0] += '-TV'
  const collision = normalizeCatalog(csv([base, variant]), { idFor: () => 'collision' })
  assert.equal(collision.records.length, 0)
  assert.ok(collision.rejected.every(r => r.reasons.includes('identity_hash_collision')))
})
test('unresolved manufacturer/model is quarantined instead of guessing', () => {
  const row = [...base]; row[0] = 'Jinko 550W'
  assert.ok(normalizeCatalog(csv([row])).rejected[0].reasons.includes('unresolved_model'))
})
test('provenance, reproducibility and failed imports preserve good snapshot', async () => {
  const root = await mkdtemp(join(tmpdir(), 'cec-test-'))
  try {
    const source = csv()
    let url
    const result = await importCatalog({ outputDir: root, timestamp: '2026-09-08T00:00:00.000Z', fetchImpl: async u => { url = u; return new Response(source) } })
    assert.ok(url.includes(DEFAULT_REVISION))
    assert.equal(result.manifest.sourceSha256, sha256(Buffer.from(source)))
    assert.equal(result.manifest.acceptedRecords, 1)
    assert.equal(result.manifest.rejectedRecords, 0)
    assert.equal(result.manifest.importedAt, '2026-09-08T00:00:00.000Z')
    assert.equal(result.manifest.technicalSource, 'CEC')
    const before = await readFile(join(result.directory, 'snapshot.json'))
    assert.equal(result.manifest.snapshotSha256, sha256(before))
    assert.deepEqual(await readFile(join(result.directory, 'source.csv')), Buffer.from(source))
    assert.equal((await importCatalog({ outputDir: root, fetchImpl: download(source) })).unchanged, true)
    for (const fetchImpl of [download('bad csv'), async () => new Response('', { status: 503 }), async () => { throw Error('network') }, download(csv([[...base.slice(0, 2), '0', ...base.slice(3)]]))]) {
      await assert.rejects(importCatalog({ outputDir: root, fetchImpl }))
      assert.deepEqual(await readFile(join(result.directory, 'snapshot.json')), before)
      assert.deepEqual(await readdir(root), [result.manifest.snapshotId])
    }
    await assert.rejects(importCatalog({ outputDir: root, revision: 'develop', fetchImpl: download(source) }))
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('checked-in real catalog reproduces snapshot, quarantine and provenance offline', async () => {
  const root = new URL('../functions/data/cec/', import.meta.url)
  const directories = (await readdir(root)).filter(name => name.startsWith('cec-v'))
  assert.ok(directories.length > 0, 'A real versioned catalog must exist')
  for (const directory of directories) {
    const baseUrl = new URL(`${directory}/`, root)
    const source = await readFile(new URL('source.csv', baseUrl))
    const snapshotBytes = await readFile(new URL('snapshot.json', baseUrl))
    const snapshot = JSON.parse(snapshotBytes)
    const manifest = JSON.parse(await readFile(new URL('manifest.json', baseUrl)))
    const quarantine = JSON.parse(await readFile(new URL('quarantine.json', baseUrl)))
    const normalized = normalizeCatalog(source.toString('utf8'))
    assert.equal(sha256(source), manifest.sourceSha256)
    assert.equal(sha256(snapshotBytes), manifest.snapshotSha256)
    assert.equal(source.length, manifest.sourceBytes)
    assert.equal(snapshotBytes.length, manifest.snapshotBytes)
    assert.equal(snapshot.snapshotId, directory)
    assert.equal(manifest.snapshotId, directory)
    assert.match(manifest.upstreamRevision, /^[a-f0-9]{40}$/)
    assert.ok(manifest.sourceUrl.includes(`/${manifest.upstreamRevision}/`))
    assert.equal(normalized.totalSourceRecords, manifest.totalSourceRecords)
    assert.equal(normalized.records.length, manifest.acceptedRecords)
    assert.equal(normalized.rejected.length, manifest.rejectedRecords)
    assert.deepEqual(normalized.records, snapshot.records)
    assert.deepEqual(normalized.rejected, quarantine)
    const reasons = {}
    for (const item of quarantine) for (const reason of item.reasons) reasons[reason] = (reasons[reason] || 0) + 1
    assert.deepEqual(reasons, manifest.rejectionReasons)
    assert.equal(new Set(snapshot.records.map(r => r.id)).size, snapshot.records.length)
  }
})
