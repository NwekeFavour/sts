// TherapistLayout.jsx
// Mount under: app router at /therapist, protected by therapist role
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import TherapistSidebar from "./sidebar";
import TherapistTopbar from "./topbar";

const PAGE_TITLES = {
  "/therapist": {
    title: "Dashboard",
    subtitle: "Your overview",
  },
  "/therapist/cases": {
    title: "My Cases",
    subtitle: "Cases assigned to you",
  },
  "/therapist/reports": {
    title: "Reports",
    subtitle: "Upload and manage therapy reports",
  },
  "/therapist/notifications": {
    title: "Notifications",
    subtitle: "Alerts and updates",
  },
  "/therapist/settings": {
    title: "Settings",
    subtitle: "Your account preferences",
  },
};

export default function TherapistLayout() {
  const loc = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const page = PAGE_TITLES[loc.pathname] || {
    title: "Therapist Portal",
    subtitle: "",
  };

  return (
    <div className="flex h-screen overflow-hidden font-body">
      <TherapistSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col lg:ml-[220px] overflow-hidden">
        <TherapistTopbar
          title={page.title}
          subtitle={page.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto scrollbar-none p-4 sm:p-6 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}