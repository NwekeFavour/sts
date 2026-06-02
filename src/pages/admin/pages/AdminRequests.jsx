import { useState } from 'react'
import { useAdminStore } from '../../../store/adminStore'
import { Search, Filter, UserPlus, Eye, MoreHorizontal, X, Check } from 'lucide-react'

const STATUS_BADGE = {
  pending:      'bg-amber-100 text-amber-700',
  assigned:     'bg-blue-100 text-blue-700',
  'in-progress':'bg-purple-100 text-purple-700',
  completed:    'bg-green-100 text-green-700',
}

const TABS = ['All', 'Pending', 'Assigned', 'In Progress', 'Completed']

export default function AdminRequests() {
  const { requests, therapists, assignTherapist, updateRequestStatus } = useAdminStore()
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [assignModal, setAssignModal] = useState(null) // request being assigned
  const [viewModal, setViewModal] = useState(null)
  const [selectedTherapist, setSelectedTherapist] = useState('')

  const filtered = requests.filter(r => {
    const matchTab = tab === 'All' || r.status.replace('-',' ').toLowerCase() === tab.toLowerCase()
    const matchSearch = !search ||
      r.parent.toLowerCase().includes(search.toLowerCase()) ||
      r.child.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  function handleAssign() {
    if (!selectedTherapist || !assignModal) return
    assignTherapist(assignModal.id, selectedTherapist)
    setAssignModal(null)
    setSelectedTherapist('')
  }

  return (
    <div className="space-y-5">

      {/* Alert cards row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { label: 'Confirm all new requests', count: requests.filter(r=>r.status==='pending').length, color: 'text-amber-600', bg: 'bg-amber-50 border-[#dadada]' },
          { label: 'Assign pending therapists', count: requests.filter(r=>r.status==='pending').length, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Active cases in progress', count: requests.filter(r=>r.status==='in-progress').length, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
        ].map(a => (
          <div key={a.label} className={`${a.bg} border rounded-2xl px-5 py-4 flex items-end justify-between`}>
            <div>
              <p className={`text-xs font-semibold ${a.color}`}>⚠ {a.label}</p>
              <p className={`text-3xl font-bold mt-1 ${a.color}`}>{a.count}</p>
            </div>
            <button className={`text-xs font-bold ${a.color} flex items-center gap-1 hover:underline`}>
              Confirm all <span>→</span>
            </button>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Tabs + search */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 gap-4 flex-wrap">
          <div className="flex gap-1 flex-wrap space-y-2">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  tab === t
                    ? 'bg-[#E8890C] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {t}
                <span className="ml-1.5 text-[9px] opacity-70">
                  {t === 'All' ? requests.length
                    : requests.filter(r => r.status.replace('-',' ').toLowerCase() === t.toLowerCase()).length}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search parent or child..."
                className="bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-xs w-52 outline-none focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C]"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100">
              <Filter size={12} /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                {['ID', 'Parent', 'Child', 'Location', 'Date Received', 'Therapist', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-gray-400">{req.id}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-800">{req.parent}</p>
                    <p className="text-xs text-gray-400">{req.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{req.child}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{req.location}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{req.date}</td>
                  <td className="px-5 py-4">
                    {req.therapist ? (
                      <p className="text-xs font-medium text-gray-700">{req.therapist}</p>
                    ) : (
                      <button
                        onClick={() => setAssignModal(req)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#E8890C] hover:underline"
                      >
                        <UserPlus size={12} /> Assign
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[req.status]}`}>
                      {req.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewModal(req)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">No requests match this filter.</div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900">Assign Therapist</h3>
                <p className="text-xs text-gray-400 mt-0.5">For {assignModal.parent} - {assignModal.child}</p>
              </div>
              <button onClick={() => setAssignModal(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2 mb-5">
              {therapists.filter(t => t.status === 'active').map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTherapist(t.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selectedTherapist === t.name
                      ? 'border-[#E8890C] bg-[#FEF3E0]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FEF3E0] to-[#F4A832] flex items-center justify-center text-[#5C3010] text-xs font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} · {t.cases} cases</p>
                  </div>
                  {selectedTherapist === t.name && (
                    <Check size={16} className="text-[#E8890C]" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedTherapist}
                className="flex-1 py-2.5 rounded-xl bg-[#E8890C] text-white text-sm font-semibold hover:bg-[#F4A832] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Therapist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900">Request Details</h3>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{viewModal.id}</p>
              </div>
              <button onClick={() => setViewModal(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Parent Name', viewModal.parent],
                  ['Email', viewModal.email],
                  ['Phone', viewModal.phone],
                  ['Location', viewModal.location],
                  ['Child', viewModal.child],
                  ['Date', viewModal.date],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm text-gray-800">{val}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Concern Summary</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{viewModal.concern}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full capitalize ${STATUS_BADGE[viewModal.status]}`}>
                  {viewModal.status.replace('-', ' ')}
                </span>
                {!viewModal.therapist && (
                  <button
                    onClick={() => { setViewModal(null); setAssignModal(viewModal) }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#E8890C] text-white text-xs font-semibold rounded-xl hover:bg-[#F4A832]"
                  >
                    <UserPlus size={13} /> Assign Therapist
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
