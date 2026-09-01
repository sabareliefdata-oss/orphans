const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const DB = require('../db');
const { generateToken, authenticateToken } = require('../auth');

// POST /api/auth/login
// Supports password-only login (auto-detects role) or username + password
router.post('/login', async (req, res) => {
  try {
    const rawUsername = (req.body.username || '').trim();
    const rawPassword = (req.body.password || '').trim();
    const inputKey = rawPassword || rawUsername;

    if (!inputKey) {
      return res.status(400).json({ error: 'Password is required to sign in.' });
    }

    const users = await DB.getAllUsers();
    let authenticatedUser = null;

    // 1. If explicit username and password were supplied, try direct username match
    if (rawUsername && rawPassword && rawUsername !== rawPassword) {
      const user = await DB.findUserByUsername(rawUsername);
      if (user && (await bcrypt.compare(rawPassword, user.password_hash))) {
        authenticatedUser = user;
      }
    }

    // 2. Auto-role: match inputKey against all user password hashes
    if (!authenticatedUser) {
      for (const u of users) {
        if (await bcrypt.compare(inputKey, u.password_hash)) {
          authenticatedUser = u;
          break;
        }
      }
    }

    if (!authenticatedUser) {
      return res.status(401).json({ error: 'Incorrect access password. Access denied.' });
    }

    const token = generateToken(authenticatedUser);
    res.json({
      token,
      user: {
        id: authenticatedUser.id,
        username: authenticatedUser.username,
        name: authenticatedUser.name,
        role: authenticatedUser.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me (Verify session)
router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
