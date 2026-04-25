const KEYS = {
  DEALS: 'gh_deals',
  LEADS: 'gh_leads',
  BUYERS: 'gh_buyers',
}

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

// ── Deals ──────────────────────────────────────────────────────────────────
export function getDeals() { return load(KEYS.DEALS) }

export function saveDeal(deal) {
  const deals = getDeals()
  const idx = deals.findIndex(d => d.id === deal.id)
  if (idx >= 0) deals[idx] = deal
  else deals.unshift(deal)
  save(KEYS.DEALS, deals)
  return deal
}

export function deleteDeal(id) {
  save(KEYS.DEALS, getDeals().filter(d => d.id !== id))
}

export function updateDealStatus(id, status) {
  const deals = getDeals()
  const idx = deals.findIndex(d => d.id === id)
  if (idx >= 0) { deals[idx].status = status; save(KEYS.DEALS, deals) }
}

// ── Leads ──────────────────────────────────────────────────────────────────
export function getLeads() { return load(KEYS.LEADS) }

export function saveLead(lead) {
  const leads = getLeads()
  const idx = leads.findIndex(l => l.id === lead.id)
  if (idx >= 0) leads[idx] = lead
  else leads.unshift(lead)
  save(KEYS.LEADS, leads)
  return lead
}

export function deleteLead(id) {
  save(KEYS.LEADS, getLeads().filter(l => l.id !== id))
}

// ── Buyers ─────────────────────────────────────────────────────────────────
export function getBuyers() { return load(KEYS.BUYERS) }

export function saveBuyer(buyer) {
  const buyers = getBuyers()
  const idx = buyers.findIndex(b => b.id === buyer.id)
  if (idx >= 0) buyers[idx] = buyer
  else buyers.unshift(buyer)
  save(KEYS.BUYERS, buyers)
  return buyer
}

export function deleteBuyer(id) {
  save(KEYS.BUYERS, getBuyers().filter(b => b.id !== id))
}

// ── Utils ──────────────────────────────────────────────────────────────────
export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function fmt(n) {
  if (n == null || isNaN(n)) return '—'
  return '$' + Number(n).toLocaleString('en-US')
}

export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
