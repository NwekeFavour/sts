require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan")
const formsRouter = require("./routes/forms");
const TherapistRoutes = require("./routes/therapist");

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'))

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_STAGING,
  process.env.FRONTEND_URL_PROD,
].filter(Boolean); // remove undefined entries

app.use(
  cors({
    origin(origin, cb) {
      // allow server-to-server (no origin) and listed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health / keep-alive ──────────────────────────────────────────────────────
// Render free tier spins down after 15 min of inactivity — the first request
// after sleep takes ~30 s (cold start). Two mitigations:
//
//  1. /health endpoint — fast, no DB hit, used by Render's health check
//  2. Self-ping — server pings itself every 10 min so Render never sleeps
//     Only runs in production to avoid noise in dev.

app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);

if (process.env.NODE_ENV === "production" && process.env.RENDER_EXTERNAL_URL) {
  const PING_INTERVAL = 10 * 60 * 1000; // 10 min
  setInterval(async () => {
    try {
      await fetch(`${process.env.RENDER_EXTERNAL_URL}/health`);
      console.log("[keep-alive] pinged /health");
    } catch (err) {
      console.warn("[keep-alive] ping failed:", err.message);
    }
  }, PING_INTERVAL);
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/therapist", require("./routes/therapistApplication"));
app.use("/api/admin", require("./routes/admin"));
app.use(
  "/api/admin/therapist-application",
  require("./routes/therapistApplication"),
);
app.use("/api/requests", require("./routes/request"));
app.use("/api/forms", formsRouter);
app.use("/api/admin/settings", require("./routes/settings"));
app.use("/api/therapist", TherapistRoutes);

// ─── Error handler ─────────────────────────────────── ─────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Unhandled error]", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
  );
});
