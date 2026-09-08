import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

export const SNAPSHOT_ID = 'cec-v1-importer-1.0.0-cba319ded1c32a7f5b3ac76545a29e1f7181d238-a28cf8956a839ed98bb941809b439e4907f5b4c237bd9299bc123fb502c29aff'
const root = new URL(`./data/cec/${SNAPSHOT_ID}/`, import.meta.url)
const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ')
const compact = value => normalize(value).replaceAll(' ', '')
const numeric = ['watt', 'voc', 'vmp', 'isc', 'imp', 'efficiency', 'areaM2']
const valid = r => r && r.specificationsVerified === true && numeric.every(k => Number.isFinite(r[k]) && r[k] > 0) && r.efficiency <= 100 && r.vmp < r.voc && r.imp <= r.isc && ['id', 'model', 'sourceRecordName', 'manufacturer', 'brand'].every(k => typeof r[k] === 'string' && r[k].trim())

export function createCatalogLoader({ read = readFile } = {}) {
  let pending
  return function load() {
    if (!pending) pending = (async () => {
      const manifest = JSON.parse(await read(new URL('manifest.json', root)))
      const bytes = await read(new URL('snapshot.json', root))
      if (manifest.snapshotId !== SNAPSHOT_ID || manifest.schemaVersion !== 1 || createHash('sha256').update(bytes).digest('hex') !== manifest.snapshotSha256) throw Error('Invalid catalog')
      const snapshot = JSON.parse(bytes)
      if (snapshot.snapshotId !== SNAPSHOT_ID || snapshot.schemaVersion !== 1 || !Array.isArray(snapshot.records) || snapshot.records.length !== manifest.acceptedRecords) throw Error('Invalid catalog')
      const ids = new Set(), identities = new Set()
      for (const r of snapshot.records) {
        if (!r || ids.has(r.id) || identities.has(r.sourceRecordName)) throw Error('Duplicate catalog identity')
        ids.add(r.id); identities.add(r.sourceRecordName)
      }
      return { manifest, entries: snapshot.records.filter(valid).map(r => ({ record: r, model: compact(r.model), manufacturer: compact(r.manufacturer), text: normalize(`${r.manufacturer} ${r.model}`) })) }
    })().catch(error => { pending = undefined; throw error })
    return pending
  }
}

export function searchCatalog(catalog, query, limit = 20, offset = 0) {
  const watts = [...query.matchAll(/\b(\d+(?:\.\d+)?)\s*(?:w|watts?)\b/gi)].map(m => Number(m[1]))
  const words = normalize(query.replace(/\b\d+(?:\.\d+)?\s*(?:w|watts?)\b/gi, ' ')).split(' ').filter(Boolean)
  const identity = compact(query)
  const matches = []
  for (const e of catalog.entries) {
    if (!valid(e.record) || watts.some(w => w !== e.record.watt)) continue
    let rank = 0
    if (identity === e.model) rank = 4
    else if (identity.endsWith(e.model) && e.manufacturer.includes(identity.slice(0, -e.model.length)) && identity.length > e.model.length) rank = 3
    else if (words.every(w => e.text.includes(w))) rank = watts.length ? 2 : 1
    if (rank) matches.push({ e, rank })
  }
  matches.sort((a, b) => b.rank - a.rank || a.e.record.id.localeCompare(b.e.record.id))
  const results = matches.slice(offset, offset + limit).map(({ e }) => {
    const r = e.record
    return { id: r.id, technicalSource: 'CEC', technicalDistributor: 'SAM', sourceRecordName: r.sourceRecordName, manufacturer: r.manufacturer, brand: r.brand, model: r.model, watt: r.watt, voc: r.voc, vmp: r.vmp, isc: r.isc, imp: r.imp, efficiency: r.efficiency, specificationsVerified: true, provenance: { catalogVersion: r.catalogVersion, snapshotRevision: catalog.manifest.upstreamRevision, snapshotId: catalog.manifest.snapshotId, areaM2: r.areaM2, efficiencyMethod: r.efficiencyMethod } }
  })
  return { results, total: matches.length, limit, offset, nextOffset: offset + limit < matches.length ? offset + limit : null, snapshotId: catalog.manifest.snapshotId }
}

export function createTechnicalHandler({ load = createCatalogLoader() } = {}) {
  return async (req, res) => {
    if (req.method !== 'GET') { res.set('Allow', 'GET'); return res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET.' } }) }
    const { q, limit = '20', offset = '0' } = req.query || {}
    const integer = value => typeof value === 'string' && /^\d+$/.test(value) && Number.isSafeInteger(Number(value))
    if (typeof q !== 'string' || q.length > 160 || normalize(q).length < 2) return res.status(400).json({ error: { code: 'INVALID_QUERY', message: 'Provide a query of 2–160 characters.' } })
    if (!integer(limit) || Number(limit) < 1 || Number(limit) > 50 || !integer(offset) || Number(offset) > 100000) return res.status(400).json({ error: { code: 'INVALID_PAGINATION', message: 'Limit must be 1–50; offset must be 0–100000.' } })
    try { return res.status(200).json(searchCatalog(await load(), q, Number(limit), Number(offset))) }
    catch { return res.status(503).json({ error: { code: 'CATALOG_UNAVAILABLE', message: 'Technical catalog is temporarily unavailable.' } }) }
  }
}
