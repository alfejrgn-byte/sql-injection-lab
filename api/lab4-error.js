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
    executedQuery = `SELECT * FROM products WHERE id=${id}`;

    const result = db.exec(executedQuery);
    const rows = firstResultRows(result);

    sendJson(res, 200, {
      rows,
      count: rows.length,
      executedQuery
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message,
      executedQuery
    });
  } finally {
    if (db) {
      db.close();
    }
  }
};
