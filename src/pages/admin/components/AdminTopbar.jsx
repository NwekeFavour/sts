// AdminTopbar.jsx
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Menu,
} from "lucide-react";

export default function AdminTopbar({
  title,
  subtitle,
  onMenuClick,
}) {
  return (
    <header className="h-auto min-h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-7 py-3 sticky top-0 z-40">
      
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-[15px] font-bold text-gray-900 truncate">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#E8890C]/30 focus:border-[#E8890C] w-52 transition-all"
          />
        </div>

        {/* Help */}
        <button className="hidden sm:flex w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
          <HelpCircle size={15} />
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
          <Bell size={15} />

          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E8890C] rounded-full text-[9px] text-white font-bold flex items-center justify-center">
            3
          </span>
        </button>

        {/* User */}
        <button className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E8890C] to-[#F4A832] flex items-center justify-center text-white text-xs font-bold">
            AD
          </div>

          <div className="text-left leading-tight hidden lg:block">
            <p className="text-xs font-semibold text-gray-800">
              Admin User
            </p>

            <p className="text-[10px] text-gray-400">
              Super Admin
            </p>
          </div>

          <ChevronDown
            size={12}
            className="text-gray-400 hidden sm:block"
          />
        </button>
      </div>
    </header>
  );
}