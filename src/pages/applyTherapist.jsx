import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/header";
import Footer from "../components/footer";
import useAuthStore from "../store/useAuthStore";

// ─── Question sets per level ───────────────────────────────────────────────────

const BEGINNER_QUESTIONS = [
  {
    name: "schoolBackground",
    label: "Where did you study?",
    type: "text",
    placeholder: "e.g. University of Lagos, Dept. of Psychology",
    required: true,
  },
  {
    name: "courseStudied",
    label: "What course or programme did you study?",
    type: "text",
    placeholder: "e.g. Psychology, Education, Nursing",
    required: true,
  },
  {
    name: "comfortWithSpectrum",
    label: "How comfortable are you working around children on the autism spectrum?",
    type: "textarea",
    placeholder: "Describe your experience or feelings — be honest, there are no wrong answers.",
    required: true,
  },
  {
    name: "irritationOrFrustration",
    label: "Have you ever felt irritated or frustrated around children with behavioural differences? How did you handle it?",
    type: "textarea",
    placeholder: "Be candid — this helps us understand your self-awareness.",
    required: true,
  },
  {
    name: "whyTherapy",
    label: "What draws you to autism therapy as a career?",
    type: "textarea",
    placeholder: "Tell us what motivates you.",
    required: true,
  },
  {
    name: "specialization",
    label: "Area of interest (optional)",
    type: "text",
    placeholder: "e.g. ABA, speech support, occupational therapy",
    required: false,
  },
];

const INTERMEDIATE_QUESTIONS = [
  {
    name: "schoolBackground",
    label: "Where did you study?",
    type: "text",
    placeholder: "e.g. University of Ibadan, Covenant University",
    required: true,
  },
  {
    name: "courseStudied",
    label: "Degree / qualification obtained",
    type: "text",
    placeholder: "e.g. B.Sc. Psychology, Diploma in Special Education",
    required: true,
  },
  {
    name: "yearsOfExperience",
    label: "How many years of relevant experience do you have?",
    type: "text",
    placeholder: "e.g. 2 years working with children in a school setting",
    required: true,
  },
  {
    name: "comfortWithSpectrum",
    label: "How would you describe your approach when working with autistic children?",
    type: "textarea",
    placeholder: "Give a specific example if you can.",
    required: true,
  },
  {
    name: "irritationOrFrustration",
    label: "Have you experienced frustration in this kind of work, and how did you manage it?",
    type: "textarea",
    placeholder: "Honest reflection is valued here.",
    required: true,
  },
  {
    name: "specialization",
    label: "Specialization area",
    type: "text",
    placeholder: "e.g. Behavioural therapy, speech, OT",
    required: true,
  },
  {
    name: "resumeLink",
    label: "Resume link (Google Drive)",
    type: "url",
    placeholder: "https://drive.google.com/file/d/...",
    required: true,
    hint: "Upload your CV to Google Drive, set access to 'Anyone with the link can view', then paste the link here.",
  },
];

const EXPERT_QUESTIONS = [
  {
    name: "schoolBackground",
    label: "Where did you obtain your primary qualification?",
    type: "text",
    placeholder: "Institution name",
    required: true,
  },
  {
    name: "degreeLevel",
    label: "Highest degree obtained",
    type: "text",
    placeholder: "e.g. M.Sc. Applied Behaviour Analysis, PhD Psychology",
    required: true,
  },
  {
    name: "licenseNumber",
    label: "Professional licence or certification number",
    type: "text",
    placeholder: "e.g. BCBA #12345, COREN / MDCN number",
    required: true,
  },
  {
    name: "yearsOfExperience",
    label: "Years of clinical / professional experience",
    type: "text",
    placeholder: "e.g. 8 years, 3 in senior roles",
    required: true,
  },
  {
    name: "specialization",
    label: "Primary specialization",
    type: "text",
    placeholder: "e.g. ABA, CBT, Speech & Language, Occupational Therapy",
    required: true,
  },
  {
    name: "approachPhilosophy",
    label: "Briefly describe your clinical approach or philosophy",
    type: "textarea",
    placeholder: "How do you frame your work with autistic individuals and their families?",
    required: true,
  },
  {
    name: "resumeLink",
    label: "Resume / CV link (Google Drive)",
    type: "url",
    placeholder: "https://drive.google.com/file/d/...",
    required: true,
    hint: "Upload your CV to Google Drive, set access to 'Anyone with the link can view', then paste the link here.",
  },
];

const LEVEL_META = {
  beginner: {
    label: "Beginner",
    tag: "New to the field",
    desc: "Less than 1 year of experience or currently studying",
    color: "#4A7C5F",
    bg: "#EFF9F4",
    border: "#C3E6D3",
    questions: BEGINNER_QUESTIONS,
  },
  intermediate: {
    label: "Intermediate",
    tag: "1–4 years experience",
    desc: "Working with children in a professional or supervised setting",
    color: "#C8890C",
    bg: "#FEF9EE",
    border: "#F4D78A",
    questions: INTERMEDIATE_QUESTIONS,
  },
  expert: {
    label: "Expert",
    tag: "5+ years experience",
    desc: "Qualified clinician with independent practice experience",
    color: "#513424",
    bg: "#FAF1EC",
    border: "#D4A98A",
    questions: EXPERT_QUESTIONS,
  },
};

const INITIAL_BASE = {
  fullName: "",
  email: "",
  phone: "",
  coverLetter: "",
};

export default function ApplyTherapist() {
  const [level, setLevel]   = useState(null); // 'beginner' | 'intermediate' | 'expert'
  const [form, setForm]     = useState(INITIAL_BASE);
  const { applyTherapist, therapistApplicationLoading } = useAuthStore();

  const meta = level ? LEVEL_META[level] : null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }

  function handleLevelSelect(l) {
    setLevel(l);
    setForm(INITIAL_BASE); // reset dynamic fields on level change
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await applyTherapist({ ...form, experienceLevel: level });
      toast.success("Application submitted — we'll be in touch within 5–7 business days.");
      setForm(INITIAL_BASE);
      setLevel(null);
    } catch (err) {
      toast.error(err.message || "Submission failed. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F3EE] text-[#1A1A1A]">
      <Navbar />

      {/* HERO */}
      <section className="bg-[#1A1A1A] text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs tracking-[0.3em] text-stone-400 uppercase">Careers</p>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Become a Certified<br />Autism Therapist
            </h1>
            <p className="text-stone-300 leading-relaxed text-sm">
              Join our multidisciplinary team supporting children and families.
              Applications are reviewed within 5–7 business days.
            </p>
            <div className="flex gap-3 pt-2">
              <Link to="/" className="px-5 py-3 rounded-full bg-[#E48E15] text-white font-semibold text-sm">Back Home</Link>
              <Link to="/services" className="px-5 py-3 rounded-full border border-white/20 text-white text-sm">Explore Services</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 py-16 grid lg:grid-cols-5 gap-10">

        {/* LEFT INFO */}
        <aside className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Application Process</h2>
            <p className="text-sm text-stone-500 mt-2 leading-relaxed">
              Questions are tailored to your experience level — select it first and the form adjusts.
            </p>
          </div>

          {[
            { step: "1", title: "Choose your level", body: "Pick Beginner, Intermediate, or Expert — your answers will be shaped accordingly." },
            { step: "2", title: "Answer honestly", body: "There are no trick questions. We want to understand who you are and how you think." },
            { step: "3", title: "We review & respond", body: "Every application is reviewed by our team within 5–7 business days." },
          ].map(s => (
            <div key={s.step} className="flex gap-4 p-4 bg-white rounded-2xl border border-[#513424]/15">
              <div className="w-7 h-7 rounded-full bg-[#513424] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</div>
              <div>
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 leading-relaxed">
            <strong>Resume note:</strong> Upload your CV to Google Drive, then set sharing to "Anyone with the link can view" before pasting the URL in the form.
          </div>
        </aside>

        {/* FORM CARD */}
        <div className="lg:col-span-3 space-y-6">

          {/* ── Step 1: Level picker ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-7">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
              Step 1 — Select your experience level
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {Object.entries(LEVEL_META).map(([key, m]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleLevelSelect(key)}
                  className="text-left p-4 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: level === key ? m.color : "#E5E0D8",
                    background:  level === key ? m.bg : "#FAFAF8",
                  }}
                >
                  <p className="font-bold text-sm" style={{ color: m.color }}>{m.label}</p>
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: m.color, opacity: 0.7 }}>{m.tag}</p>
                  <p className="text-xs text-stone-500 mt-1.5 leading-snug">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Step 2: Form (shown after level is selected) ── */}
          {level && (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-7">
              {/* Level indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
                  {meta.label} Application
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Always-shown base fields */}
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Contact details</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FieldInput required label="Full name" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" />
                    <FieldInput required label="Email address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
                    <FieldInput label="Phone number" name="phone" value={form.phone || ""} onChange={handleChange} placeholder="+234 800 000 0000" />
                  </div>
                </div>

                <div className="h-px bg-stone-100" />

                {/* Dynamic level questions */}
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                    {meta.label} questions
                  </p>
                  <div className="space-y-4">
                    {meta.questions.map(q => (
                      <div key={q.name}>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">
                          {q.label}
                          {q.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        {q.type === "textarea" ? (
                          <textarea
                            name={q.name}
                            required={q.required}
                            rows={3}
                            value={form[q.name] || ""}
                            onChange={handleChange}
                            placeholder={q.placeholder}
                            className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#513424]/20 resize-none bg-[#FAFAF8]"
                          />
                        ) : (
                          <input
                            name={q.name}
                            type={q.type || "text"}
                            required={q.required}
                            value={form[q.name] || ""}
                            onChange={handleChange}
                            placeholder={q.placeholder}
                            className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#513424]/20 bg-[#FAFAF8]"
                          />
                        )}
                        {q.hint && (
                          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-1.5 leading-relaxed">
                            💡 {q.hint}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-stone-100" />

                {/* Cover letter — always shown */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Cover letter <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="coverLetter"
                    rows={5}
                    required
                    value={form.coverLetter}
                    onChange={handleChange}
                    placeholder="Tell us why you're a great fit for St. Stephen's Family and what drives your passion for this work."
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#513424]/20 resize-none bg-[#FAFAF8]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={therapistApplicationLoading}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all disabled:opacity-60"
                  style={{ background: meta.color }}
                >
                  {therapistApplicationLoading ? "Submitting…" : `Submit ${meta.label} Application`}
                </button>

              </form>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FieldInput({ label, required, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </span>
      <input
        required={required}
        {...props}
        className="mt-1.5 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#513424]/20 bg-[#FAFAF8]"
      />
    </label>
  );
}