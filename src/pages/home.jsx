import { Link } from "react-router-dom";
import Navbar from "../components/header";
import Footer from "../components/footer";

const STATS = [
  { value: "200+", label: "Families Supported" },
  { value: "40+", label: "Certified Therapists" },
  { value: "8+", label: "Years of Practice" },
  { value: "95%", label: "Satisfaction Rate" },
];

const HIGHLIGHTS = [
  {
    title: "Personalized Laboratory Examination Services",
    desc: "Our laboratory assessments focus on identifying deficiencies and metabolic markers that may impact your child's overall wellbeing and development.",
  },
  {
    title: "Personalized Laboratory Intervention Program Services",
    desc: "We certify the next generation of autism specialists through our structured training and mentorship programme.",
  },
  {
    title: "Family-Centred Care",
    desc: "Parents are partners. We guide families through every step, ensuring they feel confident and informed.",
  },
];

const SERVICES_PREVIEW = [
  { name: "Behavioural Therapy" },
  { name: "Speech & Language" },
  { name: "Occupational Therapy" },
  { name: "Assessments" },
  { name: "Parent Workshops" },
  { name: "Therapist Training" },
];

const TESTIMONIALS = [
  {
    quote:
      "St. Stephens changed our lives. Within months of starting therapy, our son began communicating in ways we never imagined.",
    name: "Adaeze O.",
    role: "Parent",
  },
  {
    quote:
      "The training programme here gave me both the clinical skills and the empathy to truly serve autistic children and their families.",
    name: "Emeka T.",
    role: "Certified Therapist",
  },
  {
    quote:
      "From the intake process to the ongoing reports, everything was so clear and compassionate. We finally felt heard.",
    name: "Ngozi & Femi A.",
    role: "Parents",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen  text-[#1A1A1A] antialiased">
      <Navbar />
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-30 pb-20 lg:pt-30 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Content */}
          <div className="lg:col-span-6 space-y-8 z-10">
            <h1 className="text-4xl lg:text-[50px] font-bold tracking-tight text-[#111] leading-[1.1]">
              Every Autistic Child Deserves a better
              <br />
              <span className="text-[#513424] font-normal italic!">
                {" "}
                treatment program to Flourish
              </span>
            </h1>

            <p className="text-[15px] text-stone-600 max-w-lg leading-relaxed">
              St. Stephens Family provides different alternatives treatment
              program designed for each specific individuals with autistic
              spectrum disorder.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/new"
                className="group px-6 py-3.5 bg-[#513424] text-white font-medium rounded-full hover:bg-[#513424] transition-all duration-200 shadow-sm text-sm inline-flex items-center gap-2"
              >
                Talk With Support Assistant
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </Link>

              <Link
                to="/request-therapist"
                className="px-6 py-3.5 border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-stone-50 transition-all duration-200 text-sm"
              >
                Request For Help
              </Link>
            </div>

            {/* Meet the Minds Behind Section */}
            {/* Meet the Minds Behind Section */}
            <div className="pt-8 border-t border-stone-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">
                Meet the Minds Behind Your Care
              </p>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-4 overflow-hidden">
                  {[
                    // Black female therapist
                    "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop",

                    // White male doctor
                    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop",

                    // Asian female practitioner
                    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",

                    // Black male medical professional
                    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
                  ].map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Therapy specialist"
                      className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-sm hover:scale-105 transition-transform duration-200"
                    />
                  ))}
                </div>

                <button className="h-10 px-4 rounded-full border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                  See all →
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Component Layout */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            {/* Main Light Green Wavy Container */}
            <div className="relative w-full max-w-[480px] aspect-[4/5] bg-[#9e9c9b]/4 rounded-[40px] rounded-tl-[140px] p-8 flex flex-col justify-between overflow-hidden shadow-sm">
              {/* Social Media Floater left edge */}
              <div className="absolute left-4 top-1/3 flex flex-col gap-3 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm z-20">
                {["fb", "tw", "ig"].map((s) => (
                  <span
                    key={s}
                    className="w-5 h-5 bg-stone-200 rounded-full block cursor-pointer hover:bg-stone-300 transition-colors"
                  />
                ))}
              </div>

              {/* Main Visual Persona Card Representation */}
              <div className="w-full h-full bg-stone-100 rounded-3xl rounded-tl-[100px] overflow-hidden relative border border-white/40 flex items-end justify-center">
                {/* Illustration / Graphic Placeholder (Simulating the doctor photo image context) */}
                <img
                  src="https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=1200&auto=format&fit=crop"
                  alt="Autism therapy specialist"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Dynamic Overlay Scatter tags matching the 'Orthopedics/Cardiology' pill layouts */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2 justify-center z-10">
                {SERVICES_PREVIEW.map((s) => (
                  <span
                    key={s.name}
                    className="px-4 py-2 bg-white/95 backdrop-blur-xs text-xs font-medium text-stone-800 rounded-full shadow-xs border border-stone-100 transform hover:scale-105 transition-transform duration-200"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US SECTION ── */}
      <section className="py-20 bg-stone-50 border-t border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-16">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                Why Choose Us?
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-stone-900">
                Because Your Special <br />
                Needs Child Deserves the Best
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-stone-600 leading-relaxed">
                We blend breakthrough strategies with compassionate care to
                deliver personalized health solutions that put your child and
                family first.
              </p>
            </div>
          </div>

          {/* Cards Interface matching layout */}
          <div className="grid md:grid-cols-3 gap-6">
            {HIGHLIGHTS.map((h, i) => (
              <div
                key={h.title}
                className={`p-10 rounded-[32px] transition-all duration-300 flex flex-col justify-between min-h-[280px] ${
                  i === 1
                    ? "bg-[#C5FF4D] text-stone-950 shadow-md transform -translate-y-1"
                    : "bg-white text-stone-800 border border-stone-100 hover:border-stone-200"
                }`}
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-bold tracking-tight">
                    {h.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${i === 1 ? "text-stone-800" : "text-stone-500"}`}
                  >
                    {h.desc}
                  </p>
                </div>
                <div className="pt-6 flex justify-between items-center">
                  <Link
                    to="/services"
                    className="text-xs font-bold uppercase tracking-wider group flex items-center gap-1"
                  >
                    Learn More
                    <span className="transform group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </Link>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${i === 1 ? "bg-black text-white" : "bg-stone-100 text-stone-600"}`}
                  >
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS COUNTER GRID ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 bg-stone-50 rounded-[32px] p-10 border border-stone-100">
            {STATS.map((s) => (
              <div key={s.label} className="text-center space-y-1">
                <p className="text-4xl lg:text-5xl font-bold tracking-tight text-stone-900">
                  {s.value}
                </p>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS SECTION ── */}
      <section className="relative py-24 bg-gradient-to-b from-white to-[#eff1ef] overflow-hidden">
        {/* subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C5FF4D]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 shadow-sm">
              Our Process
            </span>

            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
              Simple Steps to
              <span className="block text-[#513424]">
                Get the Right Support
              </span>
            </h2>

            <p className="text-[#513424] text-base leading-relaxed">
              We make therapy access straightforward, from your first request to
              continuous care and progress tracking.
            </p>
          </div>

          {/* Steps */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                title: "Submit a Request",
                desc: "Fill out a quick intake form with your child’s needs, goals, and support concerns.",
              },
              {
                n: "02",
                title: "We Review & Match",
                desc: "Our specialists review your submission and pair you with the best-fit therapist.",
              },
              {
                n: "03",
                title: "Assessment & Planning",
                desc: "Your therapist performs an evaluation and creates a personalized care plan.",
              },
              {
                n: "04",
                title: "Ongoing Therapy",
                desc: "Receive consistent sessions, progress updates, and long-term family support.",
              },
            ].map((step, i) => (
              <div
                key={step.n}
                className="group relative rounded-3xl border border-stone-200 bg-white/80 backdrop-blur-sm p-7  hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* top line connector */}
                {i !== 3 && (
                  <div className="hidden lg:block absolute top-12 left-full w-6 h-px bg-stone-200" />
                )}

                {/* step number */}
                <div className="flex items-center justify-between mb-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-[#C5FF4D] font-bold text-sm shadow-md">
                    {step.n}
                  </span>

                  <span className="text-xs uppercase tracking-widest text-stone-300 font-semibold">
                    Step
                  </span>
                </div>

                {/* content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold tracking-tight text-stone-900">
                    {step.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-stone-500">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COHORT / TRAINING CALLOUT ── */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-stone-900 text-white rounded-[40px] p-8 lg:p-16 grid lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
            <div className="lg:col-span-8 space-y-4 relative z-10">
              <span className="inline-block px-3 py-1 bg-white/10 text-xs font-medium tracking-wide rounded-full text-[#C5FF4D]">
                For Professionals
              </span>
              <h2 className="text-[24px] lg:text-4xl font-bold tracking-tight">
                Want to Become a Certified Autism Therapist?
              </h2>
              <p className="text-stone-400 text-sm max-w-2xl leading-relaxed">
                Our therapist training programme is built on real clinical
                practice. Join a cohort of passionate professionals and earn
                your certification under the mentorship of our expert team.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right relative z-10">
              <Link
                to="/services#training"
                className="inline-block px-6 py-3.5 bg-[#C5FF4D] text-black font-semibold rounded-full hover:bg-[#b5f03d] transition-colors text-sm"
              >
                Explore Training Programme →
              </Link>
            </div>
            {/* Soft decorative ambient glow */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#C5FF4D]/10 rounded-full filter blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="py-20 bg-stone-50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Stories
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Words from Families & Therapists
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-xs flex flex-col justify-between"
              >
                <p className="text-stone-600 text-sm leading-relaxed italic">
                  "{t.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-stone-50">
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center font-bold text-xs text-stone-400">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-stone-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CONVERSION BANNER ── */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-stone-900">
            Ready to Take the First Step?
          </h2>
          <p className="text-stone-500 max-w-lg mx-auto text-sm leading-relaxed">
            Whether you're a parent seeking support or a professional looking to
            grow, we're here for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/request"
              className="px-6 py-3.5 bg-[#513424] text-white font-medium rounded-full hover:bg-[#513424] transition-colors text-sm"
            >
              Request a Therapist
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3.5 border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-stone-50 transition-colors text-sm"
            >
              Talk to Us First
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
