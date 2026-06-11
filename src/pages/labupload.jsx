// pages/LabUploadPage.jsx
// Public page — no auth required.
// Route: /lab-upload/:token
// The token encodes the form ID; backend validates it and returns context.

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_MB  = 20;

export default function LabUploadPage() {
  const { token } = useParams();

  const [context, setContext]   = useState(null);   // { childName, parentName, formId }
  const [loading, setLoading]   = useState(true);
  const [invalid, setInvalid]   = useState(false);

  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState(null);

  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [done, setDone]             = useState(false);

  const inputRef = useRef(null);

  // ── 1. Validate token and fetch context ──────────────────────────────
  useEffect(() => {
    if (!token) { setInvalid(true); setLoading(false); return; }
    fetch(`${API}/api/forms/lab-upload/validate/${token}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => { setContext(d); setLoading(false); })
      .catch(() => { setInvalid(true); setLoading(false); });
  }, [token]);

  // ── 2. File handling ─────────────────────────────────────────────────
  const handleFile = useCallback((f) => {
    setFileError(null);
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setFileError("Please upload a PDF or image (JPG, PNG, WebP).");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setFileError(`File is too large — max ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }, []);

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  // ── 3. Upload ─────────────────────────────────────────────────────────
  async function handleUpload() {
    if (!file || !context) return;
    setUploading(true); setUploadError(null); setProgress(0);

    const ticker = setInterval(
      () => setProgress((p) => Math.min(p + 8, 85)), 350
    );

    try {
      const body = new FormData();
      body.append("file",  file, file.name);
      body.append("token", token);

      const res  = await fetch(`${API}/api/forms/lab-upload/submit`, { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || json.error || "Upload failed.");

      clearInterval(ticker);
      setProgress(100);
      setDone(true);
    } catch (err) {
      clearInterval(ticker);
      setUploadError(err.message || "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  // ── render states ─────────────────────────────────────────────────────
  if (loading) return <Shell><Spinner /></Shell>;

  if (invalid) return (
    <Shell>
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🔗</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Link not valid</h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
          This upload link has expired or is invalid. Please contact the St. Stephen's team for a new link.
        </p>
      </div>
    </Shell>
  );

  if (done) return (
    <Shell>
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Upload received!</h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
          Thank you, <strong>{context?.parentName}</strong>. Your lab results have been securely
          received and will be reviewed before {context?.childName}'s session.
        </p>
        <p className="text-xs text-gray-400 mt-6">You can now close this page.</p>
      </div>
    </Shell>
  );

  return (
    <Shell>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#FEF3E0] flex items-center justify-center mx-auto mb-4 text-2xl">🧪</div>
        <h1 className="text-xl font-bold text-gray-900">Lab Results Upload</h1>
        <p className="text-sm text-gray-500 mt-1">
          For <strong>{context?.childName}</strong> — {context?.parentName}
        </p>
      </div>

      {/* Admin advice block */}
      {context?.advice && (
        <div className="bg-[#FEF3E0] border border-[#F4C47A] rounded-2xl p-4 mb-6">
          <p className="text-[10px] font-bold text-[#E8890C] uppercase tracking-wider mb-2">
            Note from St. Stephen's
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{context.advice}</p>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer mb-3 ${
          fileError  ? "border-red-400 bg-red-50" :
          dragging   ? "border-gray-800 bg-gray-50" :
          file       ? "border-gray-800 bg-gray-50" :
          "border-gray-200 bg-gray-50 hover:border-[#E8890C]/50"
        } ${file ? "p-3" : "p-8 text-center"}`}
      >
        {file ? (
          <div className="flex items-center gap-3">
            {preview ? (
              <img src={preview} alt="preview" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#FEF3E0] flex items-center justify-center flex-shrink-0 text-2xl">📄</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!uploading && (
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="text-3xl mb-3">📎</div>
            <p className="font-semibold text-gray-700">{dragging ? "Drop it here" : "Tap or drag your file here"}</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, or WebP · Max {MAX_MB} MB</p>
          </>
        )}
        <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>

      {fileError && (
        <div className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2.5 mb-3">{fileError}</div>
      )}

      {/* Progress */}
      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Uploading…</span><span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#E8890C] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {uploadError && (
        <div className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2.5 mb-3">{uploadError}</div>
      )}

      <button onClick={handleUpload} disabled={!file || uploading}
        className={`w-full py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
          file && !uploading
            ? "bg-[#E8890C] text-white hover:bg-[#F4A832]"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}>
        {uploading ? <Spinner small /> : "📤"} {uploading ? "Uploading…" : "Upload Lab Results"}
      </button>

      <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
        Your file is encrypted in transit and stored securely. Only the assigned therapist and admin can access it.
      </p>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Brand bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#E8890C] flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-semibold text-gray-800 text-sm">St. Stephen's Family</span>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function Spinner({ small }) {
  return (
    <svg className={`animate-spin ${small ? "w-4 h-4" : "w-6 h-6 mx-auto"} text-[#E8890C]`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
    </svg>
  );
}