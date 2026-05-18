import { useState } from 'react'
import { useAdminStore } from '../../../store/adminStore'
import { Search, UserPlus, Mail, Phone, MoreHorizontal, X, Briefcase } from 'lucide-react'

const STATUS_BADGE = {
  active:   'bg-green-100 text-green-700',
  training: 'bg-blue-100 text-blue-700',
  inactive: 'bg-gray-100 text-gray-500',
}

export default function AdminTherapists() {
  const { therapists } = useAdminStore()
  const [search, setSearch] = useState('')
  const [viewModal, setViewModal] = useState(null)

  const filtered = therapists.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">

      {/* Top bar */}
      <div className="flex flex-wrap space-y-3  items-center justify-between">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search therapists..."
            className="bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm w-64 outline-none shadow-sm focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E8890C] text-white text-sm font-semibold rounded-xl hover:bg-[#F4A832] transition-all shadow-sm">
          <UserPlus size={15} /> Add Therapist
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { label: 'Active Therapists', value: therapists.filter(t=>t.status==='active').length, color: 'text-green-600 bg-green-50' },
          { label: 'In Training', value: therapists.filter(t=>t.status==='training').length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Cases', value: therapists.reduce((a,t)=>a+t.cases,0), color: 'text-[#E8890C] bg-[#FEF3E0]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className={`text-3xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
            <p className="text-[12px] text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Therapist grid */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="lg:flex space-y-2 items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FEF3E0] to-[#F4A832] flex items-center justify-center text-[#5C3010] font-bold text-sm flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                </div>
              </div>
              <button
                onClick={() => setViewModal(t)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-all"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail size={11} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{t.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Briefcase size={11} className="text-gray-400 flex-shrink-0" />
                <span>{t.speciality}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div>
                <p className="text-xl font-bold text-gray-900">{t.cases}</p>
                <p className="text-[10px] text-gray-400">active cases</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[t.status]}`}>
                  {t.status}
                </span>
                <p className="text-[10px] text-gray-400">Since {t.joined.slice(0,7)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Therapist Profile</h3>
              <button onClick={() => setViewModal(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6 p-4 bg-[#FEF3E0] rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F4A832] to-[#E8890C] flex items-center justify-center text-white font-bold text-lg">
                {viewModal.avatar}
              </div>
              <div>
                <p className="font-bold text-gray-900">{viewModal.name}</p>
                <p className="text-sm text-gray-500">{viewModal.role}</p>
                <span className={`mt-1 inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[viewModal.status]}`}>
                  {viewModal.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Email', viewModal.email],
                ['Speciality', viewModal.speciality],
                ['Active Cases', viewModal.cases],
                ['Joined', viewModal.joined],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm text-gray-800">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
