const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
const transac = client.transactionalEmails;

const sender = {
  name: process.env.EMAIL_FROM_NAME || "St. Stephen's Family",
  email: process.env.EMAIL_FROM,
};

// ─── Brand tokens
const BRAND = {
  primary: "#513424",
  accent: "#C8A97E",
  dark: "#1A1A1A",
  light: "#F7F5F0",
  muted: "#6B6B6B",
  border: "#E5E0D8",
  name: "St. Stephen's Family Centre",
  tagline: "Compassionate care for every child",
  website: process.env.FRONTEND_URL || "https://ststephensfamily.com",
  supportEmail: process.env.EMAIL_FROM,
};

// ─── Shared wrapper ───────────────────────────────────────────────────────────
async function sendEmail({ to, name, subject, htmlContent }) {
  await transac.sendTransacEmail({
    sender,
    to: [{ email: to, name }],
    subject,
    htmlContent,
  });
}

// ─── Base layout ──────────────────────────────────────────────────────────────
function baseTemplate({ preheader = "", body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${BRAND.name}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F0EDE8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${preheader}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F0EDE8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background:${BRAND.primary};border-radius:12px;padding:10px 20px;">
                    <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.3px;">${BRAND.name}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">

              <!-- Card top accent -->
              <div style="height:5px;background:linear-gradient(90deg,${BRAND.primary} 0%,${BRAND.accent} 100%);"></div>

              <!-- Body -->
              <div style="padding:40px 40px 32px;">
                ${body}
              </div>

              <!-- Footer -->
              <div style="background:${BRAND.light};border-top:1px solid ${BRAND.border};padding:20px 40px;text-align:center;">
                <p style="margin:0 0 6px;font-size:12px;color:${BRAND.muted};">
                  ${BRAND.tagline}
                </p>
                <p style="margin:0;font-size:11px;color:#aaa;">
                  Questions? <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.supportEmail}</a>
                  &nbsp;·&nbsp;
                  <a href="${BRAND.website}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.website}</a>
                </p>
                <p style="margin:8px 0 0;font-size:10px;color:#bbb;">
                  © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Reusable button ─────────────────────────────────────────────────────────
function ctaButton(label, href) {
  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0;">
      <tr>
        <td style="background:${BRAND.primary};border-radius:50px;">
          <a href="${href}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

// ─── Info pill ────────────────────────────────────────────────────────────────
function infoPill(icon, text) {
  return `
    <div style="display:flex;align-items:center;gap:8px;background:${BRAND.light};border:1px solid ${BRAND.border};border-radius:8px;padding:10px 14px;margin:6px 0;font-size:13px;color:#444;">
      <span style="font-size:15px;">${icon}</span>
      <span>${text}</span>
    </div>`;
}

// ─── 1. Therapist invite (existing) ──────────────────────────────────────────
async function sendApplicationReviewEmail({ to, name, inviteToken }) {
  const link = `${process.env.FRONTEND_URL}/invite/reset-password?token=${inviteToken}`;

  await sendEmail({
    to,
    name,
    subject: `Welcome to ${BRAND.name} — Set your password`,
    htmlContent: baseTemplate({
      preheader: "Your application is currently being reviewed.",
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${BRAND.accent};text-transform:uppercase;letter-spacing:0.8px;">
          Application Update
        </p>

        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          Your application is being reviewed
        </h1>

        <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">
          Hi ${name},
        </p>

        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          Thank you for applying to join ${BRAND.name} as a therapist. 
          Our team is currently reviewing your application carefully.
        </p>

        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          We’ll notify you once a decision has been made. No further action is required from you at this stage.
        </p>

        ${infoPill("⏱", "Review typically takes a few business days.")}
        ${infoPill("📩", "You will receive an update once the review is complete.")}
      `,
    }),
  });
}

async function sendFormEmail({ to, parentName, childName, advice, uploadUrl }) {
  await sendEmail({
    to,
    name: parentName,
    subject: `Your assessment is ready — ${childName} · ${BRAND.name}`,
    htmlContent: baseTemplate({
      preheader: `Our team has reviewed ${childName}'s request and shared their observations below.`,
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${BRAND.accent};text-transform:uppercase;letter-spacing:0.8px;">
          Clinical Assessment
        </p>
 
        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          A note from our team
        </h1>
 
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 16px;">
          Hi ${parentName},
        </p>
 
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 24px;">
          Our team has carefully reviewed the information and video you shared regarding
          <strong>${childName}</strong>. Below are our observations and recommended next steps.
        </p>
 
        <!-- Advice box -->
        <div style="background:${BRAND.light};border-left:4px solid ${BRAND.primary};border-radius:0 10px 10px 0;padding:20px 22px;margin-bottom:28px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:${BRAND.primary};text-transform:uppercase;letter-spacing:0.08em;">
            Assessment Notes
          </p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;white-space:pre-wrap;">${escapeHtml(advice)}</p>
        </div>
 
        <!-- Lab upload section -->
        <div style="border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;margin-bottom:28px;">
 
          <div style="background:${BRAND.primary};padding:14px 18px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#fff;">
              📋 Optional: Upload Lab Results
            </p>
          </div>
 
          <div style="padding:20px 22px;">
            <p style="margin:0 0 14px;font-size:14px;color:#444;line-height:1.7;">
              If you decide to follow the guidance above, please upload your lab results using 
              the secure button below. This helps ${childName}'s therapist prepare fully before 
              the first session.
            </p>
            <p style="margin:0 0 20px;font-size:13px;color:${BRAND.muted};line-height:1.6;">
              <strong>This step is entirely optional.</strong> You are welcome to proceed to 
              therapy without uploading any files — the link is simply there if you need it.
            </p>
 
            ${ctaButton("📤 Upload Lab Results", uploadUrl)}
 
            <p style="margin:4px 0 4px;font-size:11px;color:#aaa;">Can't click the button? Copy this link:</p>
            <p style="margin:0;font-size:11px;color:#aaa;word-break:break-all;">${uploadUrl}</p>
          </div>
        </div>
 
        <!-- Security note -->
        <div style="background:#F0FAF0;border:1px solid #C8E6C9;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#2E7D32;line-height:1.7;">
            🔒 <strong>Your privacy is protected.</strong> Any file you upload is encrypted in 
            transit and stored securely. It will only be accessible to your assigned therapist 
            and our admin team.
          </p>
        </div>
 
        ${infoPill("🔗", "This upload link is <strong>single-use</strong> and expires once a file has been submitted.")}
        ${infoPill("💬", `Questions? Reply to this email or contact us at ${BRAND.supportEmail}`)}
      `,
    }),
  });
}

// ─── sendLabUploadConfirmationEmail ───────────────────────────────────────────
// Sent automatically after the parent successfully uploads their lab results
// via the public /lab-upload/:token page.
//
// params:
//   to          string  parent email
//   parentName  string
//   childName   string

async function sendLabUploadConfirmationEmail({ to, parentName, childName }) {
  await sendEmail({
    to,
    name: parentName,
    subject: `Lab results received — ${childName} · ${BRAND.name}`,
    htmlContent: baseTemplate({
      preheader: `We've received the lab results you uploaded for ${childName}.`,
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#2E7D32;text-transform:uppercase;letter-spacing:0.8px;">
          Upload Confirmed
        </p>

        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          Lab results received ✅
        </h1>

        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 16px;">
          Hi ${parentName},
        </p>

        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 24px;">
          We've successfully received the lab results you uploaded for
          <strong>${childName}</strong>. Our clinical team will review the
          information you've provided as part of the onboarding process.
        </p>

        <div style="background:#FFF8E1;border:1px solid #FFE082;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#8A6D00;line-height:1.7;">
            💳 <strong>Next step:</strong> Before we can assign a therapist to
            ${childName}, you'll need to complete payment for access to therapy
            services. Once payment is confirmed, we'll match your child with a
            suitable therapist and notify you when the assignment is complete.
          </p>
        </div>

        <div style="text-align:center;margin:0 0 24px;">
          <a
            href="${BRAND.website}/payment"
            style="display:inline-block;background:${BRAND.primary};color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;"
          >
            Complete Payment
          </a>
        </div>

        ${infoPill("🔒", "Your file is stored securely and is only accessible to our clinical team.")}
        ${infoPill("💬", `Questions? Write to us at ${BRAND.supportEmail}`)}
      `,
    }),
  });
}

// ─── escapeHtml (needed for advice text) ─────────────────────────────────────
// Only add this if it's not already defined elsewhere in the file.
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── 2. Password reset ───────────────────────────────────────────────────────
async function sendPasswordResetEmail({ to, name, resetToken }) {
  const link = `${process.env.FRONTEND_URL}/invite/reset-password?token=${resetToken}`;

  await sendEmail({
    to,
    name,
    subject: "Reset your password — St. Stephen's Family",
    htmlContent: baseTemplate({
      preheader: "Someone requested a password reset for your account.",
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${BRAND.accent};text-transform:uppercase;letter-spacing:0.8px;">Security</p>
        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          Reset your password
        </h1>
        <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">Hi ${name},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          Someone requested a password reset for your account. If this was you, click below to choose a new password.
        </p>
        ${ctaButton("Reset My Password →", link)}
        ${infoPill("⏱", "This link expires in 1 hour.")}
        ${infoPill("🔒", "If you did not request this, you can safely ignore this email. Your password will not change.")}
      `,
    }),
  });
}

// ─── 3. Application approved (applicant notified, invite sent) ───────────────
async function sendApplicationApprovedEmail({ to, name, inviteToken }) {
  const link = `${process.env.FRONTEND_URL}/invite/reset-password?token=${inviteToken}`;

  await sendEmail({
    to,
    name,
    subject: `Your application has been approved — ${BRAND.name}`,
    htmlContent: baseTemplate({
      preheader:
        "Congratulations — your therapist application has been approved.",
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#2E7D32;text-transform:uppercase;letter-spacing:0.8px;">Application Update</p>
        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          Your application has been approved 🎉
        </h1>
        <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">Hi ${name},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          We are delighted to let you know that your application to join <strong>${BRAND.name}</strong> as a therapist has been reviewed and approved.
        </p>
        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          Click below to set your password and access your therapist portal — your journey with our families starts here.
        </p>
        ${ctaButton("Activate My Account →", link)}
        <div style="background:#F0FAF0;border:1px solid #C8E6C9;border-radius:10px;padding:16px 20px;margin:20px 0;">
          <p style="margin:0;font-size:13px;color:#2E7D32;font-weight:600;">What happens next?</p>
          <ul style="margin:8px 0 0;padding-left:18px;font-size:13px;color:#444;line-height:1.8;">
            <li>Set your password using the button above</li>
            <li>Log in to your therapist portal</li>
            <li>Patients will be assigned to your caseload by our admin team</li>
          </ul>
        </div>
        ${infoPill("⏱", "Your activation link expires in 24 hours.")}
      `,
    }),
  });
}

// ─── 4. Application rejected ─────────────────────────────────────────────────
async function sendApplicationRejectedEmail({ to, name, reason = null }) {
  await sendEmail({
    to,
    name,
    subject: `Update on your application — ${BRAND.name}`,
    htmlContent: baseTemplate({
      preheader: "An update regarding your therapist application.",
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.8px;">Application Update</p>
        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          Thank you for applying
        </h1>
        <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">Hi ${name},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          Thank you for taking the time to apply to <strong>${BRAND.name}</strong>. We genuinely appreciate your interest in supporting our families.
        </p>
        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          After careful review, we are unable to move forward with your application at this time.
        </p>
        ${
          reason
            ? `
        <div style="background:${BRAND.light};border-left:3px solid ${BRAND.accent};border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 20px;font-size:13px;color:#555;line-height:1.7;">
          <strong>Feedback:</strong> ${reason}
        </div>`
            : ""
        }
        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          We encourage you to apply again in the future as our team and needs continue to grow. We wish you all the best in your career.
        </p>
        ${infoPill("💬", `Questions? Reach us at ${BRAND.supportEmail}`)}
      `,
    }),
  });
}

// ─── 5. Status updated (generic — for pending → any other status) ────────────
async function sendApplicationStatusEmail({
  to,
  name,
  status,
  reason = null,
  inviteToken = null,
}) {
  if (status === "approved" && inviteToken) {
    return sendApplicationApprovedEmail({ to, name, inviteToken });
  }
  if (status === "rejected") {
    return sendApplicationRejectedEmail({ to, name, reason });
  }
  // "pending" status change — just an acknowledgement
  await sendEmail({
    to,
    name,
    subject: `We received your application — ${BRAND.name}`,
    htmlContent: baseTemplate({
      preheader: "Your application is under review.",
      body: `
        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};">Application received</h1>
        <p style="font-size:14px;color:#444;line-height:1.7;">Hi ${name}, thank you for applying. Your application is currently under review and we will be in touch shortly.</p>
      `,
    }),
  });
}

async function sendApplicationReceivedEmail({
  to,
  name,
  applicationId,
  experienceLevel,
}) {
  await sendEmail({
    to,
    name,
    subject: `Application received — ${BRAND.name}`,
    htmlContent: baseTemplate({
      preheader: "We received your application.",
      body: `
        <h1 style="margin:0 0 20px;">Application received</h1>
        <p>Hi ${name}, we’ve received your application and it is under review.</p>
        <p><strong>Application ID:</strong> ${applicationId}</p>
        <p><strong>Experience Level:</strong> ${experienceLevel}</p>
      `,
    }),
  });
}

async function sendAdminNewApplicationEmail({
  to,
  name,
  email,
  phone,
  specialization,
  yearsOfExperience,
  experienceLevel,
  licenseNumber,
  applicationId,
}) {
  await sendEmail({
    to,
    name,
    subject: `New Therapist Application #${applicationId} — ${name}`,
    htmlContent: baseTemplate({
      preheader: "A new therapist application has been submitted.",
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${BRAND.accent};text-transform:uppercase;letter-spacing:0.8px;">
          New Application
        </p>

        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          New Therapist Application Received
        </h1>

        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px;">
          A new therapist application has been submitted and is awaiting review.
        </p>

        <div style="background:${BRAND.light};border:1px solid ${BRAND.border};border-radius:12px;padding:16px 18px;margin-bottom:20px;">
          <p style="margin:0 0 6px;"><strong>Application ID:</strong> ${applicationId}</p>
          <p style="margin:0 0 6px;"><strong>Name:</strong> ${name}</p>
          <p style="margin:0 0 6px;"><strong>Email:</strong> ${email}</p>
          <p style="margin:0 0 6px;"><strong>Phone:</strong> ${phone}</p>
          <p style="margin:0 0 6px;"><strong>Specialization:</strong> ${specialization || "Not specified"}</p>
          <p style="margin:0 0 6px;"><strong>Experience:</strong> ${experienceLevel === "beginner" ? experienceLevel : yearsOfExperience || "Not specified"} years</p>
          <p style="margin:0;"><strong>License:</strong> ${licenseNumber || "Not provided"}</p>
        </div>

        <p style="font-size:14px;color:#444;line-height:1.7;">
          Please log into the admin dashboard to review and take action on this application.
        </p>

        ${ctaButton("View Application Dashboard →", `${BRAND.website}/admin/applications`)}
      `,
    }),
  });
}

async function sendReportFlaggedEmail({ to, therapistName, childName, reportTitle, reason }) {
  await sendEmail({
    to,
    name: therapistName,
    subject: `Action needed: report flagged — ${childName} · ${BRAND.name}`,
    htmlContent: baseTemplate({
      preheader: `Admin has flagged your report for ${childName} and needs a correction.`,
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#C0392B;text-transform:uppercase;letter-spacing:0.8px;">
          Report Flagged
        </p>
 
        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          A report needs your attention
        </h1>
 
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px;">
          Hi ${therapistName},
        </p>
 
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 24px;">
          Admin has reviewed your report <strong>"${reportTitle}"</strong> for
          <strong>${childName}</strong> and flagged it for correction.
        </p>
 
        <div style="background:#FDECEA;border-left:4px solid #C0392B;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#C0392B;text-transform:uppercase;letter-spacing:0.08em;">
            Reason for flag
          </p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${reason}</p>
        </div>
 
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px;">
          Please log into your therapist portal, review the feedback, and upload a corrected
          report for this case.
        </p>
 
        ${ctaButton('Go to My Reports →', `${BRAND.website}/therapist/reports`)}
 
        ${infoPill('💬', `Questions? Reach out at ${BRAND.supportEmail}`)}
      `,
    }),
  });
}

// ─── 6. Admin — new help request submitted ────────────────────────────────────
async function sendAdminNewHelpRequestEmail({
  to,
  parentName,
  parentEmail,
  parentPhone,
  childName,
  childAge,
  childGender,
  location,
  primaryConcerns,
  requestId,
}) {
  await sendEmail({
    to,
    name: "Admin",
    subject: `New Help Request #${requestId} — ${parentName}`,
    htmlContent: baseTemplate({
      preheader:
        "A new family has submitted a help request and is awaiting review.",
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${BRAND.accent};text-transform:uppercase;letter-spacing:0.8px;">
          New Help Request
        </p>

        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          A family needs support
        </h1>

        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px;">
          A new help request has been submitted and is awaiting your review. Please assess within <strong>2 business days</strong> and send the family an advice email before assigning a therapist.
        </p>

        <div style="background:${BRAND.light};border:1px solid ${BRAND.border};border-radius:12px;padding:16px 18px;margin-bottom:20px;">
          <p style="margin:0 0 6px;font-size:13px;"><strong>Request ID:</strong> ${requestId}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Parent name:</strong> ${parentName}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Email:</strong> ${parentEmail}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Phone:</strong> ${parentPhone || "Not provided"}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Child's name:</strong> ${childName}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Child's age:</strong> ${childAge}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Gender:</strong> ${childGender || "Not specified"}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Location:</strong> ${location || "Not specified"}</p>
          <p style="margin:0;font-size:13px;"><strong>Primary concerns:</strong> ${primaryConcerns || "See video"}</p>
        </div>

        <div style="background:#FFF8E6;border:1px solid #F0D080;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#7A5C00;line-height:1.7;">
            ⏱ <strong>Action required within 2 days:</strong> Review the uploaded video, assess the child's situation, 
            and send the family your observations and recommended next steps before assigning a therapist.
          </p>
        </div>

        ${ctaButton("Review Request →", `${BRAND.website}/admin/requests}`)}
      `,
    }),
  });
}

// ─── 7. Parent — request received + how the process works ────────────────────
async function sendParentRequestReceivedEmail({
  to,
  parentName,
  childName,
  requestId,
}) {
  await sendEmail({
    to,
    name: parentName,
    subject: `We've received your request — ${BRAND.name}`,
    htmlContent: baseTemplate({
      preheader: `Thank you for reaching out. Here's what happens next for ${childName}.`,
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${BRAND.accent};text-transform:uppercase;letter-spacing:0.8px;">
          Request Received
        </p>

        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          We're here for you and ${childName} 💛
        </h1>

        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 16px;">
          Hi ${parentName},
        </p>

        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 24px;">
          Thank you for trusting us with something so important. We've received your request and our clinical team 
          will begin reviewing it right away. You don't need to do anything else at this stage — we'll be in touch with you soon.
        </p>

        <!-- Timeline -->
        <div style="border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;margin-bottom:28px;width:100%;max-width:100%;">

          <div style="background:${BRAND.primary};padding:14px 16px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#fff;letter-spacing:0.3px;">
              What happens next
            </p>
          </div>

          <!-- Step 1 -->
          <div style="padding:18px 16px;border-bottom:1px solid ${BRAND.border};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td valign="top" width="50" style="width:50px;padding-right:12px;">
                  <div style="width:34px;height:34px;border-radius:50%;background:${BRAND.primary};color:#fff;font-size:13px;font-weight:700;line-height:34px;text-align:center;">
                    1
                  </div>
                </td>
                <td valign="top">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${BRAND.dark};line-height:1.4;">
                    We review your request
                    <span style="font-weight:400;color:${BRAND.muted};">— within 2 days</span>
                  </p>
                  <p style="margin:0;font-size:13px;color:#555;line-height:1.65;">
                    Our clinical team will watch the video you shared and carefully review everything you've told us about
                    ${childName}. This helps us form a clear picture before we respond.
                  </p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Step 2 -->
          <div style="padding:18px 16px;border-bottom:1px solid ${BRAND.border};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td valign="top" width="50" style="width:50px;padding-right:12px;">
                  <div style="width:34px;height:34px;border-radius:50%;background:${BRAND.primary};color:#fff;font-size:13px;font-weight:700;line-height:34px;text-align:center;">
                    2
                  </div>
                </td>
                <td valign="top">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${BRAND.dark};line-height:1.4;">
                    We share our observations with you
                  </p>
                  <p style="margin:0;font-size:13px;color:#555;line-height:1.65;">
                    Before anything else, we'll send you an honest, compassionate summary of what we're seeing and what we think may be going on with ${childName} — along with practical guidance on what you can do in the meantime.
                  </p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Step 3 -->
          <div style="padding:18px 16px;border-bottom:1px solid ${BRAND.border};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td valign="top" width="50" style="width:50px;padding-right:12px;">
                  <div style="width:34px;height:34px;border-radius:50%;background:${BRAND.primary};color:#fff;font-size:13px;font-weight:700;line-height:34px;text-align:center;">
                    3
                  </div>
                </td>
                <td valign="top">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${BRAND.dark};line-height:1.4;">
                    A therapist is matched to ${childName}
                  </p>
                  <p style="margin:0;font-size:13px;color:#555;line-height:1.65;">
                    If you'd like to continue with us, we'll assign the right therapist for ${childName}'s needs — someone with the right experience and approach for your child's specific situation.
                  </p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Step 4 -->
          <div style="padding:18px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td valign="top" width="50" style="width:50px;padding-right:12px;">
                  <div style="width:34px;height:34px;border-radius:50%;background:${BRAND.primary};color:#fff;font-size:13px;font-weight:700;line-height:34px;text-align:center;">
                    4
                  </div>
                </td>
                <td valign="top">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${BRAND.dark};line-height:1.4;">
                    3-month therapeutic journey begins
                  </p>
                  <p style="margin:0;font-size:13px;color:#555;line-height:1.65;">
                    Your assigned therapist will work closely with ${childName} over an initial 3-month period. During this time you'll receive regular updates and guidance so you're always part of the process — never left wondering.
                  </p>
                </td>
              </tr>
            </table>
          </div>

        </div>

        <div style="background:#F0FAF0;border:1px solid #C8E6C9;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#2E7D32;line-height:1.7;">
            🔒 <strong>Your privacy matters.</strong> The video and information you shared are kept strictly confidential 
            and will only be seen by our clinical team and the therapist assigned to ${childName}.
          </p>
        </div>

        ${infoPill("📋", `Your request reference: <strong>#${requestId}</strong>`)}
        ${infoPill("📩", `We'll reply to this email address — keep an eye on your inbox over the next 2 days.`)}
        ${infoPill("💬", `Questions? Write to us at ${BRAND.supportEmail} — we're always happy to help.`)}
      `,
    }),
  });
}

async function sendTherapistAssignedToParentEmail({
  to,
  parentName,
  childName,
  therapistName,
  therapistEmail,
  therapistPhone,
  therapistSpecialty,
}) {
  await sendEmail({
    to,
    name: parentName,
    subject: `Your therapist has been assigned — ${childName} · ${BRAND.name}`,
    htmlContent: baseTemplate({
      preheader: `${therapistName} has been matched to ${childName}. Here's how to get in touch.`,
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#2E7D32;text-transform:uppercase;letter-spacing:0.8px;">
          Therapist Assigned
        </p>
 
        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          You're all set, ${parentName} 🎉
        </h1>
 
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px;">
          Thank you for completing your payment. We've matched <strong>${childName}</strong> with
          a therapist who is the right fit for their needs. Your journey with
          <strong>${BRAND.name}</strong> officially begins now.
        </p>
 
        <!-- Therapist card -->
        <div style="border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;margin-bottom:28px;">
 
          <div style="background:${BRAND.primary};padding:14px 20px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#fff;letter-spacing:0.3px;">
              Your assigned therapist
            </p>
          </div>
 
          <div style="padding:22px 22px 18px;">
            <!-- Avatar + name row -->
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:18px;">
              <tr>
                <td valign="middle" width="52" style="padding-right:14px;">
                  <div style="width:48px;height:48px;border-radius:50%;background:${BRAND.primary};color:#fff;font-size:18px;font-weight:700;line-height:48px;text-align:center;">
                    ${therapistName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                </td>
                <td valign="middle">
                  <p style="margin:0 0 2px;font-size:16px;font-weight:700;color:${BRAND.dark};">${therapistName}</p>
                  <p style="margin:0;font-size:13px;color:${BRAND.muted};">${therapistSpecialty}</p>
                </td>
              </tr>
            </table>
 
            <!-- Contact details -->
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding-bottom:10px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                    style="background:${BRAND.light};border:1px solid ${BRAND.border};border-radius:8px;padding:10px 14px;">
                    <tr>
                      <td width="20" style="padding-right:10px;font-size:15px;">📧</td>
                      <td>
                        <p style="margin:0 0 1px;font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Email</p>
                        <a href="mailto:${therapistEmail}" style="font-size:13px;color:${BRAND.primary};text-decoration:none;font-weight:600;">${therapistEmail}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${
                therapistPhone
                  ? `
              <tr>
                <td>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                    style="background:${BRAND.light};border:1px solid ${BRAND.border};border-radius:8px;padding:10px 14px;">
                    <tr>
                      <td width="20" style="padding-right:10px;font-size:15px;">📞</td>
                      <td>
                        <p style="margin:0 0 1px;font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Phone / WhatsApp</p>
                        <a href="tel:${therapistPhone}" style="font-size:13px;color:${BRAND.primary};text-decoration:none;font-weight:600;">${therapistPhone}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
                  : ""
              }
            </table>
          </div>
        </div>
 
        <!-- What to expect -->
        <div style="background:${BRAND.light};border:1px solid ${BRAND.border};border-radius:12px;padding:18px 20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:${BRAND.dark};">What happens next</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#444;line-height:1.9;">
            <li>Reach out to ${therapistName} using the contact details above to schedule your first session</li>
            <li>Sessions typically last 45–60 minutes and are tailored to ${childName}'s needs</li>
            <li>Your therapist will keep our admin team updated on progress throughout the programme</li>
          </ul>
        </div>
 
        ${infoPill("💛", `We're rooting for you and ${childName} every step of the way.`)}
        ${infoPill("💬", `Questions? Write to us at ${BRAND.supportEmail}`)}
      `,
    }),
  });
}

// ─── sendPatientAssignedToTherapistEmail ──────────────────────────────────────
// Sent to the therapist when a patient is assigned to them.
// Includes full patient context so they can prepare.
//
// params:
//   to             string   therapist email
//   therapistName  string
//   parentName     string
//   childName      string
//   childAge       number | null
//   location       string | null
//   notes          string | null   (behavioural notes from the request)
//   parentEmail    string | null

async function sendPatientAssignedToTherapistEmail({
  to,
  therapistName,
  parentName,
  childName,
  childAge,
  location,
  notes,
  primaryConcerns,
  parentEmail,
}) {
  await sendEmail({
    to,
    name: therapistName,
    subject: `New patient assigned — ${childName} · ${BRAND.name}`,
    htmlContent: baseTemplate({
      preheader: `A new patient has been assigned to your caseload: ${childName}, ${childAge ? `age ${childAge}` : ""}.`,
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${BRAND.accent};text-transform:uppercase;letter-spacing:0.8px;">
          New Patient
        </p>
 
        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          You have a new patient, ${therapistName.split(" ")[0]}
        </h1>
 
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 24px;">
          A patient has been matched to you and is ready to begin their therapeutic journey.
          Please review the details below and reach out to the family to schedule the first session.
        </p>
 
        <!-- Patient summary card -->
        <div style="border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;margin-bottom:24px;">
 
          <div style="background:${BRAND.primary};padding:14px 20px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#fff;">Patient summary</p>
          </div>
 
          <div style="padding:20px 22px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding-bottom:10px;">
                  ${infoRow("👦", "Child's name", childName)}
                </td>
              </tr>
              ${childAge ? `<tr><td style="padding-bottom:10px;">${infoRow("🎂", "Age", `${childAge} years old`)}</td></tr>` : ""}
              ${location ? `<tr><td style="padding-bottom:10px;">${infoRow("📍", "Location", location)}</td></tr>` : ""}
              <tr>
                <td style="padding-bottom:10px;">
                  ${infoRow("👤", "Parent / Guardian", parentName)}
                </td>
              </tr>
              ${parentEmail ? `<tr><td>${infoRow("📧", "Parent email", `<a href="mailto:${parentEmail}" style="color:${BRAND.primary};text-decoration:none;">${parentEmail}</a>`)}</td></tr>` : ""}
            </table>
          </div>
        </div>
 
        <!-- Behavioural notes -->
        ${
          notes
            ? `
        <div style="background:${BRAND.light};border-left:4px solid ${BRAND.primary};border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:${BRAND.primary};text-transform:uppercase;letter-spacing:0.08em;">
            Background notes from parent
          </p>
          <p style="margin:0;font-size:13px;color:#374151;line-height:1.8;white-space:pre-wrap;">${escapeHtml(notes)}</p>
        </div>`
            : ""
        }

        ${
          primaryConcerns
            ? `
        <div style="background:${BRAND.light};border-left:4px solid ${BRAND.primary};border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:${BRAND.primary};text-transform:uppercase;letter-spacing:0.08em;">
            Concerns from parent
          </p>
          <p style="margin:0;font-size:13px;color:#374151;line-height:1.8;white-space:pre-wrap;">${escapeHtml(primaryConcerns)}</p>
        </div>`
            : ""
        }
 
        <!-- Action -->
        <div style="background:#FFF8E6;border:1px solid #F0D080;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#7A5C00;line-height:1.7;">
            ⏱ <strong>Next step:</strong> Please contact ${parentName} within <strong>2 business days</strong>
            to introduce yourself and schedule the first session.
          </p>
        </div>
 
        ${infoPill("📋", "You can view any uploaded lab results in your therapist portal.")}
        ${infoPill("💬", `Need support? Contact us at ${BRAND.supportEmail}`)}
      `,
    }),
  });
}

// ─── infoRow helper (used only in assignment emails) ─────────────────────────
function infoRow(icon, label, value) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
      style="background:${BRAND.light};border:1px solid ${BRAND.border};border-radius:8px;padding:10px 14px;">
      <tr>
        <td width="24" style="padding-right:10px;font-size:15px;">${icon}</td>
        <td>
          <p style="margin:0 0 1px;font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">${label}</p>
          <p style="margin:0;font-size:13px;color:${BRAND.dark};font-weight:600;">${value}</p>
        </td>
      </tr>
    </table>`;
}


async function sendReportUploadedEmail({
  to,
  therapistName,
  childName,
  parentName,
  reportTitle,
  reportId,
  requestId,
}) {
  await sendEmail({
    to,
    name: "Admin",
    subject: `New report uploaded — ${childName} · ${BRAND.name}`,
    htmlContent: baseTemplate({
      preheader: `${therapistName} has uploaded a report for ${childName}.`,
      body: `
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${BRAND.accent};text-transform:uppercase;letter-spacing:0.8px;">
          Report Submitted
        </p>
 
        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:${BRAND.dark};line-height:1.3;">
          A new report is ready for review
        </h1>
 
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 24px;">
          <strong>${therapistName}</strong> has uploaded a report for
          <strong>${childName}</strong>. The case status has been automatically
          updated to <em>in progress</em>.
        </p>
 
        <div style="background:${BRAND.light};border:1px solid ${BRAND.border};border-radius:12px;padding:16px 18px;margin-bottom:24px;">
          ${infoRow("📄", "Report title",  reportTitle)}
          <div style="height:8px;"></div>
          ${infoRow("👦", "Child",         childName)}
          <div style="height:8px;"></div>
          ${infoRow("👤", "Parent",        parentName)}
          <div style="height:8px;"></div>
          ${infoRow("🩺", "Therapist",     therapistName)}
        </div>
 
        ${ctaButton("Review Report →", `${BRAND.website}/admin/reports`)}
 
        ${infoPill("🔄", "Case status has been set to <strong>in progress</strong>.")}
        ${infoPill("📋", `Report ID: <strong>#${reportId}</strong> · Case ID: <strong>#${requestId}</strong>`)}
      `,
    }),
  });
}
 

module.exports = {
  sendAdminNewApplicationEmail,
  sendApplicationReceivedEmail,
  sendApplicationReviewEmail,
  sendPasswordResetEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendApplicationStatusEmail,
  sendFormEmail,
  sendLabUploadConfirmationEmail,
  sendReportUploadedEmail,
  // ── new ──
  sendAdminNewHelpRequestEmail,
  sendParentRequestReceivedEmail,
  sendTherapistAssignedToParentEmail,
  sendPatientAssignedToTherapistEmail,
  sendReportFlaggedEmail
};
