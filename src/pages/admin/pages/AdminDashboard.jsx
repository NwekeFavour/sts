import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList, Users, FileText, ClipboardCheck,
  AlertTriangle, ArrowRight, Clock, CheckCircle2,
  Trash2, CheckCheck, XCircle, RotateCcw, ChevronDown,
  Briefcase, Loader2,
} from "lucide-react";
import { useAdminStore } from "../../../store/adminStore";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  pending:       "bg-amber-100 text-amber-700",
  assigned:      "bg-blue-100 text-blue-700",
  "in_progress": "bg-purple-100 text-purple-700",
  completed:     "bg-green-100 text-green-700",
  cancelled:     "bg-gray-100 text-gray-500",
};

const APP_BADGE = {
  pending:  "bg-amber-100 text-amber-700 border border-amber-200",
  approved: "bg-green-100 text-green-700 border border-green-200",
  rejected: "bg-red-100 text-red-600 border border-red-200",
};

const EVENT_ICON = {
  report_uploaded:    { icon: CheckCircle2,  color: "text-green-500"  },
  request_created:    { icon: ClipboardList, color: "text-blue-500"   },
  therapist_assigned: { icon: Users,         color: "text-purple-500" },
  form_submitted:     { icon: FileText,      color: "text-orange-500" },
};
const DEFAULT_EVENT = { icon: AlertTriangle, color: "text-red-500" };

function ConfirmDialog({ open, title, description, onConfirm, onCancel, danger, loading, showReasonField =false, reasonValue, onReasonChange }) {
  if (!open) return null;

  const confirmLabel = loading
    ? danger ? "Deleting…" : "Saving…"
    : danger ? "Yes, delete" : "Confirm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? "bg-red-50" : "bg-amber-50"}`}>
          <AlertTriangle size={18} className={danger ? "text-red-500" : "text-amber-500"} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
        </div>
        {showReasonField && (
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium text-gray-700">Reason for rejection</label>
            <textarea
              value={reasonValue}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Optional: reason for rejection (sent to applicant)"
              className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring focus:ring-slate-500"
            />
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold text-white transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-[#E8890C] hover:opacity-90"
            }`}
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
// ── Application filter pill ───────────────────────────────────────────────────
function FilterPill({ active, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
        active
          ? "bg-[#E8890C] text-white border-[#E8890C]"
          : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
      }`}
    >
      {label}
      {count != null && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Drop-in replacement for ApplicationsSection
// Changes:
// - Added experience_level badge in table + mobile cards
// - Expanded row now shows all structured fields from the new form
// - cover_letter renders with section breaks (the \n\n[Section] format from controller)

const LEVEL_BADGE = {
  beginner:     "bg-green-50 text-green-700 border-green-200",
  intermediate: "bg-blue-50 text-blue-700 border-blue-200",
  expert:       "bg-purple-50 text-purple-700 border-purple-200",
};

function ApplicationsSection() {
  const {
    applications,
    applicationsLoading,
    applicationsError,
    fetchApplications,
    approveApplication,
    rejectApplication,
    resetApplication,
    deleteApplication,
  } = useAdminStore();

  const [filter, setFilter]             = useState("all");
  const [expanded, setExpanded]         = useState(null);
  const [actionLoading, setAction]      = useState(null);
  const [confirm, setConfirm]           = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => { fetchApplications(); }, []);

  const counts = useMemo(() => ({
    all:      applications.length,
    pending:  applications.filter(a => a.status === "pending").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  }), [applications]);

  const filtered = useMemo(() =>
    filter === "all" ? applications : applications.filter(a => a.status === filter),
    [applications, filter]
  );

  async function runAction(id, type) {
    setAction({ id, type });
    try {
      if (type === "approve") await approveApplication(id);
      else if (type === "reject") await rejectApplication(id, rejectReason);
      else if (type === "reset")  await resetApplication(id);
      else if (type === "delete") await deleteApplication(id);
      toast.success(
        type === "delete" ? "Application deleted" :
        type === "approve" ? "Application approved" :
        type === "reject"  ? "Application rejected" :
        "Reset to pending"
      );
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setAction(null);
      setConfirm(null);
      setRejectReason("");
    }
  }

  function isLoading(id, type) {
    return actionLoading?.id === id && actionLoading?.type === type;
  }

  const FILTERS = [
    { key: "all",      label: "All"      },
    { key: "pending",  label: "Pending"  },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FEF3E0] flex items-center justify-center">
            <Briefcase size={15} className="text-[#E8890C]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Therapist Applications</h2>
            <p className="text-xs text-gray-400 mt-0.5">{counts.pending} pending review</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <FilterPill key={f.key} active={filter === f.key} label={f.label} count={counts[f.key]} onClick={() => setFilter(f.key)} />
          ))}
        </div>
      </div>

      {/* Body */}
      {applicationsLoading ? (
        <div className="flex items-center justify-center py-14 gap-2 text-xs text-gray-400">
          <Loader2 size={16} className="animate-spin" /> Loading applications…
        </div>
      ) : applicationsError ? (
        <div className="flex flex-col items-center py-14 gap-3 text-center">
          <AlertTriangle size={24} className="text-red-400" />
          <p className="text-xs text-gray-500">{applicationsError}</p>
          <button onClick={fetchApplications} className="text-xs font-semibold text-[#E8890C] hover:underline">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-14 gap-2 text-center">
          <Briefcase size={24} className="text-gray-200" />
          <p className="text-xs text-gray-400">No {filter === "all" ? "" : filter} applications</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-gray-50/60">
                  {["Applicant", "Contact", "Specialization", "Level", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <>
                    <tr
                      key={app.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-gray-800">{app.full_name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">#{String(app.id).slice(0, 8)}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-xs text-gray-700">{app.email}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{app.phone}</p>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-gray-500">
                        {app.specialization || <span className="text-gray-300">—</span>}
                      </td>
                      {/* Experience level badge */}
                      <td className="px-3 py-3.5">
                        {app.experience_level ? (
                          <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize border ${LEVEL_BADGE[app.experience_level] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                            {app.experience_level}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${APP_BADGE[app.status]}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          {app.status !== "approved" && (
                            <button title="Approve" disabled={!!actionLoading}
                              onClick={() => setConfirm({ id: app.id, type: "approve" })}
                              className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition disabled:opacity-40">
                              {isLoading(app.id, "approve") ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={13} />}
                            </button>
                          )}
                          {app.status !== "rejected" && (
                            <button title="Reject" disabled={!!actionLoading}
                              onClick={() => setConfirm({ id: app.id, type: "reject" })}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition disabled:opacity-40">
                              {isLoading(app.id, "reject") ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                            </button>
                          )}
                          {app.status !== "pending" && (
                            <button title="Reset to pending" disabled={!!actionLoading}
                              onClick={() => setConfirm({ id: app.id, type: "reset" })}
                              className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-100 transition disabled:opacity-40">
                              {isLoading(app.id, "reset") ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                            </button>
                          )}
                          <button title="Delete" disabled={!!actionLoading}
                            onClick={() => setConfirm({ id: app.id, type: "delete" })}
                            className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition disabled:opacity-40">
                            {isLoading(app.id, "delete") ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                          <ChevronDown size={13} className={`text-gray-300 transition-transform ${expanded === app.id ? "rotate-180" : ""}`} />
                        </div>
                      </td>
                    </tr>

                    {/* ── Expanded detail row ── */}
                    {expanded === app.id && (
                      <tr key={`${app.id}-detail`} className="bg-gray-50/40">
                        <td colSpan={6} className="px-5 py-5">
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs mb-4">
                            <Detail label="Experience Level" value={app.experience_level ? app.experience_level.charAt(0).toUpperCase() + app.experience_level.slice(1) : null} />
                            <Detail label="Qualifications / Education" value={app.qualifications} />
                            <Detail label="Years of Experience" value={app.years_of_experience ? `${app.years_of_experience} years` : null} />
                            <Detail label="License Number" value={app.license_number} />
                            <Detail label="Specialization" value={app.specialization} />
                            <Detail label="Resume" value={app.resume_link} isLink />
                            <Detail label="Submitted" value={app.created_at ? new Date(app.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null} />
                          </div>
                          {/* Cover letter — renders structured sections */}
                          {app.cover_letter && (() => {
  const firstQuestionIndex = app.cover_letter.search(/\n\s*\[/);

  const coverLetter =
    firstQuestionIndex > -1
      ? app.cover_letter.slice(0, firstQuestionIndex).trim()
      : app.cover_letter.trim();

  const answers =
    firstQuestionIndex > -1
      ? app.cover_letter.slice(firstQuestionIndex)
      : "";

  const questionBlocks = [...answers.matchAll(/\[(.+?)\]\n([\s\S]*?)(?=\n\s*\[|$)/g)];

  return (
    <div className="mt-3 space-y-4">

      {/* Cover Letter */}
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
          Cover Letter
        </p>

        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-7">
            {coverLetter}
          </p>
        </div>
      </div>

      {/* Application Questions */}
      {questionBlocks.length > 0 && (
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
            Application Questions
          </p>

          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-100">
            {questionBlocks.map((match, i) => (
              <div key={i} className="p-4">
                <p className="text-xs font-semibold text-gray-900 mb-2">
                  {match[1]}
                </p>

                <div className="inline-flex items-center rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                  {match[2].trim() || "No answer"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
})()}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ── */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.map(app => (
              <div key={app.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{app.full_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{app.email}</p>
                    <p className="text-[10px] text-gray-400">{app.phone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${APP_BADGE[app.status]}`}>
                      {app.status}
                    </span>
                    {app.experience_level && (
                      <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full capitalize border ${LEVEL_BADGE[app.experience_level]}`}>
                        {app.experience_level}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Detail label="Specialization" value={app.specialization} />
                  <Detail label="Experience" value={app.years_of_experience ? `${app.years_of_experience} yrs` : null} />
                </div>

                <button
                  onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                  className="flex items-center gap-1 text-[11px] text-gray-400 font-medium"
                >
                  <ChevronDown size={12} className={`transition-transform ${expanded === app.id ? "rotate-180" : ""}`} />
                  {expanded === app.id ? "Less detail" : "More detail"}
                </button>

                {expanded === app.id && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <Detail label="Qualifications" value={app.qualifications} />
                    <Detail label="License" value={app.license_number} />
                    <Detail label="Resume" value={app.resume_link} isLink />
{app.cover_letter &&
  (() => {
    const firstQuestionIndex = app.cover_letter.search(/\n\s*\[/);

    const coverLetter =
      firstQuestionIndex > -1
        ? app.cover_letter.slice(0, firstQuestionIndex).trim()
        : app.cover_letter.trim();

    const answers =
      firstQuestionIndex > -1
        ? app.cover_letter.slice(firstQuestionIndex)
        : "";

    const questionBlocks = [
      ...answers.matchAll(/\[(.+?)\]\n([\s\S]*?)(?=\n\s*\[|$)/g),
    ];

    return (
      <div className="space-y-4">
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
            Cover Letter
          </p>

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-6">
              {coverLetter}
            </p>
          </div>
        </div>

        {questionBlocks.length > 0 && (
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
              Application Questions
            </p>

            <div className="bg-white border border-gray-100 rounded-xl p-4">
              {questionBlocks.map((match, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <p className="text-xs font-semibold text-gray-900 mb-2">
                    {match[1]}
                  </p>

                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-6">
                    {match[2].trim() || "No answer"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  })()}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {app.status !== "approved" && (
                    <ActionBtn label="Approve" icon={<CheckCheck size={11} />} loading={isLoading(app.id, "approve")} disabled={!!actionLoading} className="bg-green-50 text-green-700 border-green-200" onClick={() => setConfirm({ id: app.id, type: "approve" })} />
                  )}
                  {app.status !== "rejected" && (
                    <ActionBtn label="Reject" icon={<XCircle size={11} />} loading={isLoading(app.id, "reject")} disabled={!!actionLoading} className="bg-red-50 text-red-600 border-red-200" onClick={() => setConfirm({ id: app.id, type: "reject" })} />
                  )}
                  {app.status !== "pending" && (
                    <ActionBtn label="Reset" icon={<RotateCcw size={11} />} loading={isLoading(app.id, "reset")} disabled={!!actionLoading} className="bg-amber-50 text-amber-600 border-amber-200" onClick={() => setConfirm({ id: app.id, type: "reset" })} />
                  )}
                  <ActionBtn label="Delete" icon={<Trash2 size={11} />} loading={isLoading(app.id, "delete")} disabled={!!actionLoading} className="bg-gray-100 text-gray-500 border-gray-200" onClick={() => setConfirm({ id: app.id, type: "delete" })} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!confirm}
        danger={confirm?.type === "delete"}
        loading={!!actionLoading}
        title={
          confirm?.type === "delete"  ? "Delete application?"  :
          confirm?.type === "approve" ? "Approve application?" :
          confirm?.type === "reject"  ? "Reject application?"  :
          "Reset to pending?"
        }
        description={
          confirm?.type === "delete"
            ? "This will permanently remove the application. This cannot be undone."
            : confirm?.type === "approve"
            ? "The applicant will be notified and their account will be created."
            : confirm?.type === "reject"
            ? "The applicant will be notified by email that their application was unsuccessful."
            : "This will move the application back to pending review."
        }
        showReasonField={confirm?.type === "reject"}
        reasonValue={rejectReason}
        onReasonChange={setRejectReason}
        onConfirm={() => confirm && runAction(confirm.id, confirm.type)}
        onCancel={() => { setConfirm(null); setRejectReason(""); }}
      />
    </div>
  );
}

function Detail({ label, value, isLink, wide }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{label}</p>
      {isLink && value ? (
        <a href={value} target="_blank" rel="noreferrer" className="text-xs text-[#E8890C] hover:underline mt-0.5 block truncate">
          View document ↗
        </a>
      ) : (
        <p className="text-xs text-gray-700 mt-0.5">{value || <span className="text-gray-300">—</span>}</p>
      )}
    </div>
  );
}

function ActionBtn({ label, icon, loading, disabled, className, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition disabled:opacity-40 ${className}`}
    >
      {loading ? <Loader2 size={11} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const {
    dashboardStats: stats,
    recentRequests,
    therapists,
    activityFeed,
    dashboardLoading,
    dashboardError,
    fetchDashboard,
  } = useAdminStore();

  useEffect(() => { fetchDashboard(); }, []);

  const STAT_CARDS = useMemo(() => [
    {
      label: "Pending Requests",
      value: stats.pendingRequests,
      total: `of ${stats.totalRequests} total`,
      icon: ClipboardList,
      color: "bg-amber-50 text-amber-600",
      ring: "ring-[#dadada]",
      alert: stats.pendingRequests > 0,
      alertMsg: "Awaiting therapist assignment",
      link: "/admin/requests",
    },
    {
      label: "Active Cases",
      value: stats.totalCases,
      total: "currently ongoing",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      ring: "ring-blue-200",
      alert: false,
      link: "/admin/cases",
    },
    {
      label: "Pending Reports",
      value: stats.pendingReports,
      total: "to review",
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
      ring: "ring-purple-200",
      alert: stats.pendingReports > 0,
      alertMsg: "Uploaded, awaiting review",
      link: "/admin/reports",
    },
    {
      label: "Pending Forms",
      value: stats.pendingForms,
      total: "not yet submitted",
      icon: ClipboardCheck,
      color: "bg-[#FEF3E0] text-[#E8890C]",
      ring: "ring-[#F4A832]/30",
      alert: stats.pendingForms > 0,
      alertMsg: "Parents not yet responded",
      link: "/admin/forms",
    },
  ], [stats]);

 const [currentPage, setCurrentPage] = useState(1);
 const [currentActivity, setCurrentActivities] = useState(1);
const ITEMS_PER_PAGE = 4;
const ACTIVITY_PER_PAGE = 5

const paginatedRequests = recentRequests.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

const totalPages = Math.ceil(recentRequests.length / ITEMS_PER_PAGE);

//activity feed pagination
const paginatedActivies = activityFeed.slice(
  (currentActivity - 1) * ACTIVITY_PER_PAGE,
  currentActivity * ACTIVITY_PER_PAGE
);

const totalActivies = Math.ceil(activityFeed.length / ACTIVITY_PER_PAGE);
  if (dashboardLoading) {
    return (
      <div className="space-y-7 animate-pulse">
        <div className="h-14 bg-gray-100 rounded-2xl" />
        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-gray-100 rounded-2xl" />
          <div className="h-72 bg-gray-100 rounded-2xl" />
        </div>
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <AlertTriangle size={32} className="text-red-400" />
        <p className="text-sm font-semibold text-gray-700">Failed to load dashboard</p>
        <p className="text-xs text-gray-400">{dashboardError}</p>
        <button
          onClick={() => fetchDashboard()}
          className="px-4 py-2 bg-[#E8890C] text-white text-xs font-semibold rounded-full hover:opacity-90 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* Alert banner */}
      {stats.pendingRequests > 0 && (
        <div className="bg-amber-50 border border-[#dadada] rounded-2xl px-5 py-4 lg:flex items-center justify-between space-y-3 lg:space-y-0">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {stats.pendingRequests} request{stats.pendingRequests > 1 ? "s" : ""} awaiting therapist assignment
              </p>
              <p className="text-xs text-[#181616] mt-0.5">Assign therapists to avoid delays in care</p>
            </div>
          </div>
          <Link to="/admin/requests" className="text-xs font-semibold text-amber-700 flex items-center gap-1 hover:underline">
            Review now <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5">
        {STAT_CARDS.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 min-h-[180px] flex flex-col justify-between ${
              card.alert ? `ring-2 ${card.ring}` : ""
            }`}
          >
            <div className="flex flex-wrap space-y-2 items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon size={18} />
              </div>
              {card.alert && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <AlertTriangle size={10} /> Action needed
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{card.value ?? 0}</p>
            <p className="text-sm font-semibold text-gray-700">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.alert ? card.alertMsg : card.total}</p>
          </Link>
        ))}
      </div>

      {/* Main grid: requests + activity */}
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">

        {/* Recent requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-50">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Recent Requests</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest therapy intake submissions</p>
            </div>
            <Link to="/admin/requests" className="text-xs font-semibold text-[#E8890C] flex items-center justify-end gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/60">
                  {["Parent / Child","Location","Date","Status",""].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 lg:px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-xs text-gray-400 py-10">No requests yet</td></tr>
                ) : paginatedRequests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 lg:px-6 py-3.5">
                      <p className="text-sm font-semibold text-gray-800">{req.parent}</p>
                      <p className="text-xs text-gray-400">{req.child}</p>
                    </td>
                    <td className="px-3 py-3.5 text-xs text-gray-500">{req.location}</td>
                    <td className="px-3 py-3.5 text-xs text-gray-500">{req.date}</td>
                    <td className="px-3 py-3.5">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[req.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {req.status.replace("/_/g,", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link to="/admin/requests" className="text-[10px] font-semibold text-gray-400 hover:text-[#E8890C] transition-colors">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
  <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-100">
    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 text-xs font-medium border rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Previous
    </button>

    <span className="text-xs text-gray-500">
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() =>
        setCurrentPage((p) => Math.min(p + 1, totalPages))
      }
      disabled={currentPage === totalPages}
      className="px-3 py-1 text-xs font-medium border rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Next
    </button>
  </div>
)}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {paginatedRequests.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No activity yet</p>
            ) :paginatedRequests.map((req) => (
              <div key={req.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{req.parent}</p>
                    <p className="text-xs text-gray-400 mt-1">{req.child}</p>
                  </div>
                  <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[req.status]}`}>
                    {req.status.replace("/_/g,", " ")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Location</p>
                    <p className="text-xs text-gray-600 mt-1">{req.location}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Date</p>
                    <p className="text-xs text-gray-600 mt-1">{req.date}</p>
                  </div>
                </div>
                <Link to="/admin/requests" className="inline-flex text-xs font-semibold text-[#E8890C] hover:underline">
                  View Request →
                </Link>
              </div>
            ))}
          </div>
                      {totalPages > 1 && (
  <div className="md:hidden flex items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-100">
    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 text-xs font-medium border rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Previous
    </button>

    <span className="text-xs text-gray-500">
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() =>
        setCurrentPage((p) => Math.min(p + 1, totalPages))
      }
      disabled={currentPage === totalPages}
      className="px-3 py-1 text-xs font-medium border rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Next
    </button>
  </div>
)}
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest system events</p>
          </div>
          <div className="p-5 space-y-4">
            {paginatedActivies.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No activity yet</p>
            ) : paginatedActivies.map((a) => {
              const { icon: Icon, color } = EVENT_ICON[a.eventType] ?? DEFAULT_EVENT;
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 ${color}`}><Icon size={15} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 leading-snug">{a.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={9} /> {a.time}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
                                        {totalActivies > 1 && (
  <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-100">
    <button
      onClick={() => setCurrentActivities((p) => Math.max(p - 1, 1))}
      disabled={currentActivity === 1}
      className="px-3 py-1 text-xs font-medium border rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Previous
    </button>

    <span className="text-xs text-gray-500">
      Page {currentActivity} of {totalActivies}
    </span>

    <button
      onClick={() =>
        setCurrentActivities((p) => Math.min(p + 1, totalActivies))
      }
      disabled={currentActivity === totalActivies}
      className="px-3 py-1 text-xs font-medium border rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Next
    </button>
  </div>
)}
        </div>
        
      </div>

      {/* ── Applications section ── */}
      <ApplicationsSection />

      {/* Therapist snapshot */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-50">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Therapist Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Active caseloads</p>
          </div>
          <Link to="/admin/therapists" className="text-xs font-semibold text-[#E8890C] flex items-center gap-1 hover:underline">
            Manage <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 xl:divide-x divide-gray-50">
          {therapists.filter(t => t.status === 'active').length === 0 ? (
            <div className="col-span-4 text-center text-xs text-gray-400 py-10">No active therapists</div>
          ) : therapists.filter(t => t.status === 'active').map((t) => (
            <div key={t.id} className="px-4 sm:px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEF3E0] to-[#F4A832] flex items-center justify-center text-[#5C3010] text-xs font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 leading-tight truncate">{t.name}</p>
                  <p className="text-xs text-gray-400 truncate">{t.role}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{t.cases}</p>
                  <p className="text-[11px] text-gray-400">active cases</p>
                </div>
                <div className="flex-1 max-w-[90px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E8890C] rounded-full" style={{ width: `${Math.min(100, (t.cases / 15) * 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}