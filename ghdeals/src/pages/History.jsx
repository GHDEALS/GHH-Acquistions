import { useState, useEffect } from 'react'
import { getDeals, deleteDeal, updateDealStatus, fmt, fmtDate } from '../utils/storage'
import { generateDealPDF } from '../utils/pdf'
import { Badge, Button, Card, Modal, Select, Empty } from '../components/UI'

const STATUSES = ['analyzing', 'under contract', 'assigned', 'dead']

export default function History() {
  const [deals, setDeals] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')

  useEffect(() => { setDeals(getDeals()) }, [])

  function refresh() { setDeals(getDeals()) }

  function remove(id) {
    deleteDeal(id)
    refresh()
    if (selected?.id === id) setSelected(null)
  }

  function changeStatus(id, status) {
    updateDealStatus(id, status)
    refresh()
    if (selected?.id === id) setSelected(s => ({ ...s, status }))
  }

  const filtered = deals.filter(d => {
    const matchSearch = d.address.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || d.status === filterStatus
    return matchSearch && matchStatus
  })

  const r = selected?.result

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deal History</h1>
          <p className="text-sm text-slate-500 mt-0.5">{deals.length} deal{deals.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-5 flex gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by address…"
          className="flex-1 border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </Card>

      {filtered.length === 0 && (
        <Empty icon="📁" title="No deals yet" sub="Run your first analysis and save it to see it here." />
      )}

      <div className="space-y-3">
        {filtered.map(deal => (
          <Card key={deal.id} hover onClick={() => { setSelected(deal); setActiveTab('summary') }} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-800 truncate">{deal.address}</div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <Badge label={deal.status} />
                  <span className="text-xs text-slate-400">{fmtDate(deal.createdAt)}</span>
                  {deal.result?.arv && <span className="text-xs text-slate-500">ARV {fmt(deal.result.arv)}</span>}
                  {deal.result?.assignment_fee && <span className="text-xs font-semibold text-purple-600">Fee {fmt(deal.result.assignment_fee)}</span>}
                </div>
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="xs" onClick={() => generateDealPDF(deal)}>📄</Button>
                <Button variant="danger" size="xs" onClick={() => remove(deal.id)}>×</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Deal detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.address || ''} width="max-w-2xl">
        {selected && r && (
          <div className="space-y-4">
            {/* Status changer */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => changeStatus(selected.id, s)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${selected.status === s ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {['summary','repairs','comps','risks'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {t}
                </button>
              ))}
            </div>

            {activeTab === 'summary' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {[['ARV', fmt(r.arv), '#22c55e'], ['Repairs', fmt(r.repairs), '#ef4444'], [`MAO (${r.mao_pct||70}%)`, fmt(r.mao), '#3b82f6'], ['My Offer', fmt(r.my_offer), '#f59e0b'], ['End Buyer', fmt(r.end_buyer_offer), '#38bdf8'], ['Assign Fee', fmt(r.assignment_fee), '#a78bfa']].map(([l,v,c]) => (
                    <div key={l} className="bg-slate-50 rounded-lg p-3" style={{ borderTop: `2px solid ${c}` }}>
                      <div className="text-xs text-slate-400 mb-1">{l}</div>
                      <div className="font-bold text-sm" style={{ color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
                {r.comp_summary && <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{r.comp_summary}</p>}
                {r.deal_rating && <p className="text-sm font-semibold" style={{ color: { Strong:'#22c55e', Moderate:'#f59e0b', Weak:'#ef4444' }[r.deal_rating] }}>Rating: {r.deal_rating} — <span className="text-slate-500 font-normal text-xs">{r.deal_rating_reason}</span></p>}
              </div>
            )}

            {activeTab === 'repairs' && (
              <div className="space-y-2">
                {(r.repair_breakdown || []).map((item, i) => (
                  <div key={i} className="flex justify-between items-start bg-slate-50 rounded-lg p-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{item.item}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.reason}</div>
                    </div>
                    <span className="text-sm font-bold text-red-500 mono ml-4 flex-shrink-0">{fmt(item.cost)}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'comps' && (
              <div className="space-y-2">
                {(r.comps || []).map((c, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold text-slate-800">{c.address}</span>
                      <span className="text-sm font-bold text-green-600 mono ml-3">{fmt(c.sold_price)}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 text-xs text-slate-500 mb-1.5">
                      {c.beds && <span>{c.beds}bd/{c.baths}ba</span>}
                      {c.sqft && <span>{Number(c.sqft).toLocaleString()} sqft</span>}
                      {c.sold_date && <span>{c.sold_date}</span>}
                      {c.distance_miles && <span>{c.distance_miles}mi</span>}
                      <span className="text-blue-600">{c.condition}</span>
                    </div>
                    <div className="flex gap-3">
                      <a href={c.zillow_url || `https://www.zillow.com/homes/${encodeURIComponent(c.address)}_rb/`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-700 font-medium">Zillow →</a>
                      <a href={c.redfin_url || `https://www.redfin.com/search#location=${encodeURIComponent(c.address)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-500 hover:text-orange-700 font-medium">Redfin →</a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'risks' && (
              <div className="space-y-2">
                {(r.risk_flags || []).map((rf, i) => (
                  <div key={i} className={`rounded-lg p-3 border ${rf.severity==='high'?'bg-red-50 border-red-200':rf.severity==='medium'?'bg-amber-50 border-amber-200':'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge label={rf.severity} size="xs" />
                      <span className="text-sm font-semibold text-slate-800">{rf.flag}</span>
                    </div>
                    <p className="text-xs text-slate-600">{rf.detail}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => generateDealPDF(selected)} className="flex-1">📄 Export PDF</Button>
              <Button variant="danger" size="sm" onClick={() => remove(selected.id)} className="flex-1">Delete Deal</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
