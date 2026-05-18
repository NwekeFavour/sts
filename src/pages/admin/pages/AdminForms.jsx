import { useState } from "react";
import { useAdminStore } from "../../../store/adminStore";
import {
  Search,
  Send,
  Plus,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";

const TYPE_BADGE = {
  intake: "bg-[#FEF3E0] text-[#E8890C]",
  behaviour: "bg-purple-100 text-purple-700",
  medical: "bg-blue-100 text-blue-700",
};

const STATUS_BADGE = {
  submitted: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  sent: "bg-blue-100 text-blue-700",
};

const TABS = ["All", "Pending", "Submitted"];

const FORM_TEMPLATES = [
  {
    id: "T1",
    name: "Standard Intake Form",
    type: "intake",
    desc: "Parent details, child info, initial concerns",
  },
  {
    id: "T2",
    name: "Behavioural Questionnaire",
    type: "behaviour",
    desc: "Detailed behavioural patterns and triggers",
  },
  {
    id: "T3",
    name: "Medical History Form",
    type: "medical",
    desc: "Past diagnoses, medications, allergies",
  },
];

export default function AdminForms() {
  const { forms } = useAdminStore();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [sendModal, setSendModal] = useState(false);

  const filtered = forms.filter((f) => {
    const matchTab = tab === "All" || f.status === tab.toLowerCase();
    const matchSearch =
      !search || f.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid lg:grid-cols-3 gap-4">
        {[
          {
            label: "Total Forms Sent",
            value: forms.length,
            icon: ClipboardCheck,
            color: "bg-gray-50 text-gray-600",
          },
          {
            label: "Awaiting Response",
            value: forms.filter((f) => f.status === "pending").length,
            icon: Clock,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Submitted",
            value: forms.filter((f) => f.status === "submitted").length,
            icon: CheckCircle2,
            color: "bg-green-50 text-green-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}
            >
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-gray-50 gap-4">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  tab === t
                    ? "bg-[#E8890C] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search + Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search forms..."
                className="w-full sm:w-56 bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C]"
              />
            </div>

            <button
              onClick={() => setSendModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#E8890C] text-white text-xs font-semibold rounded-xl hover:bg-[#F4A832] transition-all whitespace-nowrap"
            >
              <Plus size={13} />
              Send Form
            </button>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden">
          {filtered.map((f) => (
            <div key={f.id} className="border-b border-gray-100 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {f.title}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono">{f.id}</p>
                </div>

                <span
                  className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[f.status]}`}
                >
                  {f.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Type</p>
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${TYPE_BADGE[f.type]}`}
                  >
                    {f.type}
                  </span>
                </div>

                <div>
                  <p className="text-gray-400 mb-1">Date</p>
                  <p className="text-gray-600">{f.date}</p>
                </div>

                <div>
                  <p className="text-gray-400 mb-1">Patient</p>
                  <p className="text-gray-700">{f.patient}</p>
                </div>

                <div>
                  <p className="text-gray-400 mb-1">Sent To</p>
                  <p className="text-gray-500 break-all">{f.sentTo}</p>
                </div>
              </div>

              <div>
                {f.status === "pending" && (
                  <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                    <Send size={11} />
                    Resend
                  </button>
                )}

                {f.status === "submitted" && (
                  <button className="text-xs font-semibold text-green-600 hover:underline">
                    View response
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/60">
                {[
                  "Form",
                  "Type",
                  "Patient",
                  "Sent To",
                  "Date",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="text-xs font-semibold text-gray-800">
                      {f.title}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {f.id}
                    </p>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${TYPE_BADGE[f.type]}`}
                    >
                      {f.type}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                    {f.patient}
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {f.sentTo}
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {f.date}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[f.status]}`}
                    >
                      {f.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {f.status === "pending" && (
                      <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                        <Send size={11} />
                        Resend
                      </button>
                    )}

                    {f.status === "submitted" && (
                      <button className="text-xs font-semibold text-green-600 hover:underline">
                        View response
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No forms match this filter.
          </div>
        )}
      </div>

      {/* Send form modal */}
      {sendModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900">
                  Send Assessment Form
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Choose a template and recipient
                </p>
              </div>
              <button
                onClick={() => setSendModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Select Template
                </label>
                <div className="space-y-2">
                  {FORM_TEMPLATES.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-[#E8890C] cursor-pointer transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#FEF3E0] flex items-center justify-center flex-shrink-0">
                        <ClipboardCheck size={14} className="text-[#E8890C]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {t.name}
                        </p>
                        <p className="text-xs text-gray-400">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Recipient Email
                </label>
                <input
                  placeholder="parent@email.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSendModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setSendModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E8890C] text-white text-sm font-semibold hover:bg-[#F4A832]"
                >
                  <Send size={14} /> Send Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
