const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

let isMongoConnected = false;

// --- Mongoose Schemas (For MongoDB Atlas) ---
const userSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4(), unique: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'reviewer'], default: 'reviewer' },
  created_at: { type: Date, default: Date.now }
});

const scriptSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4(), unique: true },
  serial_no: { type: Number, required: true },
  orphan_code: { type: String, required: true },
  child_name: { type: String, required: true },
  script_text: { type: String, required: true },
  original_text: { type: String },
  status: { type: String, enum: ['waiting', 'approved'], default: 'waiting' },
  notes: { type: String, default: '' },
  reviewed_by: { type: String, default: null },
  reviewed_at: { type: Date, default: null },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }
});

let UserModel, ScriptModel;

// --- Local File-Based DB Store (Fallback) ---
const dbFilePath = path.join(config.DATA_DIR, 'database.json');

function initLocalDb(forceReset = false) {
  if (!fs.existsSync(config.DATA_DIR)) {
    fs.mkdirSync(config.DATA_DIR, { recursive: true });
  }

  if (forceReset || !fs.existsSync(dbFilePath)) {
    const initialScriptsPath = path.join(config.DATA_DIR, 'initial_scripts.json');
    let scripts = [];
    if (fs.existsSync(initialScriptsPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(initialScriptsPath, 'utf8'));
        scripts = raw.map((s, idx) => ({
          id: uuidv4(),
          serial_no: s.serial_no || idx + 1,
          orphan_code: s.orphan_code,
          child_name: s.child_name || 'Orphan Child',
          script_text: s.script_text || '',
          original_text: s.script_text || '',
          status: s.status || 'waiting',
          notes: s.notes || '',
          reviewed_by: s.reviewed_by || null,
          reviewed_at: s.reviewed_at || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      } catch (err) {
        console.error('Error reading initial_scripts.json:', err);
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync(config.DEFAULT_ADMIN.password, salt);
    const reviewerHash = bcrypt.hashSync(config.DEFAULT_REVIEWER.password, salt);

    const initialDb = {
      users: [
        {
          id: uuidv4(),
          username: config.DEFAULT_ADMIN.username.toLowerCase(),
          password_hash: adminHash,
          name: config.DEFAULT_ADMIN.name,
          role: 'admin',
          created_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          username: config.DEFAULT_REVIEWER.username.toLowerCase(),
          password_hash: reviewerHash,
          name: config.DEFAULT_REVIEWER.name,
          role: 'reviewer',
          created_at: new Date().toISOString()
        }
      ],
      scripts: scripts
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialDb, null, 2), 'utf8');
    return initialDb;
  }

  try {
    return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
  } catch (e) {
    return { users: [], scripts: [] };
  }
}

function readLocalDb() {
  return initLocalDb(false);
}

function writeLocalDb(data) {
  if (!fs.existsSync(config.DATA_DIR)) {
    fs.mkdirSync(config.DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
}

// --- Unified Database Interface ---
const DB = {
  async connect() {
    if (config.MONGODB_URI) {
      try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(config.MONGODB_URI);
        isMongoConnected = true;
        UserModel = mongoose.model('User', userSchema);
        ScriptModel = mongoose.model('Script', scriptSchema);
        console.log('✅ Connected to MongoDB Atlas successfully.');
        await this.seedMongoIfEmpty();
        return;
      } catch (err) {
        console.warn('⚠️ MongoDB connection failed, falling back to secure Local JSON DB:', err.message);
      }
    }
    console.log('📁 Using Secure Local File Storage (data/database.json).');
    initLocalDb(true); // Re-seed clean DB on startup
  },

  async seedMongoIfEmpty() {
    if (!isMongoConnected) return;
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminHash = await bcrypt.hash(config.DEFAULT_ADMIN.password, salt);
      const reviewerHash = await bcrypt.hash(config.DEFAULT_REVIEWER.password, salt);

      await UserModel.create([
        {
          id: uuidv4(),
          username: config.DEFAULT_ADMIN.username.toLowerCase(),
          password_hash: adminHash,
          name: config.DEFAULT_ADMIN.name,
          role: 'admin'
        },
        {
          id: uuidv4(),
          username: config.DEFAULT_REVIEWER.username.toLowerCase(),
          password_hash: reviewerHash,
          name: config.DEFAULT_REVIEWER.name,
          role: 'reviewer'
        }
      ]);
    }

    const scriptCount = await ScriptModel.countDocuments();
    if (scriptCount === 0) {
      const initialScriptsPath = path.join(config.DATA_DIR, 'initial_scripts.json');
      if (fs.existsSync(initialScriptsPath)) {
        const raw = JSON.parse(fs.readFileSync(initialScriptsPath, 'utf8'));
        const scripts = raw.map((s, idx) => ({
          id: uuidv4(),
          serial_no: s.serial_no || idx + 1,
          orphan_code: s.orphan_code,
          child_name: s.child_name,
          script_text: s.script_text,
          original_text: s.script_text,
          status: s.status || 'waiting',
          notes: s.notes || '',
          reviewed_by: null,
          reviewed_at: null
        }));
        await ScriptModel.insertMany(scripts);
      }
    }
  },

  // --- Users Operations ---
  async getAllUsers() {
    if (isMongoConnected) {
      return await UserModel.find();
    }
    const db = readLocalDb();
    return db.users;
  },

  async findUserByUsername(username) {
    if (isMongoConnected) {
      return await UserModel.findOne({ username: username.toLowerCase() });
    }
    const db = readLocalDb();
    return db.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (isMongoConnected) {
      return await UserModel.findOne({ id });
    }
    const db = readLocalDb();
    return db.users.find(u => u.id === id) || null;
  },

  // --- Scripts Operations ---
  async getScripts({ status, search, limit = 1000, offset = 0 } = {}) {
    let list = [];
    if (isMongoConnected) {
      const query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [
          { orphan_code: regex },
          { child_name: regex },
          { script_text: regex }
        ];
      }
      list = await ScriptModel.find(query).sort({ serial_no: 1 }).skip(Number(offset)).limit(Number(limit));
    } else {
      const db = readLocalDb();
      list = [...db.scripts];

      if (status && status !== 'all') {
        list = list.filter(s => s.status === status);
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(s =>
          (s.orphan_code && s.orphan_code.toLowerCase().includes(q)) ||
          (s.child_name && s.child_name.toLowerCase().includes(q)) ||
          (s.script_text && s.script_text.toLowerCase().includes(q)) ||
          (String(s.serial_no).includes(q))
        );
      }
      list.sort((a, b) => (a.serial_no || 0) - (b.serial_no || 0));
      list = list.slice(Number(offset), Number(offset) + Number(limit));
    }
    return list;
  },

  async getScriptById(id) {
    if (isMongoConnected) {
      return await ScriptModel.findOne({ id });
    }
    const db = readLocalDb();
    return db.scripts.find(s => s.id === id) || null;
  },

  async createScript(scriptData) {
    const db = readLocalDb();
    const nextSerial = isMongoConnected
      ? (await ScriptModel.countDocuments()) + 1
      : (db.scripts.length > 0 ? Math.max(...db.scripts.map(s => s.serial_no || 0)) + 1 : 1);

    const newRecord = {
      id: uuidv4(),
      serial_no: scriptData.serial_no || nextSerial,
      orphan_code: scriptData.orphan_code ? scriptData.orphan_code.trim().toUpperCase() : `YE-${String(nextSerial).padStart(5, '0')}`,
      child_name: scriptData.child_name ? scriptData.child_name.trim() : 'Orphan Child',
      script_text: scriptData.script_text ? scriptData.script_text.trim() : '',
      original_text: scriptData.script_text ? scriptData.script_text.trim() : '',
      status: scriptData.status || 'waiting',
      notes: scriptData.notes || '',
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isMongoConnected) {
      return await ScriptModel.create(newRecord);
    }
    db.scripts.push(newRecord);
    writeLocalDb(db);
    return newRecord;
  },

  async updateScript(id, updates, updatedByUser) {
    const now = new Date().toISOString();
    if (isMongoConnected) {
      const script = await ScriptModel.findOne({ id });
      if (!script) return null;
      if (updates.script_text !== undefined) script.script_text = updates.script_text;
      if (updates.child_name !== undefined) script.child_name = updates.child_name;
      if (updates.orphan_code !== undefined) script.orphan_code = updates.orphan_code.toUpperCase();
      if (updates.notes !== undefined) script.notes = updates.notes;
      if (updates.status !== undefined) {
        script.status = updates.status;
        if (updates.status === 'approved') {
          script.reviewed_by = updatedByUser ? updatedByUser.name : 'Reviewer';
          script.reviewed_at = new Date();
        } else if (updates.status === 'waiting') {
          script.reviewed_by = null;
          script.reviewed_at = null;
        }
      }
      script.updated_at = new Date();
      await script.save();
      return script;
    }

    const db = readLocalDb();
    const index = db.scripts.findIndex(s => s.id === id);
    if (index === -1) return null;

    const script = db.scripts[index];
    if (updates.script_text !== undefined) script.script_text = updates.script_text;
    if (updates.child_name !== undefined) script.child_name = updates.child_name;
    if (updates.orphan_code !== undefined) script.orphan_code = updates.orphan_code.toUpperCase();
    if (updates.notes !== undefined) script.notes = updates.notes;
    if (updates.status !== undefined) {
      script.status = updates.status;
      if (updates.status === 'approved') {
        script.reviewed_by = updatedByUser ? updatedByUser.name : 'Reviewer';
        script.reviewed_at = now;
      } else if (updates.status === 'waiting') {
        script.reviewed_by = null;
        script.reviewed_at = null;
      }
    }
    script.updated_at = now;
    writeLocalDb(db);
    return script;
  },

  async deleteScript(id) {
    if (isMongoConnected) {
      const result = await ScriptModel.deleteOne({ id });
      return result.deletedCount > 0;
    }
    const db = readLocalDb();
    const initialLen = db.scripts.length;
    db.scripts = db.scripts.filter(s => s.id !== id);
    if (db.scripts.length !== initialLen) {
      writeLocalDb(db);
      return true;
    }
    return false;
  },

  async resequenceSerials() {
    if (isMongoConnected) {
      const scripts = await ScriptModel.find().sort({ _id: 1 });
      for (let i = 0; i < scripts.length; i++) {
        scripts[i].serial_no = i + 1;
        await scripts[i].save();
      }
      return scripts.length;
    }
    const db = readLocalDb();
    db.scripts.forEach((s, idx) => {
      s.serial_no = idx + 1;
    });
    writeLocalDb(db);
    return db.scripts.length;
  },

  async getStats() {
    if (isMongoConnected) {
      const total = await ScriptModel.countDocuments();
      const waiting = await ScriptModel.countDocuments({ status: 'waiting' });
      const approved = await ScriptModel.countDocuments({ status: 'approved' });
      return { total, waiting, approved };
    }
    const db = readLocalDb();
    const total = db.scripts.length;
    const waiting = db.scripts.filter(s => s.status === 'waiting').length;
    const approved = db.scripts.filter(s => s.status === 'approved').length;
    return { total, waiting, approved };
  }
};

module.exports = DB;
