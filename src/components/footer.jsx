import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Logo from "../assets/images/logo.png";

const Footer = () => {
  return (
    <footer className=" border-stone-200 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top CTA */}
        <div className="bg-[#d0aa75] rounded-[32px] p-8 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-white mb-3">
              Compassionate Autism Support
            </p>

            <h2 className="text-[24px] lg:text-5xl font-bold text-[#513424] leading-tight">
              Helping Children Grow,
              <br />
              Learn & Flourish.
            </h2>
          </div>

          <Link
            to="/request"
            className="group inline-flex items-center gap-2 bg-white text-black px-6 py-4 rounded-full text-sm font-medium hover:opacity-90 transition-all"
          >
            Schedule Consultation
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* Main Footer */}
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <img
                src={Logo}
                alt="St. Stephens Family"
                className="w-[200px] h-auto object-contain"
              />            
            </div>

            <p className="text-stone-600 leading-relaxed max-w-md text-sm">
              Providing evidence-based autism therapy, developmental support,
              and therapist training programs designed to help every child
              thrive in a nurturing environment.
            </p>

            {/* Socials */}
           {/* Socials */}
<div className="flex items-center gap-3 mt-6">
  {[
    {
      href: "#",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[18px] h-[18px]"
        >
          <path d="M22 12.07C22 6.477 17.523 2 12 2S2 6.477 2 12.07c0 5.017 3.657 9.178 8.438 9.93v-7.03H7.898v-2.9h2.54V9.845c0-2.522 1.492-3.916 3.777-3.916 1.095 0 2.24.198 2.24.198v2.476h-1.262c-1.243 0-1.63.776-1.63 1.57v1.886h2.773l-.443 2.9h-2.33V22c4.78-.752 8.437-4.913 8.437-9.93z" />
        </svg>
      ),
    },
    {
      href: "#",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[18px] h-[18px]"
        >
          <path d="M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 1.8h8.5a3.95 3.95 0 013.95 3.95v8.5a3.95 3.95 0 01-3.95 3.95h-8.5a3.95 3.95 0 01-3.95-3.95v-8.5A3.95 3.95 0 017.75 3.8zm8.9 1.35a.9.9 0 100 1.8.9.9 0 000-1.8zM12 7a5 5 0 100 10 5 5 0 000-10zm0 1.8A3.2 3.2 0 1112 15.2 3.2 3.2 0 0112 8.8z" />
        </svg>
      ),
    },
    {
      href: "#",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[18px] h-[18px]"
        >
          <path d="M6.94 6.5A1.44 1.44 0 115.5 5.06 1.44 1.44 0 016.94 6.5zM6.75 8.09H4.25V20h2.5zm4 0h-2.48V20h2.48v-6.27c0-3.48 4.5-3.77 4.5 0V20h2.5v-7.14c0-5.55-6.34-5.34-7 0z" />
        </svg>
      ),
    },
  ].map((social, i) => (
    <a
      key={i}
      href={social.href}
      className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-800 hover:bg-stone-100 transition-colors"
    >
      {social.icon}
    </a>
  ))}
</div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-5">
              Navigation
            </h4>

            <div className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "About", path: "/about" },
                { name: "Services", path: "/services" },
                { name: "Programs", path: "/programs" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block text-sm text-stone-600 hover:text-black transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-5">
              Services
            </h4>

            <div className="space-y-3">
              {[
                "Autism Therapy",
                "Behavioral Support",
                "Speech Development",
                "Parent Coaching",
                "Therapist Training",
              ].map((service) => (
                <p
                  key={service}
                  className="text-sm text-stone-600"
                >
                  {service}
                </p>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-5">
              Contact
            </h4>

            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin
                  size={18}
                  className="text-stone-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-sm text-stone-600 leading-relaxed">
                  24 Wellness Avenue,
                  <br />
                  Lagos, Nigeria
                </p>
              </div>

              <div className="flex gap-3">
                <Phone
                  size={18}
                  className="text-stone-500 flex-shrink-0"
                />
                <a
                  href="tel:+2348000000000"
                  className="text-sm text-stone-600 hover:text-black transition-colors"
                >
                  +234 800 000 0000
                </a>
              </div>

              <div className="flex gap-3">
                <Mail
                  size={18}
                  className="text-stone-500 flex-shrink-0"
                />
                <a
                  href="mailto:hello@ststephensfamily.com"
                  className="text-sm text-stone-600 hover:text-black transition-colors"
                >
                  hello@ststephensfamily.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-stone-200 mt-14 pt-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} St. Stephens Family. All rights
            reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-sm text-stone-500 hover:text-black transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="text-sm text-stone-500 hover:text-black transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;