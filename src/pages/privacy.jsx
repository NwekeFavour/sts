// pages/PrivacyPolicy.jsx
// Brand: St. Stephen's Family Centre — #513424 mahogany, #C8A97E gold, #F7F4F0 warm bg

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/header";

const BRAND = "#513424";
const GOLD  = "#C8A97E";
const BG    = "#F7F4F0";

const SECTIONS = [
  { id: "overview",     title: "Overview" },
  { id: "collection",  title: "Information We Collect" },
  { id: "use",         title: "How We Use Your Information" },
  { id: "sharing",     title: "How We Share Information" },
  { id: "retention",   title: "Data Retention" },
  { id: "security",    title: "Security" },
  { id: "rights",      title: "Your Rights" },
  { id: "children",    title: "Children's Privacy" },
  { id: "cookies",     title: "Cookies" },
  { id: "changes",     title: "Changes to This Policy" },
  { id: "contact",     title: "Contact Us" },
];

function SectionAnchor({ id }) {
  return <span id={id} className="block" style={{ marginTop: "-88px", paddingTop: "88px" }} />;
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: "Georgia, serif", color: BRAND }}
        className="text-xl font-bold mt-10 mb-4 pb-3 border-b"
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

export default function PrivacyPolicy() {
  const [active, setActive] = useState("overview");

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
      <div style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #7A4F32 100%)` }}
           className="py-14 mt-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold"
               style={{ background: "rgba(200,169,126,0.25)", color: GOLD, border: "1px solid rgba(200,169,126,0.4)" }}>
            <Shield size={12} />
            Legal Document
          </div>
          <h1 style={{ fontFamily: "Georgia, serif" }}
              className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-xl mx-auto">
            How St. Stephen's Family Centre collects, uses, and protects your personal
            information and that of your child.
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

          {/* Overview */}
          <SectionAnchor id="overview" />
          <SectionTitle>Overview</SectionTitle>
          <Callout>
            St. Stephen's Family Centre is committed to protecting the privacy and dignity of every
            family that reaches out to us. This policy explains what information we collect, why we
            collect it, and how we keep it safe. We handle sensitive clinical information with the
            same care and discretion we bring to every family interaction.
          </Callout>
          <P>
            This Privacy Policy applies to all services offered by St. Stephen's Family Centre,
            including our website, therapist portal, parent intake forms, and any communication
            you have with our team. By using our services, you agree to the terms described here.
          </P>
          <P>
            We are bound by applicable data protection laws, including Nigeria's Nigeria Data
            Protection Act (NDPA) 2023, and we take those obligations seriously.
          </P>

          {/* Collection */}
          <SectionAnchor id="collection" />
          <SectionTitle>Information We Collect</SectionTitle>
          <P>We collect information in several ways depending on how you interact with us:</P>

          <h3 className="text-sm font-bold mb-2 mt-4" style={{ color: BRAND }}>Information you provide directly</h3>
          <UL items={[
            "Parent or guardian full name, email address, and phone number",
            "Child's name, age, gender, and location",
            "Video recordings of your child submitted as part of the intake process",
            "Description of your child's primary concerns, behaviour, and development history",
            "Medical or diagnostic history relevant to your child's care",
            "Lab results or supporting documents uploaded through our secure portal",
            "Messages and correspondence with our administrative or clinical team",
          ]} />

          <h3 className="text-sm font-bold mb-2 mt-4" style={{ color: BRAND }}>Information collected automatically</h3>
          <UL items={[
            "Browser type, device type, and operating system",
            "IP address and approximate location",
            "Pages visited and time spent on our platform",
            "Session and authentication tokens (stored securely in your browser)",
          ]} />

          <h3 className="text-sm font-bold mb-2 mt-4" style={{ color: BRAND }}>Information from therapists</h3>
          <UL items={[
            "Professional credentials, qualifications, and licence numbers",
            "Specialisation, years of experience, and clinical philosophy",
            "Reports, progress notes, and case updates submitted through the portal",
          ]} />

          {/* Use */}
          <SectionAnchor id="use" />
          <SectionTitle>How We Use Your Information</SectionTitle>
          <P>We use the information we collect solely to deliver and improve our therapy services:</P>
          <UL items={[
            "To assess your child's needs and match them with the most suitable therapist",
            "To facilitate communication between our team, therapists, and your family",
            "To store and review clinical reports and progress documentation securely",
            "To send appointment confirmations, intake instructions, and service updates",
            "To verify therapist credentials and manage their caseloads",
            "To comply with applicable professional and legal obligations",
            "To improve our intake process and service quality (using anonymised data only)",
          ]} />
          <Callout color="#FBF7F0">
            We do not use your information for advertising or marketing purposes. We do not sell,
            rent, or trade your personal data with any third party for commercial gain.
          </Callout>

          {/* Sharing */}
          <SectionAnchor id="sharing" />
          <SectionTitle>How We Share Information</SectionTitle>
          <P>
            We share your information only where necessary to deliver your child's care, or where
            required by law:
          </P>
          <UL items={[
            "With the therapist assigned to your child — they receive the information they need to provide effective care",
            "With our administrative team, who coordinate intake, scheduling, and case management",
            "With Supabase (our secure database and file storage provider), under a data processing agreement",
            "With Brevo (our email delivery provider), for sending transactional communications only",
            "With Cloudflare (our video storage provider), for secure video submissions",
            "With law enforcement or regulatory bodies if required by applicable Nigerian law",
          ]} />
          <P>
            All third-party providers we use are bound by data processing agreements and may
            not use your data for their own purposes.
          </P>

          {/* Retention */}
          <SectionAnchor id="retention" />
          <SectionTitle>Data Retention</SectionTitle>
          <P>
            We retain your personal information for as long as necessary to provide our services
            and meet our legal obligations:
          </P>
          <UL items={[
            "Active client records are retained for the duration of the therapeutic relationship plus 7 years",
            "Video submissions are retained for 12 months from submission, then securely deleted",
            "Therapist applications are retained for 2 years regardless of outcome",
            "Activity logs are retained for 90 days",
            "You may request earlier deletion of your data — see Your Rights below",
          ]} />

          {/* Security */}
          <SectionAnchor id="security" />
          <SectionTitle>Security</SectionTitle>
          <Callout>
            We take the security of your family's information seriously, especially given the
            sensitive clinical nature of what you share with us.
          </Callout>
          <P>Our security measures include:</P>
          <UL items={[
            "All data is encrypted in transit using TLS/SSL",
            "Files and videos are stored in private, access-controlled cloud storage",
            "Therapist portals are protected by role-based authentication",
            "Lab results and reports are accessible via short-lived signed URLs only",
            "Passwords are never stored in plain text",
            "Administrative access is logged and audited",
          ]} />
          <P>
            While we implement industry-standard protections, no system is completely immune to
            risk. If you suspect unauthorised access to your account, please contact us immediately.
          </P>

          {/* Rights */}
          <SectionAnchor id="rights" />
          <SectionTitle>Your Rights</SectionTitle>
          <P>
            Under the Nigeria Data Protection Act 2023, you have the following rights regarding
            your personal data:
          </P>
          <UL items={[
            "Right to access — request a copy of the personal data we hold about you",
            "Right to correction — ask us to correct inaccurate or incomplete information",
            "Right to deletion — request that we delete your personal data, subject to legal obligations",
            "Right to restrict processing — ask us to limit how we use your data",
            "Right to object — object to our processing of your data in certain circumstances",
            "Right to data portability — request your data in a structured, machine-readable format",
          ]} />
          <P>
            To exercise any of these rights, please contact us at the address below. We will
            respond within 30 days.
          </P>

          {/* Children */}
          <SectionAnchor id="children" />
          <SectionTitle>Children's Privacy</SectionTitle>
          <P>
            Our services are designed to support children with developmental and behavioural needs.
            We collect information about children only with the explicit consent of their parent or
            legal guardian. Children do not interact directly with our digital platform.
          </P>
          <P>
            All information about a child is handled with the highest level of care and
            confidentiality, and is accessible only to the assigned therapist and authorised
            administrative staff.
          </P>

          {/* Cookies */}
          <SectionAnchor id="cookies" />
          <SectionTitle>Cookies</SectionTitle>
          <P>
            We use a small number of strictly necessary cookies to keep you signed in to your
            account and maintain your session securely. We do not use advertising cookies,
            tracking pixels, or third-party analytics cookies.
          </P>
          <UL items={[
            "Session cookies — keep you logged in during your visit",
            "Authentication tokens — stored in browser local storage to verify your identity securely",
          ]} />

          {/* Changes */}
          <SectionAnchor id="changes" />
          <SectionTitle>Changes to This Policy</SectionTitle>
          <P>
            We may update this Privacy Policy from time to time to reflect changes in our
            services or applicable law. When we do, we will update the "Last updated" date at
            the top of this page and, where the changes are significant, notify you by email.
          </P>
          <P>
            Continued use of our services after changes are posted constitutes acceptance of
            the updated policy.
          </P>

          {/* Contact */}
          <SectionAnchor id="contact" />
          <SectionTitle>Contact Us</SectionTitle>
          <P>
            If you have any questions about this Privacy Policy or wish to exercise your data
            rights, please contact us:
          </P>
          <div className="rounded-xl p-5 mt-2" style={{ background: "#F7F0EB", border: `1px solid ${GOLD}40` }}>
            <p className="text-sm font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: BRAND }}>
              St. Stephen's Family Centre
            </p>
            <p className="text-sm text-gray-700">Email: <a href="mailto:privacy@ststephensfamily.com"
               className="underline" style={{ color: BRAND }}>privacy@ststephensfamily.com</a></p>
            <p className="text-sm text-gray-700 mt-1">Website: <a href="https://ststephensfamily.com"
               className="underline" style={{ color: BRAND }}>ststephensfamily.com</a></p>
          </div>

          {/* Bottom nav */}
          <div className="mt-10 pt-6 border-t flex items-center justify-between text-xs"
               style={{ borderColor: "#E5DDD5", color: "#6B6B6B" }}>
            <span>© {new Date().getFullYear()} St. Stephen's Family Centre</span>
            <a href="/tos" className="underline hover:opacity-70 transition-opacity" style={{ color: BRAND }}>
              Terms of Service →
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}