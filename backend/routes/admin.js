// routes/admin/dashboard.js
// Mount in app.js:  app.use('/api/admin', require('./routes/admin/dashboard'))
// All routes require: authenticate + requireRole('admin')

const express = require('express');
const { supabaseAdmin } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { sendReportFlaggedEmail } = require('../utils/mail');

const router = express.Router();
const guard = [authenticate, requireRole('admin')];

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
// Returns all stat counts + recent requests + therapist snapshot + activity feed
router.get('/dashboard', ...guard, async (req, res) => {
  try {
    const [
      { data: requests,   error: rErr },
      { data: therapists, error: tErr },
      { data: reports,    error: rpErr },
      { data: forms,      error: fErr },
      { data: activity,   error: aErr },
    ] = await Promise.all([
      supabaseAdmin
        .from('requests')
        .select('id, parent_name, child_name, location, status, created_at, therapist_id')
        .order('created_at', { ascending: false }),

      supabaseAdmin
        .from('profiles')
        .select('id, full_name, specialization, status, active_cases, avatar_url')
        .eq('role', 'therapist'),

      supabaseAdmin
        .from('reports')
        .select('id, status, created_at')
        .order('created_at', { ascending: false }),

      supabaseAdmin
        .from('forms')
        .select('id, status, created_at')
        .order('created_at', { ascending: false }),

      supabaseAdmin
        .from('activity_log')
        .select('id, event_type, entity_type, message, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    const err = rErr || tErr || rpErr || fErr || aErr;
    if (err) throw err;

    // ── Stats ──
    const stats = {
      pendingRequests:  requests.filter(r => r.status === 'pending').length,
      totalRequests:    requests.length,
      totalCases:       requests.filter(r => ['in_progress'].includes(r.status)).length,
      activeTherapists: therapists.filter(t => t.status === 'active').length,
      pendingReports:   reports.filter(r => r.status === 'pending').length,
      pendingForms:     forms.filter(f => f.status === 'pending').length,
    };

    // ── Recent requests (latest 5) ──
    const recentRequests = requests.slice(0, 5).map(r => ({
      id:       r.id,
      parent:   r.parent_name,
      child:    r.child_name,
      location: r.location ?? '—',
      date:     new Date(r.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
      status:   r.status,
    }));

    // ── Therapist snapshot (active only) ──
    const therapistSnapshot = therapists
      .filter(t => t.status === 'active')
      .map(t => ({
        id:           t.id,
        name:         t.full_name,
        role:         t.specialization ?? 'Therapist',
        cases:        t.active_cases,
        status: t.status,
        avatar:       t.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        avatarUrl:    t.avatar_url ?? null,
      }));

    // ── Activity feed ──
    const activityFeed = (activity ?? []).map(a => ({
      id:        a.id,
      eventType: a.event_type,
      message:   a.message,
      time:      timeAgo(new Date(a.created_at)),
    }));

    return res.status(200).json({
      stats,
      recentRequests,
      therapists: therapistSnapshot,
      activity: activityFeed,
    });
  } catch (err) {
    console.error('[GET /admin/dashboard]', err);
    return res.status(500).json({ error: 'Failed to load dashboard', detail: err.message });
  }
});

// ─── GET /api/admin/requests ──────────────────────────────────────────────────
router.get('/requests', ...guard, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const from = (page - 1) * limit;

  try {
    let query = supabaseAdmin
      .from('requests')
      .select(`
        id, parent_name, parent_email, parent_phone, child_gender, child_name, location, child_age,
        primary_concerns, video_key, status, created_at, assigned_at,
        therapist:profiles!therapist_id(id, full_name, specialization)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;

    return res.status(200).json({ requests: data, total: count, page: +page, limit: +limit });
  } catch (err) {
    console.error('[GET /admin/requests]', err);
    return res.status(500).json({ error: 'Failed to fetch requests' });
  }
});




// ─── GET /api/admin/therapists ────────────────────────────────────────────────
router.get('/therapists', ...guard, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, specialization, status, active_cases, avatar_url, created_at')
      .eq('role', 'therapist')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ therapists: data });
  } catch (err) {
    console.error('[GET /admin/therapists]', err);
    return res.status(500).json({ error: 'Failed to fetch therapists' });
  }
});

// ─── GET /api/admin/reports ───────────────────────────────────────────────────
router.get('/reports', ...guard, async (req, res) => {
  const { status } = req.query;
  try {
    let query = supabaseAdmin
      .from('reports')
      .select(`
        id, title, status, file_url, is_final, created_at,
        therapist:profiles!therapist_id(id, full_name),
        request:requests!request_id(id, child_name, parent_name)
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

// ─── PATCH /api/admin/reports/:id/review ─────────────────────────────────────
// Guard added: cannot review a report that's already reviewed or flagged.
router.patch('/reports/:id/review', ...guard, async (req, res) => {
  try {
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('reports')
      .select('id, status, title, therapist_id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existing) return res.status(404).json({ message: 'Report not found.' });

    if (existing.status === 'reviewed') {
      return res.status(400).json({ message: 'This report has already been reviewed.' });
    }
    if (existing.status === 'flagged') {
      return res.status(400).json({ message: 'This report is flagged. Resolve the flag before marking it reviewed.' });
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .update({ status: 'reviewed' })
      .eq('id', req.params.id)
      .select('id, status')
      .single();

    if (error) throw error;

    Promise.resolve(supabaseAdmin.rpc('log_activity', {
      p_actor_id:    req.user.id,
      p_event_type:  'report_reviewed',
      p_entity_type: 'report',
      p_entity_id:   req.params.id,
      p_message:     `Report "${existing.title}" marked as reviewed`,
    })).catch(console.warn);

    return res.status(200).json({ message: 'Report marked as reviewed', report: data });
  } catch (err) {
    console.error('[PATCH /reports/:id/review]', err);
    return res.status(500).json({ message: 'Failed to update report.' });
  }
});

router.get('/reports/:id/download', ...guard, async (req, res) => {
  try {
    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select('file_url')
      .eq('id', req.params.id)
      .single();
 
    if (error || !report) return res.status(404).json({ error: 'Report not found.' });
    if (!report.file_url) return res.status(404).json({ error: 'No file attached.' });
 
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from('lab-results')
      .createSignedUrl(report.file_url, 60 * 60);
 
    if (signErr) throw signErr;
    return res.status(200).json({ url: signed.signedUrl });
  } catch (err) {
    console.error('[GET /admin/reports/:id/download]', err);
    return res.status(500).json({ error: 'Failed to generate download URL.' });
  }
});

// ─── PATCH /api/admin/reports/:id/flag ───────────────────────────────────────
// Body: { reason: string }
// Admin flags a report back to the therapist — e.g. wrong case selected,
// missing info, accidentally marked final, etc.
router.patch('/reports/:id/flag', ...guard, async (req, res) => {
  const { reason } = req.body;
  if (!reason?.trim()) {
    return res.status(422).json({ message: 'A reason is required when flagging a report.' });
  }

  try {
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('reports')
      .select(`
        id, title, status, therapist_id, request_id,
        therapist:profiles!therapist_id ( id, full_name, email ),
        request:requests!request_id ( child_name )
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existing) return res.status(404).json({ message: 'Report not found.' });

    if (existing.status === 'reviewed') {
      return res.status(400).json({ message: 'Cannot flag a report that has already been reviewed and approved.' });
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .update({
        status:       'flagged',
        flagged_at:   new Date().toISOString(),
        flagged_by:   req.user.id,
        flag_reason:  reason.trim(),
      })
      .eq('id', req.params.id)
      .select('id, status, flag_reason, flagged_at')
      .single();

    if (error) throw error;

    // Respond immediately
    res.status(200).json({ message: 'Report flagged and sent back to therapist.', report: data });

    // Log + notify therapist outside the request cycle
    setImmediate(() => {
      Promise.resolve(supabaseAdmin.rpc('log_activity', {
        p_actor_id:    req.user.id,
        p_event_type:  'report_flagged',
        p_entity_type: 'report',
        p_entity_id:   req.params.id,
        p_message:     `Report "${existing.title}" flagged: ${reason.trim()}`,
      })).catch(console.warn);

      if (existing.therapist?.email) {
        sendReportFlaggedEmail({
          to:            existing.therapist.email,
          therapistName: existing.therapist.full_name,
          childName:     existing.request?.child_name ?? 'the patient',
          reportTitle:   existing.title,
          reason:        reason.trim(),
        }).catch(e => console.warn('[flag] therapist email failed:', e.message));
      }
    });

  } catch (err) {
    console.error('[PATCH /reports/:id/flag]', err);
    return res.status(500).json({ message: 'Failed to flag report.' });
  }
});

// ─── GET /api/admin/activity ──────────────────────────────────────────────────
router.get('/activity', ...guard, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('activity_log')
      .select('id, event_type, entity_type, message, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return res.status(200).json({ activity: data });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60)         return `${diff}s ago`;
  if (diff < 3600)       return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)} hr ago`;
  return                 `${Math.floor(diff / 86400)}d ago`;
}

module.exports = router;


// ─── GET /api/admin/applications ─────────────────────────────────────────────
router.get('/applications', ...guard, async (req, res) => {
  const { status } = req.query;
  try {
    let query = supabaseAdmin
      .from('therapist_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return res.status(200).json({ applications: data });
  } catch (err) {
    console.error('[GET /admin/applications]', err);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ─── PATCH /api/admin/applications/:id/approve ───────────────────────────────
// Approves the application AND auto-creates a therapist profile + sends invite
router.patch('/applications/:id/approve', ...guard, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch the application
    const { data: app, error: appErr } = await supabaseAdmin
      .from('therapist_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (appErr || !app) return res.status(404).json({ error: 'Application not found' });
    if (app.status !== 'pending') return res.status(400).json({ error: `Application is already ${app.status}` });

    // 2. Create Supabase auth user
    const tempPassword = require('crypto').randomUUID();
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: app.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: app.full_name },
    });

    if (authErr) {
      if (authErr.message.includes('already registered')) {
        return res.status(409).json({ error: 'A user with this email already exists' });
      }
      throw authErr;
    }

    const userId = authData.user.id;

    // 3. Insert therapist profile
    const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      full_name: app.full_name,
      email: app.email,
      phone: app.phone,
      specialization: app.specialization,
      role: 'therapist',
      status: 'pending', // pending until they set their password
    });

    if (profileErr) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw profileErr;
    }

    // 4. Generate invite link
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: app.email,
    });
    if (linkErr) throw linkErr;

    const url = new URL(linkData.properties.action_link);
    const token = url.searchParams.get('token') || linkData.properties.hashed_token;

    // 5. Send invite email
    const { sendTherapistInviteEmail } = require('../../services/emailService');
    await sendTherapistInviteEmail({ to: app.email, name: app.full_name, inviteToken: token });

    // 6. Mark application approved
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('therapist_applications')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, full_name, email, status')
      .single();

    if (updateErr) throw updateErr;

    // 7. Log activity
    await supabaseAdmin.rpc('log_activity', {
      p_actor_id:    req.user.id,
      p_event_type:  'application_approved',
      p_entity_type: 'therapist_application',
      p_entity_id:   null,
      p_message:     `Application approved for ${app.full_name} — invite sent`,
    });

    return res.status(200).json({
      message: `Application approved. Invite email sent to ${app.email}.`,
      application: updated,
      therapistId: userId,
    });
  } catch (err) {
    console.error('[PATCH /admin/applications/:id/approve]', err);
    return res.status(500).json({ error: 'Failed to approve application', detail: err.message });
  }
});

// ─── PATCH /api/admin/applications/:id/reject ────────────────────────────────
router.patch('/applications/:id/reject', ...guard, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('therapist_applications')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('id, full_name, status')
      .single();

    if (error) throw error;

    await supabaseAdmin.rpc('log_activity', {
      p_actor_id:    req.user.id,
      p_event_type:  'application_rejected',
      p_entity_type: 'therapist_application',
      p_entity_id:   null,
      p_message:     `Application rejected for ${data.full_name}`,
    });

    return res.status(200).json({ message: 'Application rejected', application: data });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reject application' });
  }
});

// ─── DELETE /api/admin/applications/:id ──────────────────────────────────────
router.delete('/applications/:id', ...guard, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('therapist_applications')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    return res.status(200).json({ message: 'Application deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete application' });
  }
});


// ─── PATCH /api/admin/therapists/:id/status ──────────────────────────────────
// Body: { status: 'active' | 'inactive' | 'suspended' }
router.patch('/therapists/:id/status', ...guard, async (req, res) => {
  const { status } = req.body;
  const allowed = ['active', 'inactive', 'suspended'];
  if (!allowed.includes(status)) {
    return res.status(422).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ status })
      .eq('id', req.params.id)
      .eq('role', 'therapist')
      .select('id, full_name, status')
      .single();

    if (error) throw error;

    await supabaseAdmin.rpc('log_activity', {
      p_actor_id:    req.user.id,
      p_event_type:  'therapist_status_changed',
      p_entity_type: 'therapist',
      p_entity_id:   req.params.id,
      p_message:     `${data.full_name} marked as ${status}`,
    });

    return res.status(200).json({ message: 'Status updated', therapist: data });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update therapist status' });
  }
});

// ─── DELETE /api/admin/therapists/:id ────────────────────────────────────────
// Deletes the profile row + the Supabase auth user
router.delete('/therapists/:id', ...guard, async (req, res) => {
  try {
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', req.params.id)
      .eq('role', 'therapist');

    if (profileErr) throw profileErr;

    // Also delete from Supabase auth
    await supabaseAdmin.auth.admin.deleteUser(req.params.id);

    return res.status(200).json({ message: 'Therapist deleted' });
  } catch (err) {
    console.error('[DELETE /admin/therapists/:id]', err);
    return res.status(500).json({ error: 'Failed to delete therapist' });
  }
});