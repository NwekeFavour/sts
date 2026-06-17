// routes/therapist/index.js
// Mount: app.use('/api/therapist', require('./routes/therapist'))

const express = require('express');
const multer  = require('multer');
const { supabaseAdmin }             = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { sendReportUploadedEmail, sendTherapistAssignedToParentEmail }   = require('../utils/mail');

const router = express.Router();
const guard  = [authenticate, requireRole('therapist')];
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });


router.patch('/cases/:id/accept', ...guard, async (req, res) => {
  try {
    const { id }      = req.params;
    const therapistId = req.user.id;

    // 1. Fetch full request + therapist profile in parallel
    const [
      { data: request, error: reqErr },
      { data: therapist, error: tErr },
    ] = await Promise.all([
      supabaseAdmin
        .from('requests')
        .select('id, therapist_id, status, child_name, parent_name, parent_email, child_age, location, additional_notes, primary_concerns')
        .eq('id', id)
        .maybeSingle(),

      supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, phone, specialization')
        .eq('id', therapistId)
        .single(),
    ]);

    if (reqErr) {
      console.error('[acceptCase] lookup error:', reqErr);
      return res.status(500).json({ success: false, message: reqErr.message });
    }
    if (!request) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }
    if (tErr || !therapist) {
      return res.status(404).json({ success: false, message: 'Therapist profile not found.' });
    }
    if (request.therapist_id !== therapistId) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this case.' });
    }
    if (request.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: `Case is already "${request.status}" and cannot be accepted again.`,
      });
    }

    // 2. Update status
    const { data, error } = await supabaseAdmin
      .from('requests')
      .update({ status: 'in_progress' })
      .eq('id', id)
      .select('id, status, child_name, parent_name, assigned_at')
      .single();

    if (error) {
      console.error('[acceptCase] update error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    // 3. Respond immediately
    res.status(200).json({ success: true, message: 'Case accepted successfully.', data });

    // 4. Fire emails + log outside the request cycle
    setImmediate(() => {
      // Log activity
      Promise.resolve(supabaseAdmin.rpc('log_activity', {
        p_actor_id:    therapistId,
        p_event_type:  'case_accepted',
        p_entity_type: 'help_request',
        p_entity_id:   id,
        p_message:     `${therapist.full_name} accepted ${request.child_name}'s case`,
      })).catch(console.warn);

      // Email parent — introduce them to their therapist now that case is confirmed
      if (request.parent_email) {
        sendTherapistAssignedToParentEmail({
          to:                 request.parent_email,
          parentName:         request.parent_name,
          childName:          request.child_name,
          therapistName:      therapist.full_name,
          therapistEmail:     therapist.email,
          therapistPhone:     therapist.phone          ?? null,
          therapistSpecialty: therapist.specialization ?? 'Therapist',
        }).catch(e => console.warn('[acceptCase] parent email failed:', e.message));
      } else {
        console.warn('[acceptCase] No parent_email on request', id);
      }
    });

  } catch (err) {
    console.error('[acceptCase] unexpected error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});
 


// ── POST /api/therapist/reports ───────────────────────────────────────────────
// routes/therapist/index.js — POST /api/therapist/reports (patched)
//
// This is the piece that was missing: therapist marking a report "final"
// is what actually completes the request (Option A — therapist-driven),
// matching the ALLOWED = ["in_progress", "completed"] you already wrote
// into updateStatus for the therapist role.
router.post('/reports', ...guard, upload.single('file'), async (req, res) => {
  const { request_id, title, content, is_final } = req.body;
  const isFinal = is_final === true || is_final === 'true';
  console.log("[POST /therapist/reports] is_final raw:", is_final, "| isFinal:", isFinal); // ← ADD THIS


  if (!request_id || !title?.trim()) {
    return res.status(422).json({ success: false, message: 'request_id and title are required.' });
  }

  try {
    // 1. Verify case belongs to this therapist and is active
    const { data: request, error: rErr } = await supabaseAdmin
      .from('requests')
      .select('id, child_name, parent_name, status, therapist_id')
      .eq('id', request_id)
      .eq('therapist_id', req.user.id)
      .maybeSingle();

    if (rErr || !request) {
      return res.status(404).json({ success: false, message: 'Case not found or not assigned to you.' });
    }

    // 2. Upload file to Supabase Storage if provided
    let fileUrl = null;

    if (req.file) {
      const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!ALLOWED.includes(req.file.mimetype)) {
        return res.status(422).json({ success: false, message: 'Only PDF or image files are accepted.' });
      }
      const ext      = req.file.originalname.split('.').pop().toLowerCase();
      const filePath = `reports/${request_id}/${Date.now()}.${ext}`;

      const { error: storageErr } = await supabaseAdmin.storage
        .from('lab-results')
        .upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

      if (storageErr) throw storageErr;
      fileUrl = filePath;
    }

    // 3. New request status — only move to completed if this is the final report
    const newStatus = isFinal ? 'completed' : 'in_progress';

    // 4. Insert report + update request status in parallel
    const [
      { data: report, error: insertErr },
      { error: statusErr },
    ] = await Promise.all([
      supabaseAdmin
        .from('reports')
        .insert({
          request_id,
          therapist_id: req.user.id,
          title:        title.trim(),
          content:      content?.trim() ?? null,
          file_url:     fileUrl,
          status:       'pending',
          is_final: isFinal
        })
        .select(`
          id, title, content, file_url, status, created_at,
          request:requests!request_id ( id, child_name, parent_name )
        `)
        .single(),

      supabaseAdmin
        .from('requests')
        .update({ status: newStatus })
        .eq('id', request_id),
    ]);

    if (insertErr) throw insertErr;
    if (statusErr) console.warn('[POST /therapist/reports] status update failed:', statusErr.message);

    // 5. Respond immediately
    res.status(201).json({ success: true, report, requestStatus: newStatus });

    // 6. Log + email outside the request cycle
    setImmediate(() => {
      Promise.resolve(supabaseAdmin.rpc('log_activity', {
        p_actor_id:    req.user.id,
        p_event_type:  'report_uploaded',
        p_entity_type: 'report',
        p_entity_id:   report.id,
        p_message:     `Report "${title.trim()}" uploaded for ${request.child_name}${isFinal ? ' — case marked completed' : ''}`,
      })).catch(console.warn);

      sendReportUploadedEmail({
        to:            process.env.EMAIL_FROM,
        therapistName: req.user.name ?? req.user.email,
        childName:     request.child_name,
        parentName:    request.parent_name,
        reportTitle:   title.trim(),
        reportId:      report.id,
        requestId:     request_id,
        isFinal,
      }).catch(e => console.warn('[POST /therapist/reports] email failed:', e.message));
    });

  } catch (err) {
    console.error('[POST /therapist/reports]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});


router.get('/reports', ...guard, async (req, res) => {
  const { status } = req.query;
  try {
    let query = supabaseAdmin
      .from('reports')
      .select(`
        id, title, content, file_url, status, is_final, created_at,
        therapist:profiles!therapist_id ( id, full_name ),
        request:requests!request_id ( id, child_name, parent_name, status )
      `)
      .order('created_at', { ascending: false });
 
    if (status) query = query.eq('status', status);
 
    const { data, error } = await query;
    if (error) throw error;
 
    return res.status(200).json({ reports: data });
  } catch (err) {
    console.error('[GET /admin/reports]', err);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});



// ── GET /api/therapist/reports/:id/download ───────────────────────────────────
router.get('/reports/:id/download', ...guard, async (req, res) => {
  try {
    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select('file_url')
      .eq('id', req.params.id)
      .eq('therapist_id', req.user.id)
      .single();

    if (error || !report) return res.status(404).json({ error: 'Report not found.' });
    if (!report.file_url) return res.status(404).json({ error: 'No file attached to this report.' });

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from('lab-results')
      .createSignedUrl(report.file_url, 60 * 60);

    if (signErr) throw signErr;
    return res.status(200).json({ url: signed.signedUrl });
  } catch (err) {
    console.error('[GET /therapist/reports/:id/download]', err);
    return res.status(500).json({ error: 'Failed to generate download URL.' });
  }
});



router.get('/settings', ...guard, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone, specialization, status, created_at')
      .eq('id', req.user.id)
      .single();
 
    if (error) throw error;
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error('[GET /therapist/settings]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});
 
// ── PATCH /api/therapist/settings ─────────────────────────────────────────────
router.patch('/settings', ...guard, async (req, res) => {
  const { full_name, phone, specialization } = req.body;
 
  // Only allow updating safe fields — not role, status, email
  const updates = {};
  if (full_name?.trim())    updates.full_name    = full_name.trim();
  if (phone !== undefined)  updates.phone        = phone?.trim() || null;
  if (specialization !== undefined) updates.specialization = specialization?.trim() || null;
 
  if (Object.keys(updates).length === 0) {
    return res.status(422).json({ success: false, message: 'No valid fields to update.' });
  }
 
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, full_name, email, phone, specialization, status')
      .single();
 
    if (error) throw error;
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error('[PATCH /therapist/settings]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});


router.post('/settings/password', ...guard, async (req, res) => {
  const { newPassword } = req.body;
 
  if (!newPassword || newPassword.length < 8) {
    return res.status(422).json({ success: false, message: 'Password must be at least 8 characters.' });
  }
  if (!/[A-Z]/.test(newPassword)) {
    return res.status(422).json({ success: false, message: 'Password must contain an uppercase letter.' });
  }
  if (!/[0-9]/.test(newPassword)) {
    return res.status(422).json({ success: false, message: 'Password must contain a number.' });
  }
 
  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
      password: newPassword,
    });
 
    if (error) throw error;
 
    await Promise.resolve(supabaseAdmin.rpc('log_activity', {
      p_actor_id:    req.user.id,
      p_event_type:  'password_changed',
      p_entity_type: 'profile',
      p_entity_id:   req.user.id,
      p_message:     'Therapist changed their password',
    })).catch(console.warn);
 
    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[POST /therapist/settings/password]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;