// src/pages/NotFound.jsx
import { Link } from 'react-router-dom'
import { ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#111111] via-[#1A1A1A] to-[#222222] flex items-center justify-center px-6 py-20 relative overflow-hidden">
      
      {/* Glow background */}
      <div className="absolute top-[-120px] left-[-120px] w-[300px] h-[300px] bg-[#E8890C]/20 blur-3xl rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-orange-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-2xl text-center">
        
        {/* 404 */}
        <h1 className="text-[120px] sm:text-[160px] font-black leading-none text-white tracking-[-8px]">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-4 text-3xl sm:text-5xl font-bold text-white leading-tight">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mt-6 text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          The page you are looking for might have been removed, renamed,
          or is temporarily unavailable.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#E8890C] hover:bg-[#d97f0a] text-white px-7 py-3.5 rounded-full font-semibold transition-all duration-300 hover:scale-105"
          >
            <Home size={18} />
            Back Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white px-7 py-3.5 rounded-full font-semibold transition-all duration-300"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Optional quick links */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="text-gray-400 text-sm mb-4">
            You may want to visit:
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'About Us', path: '/about-us' },
              { label: 'Programs', path: '/programs' },
              { label: 'Contact', path: '/contact' },
              { label: 'Donate', path: '/donate' },
            ].map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-[#E8890C] hover:border-[#E8890C] hover:text-white transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}