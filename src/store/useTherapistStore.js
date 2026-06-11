// store/useTherapistStore.js
import { create } from "zustand";

const API = import.meta.env.VITE_API_URL;

function authHeaders() {
  try {
    const raw   = localStorage.getItem("ststephens-auth");
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
  if (!res.ok) throw new Error(json.message ?? json.error ?? `HTTP ${res.status}`);
  return json;
}

const useTherapistStore = create((set, get) => ({
  // ── cases ─────────────────────────────────────────────────────────────────
  cases:        [],
  casesLoading: false,
  casesError:   null,

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

  // optimistic status update (e.g. assigned → in-progress)
  updateCaseStatus: (caseId, status) =>
    set((s) => ({
      cases: s.cases.map((c) => c.id === caseId ? { ...c, status } : c),
    })),
}));

export default useTherapistStore;