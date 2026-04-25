import { useState, useEffect } from 'react'
import { getLeads, saveLead, deleteLead, genId, fmtDate } from '../utils/storage'
import { Badge, Button, Card, Modal, Input, Textarea, Select, Empty } from '../components/UI'

const STAGES = ['New', 'Contacted', 'Negotiating', 'Under Contract', 'Dead']
const MOTIVATIONS = ['Inherited', 'Divorce', 'Behind on taxes', 'Foreclosure', 'Vacant/Abandoned', 'Job relocation', 'Probate', 'Tired landlord', 'Other']

function emptyLead() {
  return { id: genId(), name: '', phone: '', email: '', address: '', city: '', state: '', zip: '', asking_price: '', motivation: '', stage: 'New', notes: '', followup_date: '', createdAt: new Date().toISOString() }
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyLead())
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('All')
  const [viewLead, setViewLead] = useState(null)

  useEffect(() => { setLeads(getLeads()) }, [])
  function refresh() { setLeads(getLeads()) }

  function openAdd() { setForm(emptyLead()); setModal('add') }
  function openEdit(lead) { setForm({ ...lead }); setModal('edit'); setViewLead(null) }

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function submit() {
    if (!form.name.trim() || !form.address.trim()) return
    saveLead(form)
    refresh()
    setModal(null)
  }

  function remove(id) {
    deleteLead(id)
    refresh()
    setViewLead(null)
  }

  function changeStage(id, stage) {
    const leads = getLeads()
    const lead = leads.find(l => l.id === id)
    if (!lead) return
    lead.stage = stage
    saveLead(lead)
    refresh()
    setViewLead(v => v?.id === id ? { ...v, stage } : v)
  }

  const filtered = leads.filter(l => {
    const matchSearch = (l.name + l.address + l.city).toLowerCase().includes(search.toLowerCase())
    const matchStage = filterStage === 'All' || l.stage === filterStage
    return matchSearch && matchStage
  })

  const stageCount = (stage) => leads.filter(l => l.stage === stage).length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Seller Leads</h1>
          <p className="text-sm text-slate-500 mt-0.5">{leads.length} lead{leads.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <Button onClick={openAdd}>+ Add Lead</Button>
      </div>

      {/* Stage pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['All', ...STAGES].map(s => (
          <button key={s} onClick={() => setFilterStage(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterStage === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
            {s} {s !== 'All' && <span className="ml-1 opacity-60">{stageCount(s)}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <Card className="p-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, address, city…"
          className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </Card>

      {filtered.length === 0 && (
        <Empty icon="🎯" title="No leads yet" sub="Add your first seller lead to start tracking your pipeline." />
      )}

      <div className="space-y-3">
        {filtered.map(lead => (
          <Card key={lead.id} hover onClick={() => setViewLead(lead)} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-slate-900">{lead.name}</span>
                  <Badge label={lead.stage.toLowerCase().replace(' ', '-')} />
                </div>
                <div className="text-xs text-slate-500 truncate">{lead.address}{lead.city ? `, ${lead.city}` : ''}{lead.state ? `, ${lead.state}` : ''}</div>
                <div className="flex gap-3 mt-1.5 flex-wrap">
                  {lead.asking_price && <span className="text-xs font-medium text-slate-600">Asking: ${Number(lead.asking_price).toLocaleString()}</span>}
                  {lead.motivation && <span className="text-xs text-slate-400">{lead.motivation}</span>}
                  {lead.followup_date && <span className="text-xs text-blue-500">Follow up: {new Date(lead.followup_date).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex gap-1 ml-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="xs" onClick={() => openEdit(lead)}>✏️</Button>
                <Button variant="danger" size="xs" onClick={() => remove(lead.id)}>×</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View lead modal */}
      <Modal open={!!viewLead} onClose={() => setViewLead(null)} title={viewLead?.name || ''} width="max-w-lg">
        {viewLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400 text-xs">Phone</span><div className="font-medium">{viewLead.phone || '—'}</div></div>
              <div><span className="text-slate-400 text-xs">Email</span><div className="font-medium">{viewLead.email || '—'}</div></div>
              <div className="col-span-2"><span className="text-slate-400 text-xs">Address</span><div className="font-medium">{viewLead.address}{viewLead.city ? `, ${viewLead.city}` : ''}{viewLead.state ? `, ${viewLead.state}` : ''} {viewLead.zip}</div></div>
              <div><span className="text-slate-400 text-xs">Asking Price</span><div className="font-medium text-green-600">{viewLead.asking_price ? '$' + Number(viewLead.asking_price).toLocaleString() : '—'}</div></div>
              <div><span className="text-slate-400 text-xs">Motivation</span><div className="font-medium">{viewLead.motivation || '—'}</div></div>
              <div><span className="text-slate-400 text-xs">Follow-up Date</span><div className="font-medium text-blue-600">{viewLead.followup_date ? new Date(viewLead.followup_date).toLocaleDateString() : '—'}</div></div>
              <div><span className="text-slate-400 text-xs">Added</span><div className="font-medium">{fmtDate(viewLead.createdAt)}</div></div>
            </div>
            {viewLead.notes && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Notes</div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{viewLead.notes}</p>
              </div>
            )}
            {/* Stage changer */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Move to Stage</div>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(s => (
                  <button key={s} onClick={() => changeStage(viewLead.id, s)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${viewLead.stage === s ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => openEdit(viewLead)} className="flex-1">✏️ Edit</Button>
              <Button variant="danger" size="sm" onClick={() => remove(viewLead.id)} className="flex-1">Delete</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Seller Lead' : 'Edit Lead'} width="max-w-lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Seller Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" />
            <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <Input label="Email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@email.com" />
          <Input label="Property Address *" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St" />
          <div className="grid grid-cols-3 gap-3">
            <Input label="City" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Columbus" />
            <Input label="State" value={form.state} onChange={e => set('state', e.target.value)} placeholder="GA" />
            <Input label="Zip" value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="31907" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Asking Price" value={form.asking_price} onChange={e => set('asking_price', e.target.value.replace(/\D/g,''))} placeholder="85000" />
            <Select label="Motivation" value={form.motivation} onChange={e => set('motivation', e.target.value)}
              options={['', ...MOTIVATIONS].map(m => ({ value: m, label: m || 'Select…' }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Stage" value={form.stage} onChange={e => set('stage', e.target.value)}
              options={STAGES.map(s => ({ value: s, label: s }))} />
            <Input label="Follow-up Date" type="date" value={form.followup_date} onChange={e => set('followup_date', e.target.value)} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Seller motivation, access details, condition notes…" rows={3} />
          <div className="flex gap-2 pt-1">
            <Button onClick={submit} className="flex-1" disabled={!form.name.trim() || !form.address.trim()}>
              {modal === 'add' ? 'Add Lead' : 'Save Changes'}
            </Button>
            <Button variant="secondary" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
