// db/index.js — Database abstraction layer with PostgreSQL + sql.js (pure-JS SQLite) fallback
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

let db = null;
let dbType = null;
let pgPool = null;

// ──────────────────────────────────────────────────────────────────────────────
// sql.js wrapper that persists to disk
// ──────────────────────────────────────────────────────────────────────────────
class SqliteWrapper {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this._db = null;
  }

  async load() {
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    if (fs.existsSync(this.dbPath)) {
      const fileBuffer = fs.readFileSync(this.dbPath);
      this._db = new SQL.Database(fileBuffer);
    } else {
      this._db = new SQL.Database();
    }
    return this;
  }

  _persist() {
    const data = this._db.export();
    const buf = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buf);
  }

  exec(sql) {
    this._db.run(sql);
    this._persist();
  }

  run(sql, params = []) {
    const stmt = this._db.prepare(sql);
    stmt.run(params);
    stmt.free();
    this._persist();
  }

  all(sql, params = []) {
    const stmt = this._db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }

  get(sql, params = []) {
    const results = this.all(sql, params);
    return results[0] || null;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function initDB() {
  if (process.env.DATABASE_URL) {
    try {
      const { Pool } = require('pg');
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
      });
      await pgPool.query('SELECT 1');
      console.log('✅ Connected to PostgreSQL database');
      dbType = 'pg';
      db = pgPool;
      await createPGTables();
      await seedTemplates();
      await seedUsers();
      return;
    } catch (err) {
      console.warn('⚠️  PostgreSQL connection failed, falling back to SQLite:', err.message);
    }
  }

  // Fallback: sql.js (pure JS SQLite — no native compilation needed)
  const dbPath = path.join(__dirname, '..', 'data.db');
  const wrapper = new SqliteWrapper(dbPath);
  await wrapper.load();
  console.log('✅ Using SQLite database at', dbPath);
  dbType = 'sqlite';
  db = wrapper;
  createSQLiteTables();
  await seedTemplates();
  await seedUsers();
}

// ──────────────────────────────────────────────────────────────────────────────
async function createPGTables() {
  await pgPool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE TABLE IF NOT EXISTS generations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_name VARCHAR(100) NOT NULL,
      product_category VARCHAR(100) NOT NULL,
      product_description TEXT NOT NULL,
      target_market VARCHAR(100) NOT NULL,
      business_goals TEXT NOT NULL,
      special_requirements TEXT,
      notes TEXT,
      prompt_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
      ai_response JSONB NOT NULL,
      rating INT CHECK (rating BETWEEN 1 AND 5),
      response_time_ms INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      generation_id UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
      rating INT CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      is_thumbs_up BOOLEAN,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_name VARCHAR(150) NOT NULL UNIQUE,
      category VARCHAR(100) NOT NULL,
      market VARCHAR(100) NOT NULL,
      preset_data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function createSQLiteTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      admin_name TEXT NOT NULL,
      product_category TEXT NOT NULL,
      product_description TEXT NOT NULL,
      target_market TEXT NOT NULL,
      business_goals TEXT NOT NULL,
      special_requirements TEXT,
      notes TEXT,
      prompt_version TEXT NOT NULL DEFAULT '1.0.0',
      ai_response TEXT NOT NULL,
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      response_time_ms INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      generation_id TEXT NOT NULL REFERENCES generations(id),
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      is_thumbs_up INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      template_name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      market TEXT NOT NULL,
      preset_data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// ──────────────────────────────────────────────────────────────────────────────
async function seedTemplates() {
  const presets = [
    {
      template_name: 'Wooden Dining Tables → USA',
      category: 'Home Furniture',
      market: 'United States',
      preset_data: {
        adminName: 'Admin', productCategory: 'Home Furniture',
        productDescription: 'Premium solid teak wood dining tables with hand-carved legs, available in 4, 6, and 8 seater configurations. Traditional Indian craftsmanship with modern finishes.',
        targetMarket: 'United States',
        businessGoals: 'Establish brand presence in US market, target mid-to-premium segment, achieve 500 units in first year.',
        specialRequirements: 'Must comply with US EPA TSCA wood import regulations. Formaldehyde-free finishes required.',
        notes: 'Focus on eco-friendly and sustainability angle for US buyers.'
      }
    },
    {
      template_name: 'Office Chairs → Germany',
      category: 'Office Furniture',
      market: 'Germany',
      preset_data: {
        adminName: 'Admin', productCategory: 'Office Furniture',
        productDescription: 'Ergonomic office chairs with lumbar support, adjustable height, and breathable mesh fabric. Meets international ergonomic standards.',
        targetMarket: 'Germany',
        businessGoals: 'Enter European B2B market, target corporate office suppliers, achieve €200K revenue in year one.',
        specialRequirements: 'Must meet EU EN 1335 standard for office chairs. German language manuals needed.',
        notes: 'German buyers value precision engineering and long warranty periods.'
      }
    },
    {
      template_name: 'Bedroom Furniture → UAE',
      category: 'Home Furniture',
      market: 'United Arab Emirates',
      preset_data: {
        adminName: 'Admin', productCategory: 'Home Furniture',
        productDescription: 'Luxury bedroom sets including king-size beds, wardrobes, dressing tables and nightstands. Ornate designs with gold accents, premium upholstery.',
        targetMarket: 'United Arab Emirates',
        businessGoals: 'Target high-end residential segment, luxury hotel furnishing market, establish partnerships with UAE interior designers.',
        specialRequirements: 'Dubai Municipality regulations compliance. Fire-retardant materials required for hotel use.',
        notes: 'UAE market values opulence and exclusivity. Focus on premium positioning.'
      }
    },
    {
      template_name: 'Custom Furniture → Australia',
      category: 'Custom Furniture',
      market: 'Australia',
      preset_data: {
        adminName: 'Admin', productCategory: 'Custom Furniture',
        productDescription: 'Bespoke furniture manufacturing service — made-to-order pieces in any dimension or design specification. Wide range of wood types: teak, mango, sheesham, rosewood.',
        targetMarket: 'Australia',
        businessGoals: 'Target online direct-to-consumer segment, establish Shopify + showroom model, reach AUD 1M revenue.',
        specialRequirements: 'DAFF biosecurity wood import compliance (heat treatment ISPM 15). GST registration.',
        notes: 'Australians prefer minimalist Scandinavian and coastal styles. Avoid heavy ornamentation.'
      }
    },
    {
      template_name: 'Premium Furniture → UK',
      category: 'Export-Grade Furniture',
      market: 'United Kingdom',
      preset_data: {
        adminName: 'Admin', productCategory: 'Export-Grade Furniture',
        productDescription: 'Export-grade premium furniture collection: sofas, sectionals, dining sets, and bedroom suites. FSC-certified wood, OEKO-TEX certified upholstery, 5-year warranty.',
        targetMarket: 'United Kingdom',
        businessGoals: 'B2B wholesale to UK furniture retailers, establish 3 anchor retail partnerships, target £500K in year one.',
        specialRequirements: 'Post-Brexit UK CA marking, UKCA conformity, Furniture and Furnishings (Fire Safety) Regulations compliance.',
        notes: 'UK buyers are increasingly interested in ethical sourcing and sustainability certifications.'
      }
    }
  ];

  for (const p of presets) {
    const exists = await queryOne(
      `SELECT id FROM templates WHERE template_name = ?`, [p.template_name],
      `SELECT id FROM templates WHERE template_name = $1`, [p.template_name]
    );
    if (!exists) {
      await run(
        `INSERT INTO templates (id, template_name, category, market, preset_data) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), p.template_name, p.category, p.market, JSON.stringify(p.preset_data)],
        `INSERT INTO templates (id, template_name, category, market, preset_data) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), p.template_name, p.category, p.market, p.preset_data]
      );
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function seedUsers() {
  const defaultUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user',  password: 'user123',  role: 'user'  },
  ];

  for (const u of defaultUsers) {
    const exists = await queryOne(
      `SELECT id FROM users WHERE username = ?`, [u.username],
      `SELECT id FROM users WHERE username = $1`, [u.username]
    );
    if (!exists) {
      const hash = await bcrypt.hash(u.password, 10);
      await run(
        `INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)`,
        [uuidv4(), u.username, hash, u.role],
        `INSERT INTO users (id, username, password_hash, role) VALUES ($1, $2, $3, $4)`,
        [uuidv4(), u.username, hash, u.role]
      );
      console.log(`✅ Seeded user: ${u.username} (${u.role})`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Unified query helpers
// ──────────────────────────────────────────────────────────────────────────────
async function query(sqlSqlite, paramsSqlite, sqlPG, paramsPG) {
  if (dbType === 'pg') {
    const res = await db.query(sqlPG || sqlSqlite, paramsPG || paramsSqlite);
    return res.rows;
  }
  return db.all(sqlSqlite, paramsSqlite || []);
}

async function run(sqlSqlite, paramsSqlite, sqlPG, paramsPG) {
  if (dbType === 'pg') {
    return db.query(sqlPG || sqlSqlite, paramsPG || paramsSqlite);
  }
  db.run(sqlSqlite, paramsSqlite || []);
}

async function queryOne(sqlSqlite, paramsSqlite, sqlPG, paramsPG) {
  if (dbType === 'pg') {
    const res = await db.query(sqlPG || sqlSqlite, paramsPG || paramsSqlite);
    return res.rows[0] || null;
  }
  return db.get(sqlSqlite, paramsSqlite || []);
}

function parseJSON(val) {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

module.exports = { initDB, query, run, queryOne, parseJSON, getDbType: () => dbType, seedUsers };
