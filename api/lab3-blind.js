const { createDatabase } = require("./_lib/db");
const {
  firstResultRows,
  handleOptions,
  methodNotAllowed,
  sendJson
} = require("./_lib/http");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET", "OPTIONS"]);
    return;
  }

  let db;
  let executedQuery = "";

  try {
    const id = req.query.id || "0";

    db = await createDatabase();
    executedQuery = `SELECT id FROM users WHERE id=${id} AND is_active=1`;

    const result = db.exec(executedQuery);
    const rows = firstResultRows(result);

    sendJson(res, 200, {
      exists: rows.length > 0,
      executedQuery
    });
  } catch (error) {
    sendJson(res, 500, {
      exists: false,
      error: error.message,
      executedQuery
    });
  } finally {
    if (db) {
      db.close();
    }
  }
};
