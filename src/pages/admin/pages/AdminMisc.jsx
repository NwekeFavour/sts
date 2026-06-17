// pages/admin/AdminNotificationsSettings.jsx
// Two named exports — wire to your router:
//   /admin/notifications → <AdminNotifications />
//   /admin/settings      → <AdminSettings />

import { useEffect, useState } from 'react'
import { Bell, Settings, CheckCircle2, Clock, AlertTriangle, FileText, UserCheck, ClipboardCheck, RefreshCw } from 'lucide-react'
import { useAdminStore } from '../../../store/adminStore'
import useAuthStore from '../../../store/useAuthStore'

const API = import.meta.env.VITE_API_URL

function authHeaders() {
  try {
    const raw   = localStorage.getItem('ststephens-auth')
    const token = raw ? JSON.parse(raw)?.state?.session?.access_token : null
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  } catch { return { 'Content-Type': 'application/json' } }
}

// ── map event_type → icon + color ────────────────────────────────────────────
function resolveIcon(eventType) {
  const map = {
    request_created:       { Icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
    therapist_assigned:    { Icon: UserCheck,     color: 'text-blue-500 bg-blue-50' },
    report_uploaded:       { Icon: FileText,      color: 'text-purple-500 bg-purple-50' },
    form_submitted:        { Icon: ClipboardCheck,color: 'text-green-500 bg-green-50' },
    form_sent:             { Icon: Bell,          color: 'text-orange-500 bg-orange-50' },
    application_approved:  { Icon: CheckCircle2,  color: 'text-green-500 bg-green-50' },
    application_rejected:  { Icon: AlertTriangle, color: 'text-red-400 bg-red-50' },
    form_reviewed:         { Icon: CheckCircle2,  color: 'text-green-500 bg-green-50' },
  }
  return map[eventType] ?? { Icon: Bell, color: 'text-gray-500 bg-gray-50' }
}


// ── skeleton ──────────────────────────────────────────────────────────────────
function NotifSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/4 bg-gray-100 rounded" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminNotifications
// ─────────────────────────────────────────────────────────────────────────────
export function AdminNotifications() {
  const { activityFeed, fetchDashboard, dashboardLoading } = useAdminStore()
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('admin-read-notifs') ?? '[]')) }
    catch { return new Set() }
  })
  const [filter, setFilter] = useState('all') // 'all' | 'unread'

  useEffect(() => {
    if (!activityFeed.length) fetchDashboard()
  }, [])

  function markRead(id) {
    setReadIds(prev => {
      const next = new Set(prev).add(id)
      localStorage.setItem('admin-read-notifs', JSON.stringify([...next]))
      return next
    })
  }

  function markAllRead() {
    const allIds = activityFeed.map(a => a.id)
    const next = new Set([...readIds, ...allIds])
    localStorage.setItem('admin-read-notifs', JSON.stringify([...next]))
    setReadIds(next)
  }

  const displayed = activityFeed.filter(a =>
    filter === 'all' ? true : !readIds.has(a.id)
  )
  const unreadCount = activityFeed.filter(a => !readIds.has(a.id)).length

  return (
    <div className="max-w-2xl space-y-4">
      {/* header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-[#E8890C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* filter tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {['all', 'unread'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={markAllRead}
            className="text-xs text-[#E8890C] font-semibold hover:underline whitespace-nowrap">
            Mark all read
          </button>
          <button onClick={fetchDashboard}
            className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-all">
            <RefreshCw size={13} className={dashboardLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* skeletons */}
      {dashboardLoading && Array.from({ length: 5 }).map((_, i) => <NotifSkeleton key={i} />)}

      {/* list */}
      {!dashboardLoading && displayed.map((n) => {
        const unread = !readIds.has(n.id)
        const { Icon, color } = resolveIcon(n.eventType)
        return (
          <div key={n.id}
            onClick={() => markRead(n.id)}
            className={`bg-white rounded-2xl border p-5 flex items-start gap-4 cursor-pointer transition-all hover:shadow-sm ${
              unread ? 'border-[#E8890C]/30 shadow-sm' : 'border-gray-100'
            }`}>
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${unread ? 'font-semibold text-gray-900' : 'font-normal text-gray-600'}`}>
                {n.message}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Clock size={10} /> {n.time}
              </p>
            </div>
            {unread && <div className="w-2 h-2 rounded-full bg-[#E8890C] mt-1.5 flex-shrink-0" />}
          </div>
        )
      })}

      {!dashboardLoading && displayed.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          {filter === 'unread' ? 'No unread notifications.' : 'No activity yet.'}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminSettings
// ─────────────────────────────────────────────────────────────────────────────
export function AdminSettings() {
  const { user } = useAuthStore()

  const [org, setOrg] = useState({
    name:  '',
    email: '',
    phone: '',
  })
  const [account, setAccount] = useState({
    name : '',
    email:     '',
  })
  const [passwords, setPasswords] = useState({
    current:  '',
    next:     '',
    confirm:  '',
  })

  const [orgLoading,  setOrgLoading]  = useState(false)
  const [orgError,    setOrgError]    = useState(null)
  const [orgSuccess,  setOrgSuccess]  = useState(false)

  const [accLoading,  setAccLoading]  = useState(false)
  const [accError,    setAccError]    = useState(null)
  const [accSuccess,  setAccSuccess]  = useState(false)

  const [pwLoading,   setPwLoading]   = useState(false)
  const [pwError,     setPwError]     = useState(null)
  const [pwSuccess,   setPwSuccess]   = useState(false)

  // Seed from auth store on mount
  useEffect(() => {
    if (user) {
      setAccount({ name: user.name ?? '', email: user.email ?? '' })
    }
  }, [user])

  // ── save org details ──────────────────────────────────────────────────────
  async function saveOrg(e) {
    e.preventDefault()
    setOrgLoading(true); setOrgError(null); setOrgSuccess(false)
    try {
      const res  = await fetch(`${API}/api/admin/settings/org`, {
        method:  'PATCH',
        headers: authHeaders(),
        body:    JSON.stringify(org),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message ?? json.error ?? `HTTP ${res.status}`)
      setOrgSuccess(true)
      setTimeout(() => setOrgSuccess(false), 3000)
    } catch (err) {
      setOrgError(err.message)
    } finally {
      setOrgLoading(false)
    }
  }

  // ── save account details ──────────────────────────────────────────────────
  async function saveAccount(e) {
    e.preventDefault()
    setAccLoading(true); setAccError(null); setAccSuccess(false)
    try {
      const res  = await fetch(`${API}/api/admin/settings/account`, {
        method:  'PATCH',
        headers: authHeaders(),
        body:    JSON.stringify(account),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message ?? json.error ?? `HTTP ${res.status}`)
      setAccSuccess(true)
      setTimeout(() => setAccSuccess(false), 3000)
    } catch (err) {
      setAccError(err.message)
    } finally {
      setAccLoading(false)
    }
  }

  // ── change password ───────────────────────────────────────────────────────
  async function changePassword(e) {
    e.preventDefault()
    if (passwords.next !== passwords.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    if (passwords.next.length < 8) {
      setPwError('Password must be at least 8 characters.')
      return
    }
    setPwLoading(true); setPwError(null); setPwSuccess(false)
    try {
      const res  = await fetch(`${API}/api/admin/settings/password`, {
        method:  'PATCH',
        headers: authHeaders(),
        body:    JSON.stringify({ current_password: passwords.current, new_password: passwords.next }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message ?? json.error ?? `HTTP ${res.status}`)
      setPwSuccess(true)
      setPasswords({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (err) {
      setPwError(err.message)
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Organisation Details ── */}
      <SettingsCard title="Organisation Details" desc="Public-facing contact information">
        <form onSubmit={saveOrg} className="space-y-4">
          <Field label="Organisation Name"
            value={org.name}
            onChange={v => setOrg(p => ({ ...p, name: v }))}
            placeholder="St. Stephen's Family" />
          <Field label="Organisation Email" type="email"
            value={org.email}
            onChange={v => setOrg(p => ({ ...p, email: v }))}
            placeholder="info@ststephensfam.org" />
          <Field label="Phone"
            value={org.phone}
            onChange={v => setOrg(p => ({ ...p, phone: v }))}
            placeholder="+234 800 000 0000" />
          <FormFooter loading={orgLoading} success={orgSuccess} error={orgError} />
        </form>
      </SettingsCard>

      {/* ── Admin Account ── */}
      <SettingsCard title="Admin Account" desc="Your personal profile">
        <form onSubmit={saveAccount} className="space-y-4">
          <Field label="Full Name"
            value={account.name}
            onChange={v => setAccount(p => ({ ...p, name: v }))}
            placeholder="Admin Name" />
          <Field label="Email Address" type="email"
            value={account.email}
            onChange={v => setAccount(p => ({ ...p, email: v }))}
            placeholder="admin@ststephensfam.org" />
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Role</p>
            <p className="text-sm text-gray-700 font-medium">Super Admin</p>
          </div>
          <FormFooter loading={accLoading} success={accSuccess} error={accError} />
        </form>
      </SettingsCard>

      {/* ── Change Password ── */}
      <SettingsCard title="Change Password" desc="Must be at least 8 characters">
        <form onSubmit={changePassword} className="space-y-4">
          <Field label="Current Password" type="password"
            value={passwords.current}
            onChange={v => setPasswords(p => ({ ...p, current: v }))}
            placeholder="••••••••" />
          <Field label="New Password" type="password"
            value={passwords.next}
            onChange={v => setPasswords(p => ({ ...p, next: v }))}
            placeholder="••••••••" />
          <Field label="Confirm New Password" type="password"
            value={passwords.confirm}
            onChange={v => setPasswords(p => ({ ...p, confirm: v }))}
            placeholder="••••••••" />
          <FormFooter loading={pwLoading} success={pwSuccess} error={pwError} label="Update Password" />
        </form>
      </SettingsCard>

    </div>
  )
}

// ── shared sub-components ─────────────────────────────────────────────────────
function SettingsCard({ title, desc, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C] transition-all"
      />
    </div>
  )
}

function FormFooter({ loading, success, error, label = 'Save Changes' }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <button type="submit" disabled={loading}
        className={`px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all ${
          loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#E8890C] hover:bg-[#F4A832]'
        }`}>
        {loading ? 'Saving…' : label}
      </button>
      {success && (
        <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
          <CheckCircle2 size={13} /> Saved
        </span>
      )}
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  )
}