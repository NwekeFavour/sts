// routes/admin/dashboard.js
// Mount in app.js:  app.use('/api/admin', require('./routes/admin/dashboard'))
// All routes require: authenticate + requireRole('admin')

const express = require('express');
const { supabaseAdmin } = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

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
      totalCases:       requests.filter(r => ['assigned','in-progress'].includes(r.status)).length,
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
        id, parent_name, child_name, location, child_age,
        notes, video_url, status, created_at, assigned_at,
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

// ─── PATCH /api/admin/requests/:id/assign ────────────────────────────────────
// Body: { therapist_id }
router.patch('/requests/:id/assign', ...guard, async (req, res) => {
  const { id } = req.params;
  const { therapist_id } = req.body;
  if (!therapist_id) return res.status(422).json({ error: 'therapist_id required' });

  try {
    const { data, error } = await supabaseAdmin
      .from('requests')
      .update({
        therapist_id,
        status: 'assigned',
        assigned_by: req.user.id,
        assigned_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, parent_name, child_name, status, therapist_id')
      .single();

    if (error) throw error;

    // Log the activity
    await supabaseAdmin.rpc('log_activity', {
      p_actor_id:    req.user.id,
      p_event_type:  'therapist_assigned',
      p_entity_type: 'request',
      p_entity_id:   id,
      p_message:     `Therapist assigned to ${data.child_name}`,
    });

    return res.status(200).json({ message: 'Therapist assigned', request: data });
  } catch (err) {
    console.error('[PATCH /admin/requests/:id/assign]', err);
    return res.status(500).json({ error: 'Failed to assign therapist' });
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
        id, title, status, file_url, created_at,
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
router.patch('/reports/:id/review', ...guard, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .update({ status: 'reviewed' })
      .eq('id', req.params.id)
      .select('id, status')
      .single();

    if (error) throw error;
    return res.status(200).json({ message: 'Report marked as reviewed', report: data });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update report' });
  }
});

// ─── GET /api/admin/forms ─────────────────────────────────────────────────────
router.get('/forms', ...guard, async (req, res) => {
  const { status } = req.query;
  try {
    let query = supabaseAdmin
      .from('forms')
      .select(`
        id, form_type, status, file_url, submitted_at, created_at,
        parent:profiles!parent_id(id, full_name, email),
        request:requests!request_id(id, child_name)
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return res.status(200).json({ forms: data });
  } catch (err) {
    console.error('[GET /admin/forms]', err);
    return res.status(500).json({ error: 'Failed to fetch forms' });
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