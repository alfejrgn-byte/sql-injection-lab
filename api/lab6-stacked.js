const { createDatabase } = require("./_lib/db");
const {
  extractFlag,
  firstResultRows,
  handleOptions,
  methodNotAllowed,
  normalizeResultSets,
  readJsonBody,
  sendJson
} = require("./_lib/http");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST", "OPTIONS"]);
    return;
  }

  let db;
  let executedQuery = "";

  try {
    const body = await readJsonBody(req);
    const title = body.title || "";

    db = await createDatabase();
    executedQuery = `INSERT INTO admin_logs (action, details, created_at) VALUES ('POST', '${title}', datetime('now'))`;

    const execResult = db.exec(executedQuery);
    const adminLogsResult = db.exec("SELECT * FROM admin_logs ORDER BY id DESC");
    const adminLogs = firstResultRows(adminLogsResult);

    sendJson(res, 200, {
      message: "로그가 기록되었습니다.",
      adminLogs,
      executionResults: normalizeResultSets(execResult),
      flag: extractFlag(execResult, null),
      executedQuery
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message,
      adminLogs: [],
      executionResults: [],
      flag: null,
      executedQuery
    });
  } finally {
    if (db) {
      db.close();
    }
  }
};
