// pages/therapist/TherapistDashboard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, FileText, Clock, CheckCircle } from "lucide-react";
import useTherapistStore from "../../store/useTherapistStore";

function StatCard({ label, value, Icon, color }) {
  const colors = {
    teal:  "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    blue:  "bg-blue-50 text-blue-600",
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

const STATUS_PILL = {
  assigned:    "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  completed:   "bg-green-50 text-green-700",
  on_hold:     "bg-gray-100 text-gray-600",
};

// components/skeletons/DashboardSkeleton.jsx
// Usage: render while casesLoading || reportsLoading in TherapistDashboard

function Pulse({ className }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />;
}

// ── Stat card skeleton ────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse shrink-0" />
      <div className="space-y-2 flex-1">
        <Pulse className="h-6 w-12" />
        <Pulse className="h-3 w-24" />
      </div>
    </div>
  );
}

// ── List row skeleton ─────────────────────────────────
function ListRowSkeleton() {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div className="space-y-1.5">
        <Pulse className="h-3.5 w-28" />
        <Pulse className="h-3 w-20 bg-gray-100" />
      </div>
      <Pulse className="h-5 w-16 rounded-full" />
    </li>
  );
}

// ── Panel skeleton (header + rows) ────────────────────
function PanelSkeleton({ rows = 4 }) {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      {/* panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <Pulse className="h-3.5 w-24" />
        <Pulse className="h-3 w-12 bg-gray-100" />
      </div>
      <ul className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}

// ── Exported dashboard skeleton ───────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* two-column panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelSkeleton rows={4} />
        <PanelSkeleton rows={4} />
      </div>
    </div>
  );
}

export default function TherapistDashboard() {
  const navigate = useNavigate();
 
  const {
    cases,   casesLoading,   fetchMyCases,
    reports, reportsLoading, fetchReports,
  } = useTherapistStore();
 
  useEffect(() => {
    fetchMyCases();
    fetchReports();
  }, []);
 
  const inProgress    = cases.filter((c) => c.status === "in_progress").length;
  const completed     = cases.filter((c) => c.status === "completed").length;
  const pendingReports = reports.filter((r) => r.status === "pending").length;
 
  const loading = casesLoading || reportsLoading;
 
  if (loading) return <DashboardSkeleton />;
  
 
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total cases"     value={cases.length}   Icon={FolderOpen}  color="teal"  />
        <StatCard label="In progress"     value={inProgress}     Icon={Clock}       color="amber" />
        <StatCard label="Completed"       value={completed}      Icon={CheckCircle} color="green" />
        <StatCard label="Reports pending" value={pendingReports} Icon={FileText}    color="blue"  />
      </div>
 
      {/* Two-column recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent cases */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Recent cases</h2>
            <button
              onClick={() => navigate("/therapist/cases")}
              className="text-xs text-teal-600 hover:underline"
            >
              View all
            </button>
          </div>
          {cases.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No cases yet</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {cases.slice(0, 5).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.child_name}</p>
                    <p className="text-xs text-gray-500">{c.parent_name}</p>
                  </div>
                  <span
                    className={`text-xs capitalize px-2 py-0.5 rounded font-medium ${
                      STATUS_PILL[c.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.status?.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
 
        {/* Recent reports */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Recent reports</h2>
            <button
              onClick={() => navigate("/therapist/reports")}
              className="text-xs text-teal-600 hover:underline"
            >
              View all
            </button>
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No reports yet</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {reports.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-500">{r.request?.child_name}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      r.status === "pending"
                        ? "bg-amber-50 text-amber-700"
                        : r.status === "approved"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}