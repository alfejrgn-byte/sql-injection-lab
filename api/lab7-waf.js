const { createDatabase } = require("./_lib/db");
const {
  extractFlag,
  firstResultRows,
  handleOptions,
  methodNotAllowed,
  sendJson
} = require("./_lib/http");

const LOW_BLOCKLIST = ["UNION", "SELECT", "OR", "AND", "--", "#", "/*"];
const HIGH_REGEX = /(union|select|or|and|--|#|\/\*|\*\/|;|'|"|char\(|substr\()/i;
const HIGH_DOUBLE_KEYWORD = /(union\s+union|select\s+select|or\s+or|and\s+and)/i;

function passesWaf(search, difficulty) {
  if (difficulty === "medium") {
    const normalized = search.toUpperCase();
    return !LOW_BLOCKLIST.some((keyword) => normalized.includes(keyword));
  }

  if (difficulty === "high") {
    return !HIGH_REGEX.test(search) && !HIGH_DOUBLE_KEYWORD.test(search);
  }

  return !LOW_BLOCKLIST.some((keyword) => search.includes(keyword));
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
  const search = req.query.search || "";
  const difficulty = req.query.difficulty || "low";
  const executedQuery =
    `SELECT id, username, email, role FROM users ` +
    `WHERE username LIKE '%${search}%' OR email LIKE '%${search}%'`;

  try {
    if (!["low", "medium", "high"].includes(difficulty)) {
      sendJson(res, 400, {
        error: "difficulty는 low, medium, high 중 하나여야 합니다.",
        executedQuery
      });
      return;
    }

    if (!passesWaf(search, difficulty)) {
      sendJson(res, 403, {
        blocked: true,
        message: `WAF(${difficulty})가 요청을 차단했습니다.`,
        executedQuery
      });
      return;
    }

    db = await createDatabase();
    const result = db.exec(executedQuery);
    const rows = firstResultRows(result);

    sendJson(res, 200, {
      rows,
      count: rows.length,
      blocked: false,
      flag: extractFlag(result, null),
      executedQuery
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message,
      rows: [],
      blocked: false,
      flag: null,
      executedQuery
    });
  } finally {
    if (db) {
      db.close();
    }
  }
};
