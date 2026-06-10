const { supabaseAdmin } = require("../config/db");
const {
  sendApplicationRejectedEmail,
  sendApplicationApprovedEmail,
  sendApplicationReceivedEmail,
  sendAdminNewApplicationEmail,
} = require("../utils/mail");

exports.applyTherapist = async (req, res) => {
  try {
    const {
      // ── Always present ──────────────────────────────────────────────────────
      fullName,
      email,
      phone,
      coverLetter,
      experienceLevel, // 'beginner' | 'intermediate' | 'expert'

      // ── Beginner + Intermediate + Expert ───────────────────────────────────
      schoolBackground, // where they studied
      courseStudied, // beginner/intermediate — course name
      comfortWithSpectrum, // beginner/intermediate — how they feel around autistic kids
      irritationOrFrustration, // beginner/intermediate — frustration handling
      whyTherapy, // beginner only — motivation

      // ── Intermediate + Expert ───────────────────────────────────────────────
      yearsOfExperience,
      specialization,
      resumeLink,

      // ── Expert only ─────────────────────────────────────────────────────────
      degreeLevel, // e.g. "M.Sc. ABA"
      licenseNumber,
      approachPhilosophy, // clinical philosophy
    } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid email required." });
    }
    // ── Validation: only truly universal required fields ──────────────────────
    if (!fullName || !email || !coverLetter || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message:
          "Certain fields are required for all applicants: full name, email, cover letter, experience level",
      });
    }


    
    const VALID_LEVELS = ["beginner", "intermediate", "expert"];
    if (!VALID_LEVELS.includes(experienceLevel)) {
      return res.status(400).json({
        success: false,
        message: `experienceLevel must be one of: ${VALID_LEVELS.join(", ")}`,
      });
    }


    if (experienceLevel === "intermediate" || experienceLevel === "expert") {
      if (!yearsOfExperience) {
        return res
          .status(400)
          .json({ success: false, message: "Years of experience required." });
      }
    }
    if (experienceLevel === "expert") {
      if (!licenseNumber) {
        return res
          .status(400)
          .json({
            success: false,
            message: "License number required for expert applicants.",
          });
      }
      if (!degreeLevel) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Degree level required for expert applicants.",
          });
      }
    }

    // ── Build qualifications string from level-specific fields ────────────────
    // Consolidates the school/degree info into the existing qualifications column
    const qualifications =
      [
        schoolBackground && `School: ${schoolBackground}`,
        courseStudied && `Course: ${courseStudied}`,
        degreeLevel && `Degree: ${degreeLevel}`,
      ]
        .filter(Boolean)
        .join(" | ") || null;

    // ── Store ALL level-specific answers in cover_letter as structured text ───
    // This avoids needing new DB columns for each question while keeping answers readable
    const fullCoverLetter = [
      coverLetter,
      comfortWithSpectrum &&
        `\n\n[Comfort with spectrum children]\n${comfortWithSpectrum}`,
      irritationOrFrustration &&
        `\n\n[Handling frustration]\n${irritationOrFrustration}`,
      whyTherapy && `\n\n[Motivation for therapy work]\n${whyTherapy}`,
      approachPhilosophy &&
        `\n\n[Clinical approach / philosophy]\n${approachPhilosophy}`,
    ]
      .filter(Boolean)
      .join("");

    const { data, error } = await supabaseAdmin
      .from("therapist_applications")
      .insert([
        {
          full_name: fullName,
          email,
          phone: phone || null,
          qualifications: qualifications || null,
          years_of_experience: yearsOfExperience
            ? parseInt(yearsOfExperience, 10)
            : null,
          specialization: specialization || null,
          license_number: licenseNumber || null,
          resume_link: resumeLink || null,
          cover_letter: fullCoverLetter || null,
          experience_level: experienceLevel,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const applicationId = data.id;

    return res.status(201).json({ success: true, applicationId });

    Promise.allSettled([
      sendApplicationReceivedEmail({
        to: email,
        name: fullName,
        applicationId,
        experienceLevel,
      }).catch((e) =>
        console.error("[applyTherapist] applicant email failed:", e.message),
      ),

      sendAdminNewApplicationEmail({
        to: process.env.EMAIL_FROM,
        name: fullName,
        email,
        phone,
        specialization,
        yearsOfExperience,
        licenseNumber,
        experienceLevel,
        applicationId,
      }).catch((e) =>
        console.error("[applyTherapist] admin email failed:", e.message),
      ),
    ]);
  } catch (err) {
    console.error("[applyTherapist]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get all applications (admin) ─────────────────────────────────────────────
exports.getAllApplications = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("therapist_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error)
      return res.status(500).json({ success: false, message: error.message });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get all therapists + pending applicants combined (admin) ──────────────────
// Returns:
//   profiles with role=therapist  → status as-is (active | pending | suspended)
//   therapist_applications        → mapped to status "training" until approved
exports.getAllTherapistsAndApplicants = async (req, res) => {
  try {
    // 1. Confirmed therapist profiles
    const { data: therapists, error: tErr } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, full_name, email, phone, specialization, status, avatar_url, created_at",
      )
      .eq("role", "therapist")
      .order("created_at", { ascending: false });

    if (tErr)
      return res.status(500).json({ success: false, message: tErr.message });

    // 2. Applications that haven't been converted to a profile yet
    //    We exclude emails that already exist in profiles to avoid duplicates
    const therapistEmails = (therapists || []).map((t) => t.email);

    const { data: applications, error: aErr } = await supabaseAdmin
      .from("therapist_applications")
      .select(
        "id, full_name, email, phone, specialization, years_of_experience, status, created_at",
      )
      .order("created_at", { ascending: false });

    if (aErr)
      return res.status(500).json({ success: false, message: aErr.message });

    // Map therapist profiles to unified shape
    const therapistRows = (therapists || []).map((t) => ({
      id: t.id,
      full_name: t.full_name,
      email: t.email,
      phone: t.phone || "—",
      specialization: t.specialization || "—",
      avatar_url: t.avatar_url || null,
      status: t.status, // active | pending | suspended
      source: "profile", // came from profiles table
      joined: t.created_at,
    }));

    // Map applications to unified shape
    // - approved applications that already have a profile are excluded (email match)
    // - pending/rejected → "training" display status
    // - approved but not yet a profile → "training" (edge case)
    const applicationRows = (applications || [])
      .filter((a) => !therapistEmails.includes(a.email))
      .map((a) => ({
        id: a.id,
        full_name: a.full_name,
        email: a.email,
        phone: a.phone || "—",
        specialization: a.specialization || "—",
        avatar_url: null,
        status: "training", // always "training" until promoted to profile
        application_status: a.status, // pending | approved | rejected (actual app status)
        source: "application", // came from therapist_applications table
        joined: a.created_at,
      }));

    return res.status(200).json({
      success: true,
      data: [...therapistRows, ...applicationRows],
    });
  } catch (err) {
    console.error("[getAllTherapistsAndApplicants]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update application status via URL param (admin) ──────────────────────────
// PATCH /api/therapist/applications/:id/:status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id, status } = req.params;
    const { reason = null } = req.body ?? {};

    const VALID = ["pending", "approved", "rejected"];

    if (!VALID.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Must be one of: ${VALID.join(", ")}`,
      });
    }

    // 1. Fetch application first (needed for email check)
    const { data: app, error: appErr } = await supabaseAdmin
      .from("therapist_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (appErr || !app) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // 2. 🚫 BLOCK if therapist profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("email", app.email)
      .eq("role", "therapist")
      .maybeSingle();

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message:
          "This user is already a therapist. Application status cannot be modified.",
      });
    }

    // 3. Proceed with update
    const { data, error } = await supabaseAdmin
      .from("therapist_applications")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      return res.status(500).json({ success: false, message: error.message });
    }

    // ── Email logic unchanged ──
    try {
      if (status === "rejected") {
        await sendApplicationRejectedEmail({
          to: app.email,
          name: app.full_name,
          reason: reason ?? null,
        });
      }
    } catch (emailErr) {
      console.error(
        "[updateApplicationStatus] Email send failed:",
        emailErr.message,
      );
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("[updateApplicationStatus]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.promoteToTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const crypto = require("crypto");

    // 1. Fetch application
    const { data: app, error: appErr } = await supabaseAdmin
      .from("therapist_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (appErr || !app) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    // 2. ── Status guard ──────────────────────────────────────────────────────
    if (app.status === "rejected") {
      return res.status(400).json({
        success: false,
        message:
          "This application has been rejected and cannot be promoted. Reset it to pending first if you wish to reconsider.",
      });
    }

    if (app.status === "pending") {
      return res.status(400).json({
        success: false,
        message:
          "This application is still pending. Please approve it before promoting to therapist.",
      });
    }

    // app.status === "approved" — safe to continue

    // 3. Guard — already promoted?
    const { data: existing } = await supabaseAdmin
      .from("therapist_applications")
      .select("id")
      .eq("email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An application with this email is already under review.",
      });
    }

    // 4. Create Supabase auth user
    const tempPassword = crypto.randomUUID();
    const { data: authData, error: authErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: app.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: app.full_name },
      });

    if (authErr) throw authErr;
    const userId = authData.user.id;

    // 5. Insert therapist profile
    const { error: profileErr } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: app.full_name,
      email: app.email,
      phone: app.phone || null,
      specialization: app.specialization || null,
      role: "therapist",
      status: "active",
    });
    if (profileErr) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw profileErr;
    }

    // 6. Generate invite link
    const { data: linkData, error: linkErr } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: app.email,
      });
    if (linkErr) throw linkErr;

    const url = new URL(linkData.properties.action_link);
    const token =
      url.searchParams.get("token") || linkData.properties.hashed_token;

    // 7. Send branded approval + invite email
    await sendApplicationApprovedEmail({
      to: app.email,
      name: app.full_name,
      inviteToken: token,
    });

    // 8. Mark application promoted (keep status approved, add promoted_at timestamp)
    await supabaseAdmin
      .from("therapist_applications")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return res.status(201).json({
      success: true,
      message: `${app.full_name} has been promoted to therapist. Invite email sent.`,
      therapistId: userId,
    });
  } catch (err) {
    console.error("[promoteToTherapist]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete application (admin) ───────────────────────────────────────────────
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("therapist_applications")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    const { error } = await supabaseAdmin
      .from("therapist_applications")
      .delete()
      .eq("id", id);

    if (error)
      return res.status(500).json({ success: false, message: error.message });

    return res
      .status(200)
      .json({ success: true, message: "Application deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update therapist profile status (admin) ──────────────────────────────────
// PATCH /api/therapist/profile/:id/:status
// :status → active | pending | suspended
exports.updateTherapistStatus = async (req, res) => {
  try {
    const { id, status } = req.params;
    const VALID = ["active", "pending", "suspended"];

    if (!VALID.includes(status)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid status. Must be: ${VALID.join(", ")}`,
        });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ status })
      .eq("id", id)
      .eq("role", "therapist")
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116")
        return res
          .status(404)
          .json({ success: false, message: "Therapist not found" });
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
