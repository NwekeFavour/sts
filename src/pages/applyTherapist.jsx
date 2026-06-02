import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/header";
import Footer from "../components/footer";
import useAuthStore from "../store/useAuthStore";

const INITIAL_STATE = {
  fullName: "",
  email: "",
  phone: "",
  qualifications: "",
  yearsOfExperience: "",
  specialization: "",
  licenseNumber: "",
  resumeLink: "",
  coverLetter: "",
};

export default function ApplyTherapist() {
  const [form, setForm] = useState(INITIAL_STATE);
  const { applyTherapist, therapistApplicationLoading } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await applyTherapist(form);
      toast.success("Application submitted successfully.");
      setForm(INITIAL_STATE);
    } catch (err) {
      toast.error(err.message || "Submission failed. Try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F3EE] text-[#1A1A1A]">
      <Navbar />

      {/* HERO */}
      <section className="bg-[#1A1A1A] text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-20">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs tracking-[0.3em] text-stone-400 uppercase">
              Careers
            </p>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Become a Certified Autism Therapist
            </h1>

            <p className="text-stone-300 leading-relaxed">
              Join our multidisciplinary team supporting children and families.
              Applications are reviewed within 5–7 business days.
            </p>

            <div className="flex gap-3 pt-2">
              <Link
                to="/"
                className="px-5 py-3 rounded-full bg-[#C5FF4D] text-black font-semibold text-sm"
              >
                Back Home
              </Link>
              <Link
                to="/services"
                className="px-5 py-3 rounded-full border border-white/20 text-white text-sm"
              >
                Explore Services
              </Link>
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
            <p className="text-sm text-stone-600 mt-2">
              We carefully review every application in 3 stages.
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="p-4 bg-white rounded-2xl border">
              <p className="font-semibold">1. Application Review</p>
              <p className="text-stone-600">We assess qualifications & experience.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border">
              <p className="font-semibold">2. Shortlisting</p>
              <p className="text-stone-600">Qualified applicants are shortlisted.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border">
              <p className="font-semibold">3. Onboarding</p>
              <p className="text-stone-600">Selected candidates receive access.</p>
            </div>
          </div>
        </aside>

        {/* FORM */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Start Your Application</h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* BASIC INFO */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-500 uppercase">
                Personal Information
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} />
                <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
                <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
                <Input label="Qualifications" name="qualifications" value={form.qualifications} onChange={handleChange} />
              </div>
            </div>

            {/* PROFESSIONAL */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-500 uppercase">
                Professional Details
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Years of Experience" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} />
                <Input label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} />
                <Input label="License Number" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} />
                <Input label="Resume Link" name="resumeLink" value={form.resumeLink} onChange={handleChange} />
              </div>
            </div>

            {/* COVER LETTER */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-stone-500 uppercase">
                Cover Letter
              </h3>

              <textarea
                name="coverLetter"
                rows="5"
                value={form.coverLetter}
                onChange={handleChange}
                className="w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#513424]/20"
                placeholder="Tell us why you're a great fit..."
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={therapistApplicationLoading}
              className="w-full bg-[#513424] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#6B4530] disabled:opacity-60"
            >
              {therapistApplicationLoading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* Reusable Input */
function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-stone-600">{label}</span>
      <input
        {...props}
        className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#513424]/20"
      />
    </label>
  );
}