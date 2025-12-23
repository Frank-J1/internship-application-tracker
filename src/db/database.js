const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Build an absolute path to: data/applications.db
const dbPath = path.join(__dirname, "../../data/applications.db");

// Open (or create) the database file
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite:", err.message);
    return;
  }
  console.log("Connected to SQLite at:", dbPath);
});

db.run(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

db.run(
  `ALTER TABLE applications ADD COLUMN status TEXT DEFAULT 'applied'`, 
  (err) => {
    if(err){
      console.log("Statis column may already exist", err.message);
    } 
    else{
      console.log("Added status column to applications table");
  }
});

module.exports = db;