// controllers/requestController.js
// Covers the full lifecycle of a help request from submission → assignment → completion

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { supabaseAdmin } = require("../config/db");

// ─── R2 client ────────────────────────────────────────────────────────────────
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function paginate(query, page = 1, limit = 20) {
  const from = (page - 1) * limit;
  return query.range(from, from + limit - 1);
}

// ─── GET /api/requests ────────────────────────────────────────────────────────
// Admin: all requests, filterable + paginated
exports.getAllRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    let query = supabaseAdmin
      .from("requests")
      .select(`
        id, parent_name, parent_email, parent_phone,
        child_name, child_age, child_gender,
        primary_concerns, diagnosis_received, existing_diagnosis,
        behavioural_challenges, communication_level,
        school_attendance, previous_therapy, previous_therapy_details,
        additional_notes, video_filename, video_size_bytes,
        status, created_at, assigned_at,
        therapist:profiles!therapist_id (
          id, full_name, email, specialization
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    if (status)  query = query.eq("status", status);
    if (search)  query = query.ilike("parent_name", `%${search}%`);

    const { data, error, count } = await paginate(query, +page, +limit);
    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
      total: count,
      page:  +page,
      limit: +limit,
    });
  } catch (err) {
    console.error("[getAllRequests]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/requests/:id ────────────────────────────────────────────────────
// Admin or assigned therapist: single request full detail
exports.getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const { data, error } = await supabaseAdmin
      .from("requests")
      .select(`
        *,
        therapist:profiles!therapist_id (
          id, full_name, email, specialization, phone
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Therapists can only view their own assigned requests
    if (role === "therapist" && data.therapist_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorised to view this request" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/requests/:id/video-url ─────────────────────────────────────────
// Admin or assigned therapist: short-lived signed URL to stream the child video
exports.getVideoSignedUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const { data, error } = await supabaseAdmin
      .from("requests")
      .select("video_key, video_filename, child_name, parent_name, therapist_id")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (!data.video_key) {
      return res.status(404).json({ success: false, message: "No video on this request" });
    }

    // Therapist must be assigned to this request
    if (role === "therapist" && data.therapist_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorised to view this video" });
    }

    // Signed URL valid 1 hour — enough to stream without permanent public access
    const url = await getSignedUrl(
      r2,
      new GetObjectCommand({ Bucket: BUCKET, Key: data.video_key }),
      { expiresIn: 3600 }
    );

    return res.status(200).json({
      success:    true,
      url,
      filename:   data.video_filename,
      childName:  data.child_name,
      parentName: data.parent_name,
      expiresIn:  "1 hour",
    });
  } catch (err) {
    console.error("[getVideoSignedUrl]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/requests/:id/assign ──────────────────────────────────────────
// Admin: assign a therapist to a request
exports.assignTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const { therapist_id } = req.body;

    if (!therapist_id) {
      return res.status(422).json({ success: false, message: "therapist_id is required" });
    }

    // Verify therapist exists and is active
    const { data: therapist, error: tErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, status")
      .eq("id", therapist_id)
      .eq("role", "therapist")
      .single();

    if (tErr || !therapist) {
      return res.status(404).json({ success: false, message: "Therapist not found" });
    }

    if (therapist.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Therapist is ${therapist.status} — only active therapists can be assigned`,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("requests")
      .update({
        therapist_id,
        status:      "assigned",
        assigned_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, child_name, parent_name, status, therapist_id")
      .single();

    if (error) {
      if (error.code === "PGRST116") return res.status(404).json({ success: false, message: "Request not found" });
      throw error;
    }

    // Log activity
    await supabaseAdmin.rpc("log_activity", {
      p_actor_id:    req.user.id,
      p_event_type:  "therapist_assigned",
      p_entity_type: "help_request",
      p_entity_id:   id,
      p_message:     `${therapist.full_name} assigned to ${data.child_name}'s request`,
    });

    return res.status(200).json({
      success:  true,
      message:  `${therapist.full_name} assigned successfully`,
      data,
    });
  } catch (err) {
    console.error("[assignTherapist]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/requests/:id/status ──────────────────────────────────────────
// Admin or therapist: update request status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { role, id: userId } = req.user;

    const VALID = ["pending", "assigned", "in-progress", "completed", "cancelled"];
    if (!VALID.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID.join(", ")}`,
      });
    }

    // Therapist can only update requests assigned to them
    // and can only move to in-progress or completed
    if (role === "therapist") {
      const THERAPIST_ALLOWED = ["in-progress", "completed"];
      if (!THERAPIST_ALLOWED.includes(status)) {
        return res.status(403).json({
          success: false,
          message: "Therapists can only set status to in-progress or completed",
        });
      }

      const { data: existing } = await supabaseAdmin
        .from("requests")
        .select("therapist_id")
        .eq("id", id)
        .single();

      if (existing?.therapist_id !== userId) {
        return res.status(403).json({ success: false, message: "Not authorised to update this request" });
      }
    }

    const { data, error } = await supabaseAdmin
      .from("requests")
      .update({ status })
      .eq("id", id)
      .select("id, child_name, status")
      .single();

    if (error) {
      if (error.code === "PGRST116") return res.status(404).json({ success: false, message: "Request not found" });
      throw error;
    }

    await supabaseAdmin.rpc("log_activity", {
      p_actor_id:    req.user.id,
      p_event_type:  "request_status_updated",
      p_entity_type: "help_request",
      p_entity_id:   id,
      p_message:     `Request for ${data.child_name} marked as ${status}`,
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("[updateStatus]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/requests/my-cases ───────────────────────────────────────────────
// Therapist: their own assigned requests only
exports.getMyCases = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from("requests")
      .select(`
        id, parent_name, parent_email, parent_phone,
        child_name, child_age, child_gender,
        primary_concerns, communication_level,
        video_filename, status, created_at, assigned_at
      `)
      .eq("therapist_id", req.user.id)
      .order("assigned_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/requests/:id ─────────────────────────────────────────────────
// Admin only: hard delete (video stays in R2 until manually purged)
exports.deleteRequest = async (req, res) => {
  try {
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("requests")
      .select("id, child_name")
      .eq("id", req.params.id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const { error } = await supabaseAdmin
      .from("requests")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    return res.status(200).json({ success: true, message: "Request deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};