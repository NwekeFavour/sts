import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

/**
 * ProtectedRoute - Base route protection component
 * Redirects to /login if user is not authenticated
 */
export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const status = useAuthStore((state) => state.status);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * AdminRoute - Protects routes for admin users only
 * Redirects to /login if:
 * - User is not authenticated
 * - User is authenticated but not an admin
 */
export function AdminRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const status = useAuthStore((state) => state.status);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * TherapistRoute - Protects routes for therapist users only
 * Redirects to /login if:
 * - User is not authenticated
 * - User is authenticated but not a therapist
 */
export function TherapistRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isTherapist = useAuthStore((state) => state.isTherapist());
  const status = useAuthStore((state) => state.status);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isTherapist) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
