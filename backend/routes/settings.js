// routes/admin/settings.js
// Mount in app.js: app.use('/api/admin/settings', require('./routes/admin/settings'))

const express = require('express');
const { supabaseAdmin }             = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const guard  = [authenticate, requireRole('admin')];

// ── PATCH /api/admin/settings/org ─────────────────────────────────────────────
// Update organisation-level metadata stored in a settings table or env-backed store.
// Simple approach: store in a single-row `settings` table (id = 'org').
router.patch('/org', ...guard, async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .upsert({ id: 'org', name, email, phone, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ message: 'Organisation details updated.', data });
  } catch (err) {
    console.error('[PATCH /settings/org]', err);
    return res.status(500).json({ error: 'Failed to update organisation details.', detail: err.message });
  }
});

// ── GET /api/admin/settings/org ───────────────────────────────────────────────
router.get('/org', ...guard, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 'org')
      .maybeSingle();

    if (error) throw error;
    return res.status(200).json({ data: data ?? {} });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

// ── PATCH /api/admin/settings/account ────────────────────────────────────────
// Update the calling admin's own profile (full_name, email).
router.patch('/account', ...guard, async (req, res) => {
  const { full_name, email } = req.body;
  if (!full_name?.trim() && !email?.trim()) {
    return res.status(422).json({ error: 'At least one field (full_name or email) is required.' });
  }

  try {
    const updates = {};
    if (full_name?.trim()) updates.full_name = full_name.trim();
    if (email?.trim())     updates.email     = email.trim();

    // Update profile row
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, full_name, email, role')
      .single();

    if (profileErr) throw profileErr;

    // If email changed, update Supabase auth user too
    if (email?.trim() && email.trim() !== req.user.email) {
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(
        req.user.id,
        { email: email.trim() }
      );
      if (authErr) throw authErr;
    }

    return res.status(200).json({ message: 'Account updated.', data: profile });
  } catch (err) {
    console.error('[PATCH /settings/account]', err);
    return res.status(500).json({ error: 'Failed to update account.', detail: err.message });
  }
});

// ── PATCH /api/admin/settings/password ───────────────────────────────────────
// Change the admin's own password. Verifies current password first.
router.patch('/password', ...guard, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(422).json({ error: 'current_password and new_password are required.' });
  }
  if (new_password.length < 8) {
    return res.status(422).json({ error: 'New password must be at least 8 characters.' });
  }

  try {
    // Verify current password by attempting a sign-in with the user's email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', req.user.id)
      .single();

    const { error: signInErr } = await supabaseAdmin.auth.signInWithPassword({
      email:    profile.email,
      password: current_password,
    });
    if (signInErr) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Update password
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.id,
      { password: new_password }
    );
    if (updateErr) throw updateErr;

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[PATCH /settings/password]', err);
    return res.status(500).json({ error: 'Failed to update password.', detail: err.message });
  }
});

module.exports = router;