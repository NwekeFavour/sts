import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Base URL — set VITE_API_URL in your .env, e.g. http://localhost:4000/api
// ---------------------------------------------------------------------------
const API = import.meta.env.VITE_API_URL;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Attach the stored access_token to every authenticated request */
function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Unwrap a fetch response.
 * Throws a plain Error whose .message is the server's { error } string
 * so UI code can do: catch (e) => setError(e.message)
 */
async function unwrap(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
}

// Store shape
//
//  user     — { id, email, role, name, specialization } | null
//  session  — { access_token, refresh_token, expires_at } | null
//  status   — "idle" | "loading" | "error"
//  error    — string | null
//

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State 
      user: null,
      session: null,
      status: "idle",
      error: null,

      // ── Derived helpers 
      isAuthenticated: () => !!get().session?.access_token,
      isAdmin: () => get().user?.role === "admin",
      isTherapist: () => get().user?.role === "therapist",
      isPatient: () => get().user?.role === "patient",
      accessToken: () => get().session?.access_token ?? null,

      // ── Internal setter 
      _setLoading: () => set({ status: "loading", error: null }),
      _setError: (msg) => set({ status: "error", error: msg }),
      _clearError: () => set({ error: null }),

      // POST /api/auth/login
      // Returns: { user, session }
      login: async ({ email, password }) => {
        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            })
          );
          set({
            user: data.user,
            session: data.session,
            status: "idle",
            error: null,
          });
          return data;
        } catch (err) {
          get()._setError(err.message);
          throw err;
        }
      },

      register: async ({ email, full_name, password }) => {
        get()._setLoading();
        try {
            const data = await unwrap(
                await fetch(`${API}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, full_name, password }),
                })
            );
            set({
                user: data.user,
                session: data.session,
                status: "idle",
                error: null,
            });
            return data;
        } catch (err) {
            get()._setError(err.message);
            throw err;
        }
      },

      // ── logout
      // No dedicated endpoint — just clear local state
      logout: () =>
        set({ user: null, session: null, status: "idle", error: null }),

      // ── refreshToken ───
      // POST /api/auth/refresh
      // Returns: { session }
      refreshToken: async () => {
        const { session } = get();
        if (!session?.refresh_token) return;

        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: session.refresh_token }),
            })
          );
          set({ session: data.session });
          return data.session;
        } catch (err) {
          // Refresh failed — force logout
          get().logout();
          throw err;
        }
      },

      // ── forgotPassword ─
      // POST /api/auth/forgot-password
      // Returns: { message }
      forgotPassword: async ({ email }) => {
        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/forgot-password`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            })
          );
          set({ status: "idle" });
          return data;
        } catch (err) {
          get()._setError(err.message);
          throw err;
        }
      },

      // ── resetPassword ──
      // POST /api/auth/reset-password  (therapist sets password from invite link)
      // Body: { token, password }
      // Returns: { message }
      resetPassword: async ({ token, password }) => {
        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/reset-password`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, password }),
            })
          );
          set({ status: "idle" });
          return data;
        } catch (err) {
          get()._setError(err.message);
          throw err;
        }
      },

      // ── inviteTherapist  (admin only) ──────────────────────────────────────
      // POST /api/auth/invite-therapist
      // Body: { email, full_name, phone?, specialization? }
      // Returns: { message, therapist }
      inviteTherapist: async ({ email, full_name, phone, specialization }) => {
        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/invite-therapist`, {
              method: "POST",
              headers: authHeaders(get().accessToken()),
              body: JSON.stringify({ email, full_name, phone, specialization }),
            })
          );
          set({ status: "idle" });
          return data;
        } catch (err) {
          get()._setError(err.message);
          throw err;
        }
      },

      // ── resendInvite  (admin only) ─────────────────────────────────────────
      // POST /api/auth/resend-invite/:therapistId
      // Returns: { message }
      resendInvite: async (therapistId) => {
        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/resend-invite/${therapistId}`, {
              method: "POST",
              headers: authHeaders(get().accessToken()),
            })
          );
          set({ status: "idle" });
          return data;
        } catch (err) {
          get()._setError(err.message);
          throw err;
        }
      },
    }),

    // ── Persist config ────
    // Only persist user + session — status/error are transient UI state
    {
      name: "ststephens-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

export default useAuthStore;