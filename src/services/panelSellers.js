import { searchOnlinePanels } from './onlinePanels.js'

export const safeUrl = value => {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null } catch { return null }
}
export function sellerQuery(panel) {
  return `${panel.manufacturer || panel.brand} ${panel.model}`.trim()
}
export function exactModelInTitle(title, model) {
  if (typeof title !== 'string' || typeof model !== 'string' || !/\d/.test(model)) return false
  const clean = value => value.normalize('NFKC').replace(/[‐‑–—]/g, '-').toLowerCase()
  const pattern = clean(model).split(/[\s-]+/).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s-]+')
  const match = new RegExp(`(?:^|[^a-z0-9])(${pattern})(?=$|[^a-z0-9])`, 'i').exec(clean(title))
  if (!match) return false
  const tail = clean(title).slice(match.index + match[0].length)
  // Never accept a joined suffix; unfamiliar following variant words stay possible.
  if (/^[-/]/.test(tail)) return false
  const next = tail.trim().match(/^([a-z0-9]+)/)?.[1]
  return !next || /^(solar|panel|panels|module|modules|\d+w)$/.test(next)
}
export async function findPanelSellers(panel, search = searchOnlinePanels) {
  const rows = await search(sellerQuery(panel))
  return rows.filter(r => r && typeof r.title === 'string' && r.title.trim()).map(r => ({
    title: r.title, seller: typeof r.seller === 'string' && r.seller ? r.seller : 'Seller unavailable',
    priceText: typeof r.priceText === 'string' && r.priceText ? r.priceText : 'Price unavailable',
    rating: Number.isFinite(r.rating) ? r.rating : null,
    reviewCount: Number.isFinite(r.reviews) ? r.reviews : null,
    image: safeUrl(r.image), productUrl: safeUrl(r.productUrl),
    exact: exactModelInTitle(r.title, panel.model),
  })).sort((a, b) => Number(b.exact) - Number(a.exact))
}
