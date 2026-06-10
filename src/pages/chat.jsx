import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import useTherapistRequestStore from "../store/useTherapistRequestStore";


export const STEPHANIE_CHARACTER = {
  name: "Stephanie",
  role: "Support Assistant",
  centre: "St Stephen's Family",
  accentColor: "#4A7C5F",
  traits: [
    { icon: "🌿", label: "Calm & grounding", desc: "Never rushed or overwhelming" },
    { icon: "💬", label: "Plain language", desc: "Literal, clear, no idioms" },
    { icon: "🤝", label: "Warm & welcoming", desc: "Like a friendly front desk" },
    { icon: "🔒", label: "Safe boundaries", desc: "No diagnoses or prescriptions" },
  ],
  canHelp: [
    "Services & therapy types",
    "Booking & appointments",
    "What to expect at sessions",
    "Patient portal questions",
    "Referral process",
    "Contacting the team",
  ],
  cannotHelp: [
    "Medical diagnosis",
    "Medication advice",
    "Clinical assessments",
    "Replacing a therapist",
  ],
  greeting:
    "Hi there 👋 I’m Stephanie, the support assistant for St. Stephen’s Family. I can help with questions about our services, appointments, and how things work here. Please note, I’m not a therapist and can’t provide medical advice or diagnoses. Your conversation is handled securely and is only used to support your request and improve our services. It is not used for any illegal purposes. What can I help you with today?",
};



const QUICK_QUESTIONS = [
  "What services does St. Stephen's Family offer?",
  "How do I book an appointment?",
  "What should I expect at a first session?",
  "How does the patient portal work?",
];

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "10px 0" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: "#4A7C5F",
          display: "inline-block",
          animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
        }} />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

function MessageText({ text }) {
  const lines = text.split("\n");
  return (
    <div style={{ lineHeight: 1.65, fontSize: 13.5 }}>
      {lines.map((line, i) => {
        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <div key={i} style={{ display: "flex", gap: 7, marginTop: 5 }}>
              <span style={{ color: "#4A7C5F", flexShrink: 0, marginTop: 1 }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: boldify(line.slice(2)) }} />
            </div>
          );
        if (line.trim() === "") return <div key={i} style={{ height: 5 }} />;
        return <p key={i} style={{ margin: "2px 0" }} dangerouslySetInnerHTML={{ __html: boldify(line) }} />;
      })}
    </div>
  );
}

function boldify(t) {
  return t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sidebar panel content, shared between desktop static and mobile drawer
// ---------------------------------------------------------------------------
function SidebarContent({ onClose, onRequestHelp, isMobile }) {
  const { name, role, centre, traits, canHelp, cannotHelp } = STEPHANIE_CHARACTER;

  const sec = {
    fontSize: 10, color: "rgba(255,255,255,0.38)", textTransform: "uppercase",
    letterSpacing: "0.09em", marginBottom: 9, marginTop: 0,
  };

  return (
    <div style={{
      width: isMobile ? 280 : 220,
      height: "100%",
      background: "#1C1C1E",
      display: "flex",
      flexDirection: "column",
      padding: "24px 20px 20px",
      overflowY: "auto",
      scrollbarWidth: "none",
      boxSizing: "border-box",

    }}>
      {/* Mobile header row: close × button */}
      {isMobile && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.45)", padding: 4, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Avatar + identity */}
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%", background: "#4A7C5F",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, color: "#fff", margin: "0 auto 10px",
          border: "2px solid rgba(255,255,255,0.08)",
        }}>S</div>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>{name}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{role}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{centre}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 9 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#5DD68A" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Online now</span>
        </div>
      </div>

      <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)", marginBottom: 18 }} />

      {/* Personality */}
      <div style={{ marginBottom: 18 }}>
        <p style={sec}>Personality</p>
        {traits.map((t) => (
          <div key={t.label} style={{ marginBottom: 9 }}>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.82)" }}>{t.icon} {t.label}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", paddingLeft: 20, marginTop: 1 }}>{t.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)", marginBottom: 18 }} />

      {/* Can help */}
      <div style={{ marginBottom: 18 }}>
        <p style={sec}>Can help with</p>
        {canHelp.map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6EC99A", marginBottom: 5 }}>
            <span style={{ fontSize: 10 }}>✓</span>{item}
          </div>
        ))}
      </div>

      <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)", marginBottom: 18 }} />

      {/* Cannot help */}
      <div style={{ marginBottom: 22 }}>
        <p style={sec}>Cannot help with</p>
        {cannotHelp.map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 5 }}>
            <span style={{ fontSize: 10 }}>✕</span>{item}
          </div>
        ))}
      </div>

      {/* CTAs, pinned to bottom */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={() => { onRequestHelp(); if (isMobile) onClose(); }} style={{
          width: "100%", padding: "10px 0", background: "#4A7C5F",
          color: "#fff", border: "none", borderRadius: 8, fontSize: 13,
          fontWeight: 600, cursor: "pointer",
        }}>🙋 Request Help</button>

        {/* Back to Home */}
        <a href="/" style={{
          width: "100%", padding: "9px 0",
          background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, fontSize: 12, fontWeight: 500,
          cursor: "pointer", textDecoration: "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          boxSizing: "border-box",
        }}>
          <BackArrowIcon /> Back to Home
        </a>

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 2, lineHeight: 1.5 }}>
          Speak directly with a therapist
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar, static on desktop, animated drawer on mobile
// ---------------------------------------------------------------------------
function Sidebar({ open, onClose, onRequestHelp, isMobile }) {
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = open ? "hidden" : "";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open, isMobile]);

  if (!isMobile) {
    return <SidebarContent onClose={onClose} onRequestHelp={onRequestHelp} isMobile={false} />;
  }

  // Mobile: always mounted so CSS transition works, never unmount
  return (
    <>
      {/* Dim backdrop, fades in/out */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />
      {/* Drawer, slides in from left */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
      }}>
        <SidebarContent onClose={onClose} onRequestHelp={onRequestHelp} isMobile={true} />
      </div>
    </>
  );
}


// ─── design tokens ────────────────────────────────────────────────────────
const T = {
  ink:       "#1A1A1E",
  muted:     "#6B7280",
  faint:     "#9CA3AF",
  border:    "#E4E7E4",
  surface:   "#F8FAF8",
  danger:    "#DC2626",
  dangerBg:  "#FEF2F2",
  successBg: "#F0FDF4",
};

// ─── micro-styles ─────────────────────────────────────────────────────────
const fieldStyle = {
  display: "block", width: "100%", padding: "10px 12px",
  border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13.5,
  color: T.ink, background: T.surface, marginBottom: 12,
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700, color: T.faint,
  marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase",
};
const btnPrimary = {
  flex: 1, padding: "11px 0", background: T.ink, color: "#fff",
  border: "none", borderRadius: 9, fontSize: 13.5, fontWeight: 600,
  cursor: "pointer", transition: "opacity 0.15s",
};
const btnGhost = {
  flex: 1, padding: "11px 0", background: "transparent", color: T.muted,
  border: `1px solid ${T.border}`, borderRadius: 9, fontSize: 13.5, cursor: "pointer",
};
const row = { display: "flex", gap: 10, marginTop: 8 };
const half = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

// ─── shared field wrapper ─────────────────────────────────────────────────
function F({ label, children, style }) {
  return (
    <div style={style}>
      <span style={labelStyle}>{label}</span>
      {children}
    </div>
  );
}

// ─── step pills ───────────────────────────────────────────────────────────
const STEP_LABELS = ["", "Your details", "Child's profile", "Video"];
function Steps({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 22 }}>
      {[1, 2, 3].map((n) => (
        <div key={n} style={{
          height: 6, borderRadius: 99,
          width: n === current ? 22 : 7,
          background: n <= current ? T.ink : T.border,
          transition: "all 0.25s ease",
        }} />
      ))}
      <span style={{ fontSize: 11.5, color: T.muted, marginLeft: 4 }}>
        {STEP_LABELS[current]}
      </span>
    </div>
  );
}

// ─── Step 1: parent + child basics ────────────────────────────────────────
function Step1() {
  const { form, setField, setStep, closeModal } = useTherapistRequestStore();
  const canContinue =
    form.parentName.trim() &&
    /\S+@\S+\.\S+/.test(form.parentEmail) &&
    form.childName.trim();

  return (
    <>
      <div style={{ fontWeight: 700, fontSize: 18, color: T.ink, marginBottom: 4 }}>
        Request a therapist
      </div>
      <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65, marginBottom: 20 }}>
        Tell us about yourself and your child so we can find the right match.
      </p>
      <Steps current={1} />

      <div style={half}>
        <F label="Your full name">
          <input value={form.parentName} placeholder="e.g. Ngozi Okafor"
            onChange={(e) => setField("parentName", e.target.value)} style={fieldStyle} />
        </F>
        <F label="Phone number">
          <input value={form.parentPhone} placeholder="e.g. +234 800 000 0000"
            onChange={(e) => setField("parentPhone", e.target.value)} style={fieldStyle} />
        </F>
      </div>

      <F label="Email address">
        <input type="email" value={form.parentEmail} placeholder="you@example.com"
          onChange={(e) => setField("parentEmail", e.target.value)} style={fieldStyle} />
      </F>

      <div style={half}>
        <F label="Child's first name">
          <input value={form.childName} placeholder="e.g. Kofi"
            onChange={(e) => setField("childName", e.target.value)} style={fieldStyle} />
        </F>
        <F label="Child's age">
          <input type="number" min={0} max={17} value={form.childAge}
            placeholder="e.g. 4"
            onChange={(e) => setField("childAge", e.target.value)} style={fieldStyle} />
        </F>
      </div>

      <div>
        <select value={form.childGender} onChange={(e) => setField("childGender", e.target.value)} style={fieldStyle}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>

      <F label="Location (city / state)">
        <input value={form.location} placeholder="e.g. Lagos, Nigeria"
          onChange={(e) => setField("location", e.target.value)} style={fieldStyle} />
      </F>

      <div style={row}>
        <button onClick={closeModal} style={btnGhost}>Cancel</button>
        <button onClick={() => setStep(2)} disabled={!canContinue}
          style={{ ...btnPrimary, opacity: canContinue ? 1 : 0.38 }}>
          Continue →
        </button>
      </div>
    </>
  );
}

// ─── Step 2: behavioural profile ──────────────────────────────────────────
function Step2() {
  const { form, setField, setStep } = useTherapistRequestStore();

  return (
    <>
      <div style={{ fontWeight: 700, fontSize: 18, color: T.ink, marginBottom: 4 }}>
        Child's profile
      </div>
      <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65, marginBottom: 20 }}>
        This helps the therapist prepare well before the first session.
      </p>
      <Steps current={2} />

      <F label="Behaviours or challenges you're noticing">
        <textarea value={form.behaviours}
          placeholder="e.g. frequent meltdowns, difficulty focusing, withdrawing socially…"
          onChange={(e) => setField("behaviours", e.target.value)}
          style={{ ...fieldStyle, height: 82, resize: "none" }} />
      </F>
      <F label="How long has this been going on?">
        <input value={form.duration} placeholder="e.g. About 6 months"
          onChange={(e) => setField("duration", e.target.value)} style={fieldStyle} />
      </F>
      <F label="Previous therapy or diagnosis (if any)">
        <textarea value={form.history}
          placeholder="e.g. Attended occupational therapy in 2023 — or None"
          onChange={(e) => setField("history", e.target.value)}
          style={{ ...fieldStyle, height: 70, resize: "none" }} />
      </F>
      <F label="Anything else we should know? (optional)">
        <textarea value={form.extra}
          placeholder="Family situation, known triggers, what helps calm them down…"
          onChange={(e) => setField("extra", e.target.value)}
          style={{ ...fieldStyle, height: 70, resize: "none" }} />
      </F>

      <div style={row}>
        <button onClick={() => setStep(1)} style={btnGhost}>← Back</button>
        <button onClick={() => setStep(3)} style={btnPrimary}>Continue →</button>
      </div>
    </>
  );
}

// ─── Step 3: video upload ─────────────────────────────────────────────────
function Step3() {
  const {
    form, setVideoFile, setStep, submit,
    uploading, uploadProgress, videoError, submitError,
  } = useTherapistRequestStore();

  const inputRef   = useRef(null);
  const [preview, setPreview]   = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    await setVideoFile(file);
    setTimeout(() => {
      if (!useTherapistRequestStore.getState().videoError) {
        setPreview(URL.createObjectURL(file));
      }
    }, 60);
  }, [setVideoFile]);

  const removeVideo = (e) => {
    e.stopPropagation();
    setVideoFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const dropBorder = videoError ? T.danger : dragging ? T.ink : form.videoFile ? T.ink : T.border;

  return (
    <>
      <div style={{ fontWeight: 700, fontSize: 18, color: T.ink, marginBottom: 4 }}>
        Upload a short video
      </div>
      <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65, marginBottom: 20 }}>
        A natural, unposed clip of your child — under 5 minutes. Kept strictly confidential
        and only visible to the assigned therapist and admin.
      </p>
      <Steps current={3} />

      {/* drop zone */}
      <div
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dropBorder}`,
          borderRadius: 12,
          padding: preview ? 12 : "26px 16px",
          textAlign: "center",
          cursor: uploading ? "default" : "pointer",
          background: dragging ? "#F0F2F0" : T.surface,
          marginBottom: 10,
          transition: "border-color 0.15s, background 0.15s",
        }}
      >
        {preview ? (
          <>
            <video src={preview} controls
              style={{ width: "100%", maxHeight: 190, borderRadius: 8, display: "block" }} />
            <div style={{ fontSize: 12, color: T.muted, marginTop: 8, wordBreak: "break-all" }}>
              {form.videoFile?.name}
            </div>
            {!uploading && (
              <button onClick={removeVideo} style={{
                marginTop: 6, fontSize: 12, color: T.muted,
                background: "none", border: "none", cursor: "pointer", textDecoration: "underline",
              }}>
                Remove
              </button>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 30, marginBottom: 8 }}>🎥</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>
              {dragging ? "Drop it here" : "Drag & drop or tap to choose"}
            </div>
            <div style={{ fontSize: 12, color: T.faint, marginTop: 4 }}>
              MP4, MOV, or WebM · Under 5 minutes · Max 200 MB
            </div>
          </>
        )}
        <input required ref={inputRef} type="file" accept="video/*" style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>

      {videoError && (
        <div style={{
          fontSize: 12.5, color: T.danger, padding: "9px 12px",
          background: T.dangerBg, borderRadius: 8, marginBottom: 10,
        }}>
          {videoError}
        </div>
      )}

      {/* progress bar */}
      {uploading && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, marginBottom: 5 }}>
            <span>Uploading…</span><span>{uploadProgress}%</span>
          </div>
          <div style={{ height: 5, background: T.border, borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: 5, background: T.ink, borderRadius: 99,
              width: `${uploadProgress}%`, transition: "width 0.35s ease",
            }} />
          </div>
        </div>
      )}

      {submitError && (
        <div style={{
          fontSize: 12.5, color: T.danger, padding: "9px 12px",
          background: T.dangerBg, borderRadius: 8, marginBottom: 10,
        }}>
          {submitError}
        </div>
      )}

      <div style={row}>
        <button onClick={() => setStep(2)} disabled={uploading}
          style={{ ...btnGhost, opacity: uploading ? 0.4 : 1 }}>
          ← Back
        </button>
        <button onClick={submit} disabled={!form.videoFile || uploading}
          style={{ ...btnPrimary, opacity: form.videoFile && !uploading ? 1 : 0.38 }}>
          {uploading ? "Sending…" : "Send request"}
        </button>
      </div>
    </>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────
function Success() {
  const { form, closeModal, reset } = useTherapistRequestStore();
  return (
    <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: T.successBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px", fontSize: 26,
      }}>
        ✅
      </div>
      <div style={{ fontWeight: 700, fontSize: 19, color: T.ink, marginBottom: 6 }}>
        Request sent!
      </div>
      <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65, marginBottom: 24 }}>
        Thank you, <strong>{form.parentName}</strong>. The St Stephens team will review
        your request and reach out to <strong>{form.parentEmail}</strong> shortly.
      </p>
      <button onClick={() => { reset(); closeModal(); }}
        style={{ ...btnPrimary, flex: "none", padding: "11px 36px" }}>
        Done
      </button>
    </div>
  );
}

// ─── Root modal ───────────────────────────────────────────────────────────
function TherapistRequestModal() {
  const { isOpen, step, requestSent, closeModal, uploading } = useTherapistRequestStore();
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && !uploading && closeModal()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.42)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 300, padding: 16,
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 18, padding: "28px 24px 24px",
        width: "100%", maxWidth: 430, maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
      }}>
        {requestSent ? <Success /> : (
          <>
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
          </>
        )}
      </div>
    </div>
  );
}
export default function StStephensChatbot() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    messages,
    loading,
    retrying,
    sendMessage,
    clearChat
  } = useChatStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

    const openModal = useTherapistRequestStore((s) => s.openModal);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const avatarStyle = {
    width: 26, height: 26, borderRadius: "50%", background: "#1C1C1E",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 11, fontWeight: 600, flexShrink: 0,
  };

  const inputFieldStyle = {
    width: "100%", padding: "10px 13px",
    border: "1px solid rgba(0,0,0,0.12)", borderRadius: 9,
    fontSize: 13.5, marginBottom: 10, color: "#1a1a1a",
    outline: "none", background: "#EFF1EF", display: "block", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", height: "100dvh", fontFamily: "system-ui,-apple-system,sans-serif", background: "#EFF1EF", overflow: "hidden" }}>

      {/* ── Sidebar ── */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onRequestHelp={openModal}
        isMobile={isMobile}
      />

      {/* ── Chat column ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#EFF1EF" }}>

        {/* Top bar */}
        <div style={{
          padding: isMobile ? "12px 16px" : "13px 20px",
          background: "#EFF1EF",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 0, display: "flex", alignItems: "center", color: "#1a1a1a", flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          {isMobile && (
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#4A7C5F", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>S</div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: isMobile ? 13 : 14, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {isMobile ? "Stephanie · St. Stephen's" : "St. Stephen's Family"}
            </div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>Support chat · Stephanie is available</div>
          </div>

          <div style={{ fontSize: 11, background: "rgba(0,0,0,0.06)", color: "#666", padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0 }}>
            ⚕️ {isMobile ? "Not medical" : "Not a medical service"}
          </div>
        </div>

        {/* Rate limit banner */}
        {retrying && (
          <div style={{ background: "#FFF8E6", borderBottom: "1px solid #F0D080", padding: "8px 16px", fontSize: 12, color: "#7A5C00", flexShrink: 0 }}>
            ⏳ High demand, replies may be delayed.{" "}
            <button onClick={() => openModal()} style={{ background: "none", border: "none", color: "#4A7C5F", fontWeight: 600, cursor: "pointer", padding: 0, fontSize: 12, textDecoration: "underline" }}>
              Request help directly →
            </button>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 12px" : "20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
              {m.role === "assistant" && <div style={avatarStyle}>S</div>}
              <div style={m.role === "user" ? {
                maxWidth: isMobile ? "82%" : "68%",
                background: "#1C1C1E", color: "#fff",
                borderRadius: "18px 18px 4px 18px",
                padding: "10px 14px", fontSize: 13.5, lineHeight: 1.6,
              } : {
                maxWidth: isMobile ? "82%" : "68%",
                background: m.isError ? "#FFF8E6" : "#fff",
                border: m.isError ? "1px solid #F0D080" : "1px solid rgba(0,0,0,0.07)",
                color: "#1a1a1a", borderRadius: "18px 18px 18px 4px",
                padding: "11px 14px",
              }}>
                {m.role === "assistant" ? <MessageText text={m.content} /> : m.content}
                {m.role === "assistant" && m.content.toLowerCase().includes("request help") && (
                  <button onClick={openModal} style={{
                    display: "block", marginTop: 10, padding: "7px 13px",
                    background: "#EFF1EF", color: "#1C1C1E",
                    border: "1px solid rgba(0,0,0,0.12)", borderRadius: 7,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>Request Help →</button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={avatarStyle}>S</div>
              <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "18px 18px 18px 4px", padding: "10px 14px" }}>
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        {messages.length <= 2 && (
          <div style={{ padding: isMobile ? "0 12px 10px" : "0 20px 12px", display: "flex", flexWrap: "wrap", gap: 7, flexShrink: 0 }}>
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} onClick={async () => {await sendMessage(q)}} style={{
                padding: "7px 13px", background: "#fff",
                border: "1px solid rgba(0,0,0,0.1)", borderRadius: 20,
                fontSize: 12, color: "#333", cursor: "pointer", fontWeight: 500,
              }}>{q}</button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div style={{
          display: "flex", gap: 8,
          padding: isMobile ? "10px 12px" : "12px 20px",
          background: "#fff", borderTop: "1px solid rgba(0,0,0,0.07)",
          flexShrink: 0, alignItems: "center",
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                await sendMessage(input);

                setInput("");
              }
            }}
            placeholder="Type your question…"
            disabled={loading}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 24,
              border: "1px solid rgba(0,0,0,0.12)", fontSize: 13.5,
              outline: "none", background: "#EFF1EF", color: "#1a1a1a",
              minWidth: 0,
            }}
          />
          <button onClick={async () => { await sendMessage(input); setInput("");}} disabled={loading || !input.trim()} style={{
            width: 38, height: 38, borderRadius: "50%",
            background: loading || !input.trim() ? "#ccc" : "#1C1C1E",
            border: "none", color: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: loading || !input.trim() ? "default" : "pointer",
            flexShrink: 0, transition: "background 0.15s",
          }}><SendIcon /></button>
          {isMobile && (
            <button onClick={openModal} style={{
              height: 38, padding: "0 12px", background: "#EFF1EF",
              border: "1px solid rgba(0,0,0,0.1)", borderRadius: 19,
              fontSize: 12, fontWeight: 600, color: "#1a1a1a",
              cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
            }}>Help</button>
          )}
        </div>
      </div>

      {/* ── Request Help modal ── */}
      {openModal && (
        <TherapistRequestModal/>
      )}
    </div>
  );
}