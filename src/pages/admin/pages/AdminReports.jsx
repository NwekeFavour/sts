// pages/admin/AdminReports.jsx
import { useEffect, useState } from "react";
import { Search, Download, CheckCircle2, Clock, FileText, Sparkles, Flag, X, AlertTriangle } from "lucide-react";
import { useAdminStore } from "../../../store/adminStore";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  reviewed: "bg-green-100 text-green-700",
  pending:  "bg-amber-100 text-amber-700",
  flagged:  "bg-red-100 text-red-700",
};

// Any pending report — final or routine — can be reviewed or flagged.
// "Final" remains its own filter tab since it answers a different
// question (did this report close the case?) than status does.
const TABS = ["All", "Pending", "Reviewed", "Flagged", "Final"];

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function FinalBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-purple-50 text-purple-600">
      <Sparkles size={10} /> Final
    </span>
  );
}

function CaseClosedPill() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600">
      <CheckCircle2 size={11} /> Case closed
    </span>
  );
}

// ── Flag reason modal ──────────────────────────────────────────────────────
function FlagModal({ report, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState("");
  const [err, setErr]       = useState(null);

  function handleSubmit() {
    if (!reason.trim()) {
      setErr("Please describe why you're flagging this report.");
      return;
    }
    setErr(null);
    onSubmit(reason.trim());
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <Flag size={14} className="text-red-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Flag report</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Flagging report</p>
            <p className="text-sm font-medium text-gray-800">{report.title}</p>
            <p className="text-xs text-gray-400">
              {report.request?.child_name} · {report.therapist?.full_name}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Wrong case selected, missing session notes, marked final by mistake…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              This will be sent to {report.therapist?.full_name ?? "the therapist"} so they can correct and resubmit.
            </p>
          </div>

          {err && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {err}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Flagging…" : "Flag report"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReports() {
  const {
    reports, reportsLoading, reportsError,
    fetchReports, reviewReport, flagReport, downloadReport,
  } = useAdminStore();

  const [tab, setTab]                 = useState("All");
  const [search, setSearch]           = useState("");
  const [reviewingId, setReviewingId] = useState(null);
  const [flagging, setFlagging]       = useState(null);   // report object or null
  const [flagSubmitting, setFlagSubmitting] = useState(false);

  useEffect(() => { fetchReports(); }, []);

  const filtered = reports.filter((r) => {
    const matchTab =
      tab === "All"      ? true :
      tab === "Final"    ? r.is_final :
      r.status === tab.toLowerCase();

    const q = search.toLowerCase();
    const matchSearch = !search
      || r.title?.toLowerCase().includes(q)
      || r.therapist?.full_name?.toLowerCase().includes(q)
      || r.request?.child_name?.toLowerCase().includes(q)
      || r.request?.parent_name?.toLowerCase().includes(q);

    return matchTab && matchSearch;
  });

  console.log(filtered)

  const thisMonth = reports.filter((r) => {
    if (!r.created_at) return false;
    const d = new Date(r.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const finalCount   = reports.filter((r) => r.is_final).length;
  const flaggedCount = reports.filter((r) => r.status === "flagged").length;

  async function handleDownload(id) {
    try {
      const url = await downloadReport(id);
      window.open(url, "_blank");
    } catch {
      toast.error("Could not generate download link.");
    }
  }

  async function handleReview(id) {
    if (reviewingId) return;
    setReviewingId(id);
    try {
      await reviewReport(id);
      toast.success("Report marked as reviewed.");
    } catch (err) {
      toast.error(err.message || "Could not mark report as reviewed.");
    } finally {
      setReviewingId(null);
    }
  }

  async function handleFlagSubmit(reason) {
    setFlagSubmitting(true);
    try {
      await flagReport(flagging.id, reason);
      toast.success("Report flagged and sent back to therapist.");
      setFlagging(null);
    } catch (err) {
      toast.error(err.message || "Could not flag report.");
    } finally {
      setFlagSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 gap-4">
        {[
          { label: "Total Reports",  value: reports.length,                                       icon: FileText,     color: "bg-gray-50 text-gray-600"    },
          { label: "Pending Review", value: reports.filter((r) => r.status === "pending").length, icon: Clock,        color: "bg-amber-50 text-amber-600"  },
          { label: "Flagged",        value: flaggedCount,                                          icon: Flag,         color: "bg-red-50 text-red-600"      },
          { label: "Final Reports",  value: finalCount,                                            icon: Sparkles,     color: "bg-purple-50 text-purple-600"},
          { label: "This Month",     value: thisMonth,                                             icon: FileText,     color: "bg-[#FEF3E0] text-[#E8890C]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-gray-50 gap-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  tab === t ? "bg-[#E8890C] text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports…"
              className="w-full sm:w-56 bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C]"
            />
          </div>
        </div>

        {reportsLoading && (
          <div className="py-16 text-center text-sm text-gray-400">Loading reports…</div>
        )}
        {reportsError && (
          <div className="py-16 text-center text-sm text-red-500">{reportsError}</div>
        )}

        {!reportsLoading && !reportsError && (
          <>
            {/* ── Mobile cards ── */}
            <div className="block lg:hidden">
              {filtered.map((r) => (
                <div key={r.id} className="border-b border-gray-100 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FEF3E0] flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-[#E8890C]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-800 truncate">{r.title}</p>
                          {r.is_final && <FinalBadge />}
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono truncate">{r.id}</p>
                        {r.request?.status === "completed" && <CaseClosedPill />}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  {r.status === "flagged" && r.flag_reason && (
                    <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-700">
                      <span className="font-semibold">Flag reason:</span> {r.flag_reason}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400 mb-0.5">Therapist</p>
                      <p className="text-gray-700">{r.therapist?.full_name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Child</p>
                      <p className="text-gray-700">{r.request?.child_name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Parent</p>
                      <p className="text-gray-700">{r.request?.parent_name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Date</p>
                      <p className="text-gray-500">{fmt(r.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {r.file_url && (
                      <button
                        onClick={() => handleDownload(r.id)}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
                      >
                        <Download size={14} />
                      </button>
                    )}
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleReview(r.id)}
                          disabled={reviewingId === r.id}
                          className="px-3 py-2 bg-green-50 text-green-700 text-[11px] font-bold rounded-lg hover:bg-green-100 disabled:opacity-50 transition-all"
                        >
                          {reviewingId === r.id ? "Marking…" : "Mark reviewed"}
                        </button>
                        <button
                          onClick={() => setFlagging(r)}
                          className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg hover:bg-red-100 transition-all"
                        >
                          <Flag size={11} /> Flag
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="bg-gray-50/60">
                    {["Report", "Therapist", "Child", "Parent", "Date", "Status", ""].map((h) => (
                      <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FEF3E0] flex items-center justify-center flex-shrink-0">
                            <FileText size={14} className="text-[#E8890C]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-gray-800 max-w-[180px] truncate">{r.title}</p>
                              {r.is_final && <FinalBadge />}
                            </div>
                            <p className="text-[10px] text-gray-400 font-mono">{r.id}</p>
                            {r.request?.status === "completed" && <CaseClosedPill />}
                            {r.status === "flagged" && r.flag_reason && (
                              <p className="text-[10px] text-red-500 mt-1 max-w-[220px] truncate" title={r.flag_reason}>
                                ⚠ {r.flag_reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                        {r.therapist?.full_name ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                        {r.request?.child_name ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                        {r.request?.parent_name ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {fmt(r.created_at)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {r.file_url && (
                            <button
                              onClick={() => handleDownload(r.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                              title="Download file"
                            >
                              <Download size={14} />
                            </button>
                          )}
                          {r.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleReview(r.id)}
                                disabled={reviewingId === r.id}
                                className="px-2.5 py-1.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg hover:bg-green-100 disabled:opacity-50 transition-all"
                              >
                                {reviewingId === r.id ? "Marking…" : "Mark reviewed"}
                              </button>
                              <button
                                onClick={() => setFlagging(r)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-all"
                                title="Flag this report back to the therapist"
                              >
                                <Flag size={10} /> Flag
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm">
                No reports match this filter.
              </div>
            )}
          </>
        )}
      </div>

      {flagging && (
        <FlagModal
          report={flagging}
          submitting={flagSubmitting}
          onClose={() => setFlagging(null)}
          onSubmit={handleFlagSubmit}
        />
      )}
    </div>
  );
}