// ── Badge ──────────────────────────────────────────────────────────────────
const badgeColors = {
  // deal status
  analyzing:      'bg-blue-100 text-blue-700',
  'under contract':'bg-amber-100 text-amber-700',
  assigned:       'bg-green-100 text-green-700',
  dead:           'bg-red-100 text-red-700',
  // lead status
  new:            'bg-slate-100 text-slate-600',
  contacted:      'bg-blue-100 text-blue-700',
  negotiating:    'bg-amber-100 text-amber-700',
  'under-contract':'bg-purple-100 text-purple-700',
  closed:         'bg-green-100 text-green-700',
  // severity
  high:           'bg-red-100 text-red-600',
  medium:         'bg-amber-100 text-amber-600',
  low:            'bg-green-100 text-green-700',
}

export function Badge({ label, size = 'sm' }) {
  const cls = badgeColors[label?.toLowerCase()] || 'bg-slate-100 text-slate-600'
  const sz = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center rounded-full font-medium capitalize ${cls} ${sz}`}>
      {label}
    </span>
  )
}

// ── Button ─────────────────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', type = 'button' }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed gap-2'
  const variants = {
    primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    danger:    'bg-red-50 hover:bg-red-100 text-red-600',
    ghost:     'hover:bg-slate-100 text-slate-600',
    outline:   'border border-slate-200 hover:bg-slate-50 text-slate-700',
  }
  const sizes = {
    xs: 'text-xs px-2.5 py-1.5',
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────
export function Input({ label, value, onChange, placeholder, type = 'text', className = '', onKeyDown, autoFocus, readOnly }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        readOnly={readOnly}
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
      />
    </div>
  )
}

// ── Textarea ───────────────────────────────────────────────────────────────
export function Textarea({ label, value, onChange, placeholder, rows = 3, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white resize-none"
      />
    </div>
  )
}

// ── Select ─────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick, hover }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${hover ? 'hover:shadow-md hover:border-slate-300 cursor-pointer transition-all duration-150' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-light leading-none transition">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── StatBox ────────────────────────────────────────────────────────────────
export function StatBox({ label, value, accent = '#3b82f6', sub }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ── ToggleGroup ────────────────────────────────────────────────────────────
export function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div>
      {label && <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</div>}
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all duration-150 ${
              value === opt.value
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────
export function Empty({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-base font-semibold text-slate-700 mb-1">{title}</div>
      {sub && <div className="text-sm text-slate-400 max-w-xs">{sub}</div>}
    </div>
  )
}
