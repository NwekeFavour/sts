import { useState } from "react";
import Logo from "../assets/images/logo.png";

export default function AuthPages() {
  const [pages, setPages] = useState("login");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Section */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-black text-white">
          <img
            src="https://images.unsplash.com/photo-1547496613-4e19af6736dc?q=80&w=1200&h=900&auto=format&fit=crop"
            alt="West African teen"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />

          <div className="relative z-10">
            <h1 className="text-5xl font-bold leading-tight max-w-md">
              Welcome Back
            </h1>

            <p className="mt-6 text-lg text-gray-200 max-w-lg">
              Access your dashboard, manage your activities, and stay connected
              with your community.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white rounded-[50px]">
              <img
                src={Logo}
                alt="St. Stephens Family"
                className="w-[100px] h-auto object-contain"
              />
            </div>

            <div>
              <p className="font-semibold">St. Stephens Family</p>
              <p className="text-sm text-gray-300">
                Secure authentication experience
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}

        <div className="bg-white md:hidden mx-auto pt-5  rounded-[50px]">
          <img
            src={Logo}
            alt="St. Stephens Family"
            className="w-[10px] h-auto object-contain"
          />
        </div>
        <div className="flex items-center justify-center p-8 md:p-12">
          {/* LOGIN */}

          {pages === "login" && (
            <div className="w-full max-w-sm">
              <h2 className="text-3xl font-bold text-gray-900">Login</h2>

              <p className="mt-2 text-gray-500">
                Enter your credentials to continue.
              </p>

              <form className="mt-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-sm text-black font-medium hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Sign In
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Don’t have an account?{" "}
                <span
                  className="text-black font-semibold cursor-pointer hover:underline"
                  onClick={() => setPages("register")}
                >
                  Register
                </span>
              </p>
            </div>
          )}

          {/* REGISTER */}
          {pages === "register" && (
            <div className="w-full max-w-sm">
              <h2 className="text-3xl font-bold text-gray-900">
                Create Account
              </h2>

              <p className="mt-2 text-gray-500">
                Join us and get started today.
              </p>

              <form className="mt-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Create password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Create Account
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <span
                  className="text-black font-semibold cursor-pointer hover:underline"
                  onClick={() => setPages("login")}
                >
                  Login
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
