// ─── Brevo (formerly Sendinblue) email service ─────────────────────────────
// @getbrevo/brevo v2+ uses a single BrevoClient instance.
// The old SibApiV3Sdk.TransactionalEmailsApi() constructor no longer exists.

const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

// Shorthand — all transactional email methods live here
const transac = client.transactionalEmails;

const sender = {
  name: process.env.EMAIL_FROM_NAME,
  email: process.env.EMAIL_FROM,
};

// ─── Shared send helper ────────────────────────────────────────────────────

async function sendEmail({ to, name, subject, htmlContent }) {
  await transac.sendTransacEmail({
    sender,
    to: [{ email: to, name }],
    subject,
    htmlContent,
  });
}

// ─── Therapist invite ──────────────────────────────────────────────────────

async function sendTherapistInviteEmail({ to, name, inviteToken }) {
  const link = `${process.env.FRONTEND_URL}/invite/reset-password?token=${inviteToken}`;

  await sendEmail({
    to,
    name,
    subject: "You have been added as a therapist — set your password",
    htmlContent: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
        <h2 style="color:#2d2d2d;">Welcome to the Therapy Platform</h2>
        <p>Hi ${name},</p>
        <p>
          You have been added as a therapist by the platform administrator.
          Click the button below to set your password and activate your account.
        </p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
          Set my password
        </a>
        <p style="color:#666;font-size:13px;">
          This link expires in 24 hours.
          If you did not expect this email, you can safely ignore it.
        </p>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0;" />
        <p style="color:#999;font-size:12px;">Therapy Platform — confidential staff communication</p>
      </div>
    `,
  });
}

// ─── Self-serve password reset ─────────────────────────────────────────────

async function sendPasswordResetEmail({ to, name, resetToken }) {
  const link = `${process.env.FRONTEND_URL}/invite/reset-password?token=${resetToken}`;

  await sendEmail({
    to,
    name,
    subject: "Reset your password",
    htmlContent: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
        <h2>Password reset</h2>
        <p>Hi ${name},</p>
        <p>Someone requested a password reset for your account. Click below to choose a new password.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
          Reset password
        </a>
        <p style="color:#666;font-size:13px;">
          This link expires in 1 hour.
          If you did not request this, ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = { sendTherapistInviteEmail, sendPasswordResetEmail };