import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const IMPORTER_VERSION = '1.0.0'
export const SCHEMA_VERSION = 1
export const DEFAULT_REVISION = 'cba319ded1c32a7f5b3ac76545a29e1f7181d238'
export const sha256 = value => createHash('sha256').update(value).digest('hex')
export const identityId = name => `cec-${sha256(name)}`
const fields = { STC: 'watt', V_oc_ref: 'voc', V_mp_ref: 'vmp', I_sc_ref: 'isc', I_mp_ref: 'imp', A_c: 'areaM2' }
const required = ['Name', 'Manufacturer', ...Object.keys(fields), 'Version', 'Date']

// Strict CSV reader: quoted commas, escaped quotes, embedded newlines and CRLF.
export function parseCsv(text) {
  const rows = []; let row = [], value = '', state = 'plain'
  text = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (state === 'quoted') {
      if (c === '"') {
        if (text[i + 1] === '"') { value += '"'; i++ } else state = 'closed'
      } else value += c
      continue
    }
    if (c === ',' || c === '\n' || c === '\r') {
      row.push(value); value = ''; state = 'plain'
      if (c !== ',') {
        rows.push(row); row = []
        if (c === '\r' && text[i + 1] === '\n') i++
      }
    } else if (c === '"' && !value && state === 'plain') state = 'quoted'
    else {
      if (state === 'closed' || c === '"') throw new Error('Malformed CSV quoting')
      value += c
    }
  }
  if (state === 'quoted') throw new Error('Unterminated CSV field')
  if (value || row.length || state === 'closed') { row.push(value); rows.push(row) }
  return rows
}

function positiveNumber(value) {
  if (typeof value !== 'string' || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) return null
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

export function normalizeCatalog(text, { idFor = identityId } = {}) {
  const rows = parseCsv(text)
  const header = rows[0]
  if (!header || required.some(k => header.filter(h => h === k).length !== 1)) throw new Error('Missing or duplicate required CSV columns')
  if (rows[1]?.[0] !== 'Units' || rows[2]?.[0] !== '[0]') throw new Error('Unexpected SAM introductory rows')
  const units = Object.fromEntries(header.map((h, i) => [h, rows[1][i]]))
  for (const [field, unit] of Object.entries({ A_c: 'm2', V_oc_ref: 'V', V_mp_ref: 'V', I_sc_ref: 'A', I_mp_ref: 'A' })) {
    if (units[field] !== unit) throw new Error(`Unexpected unit for ${field}`)
  }
  const candidates = rows.slice(3).filter(row => row.some(value => value !== '')).map((row, index) => {
    const source = Object.fromEntries(header.filter(Boolean).map(h => [h, row[header.indexOf(h)]]))
    const reasons = []
    if (row.length !== header.length) reasons.push('column_count')
    const name = source.Name
    const manufacturer = source.Manufacturer?.trim()
    if (!name?.trim()) reasons.push('missing_identity')
    if (!manufacturer) reasons.push('missing_manufacturer')
    const record = { id: name ? idFor(name) : null, technicalSource: 'CEC', technicalDistributor: 'SAM', sourceRecordName: name, manufacturer, brand: manufacturer }
    // Strip only the complete explicit manufacturer prefix, never its first word.
    record.model = manufacturer && name?.startsWith(`${manufacturer} `) ? name.slice(manufacturer.length + 1) : null
    if (!record.model?.trim()) reasons.push('unresolved_model')
    for (const [column, field] of Object.entries(fields)) {
      record[field] = positiveNumber(source[column])
      if (record[field] === null) reasons.push(`invalid_${field}`)
    }
    record.efficiency = record.watt !== null && record.areaM2 !== null ? 100 * record.watt / (1000 * record.areaM2) : null
    if (!Number.isFinite(record.efficiency) || record.efficiency <= 0 || record.efficiency > 100) reasons.push('invalid_efficiency')
    if (record.vmp !== null && record.voc !== null && record.vmp >= record.voc) reasons.push('vmp_not_below_voc')
    if (record.imp !== null && record.isc !== null && record.imp > record.isc) reasons.push('imp_above_isc')
    record.specificationsVerified = true
    record.catalogVersion = source.Version
    record.catalogDate = source.Date
    record.efficiencyMethod = '100 * STC / (1000 * A_c)'
    return { sourceRow: index + 4, source, record, reasons }
  })
  const groups = new Map()
  for (const item of candidates) {
    if (!item.record.id) continue
    const group = groups.get(item.record.id) || []
    group.push(item); groups.set(item.record.id, group)
  }
  for (const group of groups.values()) if (group.length > 1) {
    const reason = new Set(group.map(item => item.record.sourceRecordName)).size > 1 ? 'identity_hash_collision' : 'duplicate_identity'
    for (const item of group) item.reasons.push(reason)
  }
  const records = candidates.filter(item => !item.reasons.length).map(item => item.record).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  const rejected = candidates.filter(item => item.reasons.length).map(({ sourceRow, source, reasons }) => ({ sourceRow, source, reasons }))
  return { records, rejected, totalSourceRecords: candidates.length }
}

export async function importCatalog({ revision = DEFAULT_REVISION, outputDir, fetchImpl = fetch, timestamp = new Date().toISOString() }) {
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('A full immutable 40-character commit SHA is required')
  const sourceUrl = `https://raw.githubusercontent.com/NatLabRockies/SAM/${revision}/deploy/libraries/CEC%20Modules.csv`
  const response = await fetchImpl(sourceUrl, { signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`Catalog download failed: HTTP ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  const parsed = normalizeCatalog(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
  // Fail closed on empty or unexpectedly degraded imports; keep prior versions intact.
  if (!parsed.records.length || parsed.rejected.length / parsed.totalSourceRecords > 0.05) throw new Error(`Catalog validation failed: ${parsed.records.length} accepted, ${parsed.rejected.length} rejected`)
  const sourceSha256 = sha256(bytes)
  const snapshotId = `cec-v${SCHEMA_VERSION}-importer-${IMPORTER_VERSION}-${revision}-${sourceSha256}`
  const snapshot = JSON.stringify({ schemaVersion: SCHEMA_VERSION, snapshotId, records: parsed.records }) + '\n'
  const rejectionReasons = {}
  for (const item of parsed.rejected) for (const reason of item.reasons) rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1
  const manifest = { technicalSource: 'CEC', distributor: 'SAM', sourceUrl, upstreamRevision: revision, importedAt: timestamp, sourceSha256, totalSourceRecords: parsed.totalSourceRecords, acceptedRecords: parsed.records.length, rejectedRecords: parsed.rejected.length, rejectionReasons, importerVersion: IMPORTER_VERSION, schemaVersion: SCHEMA_VERSION, snapshotId, snapshotSha256: sha256(snapshot), snapshotBytes: Buffer.byteLength(snapshot), sourceBytes: bytes.length, efficiencyMethod: '100 * STC / (1000 * A_c)', catalogVersions: [...new Set(parsed.records.map(r => r.catalogVersion))], catalogDates: [...new Set(parsed.records.map(r => r.catalogDate))] }
  const target = resolve(outputDir, snapshotId)
  await mkdir(outputDir, { recursive: true })
  try {
    const existing = JSON.parse(await readFile(resolve(target, 'manifest.json'), 'utf8'))
    if (existing.sourceSha256 !== sourceSha256 || sha256(await readFile(resolve(target, 'snapshot.json'))) !== manifest.snapshotSha256) throw new Error('Existing snapshot integrity mismatch')
    return { directory: target, manifest: existing, unchanged: true }
  } catch (error) { if (error.code !== 'ENOENT') throw error }
  const staging = resolve(outputDir, `.staging-${randomUUID()}`)
  await mkdir(staging)
  try {
    await writeFile(resolve(staging, 'source.csv'), bytes)
    await writeFile(resolve(staging, 'snapshot.json'), snapshot)
    await writeFile(resolve(staging, 'quarantine.json'), JSON.stringify(parsed.rejected, null, 2) + '\n')
    await writeFile(resolve(staging, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
    await rename(staging, target)
  } finally { await rm(staging, { recursive: true, force: true }) }
  return { directory: target, manifest, unchanged: false }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    if (args.length && (args.length !== 2 || args[0] !== '--revision')) throw new Error('Usage: node scripts/importCecModules.mjs [--revision FULL_COMMIT_SHA]')
    const result = await importCatalog({ revision: args[1] || DEFAULT_REVISION, outputDir: resolve(dirname(fileURLToPath(import.meta.url)), '../functions/data/cec') })
    console.log(JSON.stringify(result, null, 2))
  } catch (error) { console.error(`CEC import failed: ${error.message}`); process.exitCode = 1 }
}
