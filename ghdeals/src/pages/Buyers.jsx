import { useState, useEffect } from 'react'
import { getBuyers, saveBuyer, deleteBuyer, genId, fmtDate } from '../utils/storage'
import { Button, Card, Modal, Input, Textarea, Select, Empty, Badge } from '../components/UI'

const PROPERTY_TYPES = ['SFR', 'Multi-family', 'Land/Lots', 'Commercial', 'Any']
const BUY_METHODS = ['Cash', 'Hard money', 'Conventional', 'Creative finance']
const STATES_LIST = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

function emptyBuyer() {
  return { id: genId(), name: '', company: '', phone: '', email: '', markets: '', states: [], property_types: [], buy_method: 'Cash', min_price: '', max_price: '', closes_in_days: '', last_contact: '', notes: '', active: true, createdAt: new Date().toISOString() }
}

export default function Buyers() {
  const [buyers, setBuyers] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyBuyer())
  const [search, setSearch] = useState('')
  const [viewBuyer, setViewBuyer] = useState(null)

  useEffect(() => { setBuyers(getBuyers()) }, [])
  function refresh() { setBuyers(getBuyers()) }

  function openAdd() { setForm(emptyBuyer()); setModal('add') }
  function openEdit(b) { setForm({ ...b, states: b.states || [], property_types: b.property_types || [] }); setModal('edit'); setViewBuyer(null) }

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function toggleArr(k, v) {
    setForm(p => {
      const arr = p[k] || []
      return { ...p, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] }
    })
  }

  function submit() {
    if (!form.name.trim()) return
    saveBuyer(form)
    refresh()
    setModal(null)
  }

  function remove(id) {
    deleteBuyer(id)
    refresh()
    setViewBuyer(null)
  }

  function touchContact(id) {
    const all = getBuyers()
    const b = all.find(x => x.id === id)
    if (!b) return
    b.last_contact = new Date().toISOString()
    saveBuyer(b)
    refresh()
    setViewBuyer(v => v?.id === id ? { ...v, last_contact: b.last_contact } : v)
  }

  const filtered = buyers.filter(b =>
    (b.name + b.company + b.markets + (b.states||[]).join(' ')).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Buyers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{buyers.length} buyer{buyers.length !== 1 ? 's' : ''} in your list</p>
        </div>
        <Button onClick={openAdd}>+ Add Buyer</Button>
      </div>

      <Card className="p-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, market, state…"
          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </Card>

      {filtered.length === 0 && (
        <Empty icon="👥" title="No buyers yet" sub="Add cash buyers to your list to track deals and preferences." />
      )}

      <div className="space-y-3">
        {filtered.map(buyer => (
          <Card key={buyer.id} hover onClick={() => setViewBuyer(buyer)} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-slate-900">{buyer.name}</span>
                  {buyer.company && <span className="text-xs text-slate-400">· {buyer.company}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${buyer.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {buyer.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                  {buyer.markets && <span>📍 {buyer.markets}</span>}
                  {buyer.buy_method && <span>💳 {buyer.buy_method}</span>}
                  {(buyer.min_price || buyer.max_price) && (
                    <span>💰 {buyer.min_price ? '$' + Number(buyer.min_price).toLocaleString() : '—'} – {buyer.max_price ? '$' + Number(buyer.max_price).toLocaleString() : '—'}</span>
                  )}
                  {buyer.closes_in_days && <span>⚡ Closes in {buyer.closes_in_days} days</span>}
                  {buyer.last_contact && <span>Last contact: {fmtDate(buyer.last_contact)}</span>}
                </div>
                {(buyer.property_types || []).length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {buyer.property_types.map(pt => <span key={pt} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{pt}</span>)}
                  </div>
                )}
              </div>
              <div className="flex gap-1 ml-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="xs" onClick={() => openEdit(buyer)}>✏️</Button>
                <Button variant="danger" size="xs" onClick={() => remove(buyer.id)}>×</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View buyer modal */}
      <Modal open={!!viewBuyer} onClose={() => setViewBuyer(null)} title={viewBuyer?.name || ''} width="max-w-lg">
        {viewBuyer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Company', viewBuyer.company], ['Phone', viewBuyer.phone], ['Email', viewBuyer.email], ['Buy Method', viewBuyer.buy_method], ['Markets', viewBuyer.markets], ['Closes In', viewBuyer.closes_in_days ? `${viewBuyer.closes_in_days} days` : null]].filter(([,v]) => v).map(([l,v]) => (
                <div key={l}><span className="text-slate-400 text-xs">{l}</span><div className="font-medium mt-0.5">{v}</div></div>
              ))}
              {(viewBuyer.min_price || viewBuyer.max_price) && (
                <div className="col-span-2"><span className="text-slate-400 text-xs">Price Range</span>
                  <div className="font-medium text-green-600 mt-0.5">
                    {viewBuyer.min_price ? '$' + Number(viewBuyer.min_price).toLocaleString() : '—'} – {viewBuyer.max_price ? '$' + Number(viewBuyer.max_price).toLocaleString() : '—'}
                  </div>
                </div>
              )}
            </div>
            {(viewBuyer.property_types || []).length > 0 && (
              <div>
                <div className="text-xs text-slate-400 mb-1.5">Property Types</div>
                <div className="flex gap-2 flex-wrap">{viewBuyer.property_types.map(pt => <span key={pt} className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium">{pt}</span>)}</div>
              </div>
            )}
            {(viewBuyer.states || []).length > 0 && (
              <div>
                <div className="text-xs text-slate-400 mb-1.5">Active States</div>
                <div className="flex gap-2 flex-wrap">{viewBuyer.states.map(s => <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>)}</div>
              </div>
            )}
            {viewBuyer.notes && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Notes</div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{viewBuyer.notes}</p>
              </div>
            )}
            <div className="text-xs text-slate-400">Last contact: {viewBuyer.last_contact ? fmtDate(viewBuyer.last_contact) : 'Never'}</div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={() => touchContact(viewBuyer.id)} className="flex-1">✓ Log Contact</Button>
              <Button variant="outline" size="sm" onClick={() => openEdit(viewBuyer)} className="flex-1">✏️ Edit</Button>
              <Button variant="danger" size="sm" onClick={() => remove(viewBuyer.id)} className="flex-1">Delete</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Cash Buyer' : 'Edit Buyer'} width="max-w-lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Mike Johnson" />
            <Input label="Company" value={form.company} onChange={e => set('company', e.target.value)} placeholder="MJ Investments LLC" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
            <Input label="Email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="mike@email.com" />
          </div>
          <Input label="Active Markets / Cities" value={form.markets} onChange={e => set('markets', e.target.value)} placeholder="Columbus GA, Atlanta GA, Birmingham AL" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min Price" value={form.min_price} onChange={e => set('min_price', e.target.value.replace(/\D/g,''))} placeholder="50000" />
            <Input label="Max Price" value={form.max_price} onChange={e => set('max_price', e.target.value.replace(/\D/g,''))} placeholder="300000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Buy Method" value={form.buy_method} onChange={e => set('buy_method', e.target.value)}
              options={BUY_METHODS.map(m => ({ value: m, label: m }))} />
            <Input label="Closes In (days)" value={form.closes_in_days} onChange={e => set('closes_in_days', e.target.value.replace(/\D/g,''))} placeholder="14" />
          </div>

          {/* Property types */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Property Types</div>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map(pt => (
                <button key={pt} type="button" onClick={() => toggleArr('property_types', pt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${(form.property_types||[]).includes(pt) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                  {pt}
                </button>
              ))}
            </div>
          </div>

          {/* States */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Active States</div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {STATES_LIST.map(s => (
                <button key={s} type="button" onClick={() => toggleArr('states', s)}
                  className={`px-2 py-1 rounded text-xs font-medium border transition-all ${(form.states||[]).includes(s) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={form.active} onChange={e => set('active', e.target.checked)} className="rounded" />
            <label htmlFor="active" className="text-sm text-slate-700">Active buyer</label>
          </div>

          <Textarea label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Preferences, criteria, past deals, relationship notes…" rows={3} />

          <div className="flex gap-2 pt-1">
            <Button onClick={submit} className="flex-1" disabled={!form.name.trim()}>
              {modal === 'add' ? 'Add Buyer' : 'Save Changes'}
            </Button>
            <Button variant="secondary" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
