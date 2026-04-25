import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Analyzer from './pages/Analyzer'
import History from './pages/History'
import Leads from './pages/Leads'
import Buyers from './pages/Buyers'

export default function App() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-56 flex-1 p-8 min-h-screen">
        <Routes>
          <Route path="/"        element={<Analyzer />} />
          <Route path="/history" element={<History />} />
          <Route path="/leads"   element={<Leads />} />
          <Route path="/buyers"  element={<Buyers />} />
        </Routes>
      </main>
    </div>
  )
}
