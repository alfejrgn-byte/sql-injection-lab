const { createDatabase } = require("./_lib/db");
const {
  extractFlag,
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
    const category = req.query.category || "";

    db = await createDatabase();
    executedQuery = `SELECT id, name, price FROM products WHERE category='${category}' AND is_hidden=0`;

    const result = db.exec(executedQuery);
    const rows = firstResultRows(result);

    sendJson(res, 200, {
      rows,
      count: rows.length,
      flag: extractFlag(result, null),
      executedQuery
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message,
      rows: [],
      flag: null,
      executedQuery
    });
  } finally {
    if (db) {
      db.close();
    }
  }
};
