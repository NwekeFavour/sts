const express = require("express");
const crypto = require("crypto");
const multer = require("multer");

const { supabaseAdmin } = require("../config/db");
const { authenticate, requireRole } = require("../middleware/auth");
const {
  sendFormEmail,
  sendLabUploadConfirmationEmail,
} = require("../utils/mail");

const router = express.Router();
const guard = [authenticate, requireRole("admin")];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ─── token helpers ────────────────────────────────────────────────────────────
const TOKEN_SECRET = process.env.FORM_TOKEN_SECRET || "change-me-in-production";

function generateUploadToken(formId) {
  const hmac = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(formId)
    .digest("hex");
  return Buffer.from(`${formId}:${hmac}`).toString("base64url");
}

function verifyUploadToken(token) {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const colonIdx = raw.indexOf(":");
    if (colonIdx === -1) return null;
    const formId = raw.slice(0, colonIdx);
    const providedHmac = raw.slice(colonIdx + 1);
    const expectedHmac = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(formId)
      .digest("hex");
    if (
      !crypto.timingSafeEqual(
        Buffer.from(providedHmac, "hex"),
        Buffer.from(expectedHmac, "hex"),
      )
    )
      return null;
    return formId;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES — must be defined BEFORE guard middleware and param routes
// so /lab-upload/validate/:token is not swallowed by /:id
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/forms/lab-upload/validate/:token
router.get("/lab-upload/validate/:token", async (req, res) => {
  const formId = verifyUploadToken(req.params.token);
  if (!formId)
    return res.status(400).json({ error: "Invalid or malformed token." });

  try {
    const { data: form, error } = await supabaseAdmin
      .from("forms")
      .select(
        `
        id, status, data,
        request:requests!request_id ( child_name, parent_name )
      `,
      )
      .eq("id", formId)
      .single();

    if (error || !form)
      return res.status(404).json({ error: "Form not found." });

    if (form.status === "submitted" || form.status === "reviewed") {
      return res
        .status(410)
        .json({ error: "This form has already been submitted." });
    }

    if (form.data?.upload_token !== req.params.token) {
      return res.status(400).json({
        error:
          "This link has been superseded. Please use the latest link from your email.",
      });
    }

    return res.status(200).json({
      formId: form.id,
      childName: form.request?.child_name ?? "—",
      parentName: form.request?.parent_name ?? "—",
      advice: form.data?.advice ?? null,
    });
  } catch (err) {
    console.error("[GET /lab-upload/validate]", err);
    return res.status(500).json({ error: "Failed to validate token." });
  }
});

// PATCH /api/forms/:id/review
// POST /api/forms/lab-upload/submit
router.post("/lab-upload/submit", upload.single("file"), async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(422).json({ error: "token is required." });

  const formId = verifyUploadToken(token);
  if (!formId)
    return res.status(400).json({ error: "Invalid or malformed token." });
  if (!req.file) return res.status(422).json({ error: "No file uploaded." });

  const ALLOWED_MIME = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  if (!ALLOWED_MIME.includes(req.file.mimetype)) {
    return res
      .status(422)
      .json({ error: "Unsupported file type. Please upload a PDF or image." });
  }

  try {
    // ── 1. Fetch form + request ───────────────────────────────────────────────
    const { data: form, error: formErr } = await supabaseAdmin
      .from("forms")
      .select(
        `
        id, status, data, request_id,
        request:requests!request_id ( parent_name, child_name )
      `,
      )
      .eq("id", formId)
      .single();

    console.log("[lab-upload/submit] form:", JSON.stringify(form, null, 2));
    console.log(
      "[lab-upload/submit] formErr:",
      JSON.stringify(formErr, null, 2),
    );

    if (formErr || !form)
      return res.status(404).json({ error: "Form not found." });
    if (form.status !== "pending") {
      return res
        .status(410)
        .json({ error: "This form has already been submitted." });
    }
    if (form.data?.upload_token !== token) {
      return res
        .status(400)
        .json({
          error: "This link is no longer valid. Please request a new one.",
        });
    }

    // ── 2. Get parent email from form data ────────────────────────────────────
    const parentEmail = form.data?.parent_email ?? null;

    // ── 3. Upload file to storage ─────────────────────────────────────────────
    const ext = req.file.originalname.split(".").pop().toLowerCase();
    const filePath = `lab-results/${formId}_${Date.now()}.${ext}`;

    const { error: storageErr } = await supabaseAdmin.storage
      .from("lab-results")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (storageErr) throw storageErr;

    // ── 4. Mark submitted + invalidate token ──────────────────────────────────
    const { error: updateErr } = await supabaseAdmin
      .from("forms")
      .update({
        status: "submitted",
        file_url: filePath,
        submitted_at: new Date().toISOString(),
        data: { ...(form.data ?? {}), upload_token: null },
      })
      .eq("id", formId);

    if (updateErr) throw updateErr;

    // ── 5. Confirmation email (best-effort) ───────────────────────────────────
    if (parentEmail) {
      sendLabUploadConfirmationEmail({
        to: parentEmail,
        parentName: form.request?.parent_name ?? "Parent",
        childName: form.request?.child_name ?? "your child",
      }).catch((e) => console.warn("[lab-upload confirm email]", e));
    }

    // ── 6. Log activity ───────────────────────────────────────────────────────
    await Promise.resolve(
      supabaseAdmin.rpc("log_activity", {
        p_actor_id: null,
        p_event_type: "form_submitted",
        p_entity_type: "form",
        p_entity_id: formId,
        p_message: `Lab results uploaded for ${form.request?.child_name ?? "child"}`,
      }),
    ).catch(console.warn);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[POST /lab-upload/submit]", err);
    return res
      .status(500)
      .json({ error: "Upload failed. Please try again.", detail: err.message });
  }
});
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/forms  — list all forms with joined request data
router.get("/", ...guard, async (req, res) => {
  const { status } = req.query;
  try {
    let query = supabaseAdmin
      .from("forms")
      .select(
        `
        id, status, file_url, data, sent_at, submitted_at, created_at,
        request:requests!request_id ( id, child_name, parent_name, parent_email )
      `, 
      )
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    const forms = (data ?? []).map((f) => ({
      id: f.id,
      status: f.status,
      file_url: f.file_url ?? null,
      data: f.data ?? null,
      advice: f.data?.advice ?? null,
      sent_at: f.sent_at,
      submitted_at: f.submitted_at,
      request_id: f.request?.id ?? null,
      child_name: f.request?.child_name ?? "—",
      parent_name: f.request?.parent_name ?? "—",
    }));

    return res.status(200).json({ forms });
  } catch (err) {
    console.error("[GET /forms]", err);
    return res.status(500).json({ error: "Failed to fetch forms" });
  }
});

// POST /api/forms/send
router.post("/send", ...guard, async (req, res) => {
  const { requestId, advice, parentEmail, parentName, childName } = req.body;

  // Validate required fields up front with clear messages
  const missing = [];
  if (!requestId) missing.push("requestId");
  if (!advice?.trim()) missing.push("advice");
  if (!parentEmail) missing.push("parentEmail");
  if (missing.length) {
    return res
      .status(422)
      .json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  try {
    // ── 1. Verify request exists ──────────────────────────────────────────────
    // Only select columns that actually exist on the requests table
    const { data: request, error: reqErr } = await supabaseAdmin
      .from("requests")
      .select("id, parent_name, child_name")
      .eq("id", requestId)
      .maybeSingle(); // maybeSingle: returns null instead of error when not found

    if (reqErr) {
      console.error("[POST /forms/send] request lookup error:", reqErr);
      return res.status(500).json({
        error: "Database error looking up request.",
        detail: reqErr.message,
      });
    }
    if (!request) {
      return res.status(404).json({ error: `Request ${requestId} not found.` });
    }

    const { data: existingForm, error: formCheckErr } = await supabaseAdmin
      .from("forms")
      .select("id, status")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (formCheckErr) throw formCheckErr;

    if (existingForm?.status === "submitted") {
      // Optionally close the request
      await supabaseAdmin
        .from("requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      return res.status(409).json({
        error: "This patient has already submitted the requested form.",
      });
    }
    // ── 2. Insert form row ────────────────────────────────────────────────────
    const { data: form, error: insertErr } = await supabaseAdmin
      .from("forms")
      .insert({
        request_id: requestId,
        status: "pending",
        data: { advice: advice.trim(), parent_email: parentEmail },
        sent_at: new Date().toISOString(),
      })
      .select("id, status, sent_at")
      .single();

    if (insertErr) throw insertErr;

    // ── 3. Generate upload token and patch into data ──────────────────────────
    const uploadToken = generateUploadToken(form.id);

    const { error: patchErr } = await supabaseAdmin
      .from("forms")
      .update({
        data: {
          advice: advice.trim(),
          parent_email: parentEmail,
          upload_token: uploadToken,
        },
      })
      .eq("id", form.id);

    if (patchErr) throw patchErr;

    // ── 4. Send email ─────────────────────────────────────────────────────────
    const uploadUrl = `${process.env.CLIENT_URL}/lab-upload/${uploadToken}`;

    await sendFormEmail({
      to: parentEmail,
      parentName: parentName ?? request.parent_name,
      childName: childName ?? request.child_name,
      advice: advice.trim(),
      uploadUrl,
    });

    // ── 5. Log activity ───────────────────────────────────────────────────────
    await Promise.resolve(
      supabaseAdmin.rpc("log_activity", {
        p_actor_id: req.user.id,
        p_event_type: "form_sent",
        p_entity_type: "form",
        p_entity_id: form.id,
        p_message: `Form has been sent to ${parentName ?? request.parent_name} for ${childName ?? request.child_name}`,
      }),
    ).catch(console.warn);

    return res.status(201).json({
      message: "Form sent successfully.",
      form: {
        ...form,
        // title:        FORM_TYPE_LABELS[formType],
        child_name: childName ?? request.child_name,
        parent_name: parentName ?? request.parent_name,
        parent_email: parentEmail,
        request_id: requestId,
      },
    });
  } catch (err) {
    console.error("[POST /forms/send]", err);
    return res
      .status(500)
      .json({ error: "Failed to send form.", detail: err.message });
  }
});

// POST /api/forms/:id/resend
router.post("/:id/resend", ...guard, async (req, res) => {
  console.log("[resend] HIT - params.id:", req.params.id);

  try {
    const { data: form, error: formErr } = await supabaseAdmin
      .from("forms")
      .select(
        `
        id, status, data,
        request:requests!request_id ( parent_name, child_name )
      `,
      )
      .eq("id", req.params.id)
      .single();

    console.log("[resend] form:", JSON.stringify(form, null, 2));
    console.log("[resend] formErr:", JSON.stringify(formErr, null, 2));

    if (formErr || !form)
      return res.status(404).json({ error: "Form not found." });
    if (form.status === "submitted") {
      return res.status(400).json({
        error: "Cannot resend a form that has already been submitted.",
      });
    }

    const parentEmail = form.data?.parent_email ?? null;
    if (!parentEmail) {
      return res
        .status(422)
        .json({ error: "No email address found for this parent." });
    }

    const uploadToken = generateUploadToken(form.id);
    const uploadUrl = `${process.env.CLIENT_URL}/lab-upload/${uploadToken}`;

    await supabaseAdmin
      .from("forms")
      .update({
        data: { ...(form.data ?? {}), upload_token: uploadToken },
        sent_at: new Date().toISOString(),
        status: "pending",
      })
      .eq("id", form.id);

    await sendFormEmail({
      to: parentEmail,
      parentName: form.request.parent_name,
      childName: form.request.child_name,
      advice: form.data?.advice ?? "",
      uploadUrl,
    });

    return res.status(200).json({ message: "Form resent successfully." });
  } catch (err) {
    console.error("[POST /forms/:id/resend]", err);
    return res.status(500).json({ error: "Failed to resend form." });
  }
});

// DELETE /api/forms/:id
router.delete("/:id", ...guard, async (req, res) => {
  try {
    const { data: form } = await supabaseAdmin
      .from("forms")
      .select("file_url")
      .eq("id", req.params.id)
      .single();

    if (form?.file_url) {
      await supabaseAdmin.storage.from("lab-results").remove([form.file_url]);
    }

    const { error } = await supabaseAdmin
      .from("forms")
      .delete()
      .eq("id", req.params.id);
    if (error) throw error;

    return res.status(200).json({ message: "Form deleted" });
  } catch (err) {
    console.error("[DELETE /forms/:id]", err);
    return res.status(500).json({ error: "Failed to delete form" });
  }
});

// GET /api/forms/:id/download  — 1-hour signed URL for lab file
router.get("/:id/download", ...guard, async (req, res) => {
  try {
    const { data: form, error } = await supabaseAdmin
      .from("forms")
      .select("file_url, status")
      .eq("id", req.params.id)
      .single();

    if (error || !form)
      return res.status(404).json({ error: "Form not found." });
    if (!form.file_url)
      return res.status(404).json({ error: "No file uploaded for this form." });

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("lab-results")
      .createSignedUrl(form.file_url, 60 * 60);

    if (signErr) throw signErr;

    return res.status(200).json({ url: signed.signedUrl });
  } catch (err) {
    console.error("[GET /forms/:id/download]", err);
    return res.status(500).json({ error: "Failed to generate download URL." });
  }
});

module.exports = router;
