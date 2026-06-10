// routes/requests.js
// Mount in app.js:  app.use('/api/requests', require('./routes/requests'))

const express = require("express");
const multer  = require("multer");
const { authenticate, requireRole } = require("../middleware/auth");
const {
  getAllRequests,
  getRequest,
  getVideoSignedUrl,
  assignTherapist,
  updateStatus,
  getMyCases,
  deleteRequest,
} = require("../controllers/request");

// submitHelpRequest lives in requestHelpController (handles the R2 upload)
const { submitHelpRequest } = require("../controllers/requestHelpController");

const router = express.Router();
 
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 200 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ok = ["video/mp4","video/quicktime","video/webm","video/x-msvideo"].includes(file.mimetype);
    cb(ok ? null : new Error("Only video files are allowed"), ok);
  },
});

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/submit", upload.single("video"), submitHelpRequest);

// ── Therapist ─────────────────────────────────────────────────────────────────
router.get("/my-cases", authenticate, requireRole("therapist"), getMyCases);
router.get("/:id",          authenticate, requireRole("therapist", "admin"), getRequest);
router.get("/:id/video-url",authenticate, requireRole("therapist", "admin"), getVideoSignedUrl);
router.patch("/:id/status", authenticate, requireRole("therapist", "admin"), updateStatus);

// ── Admin only ────────────────────────────────────────────────────────────────
router.get("/",              authenticate, requireRole("admin"), getAllRequests);
router.patch("/:id/assign",  authenticate, requireRole("admin"), assignTherapist);
router.delete("/:id",        authenticate, requireRole("admin"), deleteRequest);

module.exports = router;