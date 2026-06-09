import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/header";
import Footer from "../components/footer";
import { Upload, CheckCircle, Copy, Check } from "lucide-react";

const BANK_DETAILS = {
  bankName: "First Bank of Nigeria",
  accountName: "St Stephens Family Centre",
  accountNumber: "3012345678",
  sortCode: "011",
};

export default function PaymentPage() {
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", reference: "" });
  const fileRef = useRef(null);

  function copyAccount() {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (file) setReceipt(file);
  }

  async function handleSubmit() {
    if (!receipt || !form.name || !form.email) return;
    setUploading(true);
    // TODO: POST to /api/payments/receipt — multipart/form-data
    // FormData: name, email, reference, receipt (file)
    await new Promise((r) => setTimeout(r, 1800)); // simulate upload
    setUploading(false);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] antialiased">
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-[#1A1A1A] text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#C8A97E]/10 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-5 font-medium">Payment</p>
          <h1 className="text-4xl lg:text-[48px] font-bold leading-tight tracking-tight">
            Secure Your{" "}
            <span className="italic font-normal text-[#C8A97E]">Programme Spot</span>
          </h1>
          <p className="mt-5 text-stone-300 text-sm leading-relaxed max-w-xl">
            We do not use an online payment gateway. All payments are made by
            direct bank transfer. Follow the steps below, transfer the programme
            fee, then upload your receipt here so we can confirm and begin.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 space-y-6">

          {/* ── Step 1: Bank details ── */}
          <div className="bg-white border border-stone-200 rounded-[28px] overflow-hidden">
            <div className="px-7 py-5 border-b border-stone-100 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#513424] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              <h2 className="font-bold text-stone-900">Make the Bank Transfer</h2>
            </div>
            <div className="p-7 space-y-4">
              <p className="text-sm text-stone-500 leading-relaxed">
                Transfer the agreed programme fee to the account below. Use your
                child's name as the payment reference so we can match your receipt.
              </p>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl divide-y divide-stone-100">
                {[
                  { label: "Bank Name",      value: BANK_DETAILS.bankName       },
                  { label: "Account Name",   value: BANK_DETAILS.accountName    },
                  { label: "Sort Code",      value: BANK_DETAILS.sortCode       },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-xs text-stone-400 font-medium uppercase tracking-wide w-32 flex-shrink-0">{label}</span>
                    <span className="text-sm font-semibold text-stone-800">{value}</span>
                  </div>
                ))}

                {/* Account number with copy */}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-xs text-stone-400 font-medium uppercase tracking-wide w-32 flex-shrink-0">Account No.</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-stone-900 tracking-widest">{BANK_DETAILS.accountNumber}</span>
                    <button
                      onClick={copyAccount}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#513424] hover:opacity-70 transition-opacity"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 flex gap-3">
                <span className="text-amber-500 flex-shrink-0 text-base">ℹ</span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Use your <strong>child's full name</strong> as the transfer reference. This helps us match your payment to your file quickly.
                </p>
              </div>
            </div>
          </div>

          {/* ── Step 2: Upload receipt ── */}
          <div className="bg-white border border-stone-200 rounded-[28px] overflow-hidden">
            <div className="px-7 py-5 border-b border-stone-100 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#513424] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
              <h2 className="font-bold text-stone-900">Upload Your Receipt</h2>
            </div>

            {submitted ? (
              <div className="p-10 text-center space-y-4">
                <CheckCircle size={48} className="text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-stone-900">Receipt submitted!</h3>
                <p className="text-stone-500 text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you, {form.name}. We've received your receipt and will verify
                  your payment within 1 business day. You'll get a confirmation email at{" "}
                  <strong>{form.email}</strong> once your programme is confirmed.
                </p>
                <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#513424] text-white text-sm font-medium rounded-full hover:bg-[#6B4530] transition-all mt-2">
                  Back to Home
                </Link>
              </div>
            ) : (
              <div className="p-7 space-y-5">
                <p className="text-sm text-stone-500 leading-relaxed">
                  Once your transfer is complete, fill in your details below and
                  attach a screenshot or PDF of your bank receipt.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Your Full Name</label>
                    <input
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#513424]/20 focus:border-[#513424] bg-stone-50 transition-all"
                      placeholder="e.g. Amara Okafor"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Email Address</label>
                    <input
                      type="email"
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#513424]/20 focus:border-[#513424] bg-stone-50 transition-all"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Transfer Reference Used</label>
                  <input
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#513424]/20 focus:border-[#513424] bg-stone-50 transition-all"
                    placeholder="Child's name as used in the transfer"
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  />
                </div>

                {/* File drop zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    receipt
                      ? "border-green-400 bg-green-50"
                      : "border-stone-200 bg-stone-50 hover:border-[#513424]/40 hover:bg-[#513424]/5"
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFile}
                  />
                  {receipt ? (
                    <div className="space-y-1">
                      <CheckCircle size={28} className="text-green-500 mx-auto" />
                      <p className="text-sm font-semibold text-green-700">{receipt.name}</p>
                      <p className="text-xs text-green-500">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload size={28} className="text-stone-400 mx-auto" />
                      <p className="text-sm font-semibold text-stone-700">Click to upload receipt</p>
                      <p className="text-xs text-stone-400">PNG, JPG or PDF · Max 10MB</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!receipt || !form.name || !form.email || uploading}
                  className="w-full py-3.5 bg-[#513424] text-white font-semibold rounded-full text-sm hover:bg-[#6B4530] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Submit Receipt →"
                  )}
                </button>

                <p className="text-center text-xs text-stone-400">
                  Your programme will be confirmed within 1 business day after receipt verification.
                </p>
              </div>
            )}
          </div>

          {/* ── Questions ── */}
          <div className="bg-stone-100 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-800">Have questions about payment?</p>
              <p className="text-xs text-stone-500 mt-0.5">Our support team can help clarify any concerns.</p>
            </div>
            <Link
              to="/chat"
              className="flex-shrink-0 px-5 py-2.5 bg-[#513424] text-white text-xs font-medium rounded-full hover:bg-[#6B4530] transition-all"
            >
              Chat with Stephanie →
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}