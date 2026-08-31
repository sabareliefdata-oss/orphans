const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'one-nation-super-secure-jwt-2026-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DATA_DIR: path.join(__dirname, '..', 'data'),
  CLIENT_BUILD_PATH: path.join(__dirname, '..', 'client', 'dist'),
  DEFAULT_ADMIN: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'ON@Admin#9482$Yemen',
    name: 'Administrator / Translator',
    role: 'admin'
  },
  DEFAULT_REVIEWER: {
    username: process.env.REVIEWER_USERNAME || 'reviewer',
    password: process.env.REVIEWER_PASSWORD || 'ON@Review#7315*Scripts',
    name: 'Content Reviewer',
    role: 'reviewer'
  }
};
