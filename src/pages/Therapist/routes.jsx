// router/therapistRoutes.jsx
// Drop this into your main router setup alongside your admin routes.

import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import TherapistLayout from "./layout";
import { TherapistRoute } from "../../components/ProtectedRoute";

const TherapistDashboard = lazy(() => import("./TherapistDashboard"));
const TherapistCases     = lazy(() => import("./TherapistCases"));
const TherapistReports   = lazy(() => import("./TherapistReports"));
const TherapistSettings = lazy(() => import("./TherapistSettings"));


const Loading = () => (
  <div className="flex items-center justify-center h-48 text-sm text-gray-400">
    Loading…
  </div>
);

export const therapistRoutes = (
  <Route
    path="/therapist"
    element={
      <TherapistRoute>
        <TherapistLayout />
      </TherapistRoute>
    }
  >
    <Route index element={<Suspense fallback={<Loading />}><TherapistDashboard /></Suspense>} />
    <Route path="cases"   element={<Suspense fallback={<Loading />}><TherapistCases /></Suspense>} />
    <Route path="reports" element={<Suspense fallback={<Loading />}><TherapistReports /></Suspense>} />
    <Route path="settings" element={<Suspense fallback={<Loading />}><TherapistSettings /></Suspense>} />
  </Route>
);

// In your main router (e.g. App.jsx):
// import { therapistRoutes } from "./router/therapistRoutes";
//
// <Routes>
//   {therapistRoutes}
//   <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>…</Route>
// </Routes>