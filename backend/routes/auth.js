const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  inviteTherapist,
  resetPassword,
  login,
  requestPasswordReset,
  resendInvite,
  refreshToken,
} = require('../controllers/auth');

const router = express.Router();

// ─── Rate limiters 

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many reset requests. Try again in 1 hour.' },
});

// ─── Validators ───

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const inviteValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be 2–100 characters'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('specialization').optional().trim().isLength({ max: 200 }),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
];

// ─── Public routes 

// POST /api/auth/login
router.post('/login', loginLimiter, loginValidation, login);

// POST /api/auth/reset-password  (therapist sets password from invite link)
router.post('/reset-password', resetPasswordValidation, resetPassword);

// POST /api/auth/forgot-password  (self-serve reset request)
router.post('/forgot-password', resetLimiter, requestPasswordReset);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// ─── Admin-only routes 

// POST /api/auth/invite-therapist
router.post(
  '/invite-therapist',
  authenticate,
  requireRole('admin'),
  inviteValidation,
  inviteTherapist
);

// POST /api/auth/resend-invite/:therapistId
router.post(
  '/resend-invite/:therapistId',
  authenticate,
  requireRole('admin'),
  resendInvite
);

module.exports = router;
