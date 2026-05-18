// AdminSidebar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  ClipboardList,
  FileText,
  Bell,
  Settings,
  LogOut,
  ClipboardCheck,
  ExternalLink,
  X,
} from "lucide-react";

import { useAdminStore } from "../../../store/adminStore";
import { useMemo } from "react";

const NAV = [
  {
    section: "OVERVIEW",
    items: [
      {
        to: "/admin",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
    ],
  },
  {
    section: "CASE MANAGEMENT",
    items: [
      {
        to: "/admin/requests",
        icon: ClipboardList,
        label: "Requests",
        countKey: "pendingRequests",
      },
      {
        to: "/admin/cases",
        icon: Users,
        label: "Active Cases",
        countKey: "totalCases",
      },
      {
        to: "/admin/forms",
        icon: ClipboardCheck,
        label: "Forms",
        countKey: "pendingForms",
      },
    ],
  },
  {
    section: "THERAPISTS",
    items: [
      {
        to: "/admin/therapists",
        icon: UserCog,
        label: "Therapists",
        countKey: "activeTherapists",
      },
    ],
  },
  {
    section: "REPORTS",
    items: [
      {
        to: "/admin/reports",
        icon: FileText,
        label: "Reports",
        countKey: "pendingReports",
      },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      {
        to: "/admin/notifications",
        icon: Bell,
        label: "Notifications",
      },
      {
        to: "/admin/settings",
        icon: Settings,
        label: "Settings",
      },
    ],
  },
];

export default function AdminSidebar({ open, setOpen }) {
  const requests = useAdminStore((state) => state.requests);
  const therapists = useAdminStore((state) => state.therapists);
  const reports = useAdminStore((state) => state.reports);
  const forms = useAdminStore((state) => state.forms);

  const stats = useMemo(
    () => ({
      pendingRequests: requests.filter(
        (r) => r.status === "pending"
      ).length,

      activeTherapists: therapists.filter(
        (t) => t.status === "active"
      ).length,

      pendingReports: reports.filter(
        (r) => r.status === "pending"
      ).length,

      pendingForms: forms.filter(
        (f) => f.status === "pending"
      ).length,

      totalRequests: requests.length,

      totalCases: requests.filter((r) =>
        ["assigned", "in-progress"].includes(r.status)
      ).length,
    }),
    [requests, therapists, reports, forms]
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity lg:hidden ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 h-screen w-[220px] bg-[#1C1C1E] flex flex-col z-50 border-r border-[#2E2E30] transition-transform duration-300 ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#2E2E30]">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="St. Stephens Family"
              className="w-8 h-8 rounded-lg object-cover"
            />

            <div className="leading-tight">
              <p className="text-white text-xs font-bold">
                St. Stephen's
              </p>

              <p className="text-[#636366] text-[10px]">
                Family Admin
              </p>
            </div>
          </div>

          {/* Mobile close */}
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV.map((group) => (
            <div key={group.section}>
              <p className="text-[#636366] text-[10px] font-bold tracking-widest uppercase px-3 mb-2">
                {group.section}
              </p>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const count = item.countKey
                    ? stats[item.countKey]
                    : null;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/admin"}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[#E8890C] text-white"
                            : "text-[#A1A1A6] hover:bg-[#2C2C2E] hover:text-white"
                        }`
                      }
                    >
                      <item.icon
                        size={16}
                        className="flex-shrink-0"
                      />

                      <span className="flex-1">
                        {item.label}
                      </span>

                      {count != null && count > 0 && (
                        <span className="bg-[#E8890C]/20 text-[#F4A832] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {count}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 space-y-1 border-t border-[#2E2E30] pt-4">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#A1A1A6] text-sm font-medium hover:bg-[#2C2C2E] hover:text-white transition-all"
          >
            <ExternalLink size={16} />
            <span>Back to Website</span>
          </a>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#A1A1A6] text-sm font-medium hover:bg-red-900/30 hover:text-red-400 transition-all">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}