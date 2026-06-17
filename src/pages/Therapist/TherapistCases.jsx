

import { useEffect, useState } from "react";
import { Search, FileText, Phone, Mail, MapPin, Calendar, ChevronDown } from "lucide-react";
import useTherapistStore from "../../store/useTherapistStore";
import toast from "react-hot-toast";

// ── constants ─────────────────────────────────────────────────────────────────
const STATUS_BADGE = {
  assigned:      "bg-blue-100 text-blue-700",
  "in_progress": "bg-purple-100 text-purple-700",
  completed:     "bg-green-100 text-green-700",
};

const STATUS_TABS = ["All", "Assigned", "In Progress", "Completed"];

const STATUS_MAP = {
  "All":         undefined,
  "Assigned":    "assigned",
  "In Progress": "in_progress",
  "Completed":   "completed",
};

// ── skeleton ──────────────────────────────────────────────────────────────────
function CaseSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
      {/* header */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded-lg" />
          <div className="h-3 w-48 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
      </div>
      {/* concern block */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-4/5 bg-gray-200 rounded" />
        <div className="h-3 w-3/5 bg-gray-100 rounded" />
      </div>
      {/* meta row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
      {/* button row */}
      <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-2">
        <div className="h-8 bg-gray-100 rounded-xl" />
        <div className="h-8 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ── detail drawer ─────────────────────────────────────────────────────────────
function CaseDrawer({ c, onClose }) {
  if (!c) return null;

  const age    = c.child_age    ? `${c.child_age} yrs` : null;
  const gender = c.child_gender ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl z-10">
        {/* handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-4">
          {/* header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="font-bold text-gray-900 text-lg">{c.child_name}</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {[age, gender, c.location].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[c.status] ?? "bg-gray-100 text-gray-500"}`}>
              {c.status?.replace("-", " ")}
            </span>
          </div>

          {/* parent contact */}
          <section className="mb-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Parent / Guardian
            </p>
            <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 overflow-hidden">
              <ContactRow icon={<FileText size={13} />} label={c.parent_name} />
              {c.parent_email && (
                <ContactRow icon={<Mail size={13} />} label={c.parent_email}
                  href={`mailto:${c.parent_email}`} />
              )}
              {c.parent_phone && (
                <ContactRow icon={<Phone size={13} />} label={c.parent_phone}
                  href={`tel:${c.parent_phone}`} />
              )}
            </div>
          </section>

          {/* primary concerns */}
          {c.primary_concerns && (
            <section className="mb-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Primary Concerns
              </p>
              <div className="bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {c.primary_concerns}
              </div>
            </section>
          )}

          {/* communication level */}
          {c.communication_level && (
            <section className="mb-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Communication Level
              </p>
              <div className="bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-600">
                {c.communication_level}
              </div>
            </section>
          )}

          {/* dates */}
          <section className="mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Timeline
            </p>
            <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 overflow-hidden">
              <ContactRow icon={<Calendar size={13} />}
                label={`Submitted: ${fmt(c.created_at)}`} />
              {c.assigned_at && (
                <ContactRow icon={<Calendar size={13} />}
                  label={`Assigned: ${fmt(c.assigned_at)}`} />
              )}
            </div>
          </section>

          <button onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-600 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, href }) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <span className="text-sm text-gray-700 truncate">{label}</span>
    </div>
  );
  return href
    ? <a href={href} className="block hover:bg-gray-100 transition-colors">{inner}</a>
    : <div>{inner}</div>;
}

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── main component ────────────────────────────────────────────────────────────
export default function AdminCases() {
  const { cases, casesLoading, casesError, fetchMyCases, acceptCase, status } = useTherapistStore();
  const [search, setSearch] = useState("");
  const [tab, setTab]       = useState("All");
  const [drawer, setDrawer] = useState(null);

  useEffect(() => {
    fetchMyCases();
  }, []);

  const filtered = cases.filter((c) => {
    const matchTab = tab === "All" || c.status === STATUS_MAP[tab];
    if (!matchTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.child_name?.toLowerCase().includes(q)  ||
      c.parent_name?.toLowerCase().includes(q)
    );
  });


  
const handleAccept = async (id) => {
  try {
    await acceptCase(id);

    toast.success("Case accepted successfully");

    // optionally refetch cases
    fetchMyCases();
  } catch (err) {
    toast.error(err.message);
  }
};
  return (
    <div className="space-y-5">

      {/* toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === t ? "bg-[#513424] text-white" : "text-gray-500 hover:bg-gray-100"
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cases…"
              className="bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm w-52 outline-none shadow-sm focus:ring-2 focus:ring-[#513424]/20 focus:border-[#513424]"
            />
          </div>
          <p className="text-[12px] text-gray-400 whitespace-nowrap">
            {filtered.length} case{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* error */}
      {casesError && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-600">
          {casesError}
        </div>
      )}

      {/* skeleton */}
      {casesLoading && (
        <div className="grid lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <CaseSkeleton key={i} />)}
        </div>
      )}

      {/* cards */}
      {!casesLoading && (
        <div className="grid lg:grid-cols-2 gap-5">
          {filtered.map((c) => (
            <CaseCard key={c.id} c={c} onOpen={() => setDrawer(c)} handleAccept={handleAccept}  status={status}/>
          ))}
        </div>
      )}

      {/* empty */}
      {!casesLoading && filtered.length === 0 && !casesError && (
        <div className="text-center py-20 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          {search || tab !== "All" ? "No cases match this filter." : "You have no cases assigned yet."}
        </div>
      )}

      {/* drawer */}
      <CaseDrawer c={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
}

// ── case card ─────────────────────────────────────────────────────────────────
function CaseCard({ c, onOpen, handleAccept, status }) {
  const age    = c.child_age    ? `${c.child_age} yrs` : null;
  const gender = c.child_gender ?? null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
      {/* header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-bold text-gray-900">{c.child_name ?? "—"}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {[age, gender, c.location].filter(Boolean).join(" · ") || "No details"}
          </p>
        </div>
        <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[c.status] ?? "bg-gray-100 text-gray-500"}`}>
          {c.status?.replace("-", " ")}
        </span>
      </div>

      {/* concern */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
          {c.primary_concerns ?? "No concerns recorded."}
        </p>
      </div>

      {/* parent row */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FEF3E0] flex items-center justify-center text-[10px] font-bold text-[#5C3010]">
            {(c.parent_name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <span className="font-medium text-gray-700">{c.parent_name ?? "—"}</span>
        </div>
        <span className="text-gray-400 text-[10px]">Since {fmt(c.assigned_at)}</span>
      </div>

      {/* actions */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-50">
        {c.parent_email && (
          <a href={`mailto:${c.parent_email}`}
            className="flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-all">
            <Mail size={12} /> Email parent
          </a>
        )}
        {c.parent_phone && (
          <a href={`tel:${c.parent_phone}`}
            className="flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-all">
            <Phone size={12} /> Call parent
          </a>
        )}

        {/* fill remaining columns if contact info absent */}
        {!c.parent_email && !c.parent_phone && (
          <div className="col-span-2 flex items-center justify-center gap-1.5 py-2 bg-gray-50 rounded-xl text-xs text-gray-400">
            No contact info
          </div>
        )}

        
        {c.status === "assigned" && (
  <button
    onClick={() => handleAccept(c.id)}
    disabled={status === "loading"}
    className="px-4 py-2 col-span-2 w-full text-sm rounded-lg bg-[#513424]/80 text-white hover:bg-[#513424]/50 disabled:opacity-50"
  >
    {status === "loading" ? "Accepting..." : "Accept Case"}
  </button>
)}
        <button onClick={onOpen}
          className="col-span-2 flex items-center justify-center gap-1.5 py-2 bg-[#FEF3E0] hover:bg-[#F4A832]/20 rounded-xl text-xs font-semibold text-[#E8890C] transition-all">
          View full case <ChevronDown size={11} />
        </button>
      </div>
    </div>
  );
}