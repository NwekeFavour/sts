require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { supabaseAdmin } = require('./config/db');
const jwt = require('jsonwebtoken');

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" })
})

app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
// app.use('/api/appointments', require('./routes/appointments'));
// app.use('/api/patients', require('./routes/patients'));

app.use((err, req, res, next) => {
  console.error('[Unhandled error]', err);
  res.status(500).json({ error: 'Internal server error' });
});


app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port " + (process.env.PORT || 3000) + " in " + (process.env.NODE_ENV || 'development') + " mode");
})