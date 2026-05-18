import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/images/logo.png";
const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about-us", label: "About" },
  { to: "/services", label: "Service" }, // Matched naming convention from design image
  { to: "/contact", label: "Technology" }, // Using your path but text style matching 'Technology' in image
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <nav
      className={`fixed bg-white! top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 md:backdrop-blur-md border-stone-100 py-4 shadow-xs"
          : "md:bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* ── LOGO ── */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
                          src={Logo}
                          alt="St. Stephens Family"
                          className="w-[100px] h-auto object-contain"
                        />
        </Link>

        {/* ── DESKTOP LINKS ── */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`text-sm font-medium tracking-wide transition-colors relative pb-1 block group ${
                    isActive
                      ? "text-stone-950 font-semibold"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {/* Subtle dot under active link matching design aesthetic */}
                  <span className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="w-1 h-1 bg-stone-950 rounded-full inline-block" />
                    )}
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── ACTIONS / CTA ── */}
        <div className="flex items-center gap-4">

          {/* Hamburger Menu Button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 z-50 focus:outline-hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span
              className={`h-0.5 w-6 bg-stone-900 rounded-full transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-stone-900 rounded-full transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-stone-900 rounded-full transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU OVERLAY ── */}
      <div
        className={`fixed inset-0 top-0 bg-white z-40 flex flex-col pt-24 px-6 gap-6 transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`text-xl font-medium tracking-tight border-b border-stone-100 pb-3 ${
              location.pathname === to
                ? "text-stone-950 font-bold"
                : "text-stone-500"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
