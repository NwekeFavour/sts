import { Link } from "react-router-dom";
import Navbar from "../components/header";
import Footer from "../components/footer";

// ─── The St Stephens patient journey ─────────────────────────────────────────
// Steps are sequenced exactly as described by the client.
// Anything not handled by St Stephens (labs, external tests) is framed
// as "optional / your choice" rather than a St Stephens service.

const STEPS = [
  {
    number: "01",
    phase: "First Contact",
    title: "Talk to Stephanie",
    duration: "Anytime",
    desc: "Start by chatting with Stephanie, our support assistant, on the website. She can answer general questions about our services, how we work, and what to expect. Stephanie is available any time, no appointment needed.",
    note: null,
    cta: { label: "Chat with Stephanie", to: "/new" },
    accent: "#F5F0EB",
    tag: "Free · No commitment",
  },
  {
    number: "02",
    phase: "Request Support",
    title: "Submit a Help Request",
    duration: "5–10 mins",
    desc: "When you're ready to speak with a therapist, fill in the Request Help form. You'll share some basic information about your child and upload a short video, this helps our team understand your child's needs before your first session.",
    note: "A short video of your child helps our therapists prepare a more personalised initial review.",
    cta: { label: "Request Help", to: "/request-therapist" },
    accent: "#EFF5F0",
    tag: "Video of child required",
  },
  {
    number: "03",
    phase: "Initial Review",
    title: "Therapist Reviews Your Request",
    duration: "1–3 business days",
    desc: "One of our qualified therapists will carefully review your submission. After their assessment, you will receive an appreciation email with their initial observations and, where relevant, suggestions for external tests or lab work that may help build a clearer picture.",
    note: "Any suggested tests (e.g. developmental screening, blood work) are entirely your choice. They are not mandatory and are not conducted by St Stephens, we simply guide you on what may be helpful.",
    cta: null,
    accent: "#F5F0EB",
    tag: "External tests are optional",
  },
  {
    number: "04",
    phase: "Upload Results",
    title: "Share Lab Results (If Applicable)",
    duration: "When ready",
    desc: "If you chose to run any tests, the email from your therapist will include a secure upload link. You can return at any time to upload the results so your therapist has the full picture before your programme begins.",
    note: "The upload link is included in the therapist's email, you do not need to log in separately to find it.",
    cta: null,
    accent: "#EFF5F0",
    tag: "Optional step",
  },
  {
    number: "05",
    phase: "Programme Offer",
    title: "Your Personalised Programme",
    duration: "Presented after review",
    desc: "Once the review is complete, we will present your child's personalised care programme. This is a structured 3-month engagement where a dedicated therapist works closely with your child, covering behaviour, communication, diet guidance, daily routines, and structured development milestones.",
    note: "The 3-month programme includes direct sessions with your child, parent coaching, and regular progress reports.",
    cta: null,
    accent: "#F5F0EB",
    tag: "3-month commitment",
  },
  {
    number: "06",
    phase: "Payment",
    title: "Manual Bank Transfer",
    duration: "Before programme starts",
    desc: "We do not use an online payment gateway. Payment is made manually via direct bank transfer. Once you're ready to proceed, visit our payment page to see our bank details, complete your transfer, and upload your payment receipt. Your programme begins once payment is confirmed.",
    note: "Upload your bank receipt on the payment page, your therapist will be notified automatically once verified.",
    cta: { label: "View Payment Details", to: "/payment" },
    accent: "#EFF5F0",
    tag: "Bank transfer only",
  },
  {
    number: "07",
    phase: "Active Programme",
    title: "3 Months With Your Child",
    duration: "12 weeks",
    desc: "Your dedicated therapist is now fully engaged with your child. Over three months, sessions focus on behavioural therapy, communication development, diet and routine support, and family coaching. You will receive regular written progress reports throughout.",
    note: null,
    cta: null,
    accent: "#F5F0EB",
    tag: "Dedicated therapist · Weekly sessions",
  },
];

export default function OurProcess() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] antialiased">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1A1A1A] text-white">
        <img
          src="https://plus.unsplash.com/premium_photo-1721861983118-68ef35bea3f2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Family therapy session"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-28 lg:py-40">
          <div className="max-w-2xl">
            <p className="uppercase tracking-[0.3em] text-xs text-stone-400 mb-6 font-medium">
              How We Work
            </p>
            <h1 className="text-4xl lg:text-[54px] font-bold leading-[1.1] tracking-tight">
              From First Question{" "}
              <span className="italic font-normal text-[#C8A97E]">
                to Full Programme
              </span>
            </h1>
            <p className="mt-6 text-[15px] text-stone-300 max-w-xl leading-relaxed">
              Here is exactly what happens when you reach out to St Stephens,
              step by step, with no surprises. You move at your own pace and
              nothing is mandatory until you decide you're ready.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to="/new"
                className="px-6 py-3.5 bg-[#E48E15] text-white font-medium rounded-full hover:bg-[#E48E15] transition-all text-sm inline-flex items-center gap-2"
              >
                Start with Stephanie
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </Link>
              <Link
                to="/request-therapist"
                className="px-6 py-3.5 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-all text-sm"
              >
                Request Help Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW STRIP ────────────────────────────────────────────────── */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap gap-x-10 gap-y-3 items-center justify-between">
          <p className="text-sm text-stone-500 font-medium">
            The journey at a glance:
          </p>
          <div className="flex flex-wrap gap-3">
            {STEPS.map((s) => (
              <span
                key={s.number}
                className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 bg-stone-50 border border-stone-200 rounded-full px-3 py-1.5"
              >
                <span className="w-4 h-4 rounded-full bg-[#513424] text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                  {s.number}
                </span>
                {s.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 items-stretch">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="group relative bg-white rounded-3xl border border-stone-200 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                {/* Number */}
                <div
                  className="absolute -top-5 left-8 w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-md"
                  style={{ background: step.accent }}
                >
                  {step.number}
                </div>

                {/* Content */}
                <div className="pt-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#513424] font-semibold">
                      {step.phase}
                    </span>

                    <span className="text-xs text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                      {step.duration}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-stone-900 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-stone-600 text-[14px] leading-relaxed">
                    {step.desc}
                  </p>

                  {step.tag && (
                    <div className="mt-5">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#513424]/10 text-[#513424]">
                        {step.tag}
                      </span>
                    </div>
                  )}

                  {step.note && (
                    <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-100 p-4">
                      <p className="text-sm text-amber-800">{step.note}</p>
                    </div>
                  )}
                </div>
                {step.cta && (
                  <Link
                    to={step.cta.to}
                    className="mt-6 inline-flex items-center gap-2 font-medium text-[#513424] hover:gap-3 transition-all"
                  >
                    {step.cta.label}
                    <span>→</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAYMENT CALLOUT ───────────────────────────────────────────────── */}
      <section className="py-16 bg-stone-50 border-t border-stone-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-[#E48E15] rounded-[32px] p-8 lg:p-12 grid lg:grid-cols-2 gap-8 items-end overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#C8A97E]/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <p className="text-xs uppercase tracking-widest text-stone-900 font-semibold">
                Payment
              </p>
              <h3 className="text-2xl lg:text-3xl font-bold text-black leading-tight">
                We don't offer online payments. Please ignore any information
                stating otherwise.
              </h3>
              <p className="text-stone-100 text-sm leading-relaxed">
                Payment is made by direct bank transfer. Visit the payment page,
                view our account details, complete the transfer, then upload
                your receipt. Your programme will begin once payment is
                verified.
              </p>
            </div>
            <div className="relative z-10 lg:text-right space-y-3">
              <Link
                to="/payment"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#000] text-[#fff] font-semibold rounded-full text-sm hover:opacity-90 transition-all"
              >
                View Bank Details →
              </Link>
              <p className="text-stone-100 text-xs">
                Upload your receipt after transferring
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ STRIP ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-stone-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-stone-900 mb-8">
            Common questions
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                q: "Do I need a referral to contact St Stephens?",
                a: "No referral is needed. You can chat with Stephanie or fill in the help request form directly.",
              },
              {
                q: "Is the video of my child mandatory?",
                a: "Yes, a short video is required as part of the help request. It allows our therapists to better understand your child's needs before the initial review.",
              },
              {
                q: "Are the suggested tests conducted by St Stephens?",
                a: "No. Any suggested tests are external (e.g. lab work or developmental screenings). They are optional and entirely your choice. St Stephens does not conduct or arrange these tests.",
              },
              {
                q: "How do I upload lab results?",
                a: "A secure upload link is included in the appreciation email sent by your therapist after their initial review. You do not need a separate account to use it.",
              },
              {
                q: "What does the 3-month programme include?",
                a: "A dedicated therapist works directly with your child, covering behavioural therapy, communication development, diet and routine guidance, and regular sessions with you as a parent.",
              },
              {
                q: "How do I pay?",
                a: "Payment is by direct bank transfer only. Visit the payment page for our account details, make your transfer, and upload your receipt. We will confirm once verified.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-2"
              >
                <p className="text-sm font-semibold text-stone-900">{q}</p>
                <p className="text-sm text-stone-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#513424]">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
            Ready to take the first step?
          </h2>
          <p className="text-stone-300 text-sm leading-relaxed max-w-lg mx-auto">
            Start with a free conversation with Stephanie, or fill in the help
            request form when you're ready. There's no obligation until you
            choose to proceed.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/new"
              className="px-6 py-3.5 bg-white text-[#513424] font-semibold rounded-full text-sm hover:bg-stone-100 transition-all inline-flex items-center gap-2"
            >
              Talk to Stephanie
              <span className="w-2 h-2 rounded-full bg-[#513424] animate-pulse" />
            </Link>
            <Link
              to="/request-therapist"
              className="px-6 py-3.5 border border-white/30 text-white font-medium rounded-full text-sm hover:bg-white/10 transition-all"
            >
              Request Help →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
