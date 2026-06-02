import { Link } from "react-router-dom";
import Navbar from "../components/header";
import Footer from "../components/footer";

const SERVICES = [
  {
    number: "01",
    title: "Behavioural Therapy",
    tag: "Core Programme",
    desc: "We work directly with your child to develop positive behaviours, emotional regulation, and greater independence, using structured, evidence-based methods tailored to each child's needs and pace.",
    what: ["Applied Behaviour Analysis (ABA)", "Emotional regulation strategies", "Routine and structure building", "Independence skills"],
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop",
    dark: false,
  },
  {
    number: "02",
    title: "Speech & Language Therapy",
    tag: "Communication",
    desc: "Supporting children who struggle with verbal or non-verbal communication, helping them express themselves clearly, understand others, and grow their confidence in social interactions.",
    what: ["Verbal and non-verbal communication", "Language development", "Articulation and clarity", "Social communication skills"],
    image: "https://images.unsplash.com/photo-1518200925927-aa63b1e57a84?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    dark: true,
  },
  {
    number: "03",
    title: "Occupational Therapy",
    tag: "Daily Living",
    desc: "Helping children build the sensory, motor, and coordination skills they need for everyday life, from dressing and eating independently to participating fully in school and home routines.",
    what: ["Sensory processing support", "Fine and gross motor skills", "Coordination development", "Daily independence skills"],
    image: "https://images.unsplash.com/photo-1547496613-4e19af6736dc?q=80&w=1200&h=900&auto=format&fit=crop",
    dark: false,
  },
  {
    number: "04",
    title: "Parent Coaching",
    tag: "Family Support",
    desc: "You are your child's most important environment. We equip parents with practical, specific strategies to support their child's development at home, covering behaviour, communication, diet, and daily routines.",
    what: ["Behaviour management strategies", "Diet and routine guidance", "Communication support at home", "Ongoing check-ins throughout the programme"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    dark: true,
  },
];

const PROGRAMME = {
  title: "The 3-Month Programme",
  subtitle: "Everything above, working together",
  desc: "When you enrol in the full programme, your child receives a dedicated therapist for three months. Sessions cover behaviour, communication, occupational skills, and diet, while you receive ongoing parent coaching throughout. A structured, comprehensive approach built around your child specifically.",
  includes: [
    "Dedicated therapist assigned to your child",
    "Weekly one-on-one therapy sessions",
    "Behavioural, speech, and occupational support",
    "Diet and routine guidance",
    "Parent coaching throughout",
    "Written progress reports",
  ],
};

const BENEFITS = [
  "Personalised Care Plans",
  "Evidence-Based Methods",
  "Certified Specialists",
  "Family-Centred Support",
];

export default function Services() {
  return (
    <main className="min-h-screen text-[#1A1A1A] antialiased">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#1A1A1A] text-white">
        <img
          src="https://plus.unsplash.com/premium_photo-1745839716056-7dc088097cc5?q=80&w=1200&auto=format&fit=crop"
          alt="Child in therapy session"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-28 lg:py-40">
          <div className="max-w-2xl">
            <p className="uppercase tracking-[0.3em] text-xs text-stone-400 mb-6 font-medium">
              Our Services
            </p>
            <h1 className="text-4xl lg:text-[54px] font-bold leading-[1.1] tracking-tight">
              Therapy Built Around{" "}
              <span className="italic font-normal text-[#C8A97E]">Your Child</span>
            </h1>
            <p className="mt-6 text-[15px] text-stone-300 max-w-xl leading-relaxed">
              Every service we offer is part of a joined-up approach, designed
              to support your child's behaviour, communication, independence, and
              your family's confidence at home.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to="/request-therapist"
                className="px-6 py-3.5 bg-[#513424] text-white font-medium rounded-full hover:bg-[#6B4530] transition-all text-sm inline-flex items-center gap-2"
              >
                Request Support
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </Link>
              <Link
                to="/how-it-works"
                className="px-6 py-3.5 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-all text-sm"
              >
                See How It Works →
              </Link>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-2 mt-10">
              {BENEFITS.map((b) => (
                <span key={b} className="px-4 py-1.5 bg-white/10 border border-white/20 text-xs font-medium text-stone-200 rounded-full">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE OFFER INTRO ── */}
      <section className="py-16 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">What We Offer</p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-stone-900">
              Four Core Services,
              <span className="block text-[#513424]">One Joined-Up Approach</span>
            </h2>
          </div>
          <p className="text-stone-500 max-w-md leading-relaxed text-sm">
            These are the four areas we work in. Every programme combines them
            based on what your child actually needs, nothing is one-size-fits-all.
          </p>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="py-16 bg-stone-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className={`group overflow-hidden rounded-[32px] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  service.dark
                    ? "bg-[#513424] border-[#513424] text-white"
                    : "bg-white border-stone-200 text-[#1A1A1A]"
                }`}
              >
                <div className="grid md:grid-cols-2 h-full">
                  {/* Image */}
                  <div className="relative overflow-hidden min-h-[300px]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-5 left-5 flex flex-col gap-2">
                      <div className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-sm font-bold text-stone-900 shadow-md">
                        {service.number}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        service.dark ? "bg-white/20 text-white" : "bg-[#513424]/90 text-white"
                      }`}>
                        {service.tag}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 flex flex-col justify-between gap-5">
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold tracking-tight leading-snug">{service.title}</h3>
                      <p className={`text-sm leading-relaxed ${service.dark ? "text-stone-300" : "text-stone-600"}`}>
                        {service.desc}
                      </p>
                    </div>

                    <ul className="space-y-1.5">
                      {service.what.map((w) => (
                        <li key={w} className="flex items-start gap-2 text-xs">
                          <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${service.dark ? "bg-[#C8A97E]" : "bg-[#513424]"}`} />
                          <span className={service.dark ? "text-stone-300" : "text-stone-600"}>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-MONTH PROGRAMME HIGHLIGHT ── */}
      <section className="py-20 bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-[#1A1A1A] rounded-[36px] overflow-hidden grid lg:grid-cols-2">
            {/* Left */}
            <div className="p-10 lg:p-12 space-y-6 relative">
              <div className="absolute top-0 left-0 w-48 h-48 bg-[#C8A97E]/10 blur-3xl rounded-full pointer-events-none" />
              <div className="relative z-10 space-y-5">
                <span className="inline-flex rounded-full bg-[#C8A97E]/15 border border-[#C8A97E]/30 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[#C8A97E]">
                  Flagship Offering
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
                  {PROGRAMME.title}
                </h2>
                <p className="text-sm text-stone-400 leading-relaxed">{PROGRAMME.desc}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to="/how-it-works"
                    className="px-5 py-2.5 bg-[#C8A97E] text-[#1A1A1A] font-semibold rounded-full text-sm hover:opacity-90 transition-all"
                  >
                    See How It Works →
                  </Link>
                  <Link
                    to="/request-therapist"
                    className="px-5 py-2.5 border border-white/20 text-white rounded-full text-sm hover:bg-white/10 transition-all"
                  >
                    Request Support
                  </Link>
                </div>
              </div>
            </div>

            {/* Right, includes list */}
            <div className="bg-[#242424] p-10 lg:p-12 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-5">
                What's included
              </p>
              {PROGRAMME.includes.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#513424] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-stone-300 leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS CTA ── */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Not sure where to start?</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
            Start with a free conversation.
            <span className="block text-[#513424] italic font-normal">No commitment required.</span>
          </h2>
          <p className="text-stone-500 text-sm max-w-lg mx-auto leading-relaxed">
            Chat with Stella, our support assistant, to ask questions about
            our services. When you're ready, submit a help request and a
            therapist will review your child's needs personally.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/chat"
              className="px-6 py-3.5 bg-[#513424] text-white font-medium rounded-full text-sm hover:bg-[#6B4530] transition-all inline-flex items-center gap-2"
            >
              Talk to Stella
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </Link>
            <Link
              to="/how-it-works"
              className="px-6 py-3.5 border border-stone-300 text-stone-700 font-medium rounded-full text-sm hover:bg-stone-100 transition-all"
            >
              See the full process →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}