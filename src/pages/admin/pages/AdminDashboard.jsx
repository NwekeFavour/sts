import { useAdminStore } from "../../../store/adminStore";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Users,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useMemo } from "react";

const STATUS_BADGE = {
  pending: "bg-amber-100 text-amber-700",
  assigned: "bg-blue-100 text-blue-700",
  "in-progress": "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

const ACTIVITY = [
  {
    icon: CheckCircle2,
    color: "text-green-500",
    msg: "Report uploaded for Chidera E.",
    time: "2 min ago",
  },
  {
    icon: ClipboardList,
    color: "text-blue-500",
    msg: "New request from James Mensah",
    time: "18 min ago",
  },
  {
    icon: Users,
    color: "text-purple-500",
    msg: "Therapist assigned to Temi A.",
    time: "1 hr ago",
  },
  {
    icon: FileText,
    color: "text-orange-500",
    msg: "Intake form submitted by Bisi A.",
    time: "2 hr ago",
  },
  {
    icon: AlertTriangle,
    color: "text-red-500",
    msg: "2 requests awaiting assignment",
    time: "3 hr ago",
  },
];

export default function AdminDashboard() {
  const { requests, therapists, reports, forms } = useAdminStore();
  const stats = useMemo(
    () => ({
      pendingRequests: requests.filter((r) => r.status === "pending").length,
      totalCases: requests.filter((r) =>
        ["assigned", "in-progress"].includes(r.status),
      ).length,
      activeTherapists: therapists.filter((t) => t.status === "active").length,
      pendingReports: reports.filter((r) => r.status === "pending").length,
      pendingForms: forms.filter((f) => f.status === "pending").length,
      totalRequests: requests.length,
    }),
    [requests, therapists, reports, forms],
  );

  const STAT_CARDS = [
    {
      label: "Pending Requests",
      value: stats.pendingRequests,
      total: `of ${stats.totalRequests} total`,
      icon: ClipboardList,
      color: "bg-amber-50 text-amber-600",
      ring: "ring-[#dadada]",
      alert: stats.pendingRequests > 0,
      alertMsg: "Awaiting therapist assignment",
      link: "/admin/requests",
    },
    {
      label: "Active Cases",
      value: stats.totalCases,
      total: "currently ongoing",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      ring: "ring-blue-200",
      alert: false,
      link: "/admin/cases",
    },
    {
      label: "Pending Reports",
      value: stats.pendingReports,
      total: "to review",
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
      ring: "ring-purple-200",
      alert: stats.pendingReports > 0,
      alertMsg: "Uploaded, awaiting review",
      link: "/admin/reports",
    },
    {
      label: "Pending Forms",
      value: stats.pendingForms,
      total: "not yet submitted",
      icon: ClipboardCheck,
      color: "bg-[#FEF3E0] text-[#E8890C]",
      ring: "ring-[#F4A832]/30",
      alert: stats.pendingForms > 0,
      alertMsg: "Parents not yet responded",
      link: "/admin/forms",
    },
  ];

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-7">
      {/* Alert banner */}
      {stats.pendingRequests > 0 && (
        <div className="bg-amber-50 border border-[#dadada] rounded-2xl px-5 py-4 lg:flex flex-1 items-end space-y-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {stats.pendingRequests} request
                {stats.pendingRequests > 1 ? "s" : ""} awaiting therapist
                assignment
              </p>
              <p className="text-xs text-[#181616] mt-0.5">
                Assign therapists to avoid delays in care
              </p>
            </div>
          </div>
          <Link
            to="/admin/requests"
            className="text-xs lg:w-fit w-full lg:justify-start justify-end font-semibold text-amber-700 flex items-center gap-1 hover:underline"
          >
            Review now <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid lg:grid-cols-4 grid-cols-1 md:grid-cols-2  gap-5">
        {STAT_CARDS.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 min-h-[180px] flex flex-col justify-between ${
              card.alert ? `ring-2 ${card.ring}` : ""
            }`}
          >
            <div className="flex flex-wrap space-y-2 items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}
              >
                <card.icon size={18} />
              </div>
              {card.alert && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <AlertTriangle size={10} /> Action needed
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {card.value}
            </p>
            <p className="text-sm font-semibold text-gray-700">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {card.alert ? card.alertMsg : card.total}
            </p>
          </Link>
        ))}
      </div>

      {/* Main content: Recent requests + Activity feed */}
      <div className="grid lg:grid-cols-3 grid-cols-1  lg:justfify-start justify-center grid-cols-1 gap-6">
        {/* Recent requests table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-50">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Recent Requests
              </h2>

              <p className="text-xs text-gray-400 mt-0.5">
                Latest therapy intake submissions
              </p>
            </div>

            <Link
              to="/admin/requests"
              className="text-xs font-semibold text-[#E8890C] flex items-center justify-end gap-1 hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-6 py-3">
                    Parent / Child
                  </th>

                  <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-3">
                    Location
                  </th>

                  <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-3">
                    Date
                  </th>

                  <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {recentRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <p className="text-sm font-semibold text-gray-800">
                        {req.parent}
                      </p>

                      <p className="text-xs text-gray-400">{req.child}</p>
                    </td>

                    <td className="px-3 py-3.5 text-xs text-gray-500">
                      {req.location}
                    </td>

                    <td className="px-3 py-3.5 text-xs text-gray-500">
                      {req.date}
                    </td>

                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[req.status]}`}
                      >
                        {req.status.replace("-", " ")}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <Link
                        to="/admin/requests"
                        className="text-[10px] font-semibold text-gray-400 hover:text-[#E8890C] transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {recentRequests.map((req) => (
              <div key={req.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {req.parent}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">{req.child}</p>
                  </div>

                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[req.status]}`}
                  >
                    {req.status.replace("-", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Location
                    </p>

                    <p className="text-xs text-gray-600 mt-1">{req.location}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Date
                    </p>

                    <p className="text-xs text-gray-600 mt-1">{req.date}</p>
                  </div>
                </div>

                <Link
                  to="/admin/requests"
                  className="inline-flex text-xs font-semibold text-[#E8890C] hover:underline"
                >
                  View Request →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest system events</p>
          </div>
          <div className="p-5 space-y-4">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 ${a.color}`}>
                  <a.icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 leading-snug">
                    {a.msg}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock size={9} /> {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Therapist snapshot */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-50">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Therapist Overview
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Active caseloads</p>
          </div>

          <Link
            to="/admin/therapists"
            className="text-xs font-semibold text-[#E8890C] flex items-center gap-1 hover:underline"
          >
            Manage <ArrowRight size={12} />
          </Link>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 xl:divide-x divide-gray-50">
          {therapists
            .filter((t) => t.status === "active")
            .map((t) => (
              <div key={t.id} className="px-4 sm:px-6 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEF3E0] to-[#F4A832] flex items-center justify-center text-[#5C3010] text-xs font-bold flex-shrink-0">
                    {t.avatar}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{t.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {t.cases}
                    </p>
                    <p className="text-[11px] text-gray-400">active cases</p>
                  </div>

                  <div className="flex-1 max-w-[90px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E8890C] rounded-full"
                      style={{
                        width: `${Math.min(100, (t.cases / 15) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
