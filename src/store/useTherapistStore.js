// store/useTherapistStore.js
import { create } from "zustand";

const API = import.meta.env.VITE_API_URL;

function authHeaders(isMultipart = false) {
  try {
    const raw   = localStorage.getItem("ststephens-auth");
    const token = raw ? JSON.parse(raw)?.state?.session?.access_token : null;
    return {
      // omit Content-Type for multipart so browser sets boundary automatically
      ...(isMultipart ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  } catch {
    return isMultipart ? {} : { "Content-Type": "application/json" };
  }
}

async function unwrap(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message ?? json.error ?? `HTTP ${res.status}`);
  return json;
}

const useTherapistStore = create((set, get) => ({

  // ── cases ──────────────────────────────────────────────────────────────────
  cases:        [],
  casesLoading: false,
  casesError:   null,
    profile:        null,
  profileLoading: false,
  profileError:   null,
  saving:         false,
  saveError:      null,
  saveSuccess:    false,
 


  

  fetchMyCases: async (params = {}) => {
    set({ casesLoading: true, casesError: null });
    try {
      const qs   = new URLSearchParams(params).toString();
      const data = await unwrap(
        await fetch(`${API}/api/requests/my-cases${qs ? `?${qs}` : ""}`, {
          headers: authHeaders(),
        })
      );
      set({ cases: data.data ?? [], casesLoading: false });
      return data;
    } catch (err) {
      set({ casesError: err.message, casesLoading: false });
    }
  },

  // optimistic status update
  updateCaseStatus: (caseId, status) =>
    set((s) => ({
      cases: s.cases.map((c) => (c.id === caseId ? { ...c, status } : c)),
    })),

  // ── reports ────────────────────────────────────────────────────────────────
  reports:        [],
  reportsLoading: false,
  reportsError:   null,


 
acceptCase: async (caseId) => {
  set({ casesLoading: true, casesError: null });
  try {
    const data = await unwrap(
      await fetch(`${API}/api/therapist/cases/${caseId}/accept`, {
        method:  'PATCH',
        headers: authHeaders(),
      })
    );
    set((s) => ({
      casesLoading: false,
      casesError:   null,
      cases: s.cases.map((c) =>
        c.id === caseId ? { ...c, status: 'in_progress' } : c  // ✅ underscore
      ),
    }));
    return data;
  } catch (err) {
    set({ casesLoading: false, casesError: err.message });
    throw err;
  }
},
 
 
  fetchReports: async () => {
    set({ reportsLoading: true, reportsError: null });
    try {
      const data = await unwrap(
        await fetch(`${API}/api/therapist/reports`, {
          headers: authHeaders(),
        })
      );
      set({ reports: data.reports ?? [], reportsLoading: false });
      return data;
    } catch (err) {
      set({ reportsError: err.message, reportsLoading: false });
    }
  },

  uploadReport: async ({ request_id, title, content, file, is_final }) => {
    const fd = new FormData();
    fd.append("request_id", request_id);
    fd.append("title", title.trim());
    fd.append("is_final", is_final ? "true" : "false");   // ← was missing entirely
    if (content?.trim()) fd.append("content", content.trim());
    if (file) fd.append("file", file);
  
    const data = await unwrap(
      await fetch(`${API}/api/therapist/reports`, {
        method:  "POST",
        headers: authHeaders(true), // multipart — no Content-Type override
        body:    fd,
      })
    );
  
    // prepend the new report + sync case status if it changed
    set((s) => ({
      reports: [data.report, ...s.reports],
      cases: s.cases.map((c) =>
        c.id === request_id ? { ...c, status: data.requestStatus ?? c.status } : c
      ),
    }));
  
    // Return the full payload so the UI can read requestStatus,
    // not just data.report — this is what TherapistReports.jsx expects
    return data;
  },
 
  getReportDownloadUrl: async (reportId) => {
    const data = await unwrap(
      await fetch(`${API}/api/therapist/reports/${reportId}/download`, {
        headers: authHeaders(),
      })
    );
    return data.url;
  },


  //settings

   fetchProfile: async () => {
    set({ profileLoading: true, profileError: null });
    try {
      const data = await unwrap(
        await fetch(`${API}/api/therapist/settings`, { headers: authHeaders() })
      );
      set({ profile: data.profile, profileLoading: false });
    } catch (err) {
      set({ profileError: err.message, profileLoading: false });
    }
  },
 
  updateProfile: async (fields) => {
    set({ saving: true, saveError: null, saveSuccess: false });
    try {
      const data = await unwrap(
        await fetch(`${API}/api/therapist/settings`, {
          method:  "PATCH",
          headers: authHeaders(),
          body:    JSON.stringify(fields),
        })
      );
      set({ profile: data.profile, saving: false, saveSuccess: true });
      setTimeout(() => set({ saveSuccess: false }), 3000);
      return data.profile;
    } catch (err) {
      set({ saveError: err.message, saving: false });
      throw err;
    }
  },
 
  changePassword: async ({ currentPassword, newPassword }) => {
    set({ saving: true, saveError: null, saveSuccess: false });
    try {
      await unwrap(
        await fetch(`${API}/api/therapist/settings/password`, {
          method:  "POST",
          headers: authHeaders(),
          body:    JSON.stringify({ currentPassword, newPassword }),
        })
      );
      set({ saving: false, saveSuccess: true });
      setTimeout(() => set({ saveSuccess: false }), 3000);
    } catch (err) {
      set({ saveError: err.message, saving: false });
      throw err;
    }
  },
}));

export default useTherapistStore;