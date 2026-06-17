import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div style={{
        width: "40px", height: "40px",
        border: "3px solid #e2e8f0",
        borderTop: "3px solid #6366f1",
        borderRadius: "50%",
        animation: "spin 0.75s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Pull primitive values, not function calls, to avoid new refs every render ──
function useAuth() {
  const status      = useAuthStore((s) => s.status);
  const session     = useAuthStore((s) => s.session);
  const role        = useAuthStore((s) => s.user?.role ?? s.session?.user?.user_metadata?.role ?? null);

  const isAuthenticated = !!session;
  const isAdmin         = isAuthenticated && role === "admin";
  const isTherapist     = isAuthenticated && role === "therapist";

  return { status, isAuthenticated, isAdmin, isTherapist };
}

// ── ProtectedRoute ─────────────────────────────────────────────────────────────
export function ProtectedRoute({ children }) {
  const { status, isAuthenticated } = useAuth();
  if (status === "loading") return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ── AdminRoute ─────────────────────────────────────────────────────────────────
export function AdminRoute({ children }) {
  const { status, isAuthenticated, isAdmin } = useAuth();
  if (status === "loading") return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin)          return <Navigate to="/login" replace />;
  return children;
}

// ── GuestRoute ─────────────────────────────────────────────────────────────────
// Unauthenticated  → show children (login page)
// Admin            → /admin
// Therapist        → /therapist
export function GuestRoute({ children }) {
  const { status, isAuthenticated, isAdmin, isTherapist } = useAuth();
  if (status === "loading") return <Spinner />;
  if (!isAuthenticated)  return children;
  if (isAdmin)           return <Navigate to="/admin" replace />;
  if (isTherapist)       return <Navigate to="/therapist" replace />;
  return children; // authenticated but unknown role — just show login
}

// ── TherapistRoute ─────────────────────────────────────────────────────────────
export function TherapistRoute({ children }) {
  const { status, isAuthenticated, isTherapist } = useAuth();
  if (status === "loading") return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isTherapist)     return <Navigate to="/login" replace />;
  return children;
}