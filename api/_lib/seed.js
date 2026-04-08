function seedDatabase(db) {
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      is_active INTEGER NOT NULL
    );

    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      is_hidden INTEGER NOT NULL
    );

    CREATE TABLE secret_flags (
      lab_id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      flag TEXT NOT NULL
    );

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE admin_logs (
      id INTEGER PRIMARY KEY,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  db.exec(`
    INSERT INTO users (id, username, password, email, role, is_active) VALUES
      (1, 'admin', 'supersecretpassword!', 'admin@lab.com', 'admin', 1),
      (2, 'john', 'password123', 'john@lab.com', 'user', 1),
      (3, 'jane', 'jane2024!', 'jane@lab.com', 'user', 1),
      (4, 'test', 'test', 'test@lab.com', 'user', 0),
      (5, 'flag_keeper', 'FLAG{y0u_found_the_us3r}', 'secret@lab.com', 'admin', 1);

    INSERT INTO products (id, name, category, description, price, is_hidden) VALUES
      (1, 'Terminal Hoodie', 'apparel', '블랙 후드와 터미널 커서 자수가 들어간 인기 상품', 79.99, 0),
      (2, 'SQL Mug', 'accessories', 'UNION SELECT 문구가 새겨진 실습용 머그컵', 14.50, 0),
      (3, 'Red Team Sticker Pack', 'accessories', '랩탑을 위한 스티커 12종 세트', 6.90, 0),
      (4, 'Query Analyzer Pro', 'software', '쿼리 학습을 위한 데스크톱 도구 라이선스', 199.00, 0),
      (5, 'Vault Archive', 'software', 'FLAG{un10n_can_see_hidden_rows}', 999.99, 1),
      (6, 'Zero-Day Capsule', 'lab', '내부 데모용 비공개 상품', 313.37, 1);

    INSERT INTO secret_flags (lab_id, title, flag) VALUES
      (1, 'Login Bypass', 'FLAG{admin_login_bypass}'),
      (2, 'UNION Extraction', 'FLAG{un10n_can_see_hidden_rows}'),
      (3, 'Blind Boolean', 'FLAG{y0u_found_the_us3r}'),
      (4, 'Error-Based Leak', 'FLAG{err0r_messages_leak}'),
      (5, 'Time-Based Blind', 'FLAG{time_based_truth}'),
      (6, 'Stacked Queries', 'FLAG{stacked_queries_unlock}'),
      (7, 'WAF Bypass', 'FLAG{waf_bypass_complete}');

    INSERT INTO orders (id, user_id, product_id, quantity, total_price, status) VALUES
      (1, 2, 1, 1, 79.99, 'paid'),
      (2, 3, 2, 2, 29.00, 'shipped'),
      (3, 1, 4, 1, 199.00, 'processing');

    INSERT INTO admin_logs (id, action, details, created_at) VALUES
      (1, 'LOGIN', '관리자 대시보드 접근 성공', '2026-04-01 09:15:00'),
      (2, 'EXPORT', '내부 상품 목록 CSV 추출', '2026-04-03 18:40:00');
  `);
}

module.exports = { seedDatabase };
