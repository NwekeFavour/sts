// controllers/requestHelpController.js
// POST /api/requests/submit — multipart/form-data
// Receives child info + video, uploads video to Cloudflare R2, saves to help_requests

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { supabaseAdmin } = require("../config/db");
const crypto = require("crypto");
const {
  sendAdminNewHelpRequestEmail,
  sendParentRequestReceivedEmail,
} = require("../utils/mail");

// ─── R2 client ────────────────────────────────────────────────────────────────
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // https://<accountid>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;

// ─── POST /api/requests/submit ────────────────────────────────────────────────
exports.submitHelpRequest = async (req, res) => {
  try {
    const {
      // Parent
      parentName,
      parentEmail,
      parentPhone,

      // Child
      childName,
      childAge,
      childGender,
      location,

      // Behaviour & history
      primaryConcerns,
      diagnosisReceived,
      existingDiagnosis,
      behaviouralChallenges,
      communicationLevel,
      schoolAttendance,
      previousTherapy,
      previousTherapyDetails,
      additionalNotes,
    } = req.body;

    // ── Required field check ──────────────────────────────────────────────────
    if (!parentName || !parentEmail || !childName || !childAge) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields: parentName, parentEmail, childName, childAge",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "A video of the child is required. Please upload an MP4, MOV, or WebM file under 200MB.",
      });
    }

    // ── Video validation ──────────────────────────────────────────────────────
    const ALLOWED_TYPES = [
      "video/mp4",
      "video/quicktime", // MOV
      "video/webm",
      "video/x-msvideo", // AVI
    ];

    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Video must be MP4, MOV, WebM, or AVI.",
      });
    }

    if (req.file.size > 200 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Video must be under 200MB.",
      });
    }

    // ── Upload to R2 ──────────────────────────────────────────────────────────
    const ext = (req.file.originalname.split(".").pop() || "mp4").toLowerCase();
    const fileKey = `child-videos/${crypto.randomUUID()}.${ext}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        Metadata: {
          childName,
          parentEmail,
          uploadedAt: new Date().toISOString(),
        },
      }),
    );

    // ── Insert help request ───────────────────────────────────────────────────
    const { data, error } = await supabaseAdmin
      .from("requests")
      .insert([
        {
          parent_name: parentName,
          parent_email: parentEmail,
          parent_phone: parentPhone || null,
          child_name: childName,
          child_age: parseInt(childAge),
          child_gender: childGender || null,
          primary_concerns: primaryConcerns || null,
          diagnosis_received: diagnosisReceived || "unsure",
          existing_diagnosis: existingDiagnosis || null,
          behavioural_challenges: behaviouralChallenges || null,
          communication_level: communicationLevel || null,
          school_attendance: schoolAttendance || null,
          previous_therapy: previousTherapy || null,
          previous_therapy_details: previousTherapyDetails || null,
          location: location || null,
          additional_notes: additionalNotes || null,
          video_key: fileKey,
          video_filename: req.file.originalname,
          video_size_bytes: req.file.size,
          status: "pending",
        },
      ])
      .select("id")
      .single();

    if (error) throw error;

    Promise.allSettled([
      sendParentRequestReceivedEmail({
        to: parentEmail,
        parentName,
        childName,
        requestId: data.id,
      }).catch((e) =>
        console.error("[submitHelpRequest] parent email failed:", e.message),
      ),

      sendAdminNewHelpRequestEmail({
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM,
        parentName,
        parentEmail,
        parentPhone,
        childName,
        childAge,
        childGender,
        location,
        primaryConcerns,
        requestId: data.id,
      }).catch((e) =>
        console.error("[submitHelpRequest] admin email failed:", e.message),
      ),
    ]);

    return res.status(201).json({
      success: true,
      requestId: data.id,
      message:
        "Request submitted. Our team will be in touch within 1–3 business days.",
    });
  } catch (err) {
    console.error("[submitHelpRequest]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
