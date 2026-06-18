// pages/therapist/TherapistReports.jsx
import { useEffect, useRef, useState } from "react";
import {
  FileText, UploadCloud, Download,
  ChevronDown, X, CheckCircle, AlertCircle, Sparkles,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import useTherapistStore from "../../store/useTherapistStore";

/* ── Status pill ─────────────────────────────────────── */
const STATUS_CLS = {
  pending:  "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

function Pulse({ className }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />;
}

function ReportRowSkeleton() {
  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-3 space-y-1.5">
        <Pulse className="h-3.5 w-40" />
        <Pulse className="h-3 w-28 bg-gray-100" />
      </td>
      <td className="px-4 py-3 hidden md:table-cell space-y-1.5">
        <Pulse className="h-3.5 w-24" />
        <Pulse className="h-3 w-20 bg-gray-100" />
      </td>
      <td className="px-4 py-3">
        <Pulse className="h-5 w-16 rounded-full" />
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <Pulse className="h-3 w-20 bg-gray-100" />
      </td>
      <td className="px-4 py-3 text-right">
        <Pulse className="h-7 w-7 rounded-md ml-auto" />
      </td>
    </tr>
  );
}

function ReportsSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Pulse className="h-3 w-16 bg-gray-100" />
        <Pulse className="h-9 w-36 rounded-lg" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3"><Pulse className="h-3 w-10 bg-gray-100" /></th>
                <th className="px-4 py-3 hidden md:table-cell"><Pulse className="h-3 w-10 bg-gray-100" /></th>
                <th className="px-4 py-3"><Pulse className="h-3 w-12 bg-gray-100" /></th>
                <th className="px-4 py-3 hidden sm:table-cell"><Pulse className="h-3 w-8 bg-gray-100" /></th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <ReportRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const cls = STATUS_CLS[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}



function ReportRequirementsBadge() {
  const requirements = [
    "Therapist name, report date, and session duration",
    "Child's name and age",
    "Summary of concluded program/session",
    "Goals or objectives addressed",
    "Challenges or barriers encountered",
    "Progress and outcomes with specific examples",
    "Recommendations and next steps",
  ];

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-4 h-4 text-amber-700" />
        <h3 className="text-sm font-semibold text-amber-900">
          Report Requirements
        </h3>
      </div>

      <p className="text-xs text-amber-800 mb-3">
        Before uploading your report, ensure the attached document includes the
        following:
      </p>

      <div className="grid gap-2">
        {requirements.map((item) => (
          <div
            key={item}
            className="flex items-start gap-2 text-xs text-amber-900"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Upload modal ────────────────────────────────────── */
function UploadModal({ cases, onClose, onSuccess }) {
  const { uploadReport } = useTherapistStore();
  const fileRef = useRef();

  const [form, setForm]         = useState({ request_id: "", title: "", content: "", is_final: false });
  const [file, setFile]         = useState(null);
  const [submitting, setSubmit] = useState(false);
  const [err, setErr]           = useState(null);
  const isFinalRef = useRef(false);


  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Only show cases that are actually active — no point uploading a report
  // against a case that's already completed or still just "assigned"
  const eligibleCases = cases.filter((c) => c.status === "in_progress" || c.status === "completed");

  const selectedCase = cases.find((c) => c.id === form.request_id);
  const alreadyCompleted = selectedCase?.status === "completed";

  async function handleSubmit() {
    if (!form.request_id || !form.title.trim()) {
      setErr("Case and title are required.");
      return;
    }
    setErr(null);
    setSubmit(true);
    console.log("[UploadModal] submitting is_final:", form.is_final); // ← ADD THIS
    try {
      const result = await uploadReport({ ...form, is_final: isFinalRef.current, file });
      onSuccess(result?.requestStatus);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmit(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Upload report</h2>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <ReportRequirementsBadge />
          {/* Case */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Case <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.request_id}
                onChange={(e) => setField("request_id", e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#513424]/80"
              >
                <option value="">Select a case…</option>
                {eligibleCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.child_name} — {c.parent_name}
                    {c.status === "completed" ? " (completed)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {eligibleCases.length === 0 && (
              <p className="text-xs text-gray-400 mt-1.5">
                No active cases yet — accept a case first to upload a report.
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Initial assessment report"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={form.content}
              onChange={(e) => setField("content", e.target.value)}
              placeholder="Summary or observations…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* File */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Attachment <span className="text-gray-400">(PDF or image, max 20 MB)</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                file
                  ? "border-teal-400 bg-teal-50"
                  : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm text-teal-700">
                  <FileText className="w-4 h-4" />
                  <span className="truncate max-w-[260px]">{file.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-teal-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <UploadCloud className="w-6 h-6" />
                  <p className="text-xs">Click to browse, or drag & drop</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0] ?? null)}
            />
          </div>

          {/* ── Mark as final report toggle ── */}
          {!alreadyCompleted && (
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                form.is_final
                  ? "border-[#513424] bg-[#513424]/5"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                defaultChecked={false}
                onChange={(e) => {
                  isFinalRef.current = e.target.checked;
                  setField("is_final", e.target.checked); // keep for UI rendering only
                }}
                className="mt-0.5 w-4 h-4 rounded accent-[#513424]"
              />

              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#513424]" />
                  <span className="text-sm font-medium text-gray-900">
                    This is the final report
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Marking this final will close out the case and notify the admin
                  for review. Use this once treatment is complete.
                </p>
              </div>
            </label>
          )}

          {alreadyCompleted && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              This case is already marked completed. You can still add supplementary notes.
            </div>
          )}

          {err && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {err}
            </div>
          )}
        </div>

        {/* Footer */}
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
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
              form.is_final ? "bg-green-600 hover:bg-green-700" : "bg-[#513424] hover:bg-[#513424]/80"
            }`}
          >
            {submitting
              ? "Uploading…"
              : form.is_final
                ? "Upload & complete case"
                : "Upload report"}
          </button>
        </div>
      </div>
    </div>
  );
}


function FinalBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-purple-50 text-purple-600">
      <Sparkles size={10} /> Final
    </span>
  );
}
/* ── Main page ───────────────────────────────────────── */
export default function TherapistReports() {
  const {
    reports, reportsLoading,
    cases,   casesLoading,
    fetchReports, fetchMyCases,
    getReportDownloadUrl,
  } = useTherapistStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast]         = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    fetchReports();
    if (!cases.length) fetchMyCases();
  }, []);

  async function handleDownload(id) {
    try {
      const url = await getReportDownloadUrl(id);
      window.open(url, "_blank");
    } catch {
      showToast("Could not generate download link.", "error");
    }
  }

  function handleUploadSuccess(requestStatus) {
    setModalOpen(false);
    if (requestStatus === "completed") {
      showToast("Report uploaded — case marked completed 🎉");
    } else {
      showToast("Report uploaded successfully.");
    }
    // Refresh cases too, since status may have changed
    fetchMyCases();
  }

  const loading = reportsLoading || casesLoading;

  if (loading) return <ReportsSkeleton rows={5} />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {reports.length} report{reports.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#513424] text-white text-sm
                     font-medium rounded-lg hover:bg-[#513424]/60 transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          Upload report
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
            <FileText className="w-8 h-8" />
            <p className="text-sm">No reports yet</p>
            <button
              onClick={() => setModalOpen(true)}
              className="text-sm text-[#513424] hover:underline mt-1"
            >
              Upload your first report
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Child</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-gray-900">{r.title}</p>

                          {r.is_final && <FinalBadge />}
                        </div>
                      {r.content && (
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{r.content}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-gray-700">{r.request?.child_name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{r.request?.parent_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.file_url && (
                        <button
                          onClick={() => handleDownload(r.id)}
                          title="Download file"
                          className="p-1.5 rounded-md text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <UploadModal
          cases={cases}
          onClose={() => setModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}