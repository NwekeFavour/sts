const express = require('express');
const router = express.Router();
const therapistApplicationController = require('../controllers/therapistApplication');

// Public route: Apply to become a therapist
router.post('/apply', therapistApplicationController.applyTherapist);

// Temporarily remove authMiddleware
router.get('/all', therapistApplicationController.getAllApplications);
router.put('/:id/status', therapistApplicationController.updateApplicationStatus);

module.exports = router;