const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const DB = require('./db');

const authRoutes = require('./routes/auth');
const scriptsRoutes = require('./routes/scripts');

const app = express();

// Trust proxy for Render / Cloud hosting
app.set('trust proxy', 1);

// Security & Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 login attempts per 15 min
  message: { error: 'Too many login attempts, please try again after 15 minutes.' }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// Serve logo from root or client public
app.get('/api/logo', (req, res) => {
  const logoPath = path.join(__dirname, '..', 'logo.png');
  if (fs.existsSync(logoPath)) {
    res.sendFile(logoPath);
  } else {
    res.status(404).send('Logo not found');
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scripts', scriptsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), title: "One Nation Orphans' Video Scripts" });
});

// Serve frontend in production
if (fs.existsSync(config.CLIENT_BUILD_PATH)) {
  app.use(express.static(config.CLIENT_BUILD_PATH));
  app.get('*', (req, res) => {
    res.sendFile(path.join(config.CLIENT_BUILD_PATH, 'index.html'));
  });
}

// Start Server
async function startServer() {
  await DB.connect();
  app.listen(config.PORT, () => {
    console.log(`🚀 One Nation Server running on port ${config.PORT}`);
    console.log(`📡 Health check available at: http://localhost:${config.PORT}/api/health`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});
