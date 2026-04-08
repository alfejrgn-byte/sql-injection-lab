const { createDatabase } = require("./_lib/db");
const {
  firstResultRows,
  handleOptions,
  methodNotAllowed,
  sendJson
} = require("./_lib/http");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  const startedAt = Date.now();

  try {
    const id = req.query.id || "0";

    db = await createDatabase();

    if (String(id).startsWith("delay_if_true:")) {
      const condition = String(id).slice("delay_if_true:".length) || "0";
      executedQuery = `SELECT CASE WHEN (${condition}) THEN 1 ELSE 0 END AS should_delay`;
      const result = db.exec(executedQuery);
      const rows = firstResultRows(result);

      if (rows[0]?.should_delay === 1) {
        await sleep(2000);
      }
    } else {
      executedQuery = `SELECT id FROM orders WHERE id=${id}`;
      db.exec(executedQuery);
    }
  } catch (error) {
    if (!executedQuery) {
      executedQuery = `SELECT id FROM orders WHERE id=${req.query.id || "0"}`;
    }
  } finally {
    const responseTime = Date.now() - startedAt;

    sendJson(res, 200, {
      message: "요청 처리됨",
      responseTime,
      executedQuery
    });

    if (db) {
      db.close();
    }
  }
};
