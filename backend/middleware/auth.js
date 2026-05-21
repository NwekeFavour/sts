const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/db');

/**
 * Verifies the Bearer token in Authorization header.
 * Attaches req.user = { id, email, role } on success.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // First try our own JWT (for admin-issued tokens)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch {
    // Fall back to Supabase session token validation
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) throw new Error('Invalid token');

      // Fetch role from profiles table
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email,
        role: profile?.role || 'patient',
        name: profile?.full_name,
      };
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
}

/**
 * Role guard — call after authenticate.
 * Usage: requireRole('admin') or requireRole(['admin', 'therapist'])
 */
function requireRole(...roles) {
  const allowed = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowed.join(' or ')}`,
      });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
