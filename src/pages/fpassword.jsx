import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import useAuthStore from "../store/useAuthStore";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, status, error, _clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const loading = status === "loading";

  async function handleSubmit(e) {
    e.preventDefault();
    _clearError();
    try {
      await forgotPassword({ email });
      setDone(true);
    } catch {
      // error already in store
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">

          {/* Animated envelope */}
          <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-1">
            If <strong className="text-gray-700">{email}</strong> is registered,
            a reset link is on its way.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            Didn't get it? Check your spam folder or try again below.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Back to Login
            </button>
            <button
              onClick={() => { setDone(false); setEmail(""); _clearError(); }}
              className="w-full bg-gray-50 text-gray-700 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-100 transition text-sm"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
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
              Forgot your password?
            </h1>
            <p className="mt-6 text-lg text-gray-200 max-w-md">
              No worries, enter your email and we'll send you a secure
              link to reset it right away.
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
              <img src={Logo} alt="St. Stephens Family" className="w-[100px] h-auto object-contain" />
            </div>

            {/* Back link */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 mb-7 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Login
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Enter the email address linked to your account and we'll
              send you a reset link.
            </p>

            {/* Error */}
            {error && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); _clearError(); }}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <><Spinner /> Sending link…</> : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Remembered it?{" "}
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