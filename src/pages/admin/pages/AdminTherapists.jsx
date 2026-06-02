import { useState, useEffect, useMemo } from "react";
import {
  Search, UserPlus, Mail, Phone, MoreHorizontal, X,
  Briefcase, Loader2, AlertTriangle, CheckCheck,
  ShieldOff, RotateCcw, ArrowUpCircle, Trash2,
} from "lucide-react";
import { useAdminStore } from "../../../store/adminStore";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  active:    "bg-green-100 text-green-700 border-green-200",
  pending:   "bg-amber-100 text-amber-700 border-amber-200",
  suspended: "bg-gray-100 text-gray-500 border-gray-200",
  training:  "bg-blue-100 text-blue-700 border-blue-200",
};

const SOURCE_LABEL = {
  profile:     null,               // don't show anything for real therapists
  application: "Applicant",
};

// Initials from full name
function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, description, onConfirm, onCancel, danger, loading }) {
  if (!open) return null;
  const label = loading
    ? danger ? "Deleting…" : "Saving…"
    : danger ? "Yes, confirm" : "Confirm";

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
            className={`flex-1 py-2 rounded-xl text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-[#E8890C] hover:opacity-90"
            }`}
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            {label}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Therapist card ───────────────────────────────────────────────────────────
function TherapistCard({ t, onAction, actionLoading }) {
  const isApp = t.source === "application";
  const busy  = !!actionLoading;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FEF3E0] to-[#F4A832] flex items-center justify-center text-[#5C3010] font-bold text-sm flex-shrink-0">
            {initials(t.full_name)}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">{t.full_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.specialization || "—"}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize border ${STATUS_BADGE[t.status]}`}>
            {t.status}
          </span>
          {isApp && (
            <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
              Applicant
            </span>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Mail size={11} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{t.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Phone size={11} className="text-gray-400 flex-shrink-0" />
          <span>{t.phone || "—"}</span>
        </div>
      </div>

      {/* Application status pill (applicants only) */}
      {isApp && t.application_status && (
        <div className="text-[10px] text-gray-500">
          Application:{" "}
          <span className={`font-semibold capitalize ${
            t.application_status === "approved" ? "text-green-600" :
            t.application_status === "rejected" ? "text-red-500" : "text-amber-600"
          }`}>
            {t.application_status}
          </span>
        </div>
      )}

      {/* Footer: joined + actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
        <p className="text-[10px] text-gray-400">
          Since {t.joined ? new Date(t.joined).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—"}
        </p>

        <div className="flex items-center gap-1.5">
          {/* Applicant: promote to active therapist */}
          {isApp && (
            <button
              title="Promote to therapist"
              disabled={busy}
              onClick={() => onAction(t, "promote")}
              className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition disabled:opacity-40"
            >
              {actionLoading?.id === t.id && actionLoading?.type === "promote"
                ? <Loader2 size={12} className="animate-spin" />
                : <ArrowUpCircle size={13} />}
            </button>
          )}

          {/* Profile therapist: suspend / reactivate */}
          {!isApp && t.status !== "suspended" && (
            <button
              title="Suspend"
              disabled={busy}
              onClick={() => onAction(t, "suspend")}
              className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition disabled:opacity-40"
            >
              {actionLoading?.id === t.id && actionLoading?.type === "suspend"
                ? <Loader2 size={12} className="animate-spin" />
                : <ShieldOff size={12} />}
            </button>
          )}
          {!isApp && t.status === "suspended" && (
            <button
              title="Reactivate"
              disabled={busy}
              onClick={() => onAction(t, "reactivate")}
              className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition disabled:opacity-40"
            >
              {actionLoading?.id === t.id && actionLoading?.type === "reactivate"
                ? <Loader2 size={12} className="animate-spin" />
                : <RotateCcw size={12} />}
            </button>
          )}

          {/* View details */}
          <button
            title="View profile"
            onClick={() => onAction(t, "view")}
            className="w-7 h-7 rounded-lg bg-[#FEF3E0] text-[#E8890C] flex items-center justify-center hover:bg-[#F4A832]/20 transition"
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────
function DetailModal({ t, onClose, onAction, actionLoading }) {
  if (!t) return null;
  const isApp = t.source === "application";
  const busy  = !!actionLoading;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">
            {isApp ? "Applicant Profile" : "Therapist Profile"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X size={15} />
          </button>
        </div>

        {/* Avatar block */}
        <div className="px-6 pt-5">
          <div className="flex items-center gap-4 p-4 bg-[#FEF3E0] rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F4A832] to-[#E8890C] flex items-center justify-center text-white font-bold text-lg">
              {initials(t.full_name)}
            </div>
            <div>
              <p className="font-bold text-gray-900">{t.full_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.specialization || "No specialization"}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize border ${STATUS_BADGE[t.status]}`}>
                  {t.status}
                </span>
                {isApp && (
                  <span className="text-[10px] text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-full">
                    Applicant
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="px-6 py-4 grid grid-cols-2 gap-4">
          {[
            ["Email",   t.email],
            ["Phone",   t.phone || "—"],
            ["Specialization", t.specialization || "—"],
            ["Joined",  t.joined ? new Date(t.joined).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"],
            ...(isApp ? [
              ["Application Status", t.application_status || "—"],
            ] : []),
          ].map(([label, val]) => (
            <div key={label} className={label === "Email" ? "col-span-2" : ""}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm text-gray-800 break-all">{val}</p>
            </div>
          ))}
        </div>

        {/* Modal actions */}
        <div className="px-6 pb-6 flex flex-wrap gap-2">
          {isApp && (
            <button
              disabled={busy}
              onClick={() => onAction(t, "promote")}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading?.id === t.id && actionLoading?.type === "promote"
                ? <Loader2 size={12} className="animate-spin" /> : <ArrowUpCircle size={13} />}
              Promote to Therapist
            </button>
          )}
          {!isApp && t.status !== "suspended" && (
            <button
              disabled={busy}
              onClick={() => onAction(t, "suspend")}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
            >
              <ShieldOff size={13} /> Suspend
            </button>
          )}
          {!isApp && t.status === "suspended" && (
            <button
              disabled={busy}
              onClick={() => onAction(t, "reactivate")}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-semibold hover:bg-green-100 transition disabled:opacity-50"
            >
              <RotateCcw size={13} /> Reactivate
            </button>
          )}
          <button onClick={onClose} className="ml-auto px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminTherapists() {
  const {
    therapistList,
    therapistListLoading,
    therapistListError,
    fetchTherapistList,
    promoteToTherapist,
    updateTherapistStatus,
  } = useAdminStore();

  const [search,        setSearch]        = useState("");
  const [filter,        setFilter]        = useState("all");  // all | active | training | suspended
  const [viewModal,     setViewModal]     = useState(null);
  const [confirm,       setConfirm]       = useState(null);   // { person, type }
  const [actionLoading, setActionLoading] = useState(null);   // { id, type }

  useEffect(() => { fetchTherapistList(); }, []);

  // ── Derived counts ──────────────────────────────────────────────────────────
const counts = useMemo(() => {
  const therapists = therapistList || [];

  return {
    all: therapists.length,
    active: therapists.filter(t => t.status === "active").length,
    training: therapists.filter(t => t.status === "training").length,
    suspended: therapists.filter(t => t.status === "suspended").length,
  };
}, [therapistList]);

  // ── Filtered + searched list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = filter === "all" ? therapistList : therapistList.filter(t => t.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.full_name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.specialization || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [therapistList, filter, search]);

  const safeFiltered = filtered || [];
  // ── Action handler ──────────────────────────────────────────────────────────
  function handleAction(person, type) {
    if (type === "view") { setViewModal(person); return; }
    setConfirm({ person, type });
  }

async function runAction() {
  if (!confirm) return;
  const { person, type } = confirm;
  setActionLoading({ id: person.id, type });
  try {
    if (type === "promote")    await promoteToTherapist(person.id);
    if (type === "suspend")    await updateTherapistStatus(person.id, "suspended");
    if (type === "reactivate") await updateTherapistStatus(person.id, "active");
    toast.success(
      type === "promote"    ? "Therapist promoted successfully" :
      type === "suspend"    ? "Therapist suspended"            :
      type === "reactivate" ? "Therapist reactivated"          : "Done"
    );
    if (viewModal?.id === person.id) {
      setViewModal(prev => ({ ...prev, status: type === "suspend" ? "suspended" : "active" }));
    }
  } catch (err) {
    console.log(err);
    toast.error(err.message || "Something went wrong");  // ← add this
  } finally {
    setActionLoading(null);
    setConfirm(null);
  }
}

  const FILTERS = [
    { key: "all",       label: "All"       },
    { key: "active",    label: "Active"    },
    { key: "training",  label: "Training"  },
    { key: "suspended", label: "Suspended" },
  ];

  // ── Loading / error states ──────────────────────────────────────────────────
  if (therapistListLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-11 bg-gray-100 rounded-2xl w-64" />
        <div className="grid lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (therapistListError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertTriangle size={28} className="text-red-400" />
        <p className="text-sm font-semibold text-gray-700">Failed to load therapists</p>
        <p className="text-xs text-gray-400">{therapistListError}</p>
        <button onClick={fetchTherapistList} className="px-4 py-2 bg-[#E8890C] text-white text-xs font-semibold rounded-full hover:opacity-90 transition">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Top bar ── */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, specialization…"
            className="bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm w-72 outline-none shadow-sm focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E8890C] text-white text-sm font-semibold rounded-xl hover:bg-[#F4A832] transition shadow-sm">
          <UserPlus size={15} /> Add Therapist
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-4">
        {[
          { label: "Active Therapists", value: counts.active,    color: "text-green-600", bg: "bg-green-50"        },
          { label: "In Training",       value: counts.training,  color: "text-blue-600",  bg: "bg-blue-50"         },
          { label: "Suspended",         value: counts.suspended, color: "text-gray-500",  bg: "bg-gray-50"         },
          { label: "Total",             value: counts.all,       color: "text-[#E8890C]", bg: "bg-[#FEF3E0]"      },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-5`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter pills ── */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === f.key
                ? "bg-[#E8890C] text-white border-[#E8890C]"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === f.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Empty state ── */}
      {safeFiltered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <Briefcase size={28} className="text-gray-200" />
          <p className="text-sm text-gray-400">No {filter === "all" ? "" : filter} therapists found</p>
          {search && <p className="text-xs text-gray-400">Try a different search term</p>}
        </div>
      ) : (
        /* ── Card grid ── */
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
          {safeFiltered.map(t => (
            <TherapistCard
              key={t.id}
              t={t}
              onAction={handleAction}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* ── Detail modal ── */}
      <DetailModal
        t={viewModal}
        onClose={() => setViewModal(null)}
        onAction={handleAction}
        actionLoading={actionLoading}
      />

      {/* ── Confirm dialog ── */}
      <ConfirmDialog
        open={!!confirm}
        loading={!!actionLoading}
        danger={confirm?.type === "suspend"}
        title={
          confirm?.type === "promote"    ? "Promote to therapist?"  :
          confirm?.type === "suspend"    ? "Suspend therapist?"     :
          confirm?.type === "reactivate" ? "Reactivate therapist?"  : ""
        }
        description={
          confirm?.type === "promote"
            ? "This will create a therapist account and send them an invite email to set their password."
            : confirm?.type === "suspend"
            ? "The therapist will lose access to their account. You can reactivate them at any time."
            : "The therapist's account will be reactivated and they will regain full access."
        }
        onConfirm={runAction}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}