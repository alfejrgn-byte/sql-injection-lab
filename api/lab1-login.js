const { createDatabase } = require("./_lib/db");
const {
  extractFlag,
  firstResultRows,
  handleOptions,
  methodNotAllowed,
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
    const username = body.username || "";
    const password = body.password || "";

    db = await createDatabase();
    executedQuery = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;

    const result = db.exec(executedQuery);
    const users = firstResultRows(result);
    const user = users[0] || null;

    let flag = null;
    if (user && user.role === "admin") {
      const flagResult = db.exec("SELECT flag FROM secret_flags WHERE lab_id = 1");
      flag = firstResultRows(flagResult)[0]?.flag || null;
    }

    sendJson(res, 200, {
      success: Boolean(user),
      message: user ? "로그인에 성공했습니다." : "일치하는 계정을 찾지 못했습니다.",
      user,
      flag,
      executedQuery
    });
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      error: error.message,
      flag: extractFlag([], null),
      executedQuery
    });
  } finally {
    if (db) {
      db.close();
    }
  }
};
