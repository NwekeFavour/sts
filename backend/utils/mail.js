const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
const transac = client.transactionalEmails;

const sender = {
  name:  process.env.EMAIL_FROM_NAME || "St. Stephen's Family",
  email: process.env.EMAIL_FROM,
};

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND = {
  primary:    "#513424",
  accent:     "#C8A97E",
  dark:       "#1A1A1A",
  light:      "#F7F5F0",
  muted:      "#6B6B6B",
  border:     "#E5E0D8",
  name:       "St. Stephen's Family Centre",
  tagline:    "Compassionate care for every child",
  website:    process.env.FRONTEND_URL || "https://ststephensfamily.com",
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
      preheader: "Congratulations — your therapist application has been approved.",
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
        ${reason ? `
        <div style="background:${BRAND.light};border-left:3px solid ${BRAND.accent};border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 20px;font-size:13px;color:#555;line-height:1.7;">
          <strong>Feedback:</strong> ${reason}
        </div>` : ""}
        <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
          We encourage you to apply again in the future as our team and needs continue to grow. We wish you all the best in your career.
        </p>
        ${infoPill("💬", `Questions? Reach us at ${BRAND.supportEmail}`)}
      `,
    }),
  });
}

// ─── 5. Status updated (generic — for pending → any other status) ────────────
async function sendApplicationStatusEmail({ to, name, status, reason = null, inviteToken = null }) {
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

async function sendApplicationReceivedEmail({ to, name, applicationId }) {
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
          <p style="margin:0 0 6px;"><strong>Experience:</strong> ${yearsOfExperience || "Not specified"} years</p>
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

module.exports = {
  sendAdminNewApplicationEmail,
  sendApplicationReceivedEmail,
  sendApplicationReviewEmail,
  sendPasswordResetEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendApplicationStatusEmail,
};