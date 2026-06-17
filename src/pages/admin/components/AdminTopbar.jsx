// AdminTopbar.jsx
import { useEffect } from "react";
import { Search, Bell, HelpCircle, ChevronDown, Menu } from "lucide-react";
import useAuthStore from "../../../store/useAuthStore";

export default function AdminTopbar({ title, subtitle, onMenuClick }) {
  const user      = useAuthStore((s) => s.user);
  const fetchMe   = useAuthStore((s) => s.fetchMe);
  const status    = useAuthStore((s) => s.status);
  console.log(user)

  // Rehydrate user profile from server on mount if not already loaded
  useEffect(() => {
    if (!user) fetchMe();
  }, []);

  // Derive initials and display name from the live user object
  const displayName = user?.name ?? "Admin";
  const initials    = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "—";

  return (
    <header className="h-auto min-h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-7 py-3 sticky top-0 z-40">

      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-[15px] font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5 truncate hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
       
       

        {/* User pill — shows real data from fetchMe, skeleton while loading */}
        <button className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E8890C] to-[#F4A832] flex items-center justify-center text-white text-xs font-bold">
            {status === "loading" && !user ? "…" : initials}
          </div>
          <div className="text-left leading-tight hidden lg:block">
            <p className="text-xs font-semibold text-gray-800">
              {status === "loading" && !user ? (
                <span className="inline-block w-20 h-2.5 bg-gray-200 rounded animate-pulse" />
              ) : (
                displayName
              )}
            </p>
            <p className="text-[10px] text-gray-400">{roleLabel}</p>
          </div>
          <ChevronDown size={12} className="text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}