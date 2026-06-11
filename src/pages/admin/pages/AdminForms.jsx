import { useState, useEffect } from "react";
import { useAdminStore } from "../../../store/adminStore";
import {
  Search,
  Send,
  Plus,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  X,
  ChevronDown,
  Eye,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const TYPE_BADGE = {
  intake: "bg-[#FEF3E0] text-[#E8890C]",
  behaviour: "bg-purple-100 text-purple-700",
  medical: "bg-blue-100 text-blue-700",
};
const STATUS_BADGE = {
  submitted: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  reviewed: "bg-gray-100 text-gray-600",
};
const TABS = ["All", "Pending", "Submitted", "Reviewed"];

// ── SendFormModal ─────────────────────────────────────────────────────────
function SendFormModal({ onClose }) {
  const { requests, fetchRequests, sendForm, sendFormLoading, sendFormError, clearSendFormError } =
    useAdminStore();

  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [advice, setAdvice] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sent, setSent] = useState(false);


  useEffect(() => {
  if (!sendFormError) return;

  const timer = setTimeout(() => {
    clearSendFormError();
  }, 5000);

  return () => clearTimeout(timer);
}, [sendFormError, clearSendFormError]);
  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(
    (r) =>
      !requestSearch ||
      r.parent_name?.toLowerCase().includes(requestSearch.toLowerCase()) ||
      r.child_name?.toLowerCase().includes(requestSearch.toLowerCase()),
  );

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);
  const canSend = selectedRequestId && advice.trim().length > 10;

  async function handleSend() {
    try {
      await useAdminStore.getState().sendForm({
        requestId: selectedRequestId,
        advice,
        parentEmail: selectedRequest?.parent_email,
        parentName: selectedRequest?.parent_name,
        childName: selectedRequest?.child_name,
      });
      setSent(true);
    } catch (e) {
      // error surfaced via store
    }
  }

  if (sent) {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 text-2xl">
            ✅
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">Form sent!</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            An email with your advice and a lab upload link has been sent to{" "}
            <strong>{selectedRequest?.parent_name}</strong>.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-8 py-2.5 bg-[#E8890C] text-white rounded-xl text-sm font-semibold hover:bg-[#F4A832]"
          >
            Done
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      onClose={onClose}
      title="Send Assessment Form"
      sub="Select a patient and enter your advice"
    >
      {/* ── 1. Patient picker ── */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          Patient / Request
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left outline-none hover:border-[#E8890C] transition-colors"
          >
            {selectedRequest ? (
              <span className="font-medium text-gray-800">
                {selectedRequest.parent_name} —{" "}
                <span className="text-gray-500">
                  {selectedRequest.child_name}
                </span>
              </span>
            ) : (
              <span className="text-gray-400">
                Search and select a patient…
              </span>
            )}
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <input
                  autoFocus
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  placeholder="Search by parent or child name…"
                  className="w-full bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none border border-gray-200 focus:border-[#E8890C]"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredRequests.length === 0 ? (
                  <div className="text-center text-xs text-gray-400 py-6">
                    No requests found
                  </div>
                ) : (
                  filteredRequests.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRequestId(r.id);
                        setDropdownOpen(false);
                        setRequestSearch("");
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center justify-between gap-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {r.parent_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Child: {r.child_name} · {r.location || "No location"}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[r.status] || "bg-gray-100 text-gray-500"}`}
                      >
                        {r.status}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Admin advice ── */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          Your Advice / Assessment Notes
        </label>
        <textarea
          value={advice}
          onChange={(e) => setAdvice(e.target.value)}
          rows={5}
          placeholder={`e.g. Based on the information provided, I recommend running a full blood count and vitamin D panel before the first session. The behavioural patterns described suggest we should also rule out iron deficiency.\n\nPlease use the link below to upload any lab results at your convenience.`}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C] leading-relaxed"
        />
        <p className="text-[11px] text-gray-400 mt-1.5">
          A secure lab upload link will be automatically appended to the email
          regardless of whether you recommend tests.
        </p>
      </div>

      {/* ── selected patient summary ── */}
      {selectedRequest && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600 space-y-1">
          <p>
            <span className="font-semibold">Parent:</span>{" "}
            {selectedRequest.parent_name}
          </p>
          <p>
            <span className="font-semibold">Child:</span>{" "}
            {selectedRequest.child_name}, age {selectedRequest.child_age ?? "—"}
          </p>
          {selectedRequest.notes && (
            <p className="line-clamp-2 text-gray-400 mt-1 italic">
              "{selectedRequest.notes}"
            </p>
          )}
        </div>
      )}

      {sendFormError && (
        <div className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
          {sendFormError}
        </div>
      )}

      {/* ── actions ── */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSend}
          disabled={!canSend || sendFormLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${
            canSend && !sendFormLoading
              ? "bg-[#E8890C] hover:bg-[#F4A832]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {sendFormLoading ? (
            <svg
              className="animate-spin w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="31.4"
                strokeDashoffset="10"
              />
            </svg>
          ) : (
            <Send size={14} />
          )}
          {sendFormLoading ? "Sending…" : "Send Form"}
        </button>
      </div>
    </ModalShell>
  );
}

// ── ModalShell (reusable wrapper) ─────────────────────────────────────────
function ModalShell({ children, onClose, title, sub }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900">{title}</h3>
              {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-6 space-y-5">{children}</div>
      </div>
    </div>
  );
}

async function handleViewFile() {
  const { url } = await useAdminStore.getState().getFormDownloadUrl(form.id);
  window.open(url, "_blank");
}

// ── ViewResponseModal ─────────────────────────────────────────────────────
function ViewResponseModal({ form, onClose }) {

    async function handleViewFile() {
    const { url } = await useAdminStore.getState().getFormDownloadUrl(form.id);
    window.open(url, "_blank");
  }
  return (
    <ModalShell
      onClose={onClose}
      title="Form Response"
      sub={`Submitted by ${form.parent_name || "parent"}`}
    >
      <div className="space-y-4 text-sm text-gray-700">
        {form.data &&
  Object.entries(form.data)
    .filter(([k]) => !['upload_token', 'parent_email'].includes(k))
    .map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {k.replace(/_/g, " ")}
              </p>
              <p className="bg-gray-50 rounded-xl px-4 py-2.5">{String(v)}</p>
            </div>
          ))}
        {form.file_url && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Lab Upload
            </p>
            <button
              onClick={handleViewFile}
              className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-2.5 font-semibold hover:bg-green-100 transition-colors"
            >
              <Eye size={14} /> View uploaded file
            </button>
          </div>
        )}
        {!form.data && !form.file_url && (
          <p className="text-gray-400 text-center py-6">
            No response data available yet.
          </p>
        )}
      </div>
    </ModalShell>
  );
}

// ── Main AdminForms ───────────────────────────────────────────────────────
export default function AdminForms() {
  const {
    forms,
    fetchForms,
    formsLoading,
    resendForm,
    deleteForm,
    resendLoading,
    deleteLoading,
    error,
  } = useAdminStore();
  const [confirmModal, setConfirmModal] = useState(null);

  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [sendModal, setSendModal] = useState(false);
  const [viewForm, setViewForm] = useState(null);


    function handleView(form) {
    setViewForm(form);
  }
  useEffect(() => {
    fetchForms();
  }, []);

  const filtered = forms.filter((f) => {
    const matchTab = tab === "All" || f.status === tab.toLowerCase();
    const matchSearch =
      !search ||
      f.title?.toLowerCase().includes(search.toLowerCase()) ||
      f.parent_name?.toLowerCase().includes(search.toLowerCase()) ||
      f.child_name?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = [
    {
      label: "Total Sent",
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
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid lg:grid-cols-3 gap-4">
        {stats.map((s) => (
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

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-gray-50 gap-4">
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search forms…"
                className="w-full sm:w-56 bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C]"
              />
            </div>
            <button
              onClick={() => setSendModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#E8890C] text-white text-xs font-semibold rounded-xl hover:bg-[#F4A832] transition-all whitespace-nowrap"
            >
              <Plus size={13} /> Send Form
            </button>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="block lg:hidden divide-y divide-gray-100">
          {filtered.map((f) => (
            <div key={f.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {f.title}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono">{f.id}</p>
                </div>
                <span
                  className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[f.status]}`}
                >
                  {f.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Sent</p>
                  <p className="text-gray-600">
                    {f.sent_at ? new Date(f.sent_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Patient</p>
                  <p className="text-gray-700">{f.parent_name || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Email</p>
                  <p className="text-gray-700 wrap-break-word">{f.parent_email || f?.data?.parent_email || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Submitted</p>
                  <p className="text-gray-600">
                    {f.submitted_at
                      ? new Date(f.submitted_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
              <FormAction
                form={f}
                onView={() => handleView(f)}
                onResend={(form) =>
                  setConfirmModal({
                    type: "resend",
                    form,
                  })
                }
                onDelete={(form) =>
                  setConfirmModal({
                    type: "delete",
                    form,
                  })
                }
                resendLoading={resendLoading}
                deleteLoading={deleteLoading}
                error={error}
              />
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/60">
                {["Patient", "Email", "Sent", "Submitted", "Status", ""].map((h) => (
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
              {filtered.map((f, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                    {f.parent_name || "—"}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                    {f.parent_email || f?.data?.parent_email || "-"}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {f.sent_at ? new Date(f.sent_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {f.submitted_at
                      ? new Date(f.submitted_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap"> 
                    <span
                      className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[f.status]}`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <FormAction
                      form={f}
                      onView={() => handleView(f)}
                      onResend={(form) =>
                        setConfirmModal({
                          type: "resend",
                          form,
                        })
                      }
                      onDelete={(form) =>
                        setConfirmModal({
                          type: "delete",
                          form,
                        })
                      }
                      resendLoading={resendLoading}
                      deleteLoading={deleteLoading}
                      error={error}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !formsLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No forms match this filter.
          </div>
        )}
      </div>

      {sendModal && <SendFormModal onClose={() => setSendModal(false)} />}
      {viewForm && (
        <ViewResponseModal form={viewForm} onClose={() => setViewForm(null)} />
      )}

      {confirmModal && (
        <ConfirmModal
          open={!!confirmModal}
          title={
            confirmModal?.type === "resend" ? "Resend Form?" : "Delete Form?"
          }
          message={
            confirmModal?.type === "resend"
              ? "Are you sure you want to resend this form to the parent? A new upload link will be generated and emailed."
              : "Are you sure you want to permanently delete this form? This action cannot be undone."
          }
          confirmText={confirmModal?.type === "resend" ? "Resend" : "Delete"}
          onClose={() => setConfirmModal(null)}
          resendLoading={resendLoading}
          deleteLoading={deleteLoading}
          onConfirm={async () => {
            const id = confirmModal.form.id;

            if (confirmModal.type === "resend") {
              const result = await resendForm(id);
              result.success
                ? toast.success(result.message)
                : toast.error(result.message);
            } else {
              const result = await deleteForm(id);
              result.success
                ? toast.success(result.message)
                : toast.error(result.message);

              if (result.success) fetchForms();
            }

            setConfirmModal(null);
          }}
        />
      )}
    </div>
  );
}

function FormAction({ form, onView, onResend, onDelete, resendLoading, deleteLoading, error }) {
  if (form.status === "pending") {
    return (
      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onResend(form)}
          disabled={resendLoading}
        >
          <Send size={11} />
          {resendLoading ? "Re-sending email…" : "Send again"}
        </button>

        <button
          className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onDelete(form)}
          disabled={deleteLoading}
        >
          <Trash2 size={11} />
          {deleteLoading ? "Deleting record…" : "Remove"}
        </button>
      </div>
    );
  }

  if (form.status === "submitted" || form.status === "reviewed") {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={onView}
          className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline"
        >
          <Eye size={11} />
          View response
        </button>

        <button
          className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
          onClick={() => onDelete(form)}
        >
          <Trash2 size={11} />
          Delete
        </button>
      </div>
    );
  }

  return null;
}

function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  onConfirm,
  onClose,
  deleteLoading,
  resendLoading
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl p-6 animate-in fade-in zoom-in duration-150">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        <p className="mt-2 text-sm text-gray-500">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
