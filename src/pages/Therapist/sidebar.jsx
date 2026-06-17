// TherapistSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Bell,
  Settings,
  X,
  Stethoscope,
  LogOut,
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { useState } from "react";

const NAV = [
  { to: "/therapist", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/therapist/cases", label: "My Cases", Icon: FolderOpen },
  { to: "/therapist/reports", label: "Reports", Icon: FileText },
  { to: "/therapist/settings", label: "Settings", Icon: Settings },
];

const linkBase =
  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors";
const active = "bg-[#513424] text-[#fff]";
const inactive = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

// ── Sign out confirmation modal ───────────────────────────────────────────────
function SignOutModal({ onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
          <LogOut className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1.5">
          Sign out of your account?
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          You'll need to log in again to access your cases and reports.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TherapistSidebar({ open, setOpen }) {
  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut]   = useState(false);

  async function handleConfirmSignOut() {
    setSigningOut(true);
    try {
      await logout();
      navigate("/login")
    } finally {
      setSigningOut(false);
      setConfirmOpen(false);
      setOpen(false);
      navigate("/login");
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-[220px] bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50">
                <Stethoscope className="w-6 h-6 text-teal-600" />
              </div>

              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">
                  {user?.name || "Therapist"}
                </h2>

                <p className="text-xs text-gray-500">
                  Therapist Portal
                </p>

                {user?.specialization && (
                  <span className="inline-flex mt-2 px-2 py-1 text-[11px] font-medium rounded-full bg-teal-50 text-teal-700">
                    {user.specialization}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
          <p className="text-xs text-gray-400 px-2 pt-1">Therapist view</p>
        </div>
      </aside>

      {confirmOpen && (
        <SignOutModal
          loading={signingOut}
          onConfirm={handleConfirmSignOut}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}