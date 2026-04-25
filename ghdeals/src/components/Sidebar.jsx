import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/',         icon: '⚡', label: 'Analyzer'    },
  { to: '/history',  icon: '📁', label: 'Deal History' },
  { to: '/leads',    icon: '🎯', label: 'Seller Leads' },
  { to: '/buyers',   icon: '👥', label: 'Cash Buyers'  },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-slate-900 flex flex-col z-40 border-r border-slate-800">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">GH</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">GHH Acquisitions</div>
            <div className="text-slate-500 text-xs">Wholesale OS</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800">
        <div className="text-slate-600 text-xs mono">v3.0</div>
      </div>
    </aside>
  )
}
