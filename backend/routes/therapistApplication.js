const express = require('express');
const router = express.Router();
const therapistApplicationController = require('../controllers/therapistApplication');
const authMiddleware = require('../middleware/auth'); // You'll need this for admin routes

// Public route: Apply to become a therapist
router.post('/apply', therapistApplicationController.applyTherapist);

// Admin-only routes (require authentication)
router.get('/all', authMiddleware, therapistApplicationController.getAllApplications);
router.put('/:id/status', authMiddleware, therapistApplicationController.updateApplicationStatus);

module.exports = router;