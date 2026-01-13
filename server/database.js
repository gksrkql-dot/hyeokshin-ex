const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

let db;

if (process.env.DATABASE_URL) {
  // Use PostgreSQL for Cloud (Render, Neon, etc.)
  console.log('Connecting to PostgreSQL...');
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for most cloud DBs
  });

  // Wrapper for PG to match SQLite API for simple cases
  // Also converts '?' placeholders to '$1, $2...' for PostgreSQL compatibility
  const convertPlaceholders = (sql) => {
    let count = 1;
    return sql.replace(/\?/g, () => `$${count++}`);
  };

  db.run = (sql, params, callback) => {
    db.query(convertPlaceholders(sql), params, (err, res) => {
      if (callback) callback(err, res);
    });
  };
  db.all = (sql, params, callback) => {
    db.query(convertPlaceholders(sql), params, (err, res) => {
      if (callback) callback(err, res ? res.rows : null);
    });
  };
  db.get = (sql, params, callback) => {
    db.query(convertPlaceholders(sql), params, (err, res) => {
      if (callback) callback(err, res ? res.rows[0] : null);
    });
  };

  // Initial Tables for PG
  const schema = `
    CREATE TABLE IF NOT EXISTS excavators (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT,
      qr_code_data TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS maintenance_logs (
      id SERIAL PRIMARY KEY,
      excavator_id INTEGER REFERENCES excavators(id),
      mechanic_name TEXT,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT,
      comments TEXT
    );
  `;
  db.query(schema).catch(err => console.error('PG Schema Error', err));

} else {
  // Use SQLite for Local
  console.log('Connecting to SQLite...');
  const dbPath = path.resolve(__dirname, 'excavator_app.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('SQLite Error', err.message);
    else {
      db.run(`CREATE TABLE IF NOT EXISTS excavators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        model TEXT,
        qr_code_data TEXT UNIQUE NOT NULL
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS maintenance_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        excavator_id INTEGER,
        mechanic_name TEXT,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        comments TEXT,
        FOREIGN KEY (excavator_id) REFERENCES excavators (id)
      )`);
    }
  });
}

module.exports = db;
