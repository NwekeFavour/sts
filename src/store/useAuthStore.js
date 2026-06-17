import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Base URL — set VITE_API_URL in your .env, e.g. http://localhost:4000
// ---------------------------------------------------------------------------
const API = import.meta.env.VITE_API_URL;

// ---------------------------------------------------------------------------
// Security model
//  ✅ localStorage  →  access_token + refresh_token only (opaque JWT strings)
//  ✅ React state   →  user profile object (re-fetched on every page load)
//  ❌ Never stored  →  email, name, role, or any PII
// ---------------------------------------------------------------------------

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getErrorMessage(res, json) {
  if (json?.message || json?.error) return json.message || json.error;

  if (res.status >= 500) return "Server error. Please try again later.";
  if (res.status === 401) return "Please log in again.";
  if (res.status === 403) return "You don't have permission.";
  if (res.status === 404) return "Not found.";

  return "Something went wrong. Please try again.";
}


async function unwrap(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(getErrorMessage(res, json));
  }
  return json;
}

/**
 * Decode JWT payload client-side (no signature check — that's the server's job).
 * Used only to extract `sub` (userId) so we can call /me without storing userId.
 */
function decodeToken(token) {
  if (!token) return null;
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function getUserIdFromToken(token) {
  return decodeToken(token)?.sub ?? null;
}

function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──
      user: null, // lives in memory only — never persisted
      session: null, // { access_token, refresh_token, expires_at } — persisted
      status: "idle", // "idle" | "loading" | "error"
      error: null,

      // ── Derived
      isAuthenticated: () => {
        const token = get().session?.access_token;
        return !!token && !isTokenExpired(token);
      },
      isAdmin: () => get().user?.role === "admin",
      isTherapist: () => get().user?.role === "therapist",
      accessToken: () => get().session?.access_token ?? null,

      // ── Internal ───────────────────────────────────────────────────────────
      _setLoading: () => set({ status: "loading", error: null }),
      _setError: (msg) => set({ status: "error", error: msg }),
      _clearError: () => set({ status: "idle" ,error: null }),

      // Called on app mount to rehydrate user profile from the server.
      // Uses the userId decoded from the stored token — nothing extra in localStorage.
      fetchMe: async () => {
        const { session } = get();
        const token = session?.access_token;

         get()._setLoading();

        if (!token || isTokenExpired(token)) {
          // Try refresh before giving up
          try {
            await get().refreshToken();
          } catch {
            get().logout();
            return null;
          }
        }

        const userId = getUserIdFromToken(get().session?.access_token);
        if (!userId) {
          get().logout();
          return null;
        }

        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/${userId}/me`, {
              headers: authHeaders(get().accessToken()),
            }),
          );
          set({ user: data.user, status: "idle" });
          return data.user;
        } catch (err) {
          if (err.message.includes("401") || err.message.includes("403")) {
            get().logout();
          } else {
            get()._setError(err.message);
          }
          return null;
        }
      },

      // ── login ──
      // Persists ONLY the session tokens. User object stays in memory.
      login: async ({ email, password }) => {
        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            }),
          );
          set({
            session: data.session, // ← only tokens hit localStorage
            user: data.user, // ← stays in memory via React state
            status: "idle",
            error: null,
          });
          return data;
        } catch (err) {
          get()._setError(err.message);
          throw err;
        }
      },

      // ── register ───────────────────────────────────────────────────────────
      register: async ({ email, full_name, password }) => {
        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, full_name, password }),
            }),
          );
          set({
            session: data.session,
            user: data.user,
            status: "idle",
            error: null,
          });
          return data;
        } catch (err) {
          get()._setError(err.message);
          throw err;
        }
      },

      // ── logout ─
      // Wipes both memory and localStorage cleanly.
      logout: () =>
        set({ user: null, session: null, status: "idle", error: null }),

      // ── refreshToken ───────────────────────────────────────────────────────
      refreshToken: async () => {
        const { session } = get();
        if (!session?.refresh_token) throw new Error("No refresh token");

        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: session.refresh_token }),
            }),
          );
          set({ session: data.session });
          return data.session;
        } catch (err) {
          get().logout();
          throw err;
        }
      },

      // ── forgotPassword ─────────────────────────────────────────────────────
      forgotPassword: async ({ email }) => {
        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/forgot-password`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            }),
          );
          set({ status: "idle" });
          return data;
        } catch (err) {
          get()._setError(err.message);
          throw err;
        }
      },

      // ── resetPassword ──────────────────────────────────────────────────────
      resetPassword: async ({ token, password }) => {
        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/reset-password`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, password }),
            }),
          );
          set({ status: "idle" });
          return data;
        } catch (err) {
          get()._setError(err.message);
          throw err;
        }
      },

      therapistApplicationLoading: false,
      therapistApplicationError: null,

      // ── applyTherapist ──────────────────────────────────────────────────────
      applyTherapist: async (formData) => {
        set({
          therapistApplicationLoading: true,
          therapistApplicationError: null,
        });
        try {
          const data = await unwrap(
            await fetch(`${API}/api/therapist/applications`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData), // pass the whole form object as-is
            }),
          );
          set({ therapistApplicationLoading: false });
          return data;
        } catch (err) {
          set({
            therapistApplicationLoading: false,
            therapistApplicationError: err.message,
          });
          throw err;
        }
      },

      // ── inviteTherapist (admin only) ───────────────────────────────────────
      inviteTherapist: async ({ email, full_name, phone, specialization }) => {
        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/invite-therapist`, {
              method: "POST",
              headers: authHeaders(get().accessToken()),
              body: JSON.stringify({ email, full_name, phone, specialization }),
            }),
          );
          set({ status: "idle" });
          return data;
        } catch (err) {
          get()._setError(err.message);
          throw err;
        }
      },

      // ── resendInvite (admin only) ──────────────────────────────────────────
      resendInvite: async (therapistId) => {
        get()._setLoading();
        try {
          const data = await unwrap(
            await fetch(`${API}/api/auth/resend-invite/${therapistId}`, {
              method: "POST",
              headers: authHeaders(get().accessToken()),
            }),
          );
          set({ status: "idle" });
          return data;
        } catch (err) {
          get()._setError(err.message);
          throw err;
        }
      },
          logout: async () => {
  const { session } = get();
  const token = session?.access_token;
 
  // Best-effort server-side revocation — never blocks local cleanup
  if (token) {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ refresh_token: session?.refresh_token }),
      });
    } catch (err) {
      console.warn('[logout] server revocation failed, clearing local session anyway:', err.message);
    }
  }
 
  set({ user: null, session: null, status: 'idle', error: null });
},
    }),
 

    // ── Persist config ─────────────────────────────────────────────────────
    // Only session tokens are written to localStorage.
    // `user` is intentionally excluded — it is always fetched fresh via fetchMe().
    {
      name: "ststephens-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session, // access_token + refresh_token only
        // user: intentionally omitted
      }),
    },
  ),
);

export default useAuthStore;
