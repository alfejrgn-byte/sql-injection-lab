const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function setCorsHeaders(res) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

function handleOptions(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.status(statusCode).json(payload);
}

function methodNotAllowed(res, allowed) {
  sendJson(res, 405, {
    error: `허용되지 않은 메서드입니다. 사용 가능: ${allowed.join(", ")}`
  });
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch (error) {
    return {};
  }
}

function sqlResultToObjects(resultSet) {
  if (!resultSet || !resultSet.columns || !resultSet.values) {
    return [];
  }

  return resultSet.values.map((row) =>
    Object.fromEntries(resultSet.columns.map((column, index) => [column, row[index]]))
  );
}

function firstResultRows(execResult) {
  return sqlResultToObjects(execResult[0]);
}

function normalizeResultSets(execResult) {
  return (execResult || []).map((resultSet) => ({
    columns: resultSet.columns,
    rows: sqlResultToObjects(resultSet)
  }));
}

function extractFlag(execResult, explicitFlag) {
  if (explicitFlag) {
    return explicitFlag;
  }

  const pattern = /FLAG\{[^}]+\}/;
  const textBlob = JSON.stringify(normalizeResultSets(execResult));
  const match = textBlob.match(pattern);
  return match ? match[0] : null;
}

module.exports = {
  extractFlag,
  firstResultRows,
  handleOptions,
  methodNotAllowed,
  normalizeResultSets,
  readJsonBody,
  sendJson,
  setCorsHeaders,
  sqlResultToObjects
};
