// server.js
// Ciste Node.js (bez Express, bez ineho npm balicka) - HTTP server + node:sqlite.
// Spustenie: node server.js   (najprv raz "node seed.js" ak data.db este neexistuje)
import http from "http"

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, "data.db");
const PUBLIC_DIR = path.join(__dirname, "public");

if (!fs.existsSync(DB_PATH)) {
  console.error("data.db neexistuje. Najprv spusti: node seed.js");
  process.exit(1);
}

// readOnly: true -> databaza sa otvori v read-only rezime, takze aj keby
// niekto obisiel kontrolu nizsie, fyzicky sa nic nemoze zapisat/zmazat.
const db = new DatabaseSync(DB_PATH, { readOnly: true });

const TABLES = ["departments", "employees", "suppliers", "projects", "components", "customers", "orders", "order_items"];

const EXAMPLE_QUERIES = [
  {
    title: "1. Zakladny SELECT s filtrom",
    description: "Vsetky komponenty s vysokou kritickostou, ktore su stale vo faze planovania.",
    sql: `SELECT id, name, material, criticality, status\nFROM components\nWHERE criticality = 'high' AND status = 'v_planovani'\nORDER BY id;`
  },
  {
    title: "2. INNER JOIN",
    description: "Objednavky spolu s menom zakaznika a jeho krajinou.",
    sql: `SELECT o.id AS order_id, c.name AS customer, c.country, o.order_date, o.total_amount\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.order_date DESC\nLIMIT 50;`
  },
  {
    title: "3. LEFT JOIN + anti-join (presne otazka z pohovoru!)",
    description: "Zakaznici, ktori NEMAJU ziadnu objednavku za poslednych 365 dni.",
    sql: `SELECT c.id, c.name, c.country\nFROM customers c\nLEFT JOIN orders o\n  ON c.id = o.customer_id\n  AND o.order_date >= date('now', '-365 days')\nWHERE o.id IS NULL\nORDER BY c.name;`
  },
  {
    title: "4. GROUP BY + agregacie",
    description: "Pocet komponentov a priemerna cena za jednotku podla kritickosti.",
    sql: `SELECT criticality, COUNT(*) AS pocet, ROUND(AVG(unit_cost), 2) AS priemerna_cena\nFROM components\nGROUP BY criticality\nORDER BY priemerna_cena DESC;`
  },
  {
    title: "5. GROUP BY + HAVING",
    description: "Dodavatelia, ktori dodavaju viac ako 40 komponentov naprac projektami.",
    sql: `SELECT s.name, COUNT(c.id) AS pocet_komponentov\nFROM suppliers s\nJOIN components c ON c.supplier_id = s.id\nGROUP BY s.id\nHAVING COUNT(c.id) > 40\nORDER BY pocet_komponentov DESC;`
  },
  {
    title: "6. Subquery v WHERE",
    description: "Projekty, ktore prekrocili svoj rozpocet (subquery / porovnanie stlpcov).",
    sql: `SELECT name, client, budget, budget_spent,\n       ROUND(budget_spent - budget, 2) AS prekrocenie\nFROM projects\nWHERE budget_spent > budget\nORDER BY prekrocenie DESC;`
  },
  {
    title: "7. Viacnasobny JOIN (3 tabulky)",
    description: "Projekty spolu s menom manazera a poctom komponentov s vysokou kritickostou.",
    sql: `SELECT p.name AS project, e.name AS manager,\n       COUNT(c.id) AS pocet_kritickych\nFROM projects p\nJOIN employees e ON e.id = p.manager_id\nLEFT JOIN components c\n  ON c.project_id = p.id AND c.criticality = 'high'\nGROUP BY p.id\nORDER BY pocet_kritickych DESC\nLIMIT 20;`
  },
  {
    title: "8. Datumove filtrovanie",
    description: "Objednavky vytvorene v poslednych 30 dnoch.",
    sql: `SELECT id, order_date, status, total_amount\nFROM orders\nWHERE order_date >= date('now', '-30 days')\nORDER BY order_date DESC;`
  },
  {
    title: "9. Window-style rebricek (ROW_NUMBER)",
    description: "Top 3 najdrahsie komponenty v kazdom projekte.",
    sql: `SELECT project_id, name, unit_cost, rn FROM (\n  SELECT project_id, name, unit_cost,\n         ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY unit_cost DESC) AS rn\n  FROM components\n)\nWHERE rn <= 3\nORDER BY project_id, rn;`
  },
  {
    title: "10. CASE WHEN (kategorizacia)",
    description: "Rozdelenie objednavok do cenovych pasiem.",
    sql: `SELECT\n  CASE\n    WHEN total_amount < 500 THEN 'maly'\n    WHEN total_amount < 2000 THEN 'stredny'\n    ELSE 'velky'\n  END AS kategoria,\n  COUNT(*) AS pocet\nFROM orders\nGROUP BY kategoria\nORDER BY pocet DESC;`
  },
  {
    title: "11. Korelovana subquery",
    description: "Komponenty drahsie ako priemer v ramci vlastneho projektu.",
    sql: `SELECT c.project_id, c.name, c.unit_cost\nFROM components c\nWHERE c.unit_cost > (\n  SELECT AVG(c2.unit_cost) FROM components c2 WHERE c2.project_id = c.project_id\n)\nORDER BY c.project_id\nLIMIT 30;`
  },
  {
    title: "12. Percento nedodania (vypocet)",
    description: "Percento nedodanych kusov pri komponentoch vo vyrobe.",
    sql: `SELECT id, name, qty_needed, qty_delivered,\n       ROUND(100.0 * (qty_needed - qty_delivered) / qty_needed, 1) AS percento_chyba\nFROM components\nWHERE status = 'vo_vyrobe' AND qty_needed > 0\nORDER BY percento_chyba DESC\nLIMIT 30;`
  }
];

function send(res, status, body, contentType = "application/json") {
  res.writeHead(status, { "Content-Type": contentType, "Access-Control-Allow-Origin": "*" });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

function serveStatic(req, res, urlPath) {
  let filePath = urlPath === "/" ? "/index.html" : urlPath;
  filePath = path.join(PUBLIC_DIR, filePath);

  // zabranenie path traversal mimo public/
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return send(res, 403, { error: "Forbidden" });
  }

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, { error: "Not found" });
    const ext = path.extname(filePath);
    const types = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript" };
    res.writeHead(200, { "Content-Type": types[ext] || "text/plain" });
    res.end(data);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

// Velmi jednoducha, ale ucinna ochrana pre vzdelavaci ucel:
// povolime iba jeden SELECT/WITH statement, ziadne dalsie keywords ako
// INSERT/UPDATE/DELETE/DROP/ATTACH/PRAGMA a ziadne strednikom oddelene viacnasobne prikazy.
function isSafeSelect(sql) {
  const trimmed = sql.trim().replace(/;+\s*$/, "");
  if (trimmed.includes(";")) return { ok: false, reason: "Povoleny je len jeden SQL prikaz naraz." };
  const lower = trimmed.toLowerCase();
  if (!/^(select|with)\b/.test(lower)) {
    return { ok: false, reason: "Povolene su len SELECT (prip. WITH ... SELECT) dotazy." };
  }
  const forbidden = ["insert", "update", "delete", "drop", "alter", "attach", "detach", "pragma", "vacuum", "replace into", "create "];
  for (const word of forbidden) {
    if (lower.includes(word)) {
      return { ok: false, reason: `Zakazane klucove slovo v dotaze: "${word.trim()}".` };
    }
  }
  return { ok: true, sql: trimmed };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (url.pathname === "/api/schema" && req.method === "GET") {
      const schema = {};
      for (const table of TABLES) {
        const cols = db.prepare(`PRAGMA table_info(${table})`).all();
        const countRow = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get();
        schema[table] = {
          columns: cols.map((c) => ({ name: c.name, type: c.type })),
          row_count: countRow.c
        };
      }
      return send(res, 200, schema);
    }

    if (url.pathname === "/api/examples" && req.method === "GET") {
      return send(res, 200, EXAMPLE_QUERIES);
    }

    if (url.pathname === "/api/query" && req.method === "POST") {
      const raw = await readBody(req);
      let parsed;
      try {
        parsed = JSON.parse(raw || "{}");
      } catch {
        return send(res, 400, { error: "Neplatny JSON v tele poziadavky." });
      }
      const sql = (parsed.sql || "").toString();
      if (!sql.trim()) return send(res, 400, { error: "Chyba SQL dotaz." });

      const check = isSafeSelect(sql);
      if (!check.ok) return send(res, 400, { error: check.reason });

      const start = Date.now();
      try {
        const stmt = db.prepare(check.sql);
        const rows = stmt.all();
        const ms = Date.now() - start;
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        return send(res, 200, { columns, rows, row_count: rows.length, ms });
      } catch (e) {
        return send(res, 400, { error: `SQL chyba: ${e.message}` });
      }
    }

    if (req.method === "GET") {
      return serveStatic(req, res, url.pathname);
    }

    send(res, 404, { error: "Not found" });
  } catch (e) {
    send(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`SQL Practice Dashboard bezi na http://localhost:${PORT}`);
});
