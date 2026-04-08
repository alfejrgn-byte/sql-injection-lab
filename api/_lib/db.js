const initSqlJs = require("sql.js");
const { seedDatabase } = require("./seed");

let SQL = null;

async function createDatabase() {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  const db = new SQL.Database();
  seedDatabase(db);
  return db;
}

module.exports = { createDatabase };
