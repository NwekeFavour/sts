// pages/TermsOfService.jsx
// Brand: St. Stephen's Family Centre — #513424 mahogany, #C8A97E gold, #F7F4F0 warm bg

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/header";

const BRAND = "#513424";
const GOLD  = "#C8A97E";
const BG    = "#F7F4F0";

const SECTIONS = [
  { id: "agreement",    title: "Agreement to Terms" },
  { id: "services",     title: "Our Services" },
  { id: "eligibility",  title: "Eligibility" },
  { id: "accounts",     title: "Accounts & Access" },
  { id: "intake",       title: "Intake & Assessment" },
  { id: "therapy",      title: "Therapy Services" },
  { id: "payment",      title: "Payment" },
  { id: "conduct",      title: "Acceptable Use" },
  { id: "content",      title: "Uploaded Content" },
  { id: "limitation",  title: "Limitation of Liability" },
  { id: "termination",  title: "Termination" },
  { id: "governing",    title: "Governing Law" },
  { id: "contact",      title: "Contact Us" },
];

function SectionAnchor({ id }) {
  return <span id={id} className="block" style={{ marginTop: "-88px", paddingTop: "88px" }} />;
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-xl font-bold mt-10 mb-4 pb-3 border-b"
        style={{ fontFamily: "Georgia, serif", color: BRAND, borderColor: "#E5DDD5" }}>
      {children}
    </h2>
  );
}

function Callout({ children, color = "#F0EBE3" }) {
  return (
    <div className="rounded-xl px-5 py-4 my-4 text-sm leading-relaxed"
         style={{ background: color, borderLeft: `3px solid ${BRAND}` }}>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p className="text-sm leading-7 text-gray-700 mb-3">{children}</p>;
}

function UL({ items }) {
  return (
    <ul className="mb-4 space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function TermsOfService() {
  const [active, setActive] = useState("agreement");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      {/* ── Header ── */}
     <Navbar/>

      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(135deg, #7A4F32 0%, ${BRAND} 100%)` }}
           className="py-14 mt-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold"
               style={{ background: "rgba(200,169,126,0.25)", color: GOLD, border: "1px solid rgba(200,169,126,0.4)" }}>
            <FileText size={12} />
            Legal Document
          </div>
          <h1 style={{ fontFamily: "Georgia, serif" }}
              className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Terms of Service
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-xl mx-auto">
            Please read these terms carefully before using the St. Stephen's Family Centre
            platform or engaging with our therapy services.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
               style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}>
            Last updated: 19 June 2026
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:flex lg:gap-10">

        {/* ── Sidebar ToC ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 rounded-2xl overflow-hidden border"
               style={{ background: "#fff", borderColor: "#E5DDD5" }}>
            <div className="px-4 py-3 border-b text-xs font-bold uppercase tracking-widest"
                 style={{ color: BRAND, borderColor: "#E5DDD5" }}>
              Contents
            </div>
            <nav className="py-2">
              {SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`}
                   className="flex items-center justify-between px-4 py-2 text-xs transition-colors"
                   style={{
                     color: active === s.id ? BRAND : "#6B6B6B",
                     fontWeight: active === s.id ? 700 : 400,
                     background: active === s.id ? "#F7F0EB" : "transparent",
                   }}>
                  {s.title}
                  {active === s.id && <ChevronRight size={11} style={{ color: GOLD }} />}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <article className="flex-1 min-w-0 bg-white rounded-2xl border px-6 sm:px-10 py-8"
                 style={{ borderColor: "#E5DDD5" }}>

          {/* Agreement */}
          <SectionAnchor id="agreement" />
          <SectionTitle>Agreement to Terms</SectionTitle>
          <Callout>
            By accessing or using the St. Stephen's Family Centre platform, submitting an intake
            request, or engaging our therapy services, you confirm that you have read, understood,
            and agree to be bound by these Terms of Service.
          </Callout>
          <P>
            These Terms constitute a legally binding agreement between you and St. Stephen's Family
            Centre ("we", "us", "our"). If you do not agree to these Terms, please do not use
            our services.
          </P>

          {/* Services */}
          <SectionAnchor id="services" />
          <SectionTitle>Our Services</SectionTitle>
          <P>
            St. Stephen's Family Centre provides specialist therapeutic services for children with
            developmental, behavioural, and communication challenges — including but not limited to
            autism spectrum disorder, speech and language delays, and sensory processing difficulties.
          </P>
          <P>Our services include:</P>
          <UL items={[
            "Online intake and clinical assessment for new families",
            "Therapist matching and assignment based on clinical need",
            "A secure portal for therapists to manage cases and upload reports",
            "Parent communication regarding assessment outcomes and next steps",
            "A 3-month structured therapeutic programme for each accepted child",
          ]} />
          <P>
            We reserve the right to modify, suspend, or discontinue any part of our services at
            any time with reasonable notice.
          </P>

          {/* Eligibility */}
          <SectionAnchor id="eligibility" />
          <SectionTitle>Eligibility</SectionTitle>
          <P>Our services are available to:</P>
          <UL items={[
            "Parents and legal guardians seeking support for a child under their care",
            "Licensed or qualified therapists applying to join our clinical team",
            "Administrative staff authorised by St. Stephen's Family Centre",
          ]} />
          <Callout color="#FBF7F0">
            By submitting an intake form on behalf of a child, you confirm that you are the
            child's parent or legal guardian, and that you have the authority to consent to
            assessment and treatment on their behalf.
          </Callout>

          {/* Accounts */}
          <SectionAnchor id="accounts" />
          <SectionTitle>Accounts & Access</SectionTitle>
          <P>
            Therapist accounts are created by invitation only. You are responsible for maintaining
            the confidentiality of your login credentials and for all activity that occurs under
            your account.
          </P>
          <UL items={[
            "Do not share your account credentials with any other person",
            "Notify us immediately if you suspect unauthorised access to your account",
            "You may not transfer your account to another person",
            "We reserve the right to suspend or terminate accounts that violate these Terms",
          ]} />

          {/* Intake */}
          <SectionAnchor id="intake" />
          <SectionTitle>Intake & Assessment</SectionTitle>
          <P>
            Submitting an intake form does not guarantee acceptance into our programme. Our
            clinical team reviews every request individually and will contact you with our
            assessment within 2 business days.
          </P>
          <P>
            The video you upload of your child is used solely for clinical assessment purposes.
            It is viewed only by our clinical team and will not be shared with third parties or
            used for any other purpose. See our Privacy Policy for retention details.
          </P>
          <P>
            We may request additional information or decline an application if we determine that
            we are not the most appropriate provider for a child's needs. In such cases, we will
            endeavour to signpost you to a more suitable service.
          </P>

          {/* Therapy */}
          <SectionAnchor id="therapy" />
          <SectionTitle>Therapy Services</SectionTitle>
          <P>
            Once accepted, your child will be assigned a therapist whose specialisation matches
            their clinical needs. The initial programme spans 3 months, after which the
            therapeutic relationship may be reviewed and extended.
          </P>
          <Callout>
            <strong>Important:</strong> Our services are supportive and educational in nature.
            We are not a substitute for emergency medical care. If your child is in immediate
            danger or requires urgent medical attention, please contact emergency services
            or visit your nearest hospital.
          </Callout>
          <P>
            Clinical outcomes cannot be guaranteed. Therapeutic progress varies between
            individuals and depends on many factors, including the child's specific profile,
            consistency of engagement, and family involvement.
          </P>

          {/* Payment */}
          <SectionAnchor id="payment" />
          <SectionTitle>Payment</SectionTitle>
          <P>
            Access to therapy services requires payment following assessment and therapist
            assignment. Full payment details, including fees and payment methods, are provided
            at the time of assignment.
          </P>
          <UL items={[
            "Fees are due prior to the commencement of the therapeutic programme",
            "All fees are stated in Nigerian Naira (NGN) unless otherwise agreed",
            "Refund eligibility will be assessed on a case-by-case basis",
            "We do not store or process card details directly — all payments go through our designated payment processor",
          ]} />

          {/* Conduct */}
          <SectionAnchor id="conduct" />
          <SectionTitle>Acceptable Use</SectionTitle>
          <P>When using our platform, you agree not to:</P>
          <UL items={[
            "Submit false, misleading, or fraudulent information about yourself or your child",
            "Upload content that is illegal, offensive, or unrelated to your child's clinical care",
            "Attempt to access accounts, systems, or data that do not belong to you",
            "Disrupt, interfere with, or attempt to compromise the security of our platform",
            "Use our services for any commercial purpose without our written consent",
            "Harass, threaten, or abuse any member of our team or clinical staff",
          ]} />

          {/* Content */}
          <SectionAnchor id="content" />
          <SectionTitle>Uploaded Content</SectionTitle>
          <P>
            By uploading videos, documents, or other files to our platform, you confirm that:
          </P>
          <UL items={[
            "You have the right to share this content with us",
            "The content does not violate any applicable law",
            "You grant us a limited licence to use this content solely for the purpose of providing your child's care",
          ]} />
          <P>
            We do not claim ownership of any content you upload. You retain all rights to your
            materials subject to the licence granted above.
          </P>

          {/* Limitation */}
          <SectionAnchor id="limitation" />
          <SectionTitle>Limitation of Liability</SectionTitle>
          <P>
            To the fullest extent permitted by applicable law, St. Stephen's Family Centre shall
            not be liable for any indirect, incidental, special, or consequential damages arising
            from your use of our services, including but not limited to loss of data or therapeutic
            outcomes not meeting expectations.
          </P>
          <P>
            Our total liability to you for any claim arising out of or related to these Terms or
            our services shall not exceed the total amount paid by you to us in the 3 months
            preceding the claim.
          </P>

          {/* Termination */}
          <SectionAnchor id="termination" />
          <SectionTitle>Termination</SectionTitle>
          <P>
            Either party may terminate the service relationship at any time. You may withdraw
            from our programme by notifying us in writing. We reserve the right to suspend or
            terminate access to our services if these Terms are violated, or where we determine
            that continuing the relationship would not be in the best interest of the child.
          </P>
          <P>
            Upon termination, your right to access the platform ceases. Provisions regarding
            confidentiality, data retention, and limitation of liability survive termination.
          </P>

          {/* Governing law */}
          <SectionAnchor id="governing" />
          <SectionTitle>Governing Law</SectionTitle>
          <P>
            These Terms are governed by and construed in accordance with the laws of the
            Federal Republic of Nigeria. Any disputes arising out of or in connection with
            these Terms shall be subject to the exclusive jurisdiction of the courts of Nigeria.
          </P>

          {/* Contact */}
          <SectionAnchor id="contact" />
          <SectionTitle>Contact Us</SectionTitle>
          <P>
            If you have questions about these Terms or wish to raise a concern, please reach out:
          </P>
          <div className="rounded-xl p-5 mt-2" style={{ background: "#F7F0EB", border: `1px solid ${GOLD}40` }}>
            <p className="text-sm font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: BRAND }}>
              St. Stephen's Family Centre
            </p>
            <p className="text-sm text-gray-700">Email: <a href="mailto:legal@ststephensfamily.com"
               className="underline" style={{ color: BRAND }}>legal@ststephensfamily.com</a></p>
            <p className="text-sm text-gray-700 mt-1">Website: <a href="https://ststephensfamily.com"
               className="underline" style={{ color: BRAND }}>ststephensfamily.com</a></p>
          </div>

          {/* Bottom nav */}
          <div className="mt-10 pt-6 border-t flex items-center justify-between text-xs"
               style={{ borderColor: "#E5DDD5", color: "#6B6B6B" }}>
            <span>© {new Date().getFullYear()} St. Stephen's Family Centre</span>
            <Link to="/privacy" className="underline hover:opacity-70 transition-opacity" style={{ color: BRAND }}>
              ← Privacy Policy
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}