import { useState } from "react";
import reactLogo from "./assets/react.svg";
import heroImg from "./assets/hero.png";
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

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about-us" element={<AboutUs />} />

        {/* protected routes */}
        <Route path="/login" element={<AuthPages />} />
        <Route path="/invite/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/admin" element={<AdminLayout />}>
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
    </>
  );
}

export default App;
