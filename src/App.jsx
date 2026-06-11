import { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Services from "./pages/services";
import AuthPages from "./pages/auth";
import AboutUs from "./pages/about";
import AdminLayout from "./pages/admin/components/AdminLayout";
import AdminDashboard from "./pages/admin/pages/AdminDashboard";
import AdminRequests from "./pages/admin/pages/AdminRequests";
import AdminCases from "./pages/admin/pages/AdminCases";
import AdminTherapists from "./pages/admin/pages/AdminTherapists";
import AdminReports from "./pages/admin/pages/AdminReports";
import AdminForms from "./pages/admin/pages/AdminForms";
import { AdminNotifications, AdminSettings } from "./pages/admin/pages/AdminMisc";
import NotFound from "./pages/not-found";
import StStephensChatbot from "./pages/chat";
import ResetPassword from "./pages/resetP";
import ForgotPassword from "./pages/fpassword";
import OurProcess from "./pages/process";
import PaymentPage from "./pages/uploadReciept";
import ApplyTherapist from "./pages/applyTherapist";
import { Toaster } from "react-hot-toast";
import { AdminRoute, GuestRoute } from "./components/ProtectedRoute";
import LabUploadPage from "./pages/labupload";
import useAuthStore from "./store/useAuthStore";

function App() {
     const fetchMe = useAuthStore((state) => state.fetchMe);
  const session = useAuthStore((state) => state.session);
  const setLoading = useAuthStore((state) => state._setLoading);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (session) {
        setLoading(); // ← set loading BEFORE routes render
        await fetchMe();
      }
      setReady(true);
    };
    init();
  }, []);

  if (!ready) return <div>Loading...</div>;

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/how-it-works" element={<OurProcess />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/apply-therapist" element={<ApplyTherapist />} />
        {/* protected routes */}
        <Route 
  path="/login" 
  element={
    <GuestRoute>
      <AuthPages />
    </GuestRoute>
  } 
/>
        <Route path="/invite/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/lab-upload/:token" element={<LabUploadPage/>}/>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="cases" element={<AdminCases />} />
          <Route path="therapists" element={<AdminTherapists />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>


        <Route path="*" element={<NotFound />} />
        <Route path="/new" element={<StStephensChatbot/>}/>
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "8px",
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </>
  );
}

export default App;
