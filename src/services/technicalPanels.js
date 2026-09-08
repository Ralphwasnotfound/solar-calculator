export function toCalculatorPanel(record) {
  const fields = ['watt', 'voc', 'vmp', 'isc', 'imp', 'efficiency']
  if (!record || record.specificationsVerified !== true ||
      !['id', 'brand', 'model'].every(k => typeof record[k] === 'string' && record[k].trim()) ||
      !fields.every(k => Number.isFinite(record[k]) && record[k] > 0)) return null
  return {
    id: record.id, brand: record.brand, model: record.model,
    ...Object.fromEntries(fields.map(k => [k, record[k]])),
    technicalSource: 'CEC', technicalDistributor: 'SAM', specificationsVerified: true,
    sourceRecordName: record.sourceRecordName, manufacturer: record.manufacturer,
    provenance: record.provenance ? { ...record.provenance } : undefined,
  }
}

export async function searchTechnicalPanels({ q, limit = 20, offset = 0 }, fetchImpl = fetch) {
  let response
  try {
    response = await fetchImpl(`/api/technical-panels?${new URLSearchParams({ q, limit, offset })}`, { signal: AbortSignal.timeout(25000) })
  } catch { throw new Error('Unable to reach the technical catalog. Check your connection and try again.') }
  if (!response.ok) throw new Error(response.status === 400 ? 'Please check your search and try again.' : response.status === 503 ? 'The technical catalog is temporarily unavailable. Please try again.' : 'Technical search failed. Please try again.')
  try {
    const data = await response.json()
    if (!Array.isArray(data.results) || data.results.length > limit || !Number.isInteger(data.total) || data.total < 0 || typeof data.snapshotId !== 'string' ||
      !(data.nextOffset === null || (Number.isInteger(data.nextOffset) && data.nextOffset > offset))) throw Error()
    return data
  } catch { throw new Error('The technical catalog returned an invalid response. Please try again.') }
}
