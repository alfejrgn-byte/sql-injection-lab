/* api-router.js — Client-side API router replacing server endpoints */
(function () {
  /* ── helpers ported from api/_lib/http.js ── */

  function sqlResultToObjects(rs) {
    if (!rs || !rs.columns || !rs.values) return [];
    return rs.values.map(function (row) {
      var obj = {};
      rs.columns.forEach(function (col, i) { obj[col] = row[i]; });
      return obj;
    });
  }

  function firstResultRows(execResult) {
    return sqlResultToObjects(execResult[0]);
  }

  function normalizeResultSets(execResult) {
    return (execResult || []).map(function (rs) {
      return { columns: rs.columns, rows: sqlResultToObjects(rs) };
    });
  }

  function extractFlag(execResult, explicit) {
    if (explicit) return explicit;
    var pattern = /FLAG\{[^}]+\}/;
    var blob = JSON.stringify(normalizeResultSets(execResult));
    var m = blob.match(pattern);
    return m ? m[0] : null;
  }

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /* ── lab handlers ── */

  function lab1Login(params) {
    var username = params.username || "";
    var password = params.password || "";
    var executedQuery = "SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'";

    return window.createDatabase().then(function (db) {
      try {
        var result = db.exec(executedQuery);
        var users = firstResultRows(result);
        var user = users[0] || null;
        var flag = null;

        if (user && user.role === "admin") {
          var fr = db.exec("SELECT flag FROM secret_flags WHERE lab_id = 1");
          flag = (firstResultRows(fr)[0] || {}).flag || null;
        }

        return {
          _ok: true, _status: 200, _responseTime: 0,
          success: Boolean(user),
          message: user ? "\uB85C\uADF8\uC778\uC5D0 \uC131\uACF5\uD588\uC2B5\uB2C8\uB2E4." : "\uC77C\uCE58\uD558\uB294 \uACC4\uC815\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
          user: user,
          flag: flag,
          executedQuery: executedQuery
        };
      } catch (e) {
        return { _ok: false, _status: 500, _responseTime: 0, success: false, error: e.message, flag: null, executedQuery: executedQuery };
      } finally { db.close(); }
    });
  }

  function lab2Union(params) {
    var category = params.category || "";
    var executedQuery = "SELECT id, name, price FROM products WHERE category='" + category + "' AND is_hidden=0";

    return window.createDatabase().then(function (db) {
      try {
        var result = db.exec(executedQuery);
        var rows = firstResultRows(result);
        return {
          _ok: true, _status: 200, _responseTime: 0,
          rows: rows, count: rows.length,
          flag: extractFlag(result, null),
          executedQuery: executedQuery
        };
      } catch (e) {
        return { _ok: false, _status: 500, _responseTime: 0, error: e.message, rows: [], flag: null, executedQuery: executedQuery };
      } finally { db.close(); }
    });
  }

  function lab3Blind(params) {
    var id = params.id || "0";
    var executedQuery = "SELECT id FROM users WHERE id=" + id + " AND is_active=1";

    return window.createDatabase().then(function (db) {
      try {
        var result = db.exec(executedQuery);
        var rows = firstResultRows(result);
        return { _ok: true, _status: 200, _responseTime: 0, exists: rows.length > 0, executedQuery: executedQuery };
      } catch (e) {
        return { _ok: false, _status: 500, _responseTime: 0, exists: false, error: e.message, executedQuery: executedQuery };
      } finally { db.close(); }
    });
  }

  function lab4Error(params) {
    var id = params.id || "0";
    var executedQuery = "SELECT * FROM products WHERE id=" + id;

    return window.createDatabase().then(function (db) {
      try {
        var result = db.exec(executedQuery);
        var rows = firstResultRows(result);
        return { _ok: true, _status: 200, _responseTime: 0, rows: rows, count: rows.length, executedQuery: executedQuery };
      } catch (e) {
        return { _ok: false, _status: 500, _responseTime: 0, error: e.message, executedQuery: executedQuery };
      } finally { db.close(); }
    });
  }

  function lab5Time(params) {
    var id = params.id || "0";
    var startedAt = Date.now();

    return window.createDatabase().then(function (db) {
      var executedQuery = "";
      try {
        if (String(id).startsWith("delay_if_true:")) {
          var condition = String(id).slice("delay_if_true:".length) || "0";
          executedQuery = "SELECT CASE WHEN (" + condition + ") THEN 1 ELSE 0 END AS should_delay";
          var result = db.exec(executedQuery);
          var rows = firstResultRows(result);
          if (rows[0] && rows[0].should_delay === 1) {
            db.close();
            return sleep(2000).then(function () {
              return { _ok: true, _status: 200, _responseTime: Date.now() - startedAt, message: "\uC694\uCCAD \uCC98\uB9AC\uB428", executedQuery: executedQuery };
            });
          }
        } else {
          executedQuery = "SELECT id FROM orders WHERE id=" + id;
          db.exec(executedQuery);
        }
      } catch (e) {
        if (!executedQuery) executedQuery = "SELECT id FROM orders WHERE id=" + id;
      }
      db.close();
      return { _ok: true, _status: 200, _responseTime: Date.now() - startedAt, message: "\uC694\uCCAD \uCC98\uB9AC\uB428", executedQuery: executedQuery };
    });
  }

  function lab6Stacked(params) {
    var title = params.title || "";
    var executedQuery = "INSERT INTO admin_logs (action, details, created_at) VALUES ('POST', '" + title + "', datetime('now'))";

    return window.createDatabase().then(function (db) {
      try {
        var execResult = db.exec(executedQuery);
        var adminLogsResult = db.exec("SELECT * FROM admin_logs ORDER BY id DESC");
        var adminLogs = firstResultRows(adminLogsResult);
        return {
          _ok: true, _status: 200, _responseTime: 0,
          message: "\uB85C\uADF8\uAC00 \uAE30\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
          adminLogs: adminLogs,
          executionResults: normalizeResultSets(execResult),
          flag: extractFlag(execResult, null),
          executedQuery: executedQuery
        };
      } catch (e) {
        return { _ok: false, _status: 500, _responseTime: 0, error: e.message, adminLogs: [], executionResults: [], flag: null, executedQuery: executedQuery };
      } finally { db.close(); }
    });
  }

  function lab7Waf(params) {
    var search = params.search || "";
    var difficulty = params.difficulty || "low";
    var executedQuery = "SELECT id, username, email, role FROM users WHERE username LIKE '%" + search + "%' OR email LIKE '%" + search + "%'";

    var LOW_BLOCKLIST = ["UNION", "SELECT", "OR", "AND", "--", "#", "/*"];
    var HIGH_REGEX = /(union|select|or|and|--|#|\/\*|\*\/|;|'|"|char\(|substr\()/i;
    var HIGH_DOUBLE = /(union\s+union|select\s+select|or\s+or|and\s+and)/i;

    function passesWaf(s, diff) {
      if (diff === "medium") {
        var norm = s.toUpperCase();
        return !LOW_BLOCKLIST.some(function (kw) { return norm.includes(kw); });
      }
      if (diff === "high") {
        return !HIGH_REGEX.test(s) && !HIGH_DOUBLE.test(s);
      }
      return !LOW_BLOCKLIST.some(function (kw) { return s.includes(kw); });
    }

    if (["low", "medium", "high"].indexOf(difficulty) === -1) {
      return Promise.resolve({ _ok: false, _status: 400, _responseTime: 0, error: "difficulty\uB294 low, medium, high \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4.", executedQuery: executedQuery });
    }

    if (!passesWaf(search, difficulty)) {
      return Promise.resolve({
        _ok: true, _status: 403, _responseTime: 0,
        blocked: true,
        message: "WAF(" + difficulty + ")\uAC00 \uC694\uCCAD\uC744 \uCC28\uB2E8\uD588\uC2B5\uB2C8\uB2E4.",
        executedQuery: executedQuery
      });
    }

    return window.createDatabase().then(function (db) {
      try {
        var result = db.exec(executedQuery);
        var rows = firstResultRows(result);
        return {
          _ok: true, _status: 200, _responseTime: 0,
          rows: rows, count: rows.length, blocked: false,
          flag: extractFlag(result, null),
          executedQuery: executedQuery
        };
      } catch (e) {
        return { _ok: false, _status: 500, _responseTime: 0, error: e.message, rows: [], blocked: false, flag: null, executedQuery: executedQuery };
      } finally { db.close(); }
    });
  }

  /* ── URL parser + router ── */

  function parseQuery(qs) {
    var params = {};
    if (!qs) return params;
    qs.split("&").forEach(function (pair) {
      var parts = pair.split("=");
      params[decodeURIComponent(parts[0])] = decodeURIComponent(parts.slice(1).join("=") || "");
    });
    return params;
  }

  var routes = {
    "/api/lab1-login": lab1Login,
    "/api/lab2-union": lab2Union,
    "/api/lab3-blind": lab3Blind,
    "/api/lab4-error": lab4Error,
    "/api/lab5-time": lab5Time,
    "/api/lab6-stacked": lab6Stacked,
    "/api/lab7-waf": lab7Waf
  };

  /* Override window.apiCall */
  var _ready = window.createDatabase().then(function (db) { db.close(); }); // warm-up WASM

  window.apiCall = function (url, options) {
    var start = Date.now();
    var parts = url.split("?");
    var pathname = parts[0];
    var queryParams = parseQuery(parts[1] || "");

    var handler = routes[pathname];
    if (!handler) {
      return Promise.resolve({ _ok: false, _status: 404, _responseTime: Date.now() - start, error: "Not found" });
    }

    /* merge query params + JSON body */
    var bodyParams = {};
    if (options && options.body) {
      try {
        bodyParams = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
      } catch (e) { bodyParams = {}; }
    }

    var merged = {};
    Object.keys(queryParams).forEach(function (k) { merged[k] = queryParams[k]; });
    Object.keys(bodyParams).forEach(function (k) { merged[k] = bodyParams[k]; });

    return _ready.then(function () {
      return handler(merged);
    }).then(function (resp) {
      if (!resp._responseTime) resp._responseTime = Date.now() - start;
      return resp;
    });
  };
})();
