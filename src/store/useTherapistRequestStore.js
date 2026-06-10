// stores/useTherapistRequestStore.js
import { create } from "zustand";

const API = import.meta.env.VITE_API_URL;

// ── mirrors the pattern in adminStore.js ─────────────────────────────────
function authHeaders() {
  try {
    const raw = localStorage.getItem("ststephens-auth");
    const token = raw ? JSON.parse(raw)?.state?.session?.access_token : null;
    return {
      // NOTE: do NOT set Content-Type here — fetch sets it automatically
      // for FormData (multipart). We override per-call below.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  } catch {
    return {};
  }
}

async function unwrap(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message ?? json.error ?? `HTTP ${res.status}`);
  return json;
}

// ── video validation helpers ──────────────────────────────────────────────
const MAX_DURATION_SEC = 300;               // 5 min
const MAX_FILE_BYTES   = 200 * 1024 * 1024; // 200 MB
const ALLOWED_TYPES    = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];

function getVideoDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v   = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(v.duration); };
    v.onerror          = () => resolve(null);
    v.src = url;
  });
}

// ── empty form shape ──────────────────────────────────────────────────────
const EMPTY_FORM = {
  parentName:  "",
  parentEmail: "",
  parentPhone: "",
  childName:   "",
  childGender: "",
  childAge:    "",
  location:    "",
  behaviours:  "",
  duration:    "",
  history:     "",
  extra:       "",
  videoFile:   null,
};

// ─────────────────────────────────────────────────────────────────────────
const useTherapistRequestStore = create((set, get) => ({

  // ── ui ────────────────────────────────────────────────────────────────
  isOpen:      false,
  step:        1,          // 1 | 2 | 3
  requestSent: false,
  submittedId: null,

  // ── form ──────────────────────────────────────────────────────────────
  form: { ...EMPTY_FORM },

  // ── async ─────────────────────────────────────────────────────────────
  uploading:      false,
  uploadProgress: 0,
  videoError:     null,
  submitError:    null,

  // ── modal lifecycle ───────────────────────────────────────────────────
  openModal: () => set({ isOpen: true, step: 1, requestSent: false }),

  closeModal: () => {
    if (get().uploading) return; // block close mid-upload
    get().reset();
    set({ isOpen: false });
  },

  // ── form helpers ──────────────────────────────────────────────────────
  setField: (key, value) =>
    set((s) => ({ form: { ...s.form, [key]: value } })),

  setStep: (n) => set({ step: n }),

  reset: () => set({
    step: 1,
    form: { ...EMPTY_FORM },
    requestSent:    false,
    submittedId:    null,
    uploading:      false,
    uploadProgress: 0,
    videoError:     null,
    submitError:    null,
  }),

  // ── video validation ──────────────────────────────────────────────────
  setVideoFile: async (file) => {
    set({ videoError: null });

    if (!file) {
      set((s) => ({ form: { ...s.form, videoFile: null } }));
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      set({ videoError: "Please upload an MP4, MOV, or WebM video." });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      set({ videoError: "File is too large — please keep it under 200 MB." });
      return;
    }
    const dur = await getVideoDuration(file);
    if (dur && dur > MAX_DURATION_SEC) {
      const m = Math.floor(dur / 60), s = Math.round(dur % 60);
      set({ videoError: `Video is ${m}m ${s}s — must be under 5 minutes.` });
      return;
    }

    set((st) => ({ form: { ...st.form, videoFile: file } }));
  },

  // ── submit ────────────────────────────────────────────────────────────
  // Uses FormData so the video is sent as multipart — your Express backend
  // can receive it with multer (or busboy) and forward to Supabase Storage.
  //
  // POST /api/requests/submit
  //   multipart fields:  parentName, parentEmail, childName, childAge,
  //                      location, notes (concatenated), video (file)
  //   returns:           { id, status, ... }  (the new requests row)
  //
  submit: async () => {
    const { form } = get();
    set({ uploading: true, uploadProgress: 0, submitError: null });

    // Fake incremental ticks — XHR FormData upload doesn't give progress
    // through the fetch API. Replace with XMLHttpRequest if you want real %.
    const ticker = setInterval(
      () => set((s) => ({ uploadProgress: Math.min(s.uploadProgress + 6, 85) })),
      400
    );

    try {
      // Combine behavioural fields into the single `notes` column
      const notes = [
        form.behaviours && `Behaviours/challenges:\n${form.behaviours}`,
        form.duration   && `Duration: ${form.duration}`,
        form.history    && `Previous therapy/diagnosis:\n${form.history}`,
        form.extra      && `Additional notes:\n${form.extra}`,
      ].filter(Boolean).join("\n\n");

      const body = new FormData();
      body.append("parentName",  form.parentName);
      body.append("parentEmail", form.parentEmail);
      body.append("parentPhone", form.parentPhone);
      body.append("childGender", form.childGender);
      body.append("childName",   form.childName);
      body.append("childAge",    form.childAge);
      body.append("location",     form.location);
      body.append("video",        form.videoFile, form.videoFile.name);

      body.append("primaryConcerns",         form.behaviours   || "");
body.append("behaviouralChallenges",   form.behaviours   || "");
body.append("previousTherapyDetails",  form.history      || "");
body.append("additionalNotes",         form.extra        || "");
 
if (form.duration) {
  body.append("additionalNotes", [form.extra, `Duration of concern: ${form.duration}`].filter(Boolean).join("\n\n"));
}

      // authHeaders() intentionally omits Content-Type so fetch sets
      // the correct multipart boundary automatically for FormData.
      const data = await unwrap(
        await fetch(`${API}/api/requests/submit`, {
          method:  "POST",
          headers: authHeaders(),   // Authorization only, no Content-Type
          body,
        })
      );

      clearInterval(ticker);
      set({ uploadProgress: 100, requestSent: true, submittedId: data.id ?? data.request?.id });

    } catch (err) {
      clearInterval(ticker);
      console.error("[therapist-request] submit error:", err);
      set({ submitError: err.message || "Something went wrong. Please try again." });
    } finally {
      set({ uploading: false });
    }
  },
}));

export default useTherapistRequestStore;