// store/adminStore.js
import { create } from "zustand";
import useAuthStore from "./useAuthStore";

const API = import.meta.env.VITE_API_URL;

function authHeaders() {
  // Pull token directly from persisted auth store in localStorage
  try {
    const raw = localStorage.getItem("ststephens-auth");
    const token = raw ? JSON.parse(raw)?.state?.session?.access_token : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  } catch {
    return { "Content-Type": "application/json" };
  }
}

async function unwrap(res) {
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      json.message ||
      json.error ||
      `HTTP ${res.status}`
    );
  }

  return json;
}

async function patchStatus(id, status, reason = null) {
  return unwrap(
    await fetch(`${API}/api/admin/therapist-application/applications/${id}/${status}`, {
      method: "PATCH",
      headers: authHeaders(),
      ...(reason ? { body: JSON.stringify({ reason }) } : {}),
    })
  );
}

export const useAdminStore = create((set, get) => ({
  // ── Raw lists (used by sidebar counts) ──────────────────────────────────────
  requests:   [],
  therapists: [],
  reports:    [],
  forms:      [],

  // ── Dashboard-specific state ─────────────────────────────────────────────────
  dashboardStats: {
    pendingRequests: 0,
    totalRequests:   0,
    totalCases:      0,
    activeTherapists:0,
    pendingReports:  0,
    pendingForms:    0,
  },
  recentRequests: [],
  activityFeed:   [],
  dashboardLoading: false,
  dashboardError:   null,

  // ── fetchDashboard ───────────────────────────────────────────────────────────
  // Calls GET /api/admin/dashboard — single request for everything the dashboard needs.
  fetchDashboard: async () => {
    set({ dashboardLoading: true, dashboardError: null });
    try {
      const data = await unwrap(
        await fetch(`${API}/api/admin/dashboard`, { headers: authHeaders() })
      );

      set({
        dashboardStats:  data.stats,
        recentRequests:  data.recentRequests,
        activityFeed:    data.activity,
        // Also hydrate the raw lists so sidebar counts stay accurate
        therapists:      data.therapists,
        dashboardLoading: false,
      });
    } catch (err) {
      set({ dashboardError: err.message, dashboardLoading: false });
    }
  },

  // ── fetchRequests ────────────────────────────────────────────────────────────
  fetchRequests: async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      const data = await unwrap(
        await fetch(`${API}/api/admin/requests?${qs}`, { headers: authHeaders() })
      );
      set({ requests: data.requests });
      return data;
    } catch (err) {
      console.error("[fetchRequests]", err);
    }
  },

  // ── assignTherapist ──────────────────────────────────────────────────────────
  assignTherapist: async (requestId, therapistId) => {
    const data = await unwrap(
      await fetch(`${API}/api/admin/requests/${requestId}/assign`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ therapist_id: therapistId }),
      })
    );
    // Update local request status
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId ? { ...r, status: "assigned", therapist_id: therapistId } : r
      ),
    }));
    return data;
  },

  // ── fetchTherapists ──────────────────────────────────────────────────────────
  fetchTherapists: async () => {
    try {
      const data = await unwrap(
        await fetch(`${API}/api/admin/therapists`, { headers: authHeaders() })
      );
      set({ therapists: data.therapists });
      return data;
    } catch (err) {
      console.error("[fetchTherapists]", err);
    }
  },

  // ── fetchReports ─────────────────────────────────────────────────────────────
  fetchReports: async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      const data = await unwrap(
        await fetch(`${API}/api/admin/reports?${qs}`, { headers: authHeaders() })
      );
      set({ reports: data.reports });
      return data;
    } catch (err) {
      console.error("[fetchReports]", err);
    }
  },

  // ── reviewReport ─────────────────────────────────────────────────────────────
  reviewReport: async (reportId) => {
    const data = await unwrap(
      await fetch(`${API}/api/admin/reports/${reportId}/review`, {
        method: "PATCH",
        headers: authHeaders(),
      })
    );
    set((s) => ({
      reports: s.reports.map((r) =>
        r.id === reportId ? { ...r, status: "reviewed" } : r
      ),
    }));
    return data;
  },

  // ── fetchForms 
  fetchForms: async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      const data = await unwrap(
        await fetch(`${API}/api/admin/forms?${qs}`, { headers: authHeaders() })
      );
      set({ forms: data.forms });
      return data;
    } catch (err) {
      console.error("[fetchForms]", err);
    }
  },
 applications: [],
  applicationsLoading: false,
  applicationsError: null,
 
  // GET /api/therapist/applications
  fetchApplications: async () => {
    set({ applicationsLoading: true, applicationsError: null });
    try {
      const data = await unwrap(
        await fetch(`${API}/api/admin/therapist-application/applications`, { headers: authHeaders() })
      );
      set({ applications: data.data ?? [], applicationsLoading: false });
    } catch (err) {
      set({ applicationsError: err.message, applicationsLoading: false });
    }
  },

    // GET /api/therapist/all
  fetchTherapistList: async () => {
    set({ therapistListLoading: true, therapistListError: null });
    try {
      const data = await unwrap(
        await fetch(`${API}/api/admin/therapist-application/all`, { headers: authHeaders() })
      );
      set({ therapistList: data.data ?? [], therapistListLoading: false });
    } catch (err) {
      set({ therapistListError: err.message, therapistListLoading: false });
    }
  },
 
 
  // PATCH /api/therapist/applications/:id/approved
  approveApplication: async (id, reason) => {
    const data = await patchStatus(id, "approved", reason || null);
    set((s) => ({
      applications: s.applications.map((a) =>
        a.id === id ? { ...a, status: "approved" } : a
      ),
    }));
    return data;
  },

    promoteToTherapist: async (id) => {
    const data = await unwrap(
      await fetch(`${API}/api/admin/therapist-application/applications/${id}/promote`, {
        method: "POST",
        headers: authHeaders(),
      })
    );
    // Move the row from "training/application" to "active/profile" optimistically
    set(s => ({
      therapistList: s.therapistList.map(t =>
        t.id === id
          ? { ...t, status: "active", source: "profile", application_status: "approved" }
          : t
      ),
    }));
    return data;
  },
 
 
  // PATCH /api/therapist/applications/:id/rejected
  rejectApplication: async (id, rejectReason) => {
    const data = await patchStatus(id, "rejected", rejectReason || null);
    set((s) => ({
      applications: s.applications.map((a) =>
        a.id === id ? { ...a, status: "rejected" } : a
      ),
    }));
    return data;
  },
    // PATCH /api/therapist/profile/:id/:status
  updateTherapistStatus: async (id, status) => {
    const data = await patchStatus(`/api/admin/therapist-application/profile/${id}/${status}`);
    set(s => ({
      therapistList: s.therapistList.map(t => t.id === id ? { ...t, status } : t),
    }));
    return data;
  },
 
  // PATCH /api/therapist/applications/:id/pending
  resetApplication: async (id, reason) => {
    const data = await patchStatus(id, "pending", reason || null);
    set((s) => ({
      applications: s.applications.map((a) =>
        a.id === id ? { ...a, status: "pending" } : a
      ),
    }));
    return data;
  },
 
  // DELETE /api/therapist/applications/:id
  deleteApplication: async (id) => {
    await unwrap(
      await fetch(`${API}/api/admin/therapist-application/applications/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      })
    );
    set((s) => ({
      applications: s.applications.filter((a) => a.id !== id),
    }));
  },
 
}));

