import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeDeal, recalcWithMao } from '../utils/analyzer'
import { saveDeal, genId, fmt } from '../utils/storage'
import { generateDealPDF } from '../utils/pdf'
import { Button, Input, ToggleGroup, StatBox, Card } from '../components/UI'

const SEV = { high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', badge: 'bg-red-100 text-red-600' }, medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-600' }, low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-100 text-green-600' } }
const RATING = { Strong: '#22c55e', Moderate: '#f59e0b', Weak: '#ef4444' }
const RATING_W = { Strong: '85%', Moderate: '52%', Weak: '22%' }

export default function Analyzer() {
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [maoPct, setMaoPct] = useState(70)
  const [radius, setRadius] = useState(1)
  const [months, setMonths] = useState(6)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('summary')
  const [manualComps, setManualComps] = useState([])
  const [showCompForm, setShowCompForm] = useState(false)
  const [newComp, setNewComp] = useState({ address: '', beds: '', baths: '', sqft: '', sold_price: '', sold_date: '', condition: 'Renovated', note: '' })
  const dealRef = useRef(null)

  const displayed = result ? recalcWithMao(result, maoPct) : null

  async function run() {
    if (!address.trim()) return
    setLoading(true); setError(''); setResult(null); setSaved(false); setActiveTab('summary'); setManualComps([])
    try {
      const r = await analyzeDeal({ address, maoPct, radiusMiles: radius, monthsBack: months })
      setResult(r)
      dealRef.current = { id: genId(), address, result: r, status: 'analyzing', createdAt: new Date().toISOString() }
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  function saveToHistory() {
    if (!dealRef.current) return
    dealRef.current.result = displayed
    saveDeal(dealRef.current)
    setSaved(true)
  }

  function exportPDF() {
    if (!dealRef.current) return
    dealRef.current.result = displayed
    generateDealPDF(dealRef.current)
  }

  function addComp() {
    if (!newComp.address || !newComp.sold_price) return
    setManualComps(p => [...p, { ...newComp, sold_price: parseInt(newComp.sold_price.replace(/\D/g, '')), sqft: parseInt(newComp.sqft) || 0, manual: true }])
    setNewComp({ address: '', beds: '', baths: '', sqft: '', sold_price: '', sold_date: '', condition: 'Renovated', note: '' })
    setShowCompForm(false)
  }

  const allComps = [...(displayed?.comps || []), ...manualComps]
  const tabs = ['summary', 'repairs', 'comps', 'risks']

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Deal Analyzer</h1>
        <p className="text-sm text-slate-500 mt-0.5">ARV · MAO · Assignment Fee — instant wholesale analysis</p>
      </div>

      {/* Address + MAO */}
      <Card className="p-5 mb-3">
        <Input
          label="Property Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="3910 Valley Rd, Columbus, GA 31907"
          autoFocus
          className="mb-4"
        />
        <ToggleGroup label="MAO %" options={[{value:65,label:'65%'},{value:70,label:'70%'},{value:75,label:'75%'}]} value={maoPct} onChange={setMaoPct} />
      </Card>

      {/* Comp Filters */}
      <Card className="p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Comp Filters</span>
          <span className="text-xs text-slate-400 ml-1">Applied when pulling comparable sales</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <ToggleGroup label="Radius" options={[{value:0.5,label:'0.5mi'},{value:1,label:'1mi'},{value:1.5,label:'1.5mi'},{value:2,label:'2mi'}]} value={radius} onChange={setRadius} />
          <ToggleGroup label="Sold Within" options={[{value:3,label:'3mo'},{value:6,label:'6mo'},{value:9,label:'9mo'},{value:12,label:'12mo'}]} value={months} onChange={setMonths} />
        </div>
        <Button onClick={run} disabled={loading || !address.trim()} size="lg" className="w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              Analyzing…
            </span>
          ) : 'Run Analysis →'}
        </Button>
      </Card>

      {loading && (
        <div className="text-center py-10 text-slate-400 text-sm">
          <div className="animate-pulse">Pulling comps within {radius}mi · Last {months} months · Flagging risks…</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm mb-5">⚠ {error}</div>
      )}

      {displayed && (
        <div className="fade-up space-y-4">
          {/* Property info */}
          <Card className="px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-slate-900 text-sm">{address}</div>
                <div className="text-slate-500 text-xs mt-1">
                  {[displayed.beds && `${displayed.beds}bd`, displayed.baths && `${displayed.baths}ba`, displayed.sqft && `${Number(displayed.sqft).toLocaleString()} sqft`, displayed.year_built && `Built ${displayed.year_built}`].filter(Boolean).join('  ·  ')}
                </div>
                {displayed.repair_tier && <div className="text-xs text-amber-600 font-medium mt-1">{displayed.repair_tier}</div>}
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-4">
                <Button variant="outline" size="sm" onClick={saveToHistory} disabled={saved}>
                  {saved ? '✓ Saved' : '💾 Save'}
                </Button>
                <Button variant="outline" size="sm" onClick={exportPDF}>📄 PDF</Button>
              </div>
            </div>
          </Card>

          {/* Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="ARV" value={fmt(displayed.arv)} accent="#22c55e" />
            <StatBox label="Repairs" value={fmt(displayed.repairs)} accent="#ef4444" />
            <StatBox label={`MAO (${displayed.mao_pct}%)`} value={fmt(displayed.mao)} accent="#3b82f6" />
            <StatBox label="Assignment Fee" value={fmt(displayed.assignment_fee)} accent="#a78bfa" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="My Offer" value={fmt(displayed.my_offer)} accent="#f59e0b" />
            <StatBox label="End Buyer Offer" value={fmt(displayed.end_buyer_offer)} accent="#38bdf8" />
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all duration-150 ${activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {t === 'risks' && displayed.risk_flags?.length ? `Risks (${displayed.risk_flags.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Summary tab */}
          {activeTab === 'summary' && (
            <div className="space-y-3">
              <Card className="p-4 font-mono text-sm space-y-1">
                <div className="text-xs text-slate-400 mb-2 uppercase tracking-widest">Output</div>
                {[['ARV', fmt(displayed.arv), '#22c55e'], ['Repairs', fmt(displayed.repairs), '#ef4444'], [`MAO (at ${displayed.mao_pct}%)`, fmt(displayed.mao), '#3b82f6'], ['My Offer', fmt(displayed.my_offer), '#f59e0b'], ['End Buyer Offer', fmt(displayed.end_buyer_offer), '#38bdf8'], ['Assignment Fee', fmt(displayed.assignment_fee), '#a78bfa']].map(([l, v, c]) => (
                  <div key={l} className="flex justify-between items-baseline">
                    <span className="text-slate-400">{l}:</span>
                    <span className="font-bold" style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </Card>
              {displayed.deal_rating && (
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deal Rating</span>
                    <span className="text-sm font-bold" style={{ color: RATING[displayed.deal_rating] || '#64748b' }}>{displayed.deal_rating}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full mb-3">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: RATING_W[displayed.deal_rating] || '40%', background: RATING[displayed.deal_rating] || '#64748b' }} />
                  </div>
                  {displayed.deal_rating_reason && <p className="text-xs text-slate-500 leading-relaxed">{displayed.deal_rating_reason}</p>}
                </Card>
              )}
              {displayed.comp_summary && (
                <Card className="p-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Comp Summary</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{displayed.comp_summary}</p>
                </Card>
              )}
            </div>
          )}

          {/* Repairs tab */}
          {activeTab === 'repairs' && (
            <div className="space-y-2">
              <Card className="p-4 flex justify-between items-center">
                <span className="text-sm text-slate-600">Total repair estimate</span>
                <span className="text-xl font-bold text-red-500 mono">{fmt(displayed.repairs)}</span>
              </Card>
              {(displayed.repair_breakdown || []).map((item, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-slate-800">{item.item}</span>
                    <span className="text-sm font-bold text-red-500 mono ml-4 flex-shrink-0">{fmt(item.cost)}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.reason}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Comps tab */}
          {activeTab === 'comps' && (
            <div className="space-y-2">
              <div className="text-xs text-slate-400 mono px-1">Comps ≤ {radius}mi · sold within {months} months</div>
              {allComps.map((c, i) => (
                <Card key={i} className={`p-4 ${c.manual ? 'border-green-200 bg-green-50/30' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-sm text-slate-800 flex-1">{c.address}</div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <span className="text-sm font-bold text-green-600 mono">{fmt(c.sold_price)}</span>
                      {c.manual && (
                        <button onClick={() => setManualComps(p => p.filter((_, idx) => idx !== i - (displayed?.comps?.length || 0)))}
                          className="text-slate-400 hover:text-red-500 text-lg leading-none transition">×</button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mb-2">
                    {c.beds && <span>{c.beds}bd/{c.baths}ba</span>}
                    {c.sqft ? <span>{Number(c.sqft).toLocaleString()} sqft</span> : null}
                    {c.sold_date && <span>{c.sold_date}</span>}
                    {c.distance_miles && <span>{c.distance_miles}mi away</span>}
                    <span className={`font-medium ${c.condition === 'Renovated' ? 'text-blue-600' : c.condition === 'As-is' ? 'text-red-500' : 'text-amber-600'}`}>{c.condition}</span>
                    {c.manual && <span className="text-green-600 font-semibold">Manual</span>}
                  </div>
                  {c.note && <p className="text-xs text-slate-400 leading-relaxed">{c.note}</p>}
                  {/* Comp links */}
                  <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100">
                    {c.zillow_url ? (
                      <a href={c.zillow_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-700 font-medium transition">Zillow →</a>
                    ) : (
                      <a href={`https://www.zillow.com/homes/${encodeURIComponent(c.address)}_rb/`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-700 font-medium transition">Zillow →</a>
                    )}
                    {c.redfin_url ? (
                      <a href={c.redfin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-500 hover:text-orange-700 font-medium transition">Redfin →</a>
                    ) : (
                      <a href={`https://www.redfin.com/search#location=${encodeURIComponent(c.address)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-500 hover:text-orange-700 font-medium transition">Redfin →</a>
                    )}
                  </div>
                </Card>
              ))}

              {!showCompForm ? (
                <button onClick={() => setShowCompForm(true)}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl p-3 text-sm text-slate-400 hover:border-slate-300 hover:text-slate-600 transition">
                  + Add Manual Comp
                </button>
              ) : (
                <Card className="p-4 border-green-200 bg-green-50/30">
                  <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-3">Add Manual Comp</div>
                  <Input value={newComp.address} onChange={e => setNewComp(p => ({ ...p, address: e.target.value }))} placeholder="Full address" className="mb-2" />
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[['beds','Beds'],['baths','Baths'],['sqft','Sqft'],['sold_price','Price']].map(([k,p]) => (
                      <Input key={k} value={newComp[k]} onChange={e => setNewComp(prev => ({ ...prev, [k]: e.target.value }))} placeholder={p} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input value={newComp.sold_date} onChange={e => setNewComp(p => ({ ...p, sold_date: e.target.value }))} placeholder="e.g. Jan 2025" />
                    <select value={newComp.condition} onChange={e => setNewComp(p => ({ ...p, condition: e.target.value }))}
                      className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option>Renovated</option><option>Updated</option><option>As-is</option>
                    </select>
                  </div>
                  <Input value={newComp.note} onChange={e => setNewComp(p => ({ ...p, note: e.target.value }))} placeholder="Notes (optional)" className="mb-3" />
                  <div className="flex gap-2">
                    <Button onClick={addComp} variant="primary" size="sm" className="flex-1">Add Comp</Button>
                    <Button onClick={() => setShowCompForm(false)} variant="secondary" size="sm" className="flex-1">Cancel</Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Risks tab */}
          {activeTab === 'risks' && (
            <div className="space-y-2">
              {(!displayed.risk_flags || displayed.risk_flags.length === 0) && (
                <Card className="p-8 text-center text-slate-400 text-sm">No risk flags identified.</Card>
              )}
              {(displayed.risk_flags || [])
                .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]))
                .map((r, i) => {
                  const s = SEV[r.severity] || SEV.low
                  return (
                    <div key={i} className={`rounded-xl border p-4 ${s.bg} ${s.border}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${s.badge}`}>{r.severity}</span>
                        <span className="text-sm font-semibold text-slate-800">{r.flag}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{r.detail}</p>
                    </div>
                  )
                })}
            </div>
          )}

          <p className="text-xs text-slate-400 text-center pt-2 mono">Always verify with live comps before submitting offers</p>
        </div>
      )}
    </div>
  )
}
