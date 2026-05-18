import { Link } from "react-router-dom";
import Navbar from "../components/header";
import Footer from "../components/footer";

const SERVICES = [
  {
    number: "01",
    title: "Behavioural Therapy",
    desc: "Helping children develop positive behaviours, communication skills, emotional regulation, and independence through evidence-based interventions.",
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop",
  },
  {
    number: "02",
    title: "Speech & Language Therapy",
    desc: "Supporting verbal and non-verbal communication, language development, articulation, and social interaction skills.",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1200&auto=format&fit=crop",
  },
{
  number: "03",
  title: "Occupational Therapy",
  desc: "Helping children build sensory, motor, coordination, and daily living skills needed for everyday independence.",
  image:
    "https://images.unsplash.com/photo-1547496613-4e19af6736dc?q=80&w=1200&h=900&auto=format&fit=crop",
},
  {
    number: "04",
    title: "Assessments & Evaluations",
    desc: "Comprehensive developmental and behavioural assessments designed to identify needs and guide personalized care planning.",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop",
  },
  {
    number: "05",
    title: "Parent Coaching",
    desc: "Equipping parents with practical strategies, guidance, and confidence to support their child’s development at home.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    number: "06",
    title: "Therapist Training",
    desc: "Professional autism therapy certification programmes built around practical clinical mentorship and hands-on learning.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
  },
];

const BENEFITS = [
  "Personalized Care Plans",
  "Evidence-Based Methods",
  "Certified Specialists",
  "Family-Centred Support",
];

export default function Services() {
  return (
    <main className="min-h-screen bg-white text-[#1A1A1A] antialiased">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-28 pb-24">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5FF4D]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-14 items-center relative z-10">
          {/* Left */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-5">
              <span className="inline-flex items-center rounded-full border border-stone-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 bg-white shadow-sm">
                Our Services
              </span>

              <h1 className="text-4xl lg:text-[68px] font-bold tracking-tight leading-[1.05] text-stone-900">
                Therapy &
                <span className="block text-[#513424] italic font-normal">
                  Support Designed
                </span>
                Around Every Child
              </h1>

              <p className="text-stone-600 text-lg leading-relaxed max-w-xl">
                We provide specialized autism therapy services that empower
                children, support families, and create meaningful developmental
                progress through compassionate care.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/request-therapist"
                className="px-6 py-3.5 bg-[#513424] text-white rounded-full text-sm font-medium hover:opacity-95 transition-all"
              >
                Request Support →
              </Link>

              <Link
                to="/contact"
                className="px-6 py-3.5 border border-stone-200 rounded-full text-sm font-medium text-stone-700 hover:bg-stone-50 transition-all"
              >
                Speak With Our Team
              </Link>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {BENEFITS.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-2xl px-4 py-4"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C5FF4D]" />
                  <p className="text-sm font-medium text-stone-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-6">
            <div className="relative bg-[#EEF8E8] rounded-[40px] rounded-tr-[140px] p-6 overflow-hidden">
         <img
  src="https://plus.unsplash.com/premium_photo-1745839716056-7dc088097cc5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  alt="African child in therapy support session"
  className="w-full h-[620px] object-cover object-center rounded-[32px] rounded-tr-[120px]"
/>

              {/* floating cards */}
              <div className="absolute top-10 left-10 bg-white rounded-2xl p-4 shadow-xl border border-stone-100">
                <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">
                  Sessions
                </p>
                <h3 className="text-2xl font-bold text-stone-900">1-on-1</h3>
              </div>

              <div className="absolute bottom-10 right-10 bg-stone-900 text-white rounded-2xl p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">
                  Care Focus
                </p>

                <div className="space-y-2 text-sm">
                  <p>• Communication</p>
                  <p>• Behaviour</p>
                  <p>• Social Skills</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="py-24 bg-stone-50 border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">
                What We Offer
              </p>

              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-stone-900">
                Comprehensive Autism
                <span className="block text-[#513424]">
                  Therapy Services
                </span>
              </h2>
            </div>

            <p className="text-stone-600 max-w-lg leading-relaxed">
              Every programme is built around developmental goals, evidence-based
              therapy methods, and continuous collaboration with families.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {SERVICES.map((service, i) => (
              <div
                key={service.title}
                className={`group overflow-hidden rounded-[36px] border transition-all duration-300 ${
                  i % 2 === 0
                    ? "bg-white border-stone-200"
                    : "bg-[#513424] border-[#513424] text-white"
                }`}
              >
                <div className="grid md:grid-cols-2 h-full">
                  {/* image */}
                  <div className="relative overflow-hidden min-h-[320px]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    <div className="absolute top-5 left-5 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-sm font-bold text-stone-900 shadow-md">
                      {service.number}
                    </div>
                  </div>

                  {/* content */}
                  <div className="p-8 flex flex-col justify-between">
                    <div className="space-y-5">
                      <h3 className="text-2xl font-bold tracking-tight">
                        {service.title}
                      </h3>

                      <p
                        className={`text-sm leading-relaxed ${
                          i % 2 === 0
                            ? "text-stone-600"
                            : "text-stone-300"
                        }`}
                      >
                        {service.desc}
                      </p>
                    </div>

                    <div className="pt-8">
                      <Link
                        to="/contact"
                        className={`inline-flex items-center gap-2 text-sm font-semibold ${
                          i % 2 === 0
                            ? "text-stone-900"
                            : "text-[#C5FF4D]"
                        }`}
                      >
                        Learn More
                        <span className="group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUPPORT STRIP ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-stone-900 rounded-[40px] p-10 lg:p-16 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-72 h-72 bg-[#C5FF4D]/10 rounded-full blur-3xl" />

            <div className="relative z-10 grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-8 space-y-5">
                <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[#C5FF4D]">
                  Need Guidance?
                </span>

                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  We’re Here to Help You
                  <span className="block">Find the Right Care</span>
                </h2>

                <p className="text-stone-400 max-w-2xl leading-relaxed">
                  Whether you’re seeking assessments, therapy sessions, or
                  professional training, our team is ready to guide you toward
                  the best next step.
                </p>
              </div>

              <div className="lg:col-span-4 lg:text-right">
                <Link
                  to="/request-therapist"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#C5FF4D] text-black text-sm font-semibold hover:scale-[1.02] transition-transform"
                >
                  Book Consultation →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}