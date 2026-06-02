const express = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const {
  applyTherapist,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
  getAllTherapistsAndApplicants,
  promoteToTherapist,
  updateTherapistStatus,
} = require("../controllers/therapistApplication");

const router = express.Router();

// ─── Public ───────────────────────────────────────────────────────────────────
// POST /api/therapist/applications
router.post("/applications", applyTherapist);

// ─── Admin only ───────────────────────────────────────────────────────────────
// GET  /api/therapist/applications
router.get("/applications", authenticate, requireRole("admin"), getAllApplications);
router.get("/all", authenticate, requireRole("admin"), getAllTherapistsAndApplicants);

// PATCH /api/therapist/applications/:id/:status 
// :status → pending | approved | rejected
router.patch("/applications/:id/:status", authenticate, requireRole("admin"), updateApplicationStatus);
router.post(  "/applications/:id/promote", authenticate, requireRole("admin"), promoteToTherapist);

// DELETE /api/therapist/applications/:id
router.delete("/applications/:id", authenticate, requireRole("admin"), deleteApplication);

router.patch( "/profile/:id/:status" , authenticate, requireRole("admin"), updateTherapistStatus);


module.exports = router;