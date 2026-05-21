const { supabaseAdmin, supabase, authClient } = require('../config/db');
const { validationResult } = require('express-validator');
const crypto = require("crypto");
const { sendTherapistInviteEmail, sendPasswordResetEmail } = require('../utils/mail');

// ─── Admin: create therapist & send invite ────────────────────────────────────

async function inviteTherapist(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, full_name, phone, specialization } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

  try {
    // 1. Create the auth user in Supabase with a random temp password
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: crypto.randomUUID(), // random temp password — they'll set their own via the invite link
      email_confirm: true, // mark email as confirmed — they'll set password via link
      user_metadata: { full_name },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return res.status(409).json({ error: 'A user with this email already exists' });
      }
      throw authError;
    }

    const userId = authData.user.id;
    // 2. Insert profile row with role = therapist
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      full_name,
      email: normalizedEmail,
      phone: phone || null,
      specialization: specialization || null,
      role: 'therapist',
      status: 'pending', // pending until they set their password
    });

    if (profileError) {
      // Roll back auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw profileError;
    }

    // 3. Generate a Supabase password-reset link (acts as the invite link)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
    });

    if (linkError) throw linkError;

    // Extract the token from the generated link so we can build our own frontend URL
    const url = new URL(linkData.properties.action_link);
    const token = url.searchParams.get('token_hash') || linkData.properties.hashed_token;

    // 4. Send invite email
    await sendTherapistInviteEmail({ to: normalizedEmail, name: full_name, inviteToken: token });

    return res.status(201).json({
      message: `Therapist account created. Invite email sent to ${normalizedEmail}.`,
      therapist: { id: userId, email: normalizedEmail, full_name, status: 'pending' },
    });
  } catch (err) {
    console.error('[inviteTherapist]', err);
    return res.status(500).json({ error: 'Failed to create therapist account', detail: err.message });
  }
}

// ─── Therapist: set password from invite link ─────────────────────────────────

async function resetPassword(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  

  const { token, password } = req.body;

  const strongPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

if (!strongPassword.test(password)) {
  return res.status(422).json({
    error:
      'Password must contain uppercase, lowercase, number, and be 8+ chars',
  });
}

  try {
    // Exchange the recovery token for a session
    const { data: sessionData, error: sessionError } =
    await authClient.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
    });

    if (sessionError || !sessionData?.user) {
      return res.status(400).json({ error: 'Invalid or expired invite link. Please request a new one.' });
    }

    const userId = sessionData.user.id;

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
    });

    if (updateError) throw updateError;

    // Mark therapist as active
    const { data: updatedProfile, error: profileUpdateError } =
  await supabaseAdmin
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', userId)
    .select()
    .single();

if (profileUpdateError || !updatedProfile) {
  throw new Error('Failed to activate therapist profile');
}
    return res.status(200).json({ message: 'Password set successfully. You can now log in.' });
  } catch (err) {
    console.error('[resetPassword]', err);
    return res.status(500).json({ error: 'Failed to reset password', detail: err.message });
  }
}

// ─── Any user: login ───────────────────────────────────────────────────────────


async function revokeUserSessions(userId) {
  try {
    await supabaseAdmin.auth.admin.signOut(userId);
  } catch (err) {
    console.error('[revokeUserSessions]', err);
  }
}

async function login(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  try {
    // Authenticate with normal client
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data?.user || !data?.session) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        role,
        status,
        specialization
      `)
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        error: 'Profile not found',
      });
    }

    // Account status checks
    if (profile.status === 'pending') {
        await revokeUserSessions(data.user.id); // invalidate the session since they shouldn't have access yet
      return res.status(403).json({
        error: 'Account setup incomplete. Please check your email.',
      });
    }

    if (profile.status === 'suspended') {
        await revokeUserSessions(data.user.id); // invalidate the session since they shouldn't have access
      return res.status(403).json({
        error: 'This account has been suspended.',
      });
    }

    return res.status(200).json({
      message: 'Login successful',

      user: {
        id: profile.id,
        email: data.user.email,
        full_name: profile.full_name,
        role: profile.role,
        specialization: profile.specialization,
      },

      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
      },
    });
  } catch (err) {
    console.error('[login]', err);

    return res.status(500).json({
      error: 'Login failed',
      detail: err.message,
    });
  }
}

async function getMe(req, res) {
  const { userId } = req.params;
 
  // Security: ensure the token belongs to the user being requested.
  // Prevents user A from fetching user B's profile by guessing a UUID.
  if (req.user.id !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
 
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, role, status, specialization, avatar_url, created_at")
      .eq("id", userId)
      .single();
 
    if (error || !profile) {
      return res.status(404).json({ error: "User not found" });
    }
 
    if (profile.status === "suspended") {
      return res.status(403).json({ error: "Account suspended" });
    }
 
    return res.status(200).json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
        status: profile.status,
        specialization: profile.specialization ?? null,
        avatarUrl: profile.avatar_url ?? null,
        createdAt: profile.created_at,
      },
    });
  } catch (err) {
    console.error("[GET /me]", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
};

// ─── Any user: request password reset ────────────────────────────────────────

async function requestPasswordReset(req, res) {
  const { email } = req.body;
  if (!email) return res.status(422).json({ error: 'Email is required' });
    const normalizedEmail = email.trim().toLowerCase();
  try {
    // Look up user
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('email', normalizedEmail)
      .single();

    // Always return 200 to avoid user enumeration
    if (!profile) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
    });

    if (!linkError) {
      const url = new URL(linkData.properties.action_link);
      const token = url.searchParams.get('token_hash') || linkData.properties.hashed_token;
      await sendPasswordResetEmail({ to: normalizedEmail, name: profile.full_name, resetToken: token });
    }

    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[requestPasswordReset]', err);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

// ─── Admin: resend invite to therapist ────────────────────────────────────────

async function resendInvite(req, res) {
  const { therapistId } = req.params;

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name, status')
      .eq('id', therapistId)
      .eq('role', 'therapist')
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: 'Therapist not found' });
    }

    if (profile.status === 'active') {
      return res.status(400).json({ error: 'Therapist has already activated their account' });
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: profile.email,
    });

    if (linkError) throw linkError;

    const url = new URL(linkData.properties.action_link);
    const token = url.searchParams.get('token_hash') || linkData.properties.hashed_token;

    await sendTherapistInviteEmail({ to: profile.email, name: profile.full_name, inviteToken: token });

    return res.status(200).json({ message: `Invite resent to ${profile.email}` });
  } catch (err) {
    console.error('[resendInvite]', err);
    return res.status(500).json({ error: 'Failed to resend invite', detail: err.message });
  }
}

// ─── Token refresh ─────────────────────────────────────────────────────────────

async function refreshToken(req, res) {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(422).json({
      error: 'refresh_token is required',
    });
  }

  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error || !data?.session) {
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
      });
    }

    return res.status(200).json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
      },
    });
  } catch (err) {
    console.error('[refreshToken]', err);

    return res.status(500).json({
      error: 'Token refresh failed',
      detail: err.message,
    });
  }
}

module.exports = {
  inviteTherapist,
  resetPassword,
  login,
  requestPasswordReset,
  resendInvite,
  refreshToken,
  getMe
};
