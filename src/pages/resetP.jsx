import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import useAuthStore from "../store/useAuthStore";

// Password strength scorer
function scorePassword(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–5
}

const STRENGTH = [
  { label: "Too short",  color: "#e5e7eb" },
  { label: "Weak",       color: "#ef4444" },
  { label: "Fair",       color: "#f97316" },
  { label: "Good",       color: "#eab308" },
  { label: "Strong",     color: "#22c55e" },
  { label: "Very strong",color: "#16a34a" },
];

function PasswordStrengthBar({ password }) {
  const score = password ? scorePassword(password) : 0;
  const { label, color } = STRENGTH[score];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? color : "#e5e7eb" }}
          />
        ))}
      </div>
      {password && (
        <p className="text-xs" style={{ color }}>
          {label}
        </p>
      )}
    </div>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// Requirement row
function Req({ met, text }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors ${met ? "text-green-600" : "text-gray-400"}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        {met
          ? <><polyline points="20 6 9 17 4 12" /></>
          : <><circle cx="12" cy="12" r="10" /></>}
      </svg>
      {text}
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, status, error, _clearError } = useAuthStore();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [localError, setLocalError] = useState("");

  const loading = status === "loading";

  // Clear store error when user types
  useEffect(() => { _clearError(); }, [password, confirm]);

  // Validation flags
  const hasLength   = password.length >= 8;
  const hasUpper    = /[A-Z]/.test(password);
  const hasNumber   = /[0-9]/.test(password);
  const hasMatch    = password === confirm && confirm !== "";
  const allMet      = hasLength && hasUpper && hasNumber && hasMatch;

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid link</h2>
          <p className="text-sm text-gray-500 mb-6">
            This password reset link is missing or malformed.
            Please request a new one.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    if (!allMet) {
      setLocalError("Please meet all password requirements before continuing.");
      return;
    }

    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch {
      // error string lives in the store
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password set!</h2>
          <p className="text-sm text-gray-500 mb-8">
            Your password has been updated. You can now log in with your new credentials.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Main form 
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* Left panel */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-black text-white">
          <img
            src="https://images.unsplash.com/photo-1547496613-4e19af6736dc?q=80&w=1200&h=900&auto=format&fit=crop"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="relative z-10">
            <h1 className="text-5xl font-bold leading-tight max-w-sm">
              Set your password
            </h1>
            <p className="mt-6 text-lg text-gray-200 max-w-md">
              Choose a strong password to protect your account.
              You'll use this to log in going forward.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white rounded-[50px]">
              <img src={Logo} alt="St. Stephens Family" className="w-[100px] h-auto object-contain" />
            </div>
            <div>
              <p className="font-semibold">St. Stephens Family</p>
              <p className="text-sm text-gray-300">Secure authentication experience</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-sm">

            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <img src={Logo} alt="St. Stephens Family" className="w-[80px] h-auto object-contain" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">Set Password</h2>
            <p className="mt-2 text-sm text-gray-500">
              Create a new password for your account.
            </p>

            {/* Errors */}
            {(error || localError) && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {error || localError}
              </div>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>

              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>
                <PasswordStrengthBar password={password} />
              </div>

              {/* Requirements */}
              {password && (
                <div className="space-y-1.5 px-1">
                  <Req met={hasLength} text="At least 8 characters" />
                  <Req met={hasUpper}  text="One uppercase letter" />
                  <Req met={hasNumber} text="One number" />
                </div>
              )}

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className={`w-full px-4 py-3 pr-11 rounded-xl border outline-none focus:ring-2 transition ${
                      confirm && !hasMatch
                        ? "border-red-300 focus:ring-red-300"
                        : "border-gray-300 focus:ring-black"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {confirm && !hasMatch && (
                  <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                )}
                {hasMatch && (
                  <p className="mt-1 text-xs text-green-600">Passwords match ✓</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !allMet}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <><Spinner /> Setting password…</> : "Set Password"}
              </button>

            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Remembered your password?{" "}
              <span
                className="text-black font-semibold cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}