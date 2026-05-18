import { useState } from "react";
import { useAdminStore } from "../../../store/adminStore";
import {
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  FileText,
  X,
} from "lucide-react";

const TYPE_BADGE = {
  progress: "bg-green-100 text-green-700",
  assessment: "bg-blue-100 text-blue-700",
  notes: "bg-gray-100 text-gray-600",
  discharge: "bg-purple-100 text-purple-700",
};

const STATUS_BADGE = {
  reviewed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
};

const TABS = ["All", "Pending", "Reviewed"];

export default function AdminReports() {
  const { reports, markReportReviewed } = useAdminStore();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = reports.filter((r) => {
    const matchTab = tab === "All" || r.status === tab.toLowerCase();
    const matchSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.therapist.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
        {[
          {
            label: "Total Reports",
            value: reports.length,
            icon: FileText,
            color: "bg-gray-50 text-gray-600",
          },
          {
            label: "Pending Review",
            value: reports.filter((r) => r.status === "pending").length,
            icon: Clock,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Reviewed",
            value: reports.filter((r) => r.status === "reviewed").length,
            icon: CheckCircle2,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "This Month",
            value: reports.length,
            icon: FileText,
            color: "bg-[#FEF3E0] text-[#E8890C]",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}
            >
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-gray-50 gap-4">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  tab === t
                    ? "bg-[#E8890C] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full sm:w-56 bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#E8890C]/20 focus:border-[#E8890C]"
            />
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden">
          {filtered.map((r) => (
            <div key={r.id} className="border-b border-gray-100 p-4 space-y-4">
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FEF3E0] flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-[#E8890C]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {r.title}
                    </p>

                    <p className="text-[11px] text-gray-400 font-mono">
                      {r.id}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_BADGE[r.status]}`}
                >
                  {r.status}
                </span>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Therapist</p>
                  <p className="text-gray-700">{r.therapist}</p>
                </div>

                <div>
                  <p className="text-gray-400 mb-1">Patient</p>
                  <p className="text-gray-700">{r.patient}</p>
                </div>

                <div>
                  <p className="text-gray-400 mb-1">Type</p>

                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${TYPE_BADGE[r.type]}`}
                  >
                    {r.type}
                  </span>
                </div>

                <div>
                  <p className="text-gray-400 mb-1">Date</p>
                  <p className="text-gray-500">{r.date}</p>
                </div>

                <div>
                  <p className="text-gray-400 mb-1">File Size</p>
                  <p className="text-gray-500">{r.size}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all">
                  <Eye size={14} />
                </button>

                <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all">
                  <Download size={14} />
                </button>

                {r.status === "pending" && (
                  <button
                    onClick={() => markReportReviewed(r.id)}
                    className="px-3 py-2 bg-green-50 text-green-700 text-[11px] font-bold rounded-lg hover:bg-green-100 transition-all"
                  >
                    Mark reviewed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50/60">
                {[
                  "Report",
                  "Therapist",
                  "Patient",
                  "Type",
                  "Date",
                  "Size",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FEF3E0] flex items-center justify-center flex-shrink-0">
                        <FileText size={14} className="text-[#E8890C]" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-800 max-w-[200px] truncate">
                          {r.title}
                        </p>

                        <p className="text-[10px] text-gray-400 font-mono">
                          {r.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                    {r.therapist}
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                    {r.patient}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${TYPE_BADGE[r.type]}`}
                    >
                      {r.type}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {r.date}
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {r.size}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
                        <Eye size={14} />
                      </button>

                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
                        <Download size={14} />
                      </button>

                      {r.status === "pending" && (
                        <button
                          onClick={() => markReportReviewed(r.id)}
                          className="px-2.5 py-1.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg hover:bg-green-100 transition-all"
                        >
                          Mark reviewed
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No reports match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
