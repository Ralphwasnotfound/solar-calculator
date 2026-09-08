export const technicalFields = ['watt', 'voc', 'vmp', 'isc', 'imp', 'efficiency']

// Formatting only: retain letters/digits and decimal distinctions in identifiers.
// No aliases, word similarity, prefix matching, or inferred model names.
export function normalizeIdentity(value) {
  return typeof value === 'string' ? value.normalize('NFKC').toLowerCase()
    .replace(/(\d)\.(?=\d)/g, '$1decimal')
    .replace(/[^\p{L}\p{N}]/gu, '') : ''
}

function titleIdentity(value) {
  return normalizeIdentity(value.replace(/\b(?:solar\s+(?:pv\s+)?(?:panels?|modules?)|photovoltaic\s+(?:panels?|modules?)|pv\s+(?:panels?|modules?))\b/gi, '')
    .replace(/\bwatts?\b/gi, 'w'))
}

function matchesIdentity(listing, panel) {
  if (typeof listing.title !== 'string' || typeof panel?.model !== 'string') return false
  const brand = normalizeIdentity(panel.brand)
  const model = titleIdentity(panel.model)
  if (!brand || !model) return false
  if (listing.brand && normalizeIdentity(listing.brand) !== brand) return false
  // Brand + wattage is never a model identity, even if the database has one row.
  const distinctModel = model.replace(brand, '').replace(/\d+(?:decimal\d+)?w/g, '')
  if (!/[\p{L}]/u.test(distinctModel) || distinctModel.length < 3) return false
  const title = titleIdentity(listing.title)
  const identity = model.startsWith(brand) ? model : brand + model
  const watts = [...listing.title.matchAll(/\b(\d+(?:\.\d+)?)\s*(?:w|watts?)\b/gi)].map((m) => Number(m[1]))
  // Title wattage is only a conflict/identity check. It never supplies technical data.
  if (watts.length && watts.some((watt) => watt !== panel.watt)) return false
  // Family names alone are insufficient; require explicit watts or a model code.
  if (!watts.length && !/\d/.test(model)) return false
  return title === identity || title === identity + normalizeIdentity(`${panel.watt}w`)
}

export function verifyOnlinePanel(listing, panels) {
  // Ignore any upstream technical fields or claimed verification state.
  const result = { ...listing, matchedPanelId: null, matchedPanel: null, specificationsVerified: false }
  for (const field of technicalFields) result[field] = null
  const matches = panels.filter((panel) => matchesIdentity(listing, panel))
  // Count identity candidates BEFORE checking specs: an invalid duplicate is still ambiguous.
  if (matches.length !== 1) return result
  const panel = matches[0]
  if (!panel.id || technicalFields.some((field) => !Number.isFinite(panel[field]) || panel[field] <= 0)) return result
  result.matchedPanelId = panel.id
  result.matchedPanel = panel
  result.specificationsVerified = true
  for (const field of technicalFields) result[field] = panel[field]
  return result
}
