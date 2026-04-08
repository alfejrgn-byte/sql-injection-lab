/* db-client.js — Browser-side sql.js database initializer */
(function () {
  var SQL_JS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js";
  var SQL_WASM_CDN = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm";

  var _initPromise = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (window.initSqlJs) { resolve(); return; }
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("Failed to load " + src)); };
      document.head.appendChild(s);
    });
  }

  function initOnce() {
    if (!_initPromise) {
      _initPromise = loadScript(SQL_JS_CDN).then(function () {
        return window.initSqlJs({ locateFile: function () { return SQL_WASM_CDN; } });
      });
    }
    return _initPromise;
  }

  function seedDatabase(db) {
    db.exec(
      "CREATE TABLE users (" +
      "  id INTEGER PRIMARY KEY," +
      "  username TEXT NOT NULL," +
      "  password TEXT NOT NULL," +
      "  email TEXT NOT NULL," +
      "  role TEXT NOT NULL," +
      "  is_active INTEGER NOT NULL" +
      ");" +
      "CREATE TABLE products (" +
      "  id INTEGER PRIMARY KEY," +
      "  name TEXT NOT NULL," +
      "  category TEXT NOT NULL," +
      "  description TEXT NOT NULL," +
      "  price REAL NOT NULL," +
      "  is_hidden INTEGER NOT NULL" +
      ");" +
      "CREATE TABLE secret_flags (" +
      "  lab_id INTEGER PRIMARY KEY," +
      "  title TEXT NOT NULL," +
      "  flag TEXT NOT NULL" +
      ");" +
      "CREATE TABLE orders (" +
      "  id INTEGER PRIMARY KEY," +
      "  user_id INTEGER NOT NULL," +
      "  product_id INTEGER NOT NULL," +
      "  quantity INTEGER NOT NULL," +
      "  total_price REAL NOT NULL," +
      "  status TEXT NOT NULL" +
      ");" +
      "CREATE TABLE admin_logs (" +
      "  id INTEGER PRIMARY KEY," +
      "  action TEXT NOT NULL," +
      "  details TEXT NOT NULL," +
      "  created_at TEXT NOT NULL" +
      ");"
    );

    db.exec(
      "INSERT INTO users (id, username, password, email, role, is_active) VALUES " +
      "(1, 'admin', 'supersecretpassword!', 'admin@lab.com', 'admin', 1)," +
      "(2, 'john', 'password123', 'john@lab.com', 'user', 1)," +
      "(3, 'jane', 'jane2024!', 'jane@lab.com', 'user', 1)," +
      "(4, 'test', 'test', 'test@lab.com', 'user', 0)," +
      "(5, 'flag_keeper', 'FLAG{y0u_found_the_us3r}', 'secret@lab.com', 'admin', 1);"
    );

    db.exec(
      "INSERT INTO products (id, name, category, description, price, is_hidden) VALUES " +
      "(1, 'Terminal Hoodie', 'apparel', '\uBE14\uB799 \uD6C4\uB4DC\uC640 \uD130\uBBF8\uB110 \uCEE4\uC11C \uC790\uC218\uAC00 \uB4E4\uC5B4\uAC04 \uC778\uAE30 \uC0C1\uD488', 79.99, 0)," +
      "(2, 'SQL Mug', 'accessories', 'UNION SELECT \uBB38\uAD6C\uAC00 \uC0C8\uACA8\uC9C4 \uC2E4\uC2B5\uC6A9 \uBA38\uADF8\uCEF5', 14.50, 0)," +
      "(3, 'Red Team Sticker Pack', 'accessories', '\uB7A9\uD0D1\uC744 \uC704\uD55C \uC2A4\uD2F0\uCEE4 12\uC885 \uC138\uD2B8', 6.90, 0)," +
      "(4, 'Query Analyzer Pro', 'software', '\uCFFC\uB9AC \uD559\uC2B5\uC744 \uC704\uD55C \uB370\uC2A4\uD06C\uD1B1 \uB3C4\uAD6C \uB77C\uC774\uC120\uC2A4', 199.00, 0)," +
      "(5, 'Vault Archive', 'software', 'FLAG{un10n_can_see_hidden_rows}', 999.99, 1)," +
      "(6, 'Zero-Day Capsule', 'lab', '\uB0B4\uBD80 \uB370\uBAA8\uC6A9 \uBE44\uACF5\uAC1C \uC0C1\uD488', 313.37, 1);"
    );

    db.exec(
      "INSERT INTO secret_flags (lab_id, title, flag) VALUES " +
      "(1, 'Login Bypass', 'FLAG{admin_login_bypass}')," +
      "(2, 'UNION Extraction', 'FLAG{un10n_can_see_hidden_rows}')," +
      "(3, 'Blind Boolean', 'FLAG{y0u_found_the_us3r}')," +
      "(4, 'Error-Based Leak', 'FLAG{err0r_messages_leak}')," +
      "(5, 'Time-Based Blind', 'FLAG{time_based_truth}')," +
      "(6, 'Stacked Queries', 'FLAG{stacked_queries_unlock}')," +
      "(7, 'WAF Bypass', 'FLAG{waf_bypass_complete}');"
    );

    db.exec(
      "INSERT INTO orders (id, user_id, product_id, quantity, total_price, status) VALUES " +
      "(1, 2, 1, 1, 79.99, 'paid')," +
      "(2, 3, 2, 2, 29.00, 'shipped')," +
      "(3, 1, 4, 1, 199.00, 'processing');"
    );

    db.exec(
      "INSERT INTO admin_logs (id, action, details, created_at) VALUES " +
      "(1, 'LOGIN', '\uAD00\uB9AC\uC790 \uB300\uC2DC\uBCF4\uB4DC \uC811\uADFC \uC131\uACF5', '2026-04-01 09:15:00')," +
      "(2, 'EXPORT', '\uB0B4\uBD80 \uC0C1\uD488 \uBAA9\uB85D CSV \uCD94\uCD9C', '2026-04-03 18:40:00');"
    );
  }

  window.createDatabase = function () {
    return initOnce().then(function (SQL) {
      var db = new SQL.Database();
      seedDatabase(db);
      return db;
    });
  };
})();
