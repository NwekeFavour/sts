// AdminLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const PAGE_TITLES = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Overview of all activity",
  },
  "/admin/requests": {
    title: "Therapy Requests",
    subtitle: "Incoming parent & patient requests",
  },
  "/admin/cases": {
    title: "Active Cases",
    subtitle: "Currently assigned therapy cases",
  },
  "/admin/therapists": {
    title: "Therapists",
    subtitle: "Manage therapist accounts and assignments",
  },
  "/admin/forms": {
    title: "Assessment Forms",
    subtitle: "Intake forms and questionnaires",
  },
  "/admin/reports": {
    title: "Reports",
    subtitle: "Therapy and progress reports",
  },
  "/admin/notifications": {
    title: "Notifications",
    subtitle: "System and workflow alerts",
  },
  "/admin/settings": {
    title: "Settings",
    subtitle: "System configuration",
  },
};

export default function AdminLayout() {
  const loc = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const page = PAGE_TITLES[loc.pathname] || {
    title: "Admin",
    subtitle: "",
  };

  return (
    <div className="flex h-screen overflow-hidden font-body">
      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-[220px] overflow-hidden">
        <AdminTopbar
          title={page.title}
          subtitle={page.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}