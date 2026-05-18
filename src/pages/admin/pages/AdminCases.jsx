import { useAdminStore } from '../../../store/adminStore'
import { Search, FileText, ClipboardCheck, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const STATUS_BADGE = {
  assigned:     'bg-blue-100 text-blue-700',
  'in-progress':'bg-purple-100 text-purple-700',
}

export default function AdminCases() {
  const { requests } = useAdminStore()
  const [search, setSearch] = useState('')

  const activeCases = requests.filter(r => ['assigned','in-progress'].includes(r.status))
  const filtered = activeCases.filter(r =>
    !search || r.parent.toLowerCase().includes(search.toLowerCase()) || r.child.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="lg:flex block items-end justify-between">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm w-64 outline-none shadow-sm focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C]"
          />
        </div>
        <p className="text-[12px] w-full flex justify-end text-gray-500">{filtered.length} active case{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-bold text-gray-900">{c.parent}</p>
                <p className="text-[12px] text-gray-500 mt-0.5">Child: {c.child} · {c.location}</p>
              </div>
              <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[c.status]}`}>
                {c.status.replace('-', ' ')}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 leading-relaxed">{c.concern}</p>
            </div>

            <div className="flex flex-wrap  space-y-2 items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FEF3E0] flex items-center justify-center text-[10px] font-bold text-[#5C3010]">
                  {c.therapist?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <span className="font-medium text-gray-700">{c.therapist}</span>
              </div>
              <span className="text-gray-400 text-[10px]">Since {c.date}</span>
            </div>

            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-50">
              <Link to="/admin/reports" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-all">
                <FileText size={12} /> Reports
              </Link>
              <Link to="/admin/forms" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-all">
                <ClipboardCheck size={12} /> Forms
              </Link>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#FEF3E0] hover:bg-[#F4A832]/20 rounded-xl text-xs font-semibold text-[#E8890C] transition-all">
                View case <ArrowRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          No active cases found.
        </div>
      )}
    </div>
  )
}
