// pages/therapist/TherapistSettings.jsx
import { useEffect, useState } from "react";
import { User, Phone, Stethoscope, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import useTherapistStore from "../../store/useTherapistStore";

// ── helpers ───────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#513424]/40 focus:border-[#513424]
                  disabled:bg-gray-50 disabled:text-gray-400 ${className}`}
      {...props}
    />
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-[#513424]/8 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-[#513424]" />
        </div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Toast({ msg, type }) {
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3
                     rounded-xl text-sm font-medium shadow-lg
                     ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success"
        ? <CheckCircle className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg}
    </div>
  );
}

// ── Profile section ───────────────────────────────────
function ProfileSection({ profile }) {
  const { updateProfile, saving, saveError } = useTherapistStore();

  const [form, setForm] = useState({
    full_name:      profile?.full_name     ?? "",
    phone:          profile?.phone         ?? "",
    specialization: profile?.specialization ?? "",
  });
  const [toast, setToast] = useState(null);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    try {
      await updateProfile(form);
      showToast("Profile updated.");
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  return (
    <>
      <SectionCard title="Profile information" icon={User}>
        {/* Read-only email */}
        <Field label="Email address">
          <Input value={profile?.email ?? ""} disabled />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
        </Field>

        <Field label="Full name">
          <Input
            value={form.full_name}
            onChange={e => set("full_name", e.target.value)}
            placeholder="Your full name"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                className="pl-8"
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                placeholder="+234 800 000 0000"
              />
            </div>
          </Field>

          <Field label="Specialization">
            <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                className="pl-8"
                value={form.specialization}
                onChange={e => set("specialization", e.target.value)}
                placeholder="e.g. ABA Therapy"
              />
            </div>
          </Field>
        </div>

        {/* Status badge — read only */}
        <Field label="Account status">
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
              ${profile?.status === "active"
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"}`}>
              {profile?.status ?? "—"}
            </span>
            <span className="text-xs text-gray-400">Managed by admin</span>
          </div>
        </Field>

        <div className="pt-1 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#513424] text-white text-sm
                       font-medium rounded-lg hover:bg-[#513424]/80 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </SectionCard>

      {toast && <Toast {...toast} />}
    </>
  );
}

// ── Password section ──────────────────────────────────
function PasswordSection() {
  const { changePassword, saving } = useTherapistStore();

  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [err, setErr]   = useState(null);
  const [toast, setToast] = useState(null);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleChange() {
    setErr(null);
    if (form.newPassword.length < 8) {
      return setErr("Password must be at least 8 characters.");
    }
    if (!/[A-Z]/.test(form.newPassword)) {
      return setErr("Password must contain an uppercase letter.");
    }
    if (!/[0-9]/.test(form.newPassword)) {
      return setErr("Password must contain a number.");
    }
    if (form.newPassword !== form.confirm) {
      return setErr("Passwords do not match.");
    }
    try {
      await changePassword({ newPassword: form.newPassword });
      setForm({ newPassword: "", confirm: "" });
      showToast("Password changed successfully.");
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  return (
    <>
      <SectionCard title="Change password" icon={Lock}>
        <Field label="New password">
          <Input
            type="password"
            value={form.newPassword}
            onChange={e => set("newPassword", e.target.value)}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
          />
        </Field>

        <Field label="Confirm new password">
          <Input
            type="password"
            value={form.confirm}
            onChange={e => set("confirm", e.target.value)}
            placeholder="Repeat new password"
          />
        </Field>

        {/* Strength hints */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "8+ chars",   ok: form.newPassword.length >= 8 },
            { label: "Uppercase",  ok: /[A-Z]/.test(form.newPassword) },
            { label: "Number",     ok: /[0-9]/.test(form.newPassword) },
            { label: "Matches",    ok: form.newPassword && form.newPassword === form.confirm },
          ].map(({ label, ok }) => (
            <span key={label} className={`text-xs font-medium flex items-center gap-1 ${ok ? "text-green-600" : "text-gray-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-green-500" : "bg-gray-300"}`} />
              {label}
            </span>
          ))}
        </div>

        {err && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {err}
          </div>
        )}

        <div className="pt-1 flex justify-end">
          <button
            onClick={handleChange}
            disabled={saving || !form.newPassword || !form.confirm}
            className="flex items-center gap-2 px-4 py-2 bg-[#513424] text-white text-sm
                       font-medium rounded-lg hover:bg-[#513424]/80 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Updating…" : "Update password"}
          </button>
        </div>
      </SectionCard>

      {toast && <Toast {...toast} />}
    </>
  );
}

// ── Skeleton ──────────────────────────────────────────
function Pulse({ className }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />;
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <Pulse className="h-4 w-36" />
        {[140, 100, 120, 80].map((w, i) => (
          <div key={i} className="space-y-1.5">
            <Pulse className="h-3 w-20 bg-gray-100" />
            <Pulse className={`h-9 w-full`} />
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <Pulse className="h-4 w-36" />
        {[1, 2].map(i => (
          <div key={i} className="space-y-1.5">
            <Pulse className="h-3 w-20 bg-gray-100" />
            <Pulse className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────
export default function TherapistSettings() {
  const { profile, profileLoading, profileError, fetchProfile } = useTherapistStore();

  useEffect(() => { fetchProfile(); }, []);

  if (profileLoading) return <SettingsSkeleton />;

  if (profileError) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {profileError}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <ProfileSection profile={profile} />
      <PasswordSection />
    </div>
  );
}