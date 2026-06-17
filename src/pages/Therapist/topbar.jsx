// TherapistTopbar.jsx
import { Menu, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TherapistTopbar({ title, subtitle, onMenuClick }) {
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-200 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-500 leading-tight hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}