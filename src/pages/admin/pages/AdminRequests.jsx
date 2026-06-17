import { useState, useEffect } from 'react'
import { useAdminStore } from '../../../store/adminStore'
import {
  Search, Filter, UserPlus, Eye, X, Check,
  Video, Loader2, AlertTriangle, RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  pending:       'bg-amber-100 text-amber-700',
  assigned:      'bg-blue-100 text-blue-700',
  'in_progress': 'bg-purple-100 text-purple-700',
  completed:     'bg-green-100 text-green-700',
  cancelled:     'bg-gray-100 text-gray-500',
}

const TABS = ['All', 'Pending', 'Assigned', 'In_Progress', 'Completed']

const API = import.meta.env.VITE_API_URL

function authHeaders() {
  try {
    const raw = localStorage.getItem('ststephens-auth')
    const token = raw ? JSON.parse(raw)?.state?.session?.access_token : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch { return {} }
}

// ─── Video viewer modal ───────────────────────────────────────────────────────
function VideoModal({ requestId, childName, onClose }) {
  const [url, setUrl]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`${API}/api/requests/${requestId}/video-url`, { headers: authHeaders() })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load video')
        setUrl(data.url)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [requestId])

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-gray-900 text-sm">Child video</p>
            <p className="text-xs text-gray-400 mt-0.5">{childName} · Link valid for 1 hour</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          {loading && (
            <div className="flex items-center justify-center py-14 gap-2 text-gray-400 text-sm">
              <Loader2 size={18} className="animate-spin" /> Loading video…
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center py-12 gap-3 text-center">
              <AlertTriangle size={24} className="text-red-400" />
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          )}
          {url && (
            <video
              src={url}
              controls
              autoPlay
              className="w-full rounded-xl max-h-[420px] bg-black"
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── View request modal ───────────────────────────────────────────────────────
function ViewModal({ req, therapists, onClose, onAssign }) {
  const [showVideo, setShowVideo] = useState(false)

  const fields = [
    ['Parent name',   req.parent_name],
    ['Email',         req.parent_email],
    ['Phone',         req.parent_phone || '—'],
    ['Location',      req.location     || '—'],
    ['Child name',    req.child_name],
    ['Child age',     req.child_age ? `${req.child_age} years old` : '—'],
    ['Child gender',  req.child_gender || '—'],
    ['Submitted',     req.created_at
      ? new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—'],
  ]

  const behaviouralFields = [
    ['Primary concerns',       req.primary_concerns],
    ['Behavioural challenges', req.behavioural_challenges],
    ['Communication level',    req.communication_level],
    ['Has diagnosis?',         req.diagnosis_received],
    ['Existing diagnosis',     req.existing_diagnosis],
    ['School attendance',      req.school_attendance],
    ['Previous therapy',       req.previous_therapy],
    ['Previous therapy details', req.previous_therapy_details],
    ['Additional notes',       req.additional_notes],
  ].filter(([, val]) => val && val !== 'unsure' && val !== 'null')

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h3 className="font-bold text-gray-900">Request Details</h3>
              <p className="text-[10px] font-mono text-gray-400 mt-0.5">{req.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[req.status]}`}>
                {req.status?.replace('-', ' ')}
              </span>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body — scrollable */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Contact + child grid */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Contact & child</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {fields.map(([label, val]) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm text-gray-800 mt-0.5 break-all">{val || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Behavioural info */}
            {behaviouralFields.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Behavioural profile</p>
                <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                  {behaviouralFields.map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm text-gray-700 mt-0.5 leading-relaxed whitespace-pre-wrap">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned therapist */}
            {req.therapist && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Assigned therapist</p>
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FEF3E0] to-[#F4A832] flex items-center justify-center text-[#5C3010] text-xs font-bold flex-shrink-0">
                    {req.therapist.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{req.therapist.full_name}</p>
                    <p className="text-xs text-gray-400">{req.therapist.specialization || 'Therapist'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-2 flex-shrink-0">
            {req.video_key && (
              <button
                onClick={() => setShowVideo(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition"
              >
                <Video size={13} /> Watch video
              </button>
            )}
            {!req.therapist_id && (
              <button
                onClick={() => { onClose(); onAssign(req) }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#E8890C] text-white text-xs font-semibold rounded-xl hover:bg-[#F4A832] transition"
              >
                <UserPlus size={13} /> Assign therapist
              </button>
            )}
            <button onClick={onClose} className="ml-auto px-4 py-2 border border-gray-200 text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition">
              Close
            </button>
          </div>
        </div>
      </div>

      {showVideo && (
        <VideoModal
          requestId={req.id}
          childName={req.child_name}
          onClose={() => setShowVideo(false)}
        />
      )}
    </>
  )
}

// ─── Assign modal ─────────────────────────────────────────────────────────────
function AssignModal({ req, therapists, onAssign, onClose }) {
  const [selected, setSelected] = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleAssign() {
    if (!selected) return
    setLoading(true)
    try {
      await onAssign(req.id, selected)
      toast.success('Therapist assigned successfully')
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to assign therapist')
    } finally {
      setLoading(false)
    }
  }

  const activeTherapists = (therapists || []).filter(t => t.status === 'active')

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900">Assign Therapist</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              For {req.parent_name} — {req.child_name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={16} />
          </button>
        </div>

        {activeTherapists.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No active therapists available.</p>
        ) : (
          <div className="space-y-2 mb-5 max-h-64 overflow-y-auto">
            {activeTherapists.map(t => {
              const initials = (t.full_name || t.name || '')
                .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
              const name = t.full_name || t.name
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selected === t.id
                      ? 'border-[#E8890C] bg-[#FEF3E0]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FEF3E0] to-[#F4A832] flex items-center justify-center text-[#5C3010] text-xs font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {t.specialization || t.role || 'Therapist'} · {t.active_cases ?? t.cases ?? 0} cases
                    </p>
                  </div>
                  {selected === t.id && <Check size={16} className="text-[#E8890C] flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selected || loading}
            className="flex-1 py-2.5 rounded-xl bg-[#E8890C] text-white text-sm font-semibold hover:bg-[#F4A832] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            Assign Therapist
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminRequests() {
  const {
    requests,
    therapists,
    fetchRequests,
    fetchTherapists,
    assignTherapist,
    requestsLoading,
    requestsError,
  } = useAdminStore()

  const [tab, setTab]           = useState('All')
  const [search, setSearch]     = useState('')
  const [viewModal, setViewModal]   = useState(null)
  const [assignModal, setAssignModal] = useState(null)

  useEffect(() => {
    fetchRequests()
    fetchTherapists()
  }, [])

  const filtered = (requests || []).filter(r => {
    const status = r.status || ''
    const matchTab = tab === 'All' ||
      status.replace('-', ' ').toLowerCase() === tab.toLowerCase()
    const q = search.toLowerCase()
    const matchSearch = !search ||
      (r.parent_name  || '').toLowerCase().includes(q) ||
      (r.child_name   || '').toLowerCase().includes(q) ||
      (r.parent_email || '').toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  console.log(filtered)

  const counts = {
    pending:     (requests || []).filter(r => r.status === 'pending').length,
    assigned:    (requests || []).filter(r => r.status === 'assigned').length,
    inProgress:  (requests || []).filter(r => r.status === 'in_progress').length,
  }

  if (requestsLoading) return (
    <div className="space-y-5 animate-pulse">
      <div className="grid lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_,i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl"/>)}
      </div>
      <div className="h-96 bg-gray-100 rounded-2xl"/>
    </div>
  )

  if (requestsError) return (
    <div className="flex flex-col items-center py-20 gap-4 text-center">
      <AlertTriangle size={28} className="text-red-400"/>
      <p className="text-sm text-gray-600">{requestsError}</p>
      <button onClick={fetchRequests} className="px-4 py-2 bg-[#E8890C] text-white text-xs font-semibold rounded-full">
        Retry
      </button>
    </div>
  )

  return (
    <div className="space-y-5">

      {/* Summary cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { label: 'Pending requests',     count: counts.pending,    color: 'text-amber-600',  bg: 'bg-amber-50 border-[#dadada]'  },
          { label: 'Awaiting assignment',  count: counts.pending,    color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200'    },
          { label: 'In Progress',         count: counts.inProgress, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200'},
        ].map(a => (
          <div key={a.label} className={`${a.bg} border rounded-2xl px-5 py-4 flex items-end justify-between`}>
            <div>
              <p className={`text-xs font-semibold ${a.color}`}>{a.label}</p>
              <p className={`text-3xl font-bold mt-1 ${a.color}`}>{a.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Tabs + search */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 gap-4 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  tab === t ? 'bg-[#E8890C] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {t}
                <span className="ml-1.5 text-[9px] opacity-70">
                  {t === 'All'
                    ? (requests || []).length
                    : (requests || []).filter(r => r.status?.replace('-',' ').toLowerCase() === t.toLowerCase()).length}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search parent or child…"
                className="bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-xs w-52 outline-none focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C]"
              />
            </div>
            <button onClick={fetchRequests} className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100 transition" title="Refresh">
              <RefreshCw size={13}/>
            </button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="mt-4 md:block hidden overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                {['Parent', 'Child', 'Age', 'Location', 'Received', 'Therapist', 'Video', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-400 text-sm">
                    No requests match this filter.
                  </td>
                </tr>
              ) : filtered.map(req => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-gray-800">{req.parent_name}</p>
                    <p className="text-xs text-gray-400">{req.parent_email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{req.child_name}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{req.child_age ? `${req.child_age}y` : '—'}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{req.location || '—'}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">
                    {req.created_at
                      ? new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    {req.therapist ? (
                      <p className="text-xs font-medium text-gray-700">{req.therapist.full_name}</p>
                    ) : (
                      <button onClick={() => setAssignModal(req)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#E8890C] hover:underline">
                        <UserPlus size={12}/> Assign
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {req.video_key ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        <Video size={9}/> Yes
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[req.status]}`}>
                      {req.status?.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => setViewModal(req)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                      <Eye size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filtered.map(req => (
            <div key={req.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{req.parent_name}</p>
                  <p className="text-xs text-gray-400">{req.parent_email}</p>
                </div>
                <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${STATUS_BADGE[req.status]}`}>
                  {req.status?.replace('-', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div><span className="text-gray-400">Child: </span>{req.child_name}, {req.child_age}y</div>
                <div><span className="text-gray-400">Location: </span>{req.location || '—'}</div>
              </div>
              <button onClick={() => setViewModal(req)} className="text-xs font-semibold text-[#E8890C] hover:underline">
                View details →
              </button>
            </div>
          ))}
        </div>
      </div>

      {viewModal && (
        <ViewModal
          req={viewModal}
          therapists={therapists}
          onClose={() => setViewModal(null)}
          onAssign={(req) => setAssignModal(req)}
        />
      )}

      {assignModal && (
        <AssignModal
          req={assignModal}
          therapists={therapists}
          onAssign={assignTherapist}
          onClose={() => setAssignModal(null)}
        />
      )}
    </div>
  )
}