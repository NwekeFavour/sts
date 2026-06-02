import { Bell, Settings, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

const NOTIFS = [
  { icon: AlertTriangle, color: 'text-amber-500 bg-amber-50', msg: 'New therapy request from James Mensah (Manchester, UK)', time: '18 min ago', unread: true },
  { icon: CheckCircle2,  color: 'text-green-500 bg-green-50',  msg: 'Report uploaded: Discharge Summary, Chidera E. by Tolu Adeyemi', time: '2 hr ago', unread: true },
  { icon: Bell,          color: 'text-blue-500 bg-blue-50',    msg: 'Fatima Ibrahim assigned to case REQ-006 (Lola A.)', time: '3 hr ago', unread: true },
  { icon: CheckCircle2,  color: 'text-green-500 bg-green-50',  msg: 'Intake form submitted by Bisi Adegoke', time: '5 hr ago', unread: false },
  { icon: Clock,         color: 'text-gray-500 bg-gray-50',    msg: 'Reminder: 2 forms still awaiting parent response', time: '1 day ago', unread: false },
]

export function AdminNotifications() {
  return (
    <div className="max-w-2xl space-y-3">
      {NOTIFS.map((n, i) => (
        <div key={i} className={`bg-white rounded-2xl border p-5 flex items-start gap-4 transition-all ${n.unread ? 'border-[#E8890C]/30 shadow-sm' : 'border-gray-100'}`}>
          <div className={`w-10 h-10 rounded-xl ${n.color} flex items-center justify-center flex-shrink-0`}>
            <n.icon size={16} />
          </div>
          <div className="flex-1">
            <p className={`text-sm ${n.unread ? 'font-semibold text-gray-900' : 'text-gray-600'} leading-snug`}>{n.msg}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={10} /> {n.time}</p>
          </div>
          {n.unread && <div className="w-2 h-2 rounded-full bg-[#E8890C] mt-1 flex-shrink-0" />}
        </div>
      ))}
    </div>
  )
}

export function AdminSettings() {
  return (
    <div className="max-w-2xl space-y-5">
      {[
        { title: 'Organisation Details', fields: [['Organisation Name', 'St. Stephen\'s Family'], ['Email', 'info@ststephensfam.org'], ['Phone', '+234 800 000 0000']] },
        { title: 'Admin Account', fields: [['Admin Name', 'Admin User'], ['Admin Email', 'admin@ststephensfam.org'], ['Role', 'Super Admin']] },
      ].map(section => (
        <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
          </div>
          <div className="p-6 space-y-4">
            {section.fields.map(([label, val]) => (
              <div key={label}>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">{label}</label>
                <input
                  defaultValue={val}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C]"
                />
              </div>
            ))}
            <button className="px-5 py-2.5 bg-[#E8890C] text-white text-sm font-semibold rounded-xl hover:bg-[#F4A832] transition-all mt-2">
              Save Changes
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
