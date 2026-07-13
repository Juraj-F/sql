// seed.js
// Vytvori data.db (SQLite) a naplni ho velkym mnozstvom syntetickych,
// ale realistickych dat, aby bolo mozne precvicovat co najviac druhov
// SQL queries (JOIN, GROUP BY, HAVING, subquery, date filtering, ...).
//
// Spustenie: node seed.js
// Vyzaduje Node.js 22.5+ (vstavany modul node:sqlite, ziadny npm install).

const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "data.db");

// Zacni od cista, nech je seed idempotentny
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new DatabaseSync(DB_PATH);

db.exec(`
PRAGMA journal_mode = WAL;

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  role TEXT NOT NULL,
  hire_date TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  lead_time_days INTEGER NOT NULL,
  rating REAL NOT NULL
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  manager_id INTEGER REFERENCES employees(id),
  start_date TEXT NOT NULL,
  end_date TEXT,
  status TEXT NOT NULL,       -- planning / in_progress / testing / done / on_hold
  budget REAL NOT NULL,
  budget_spent REAL NOT NULL
);

CREATE TABLE components (
  id INTEGER PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  name TEXT NOT NULL,
  material TEXT NOT NULL,
  component_type TEXT NOT NULL,  -- welded / bolted / purchased
  status TEXT NOT NULL,          -- vo_vyrobe / v_planovani / nepouzije_sa / neurcena
  criticality TEXT NOT NULL,     -- low / medium / high
  supplier_id INTEGER REFERENCES suppliers(id),
  unit_cost REAL NOT NULL,
  qty_needed INTEGER NOT NULL,
  qty_delivered INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  segment TEXT NOT NULL,      -- automotive / logistics / retail / manufacturing / finance
  created_at TEXT NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  order_date TEXT NOT NULL,
  status TEXT NOT NULL,       -- new / confirmed / shipped / delivered / cancelled
  total_amount REAL NOT NULL
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL
);

CREATE INDEX idx_components_project ON components(project_id);
CREATE INDEX idx_components_supplier ON components(supplier_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_projects_manager ON projects(manager_id);
`);

// ---------- helpery ----------
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function randomDateBetween(start, end) {
  const s = start.getTime();
  const e = end.getTime();
  return new Date(s + Math.random() * (e - s));
}
function iso(d) { return d.toISOString().slice(0, 19).replace("T", " "); }
function isoDate(d) { return d.toISOString().slice(0, 10); }

const TODAY = new Date("2026-07-13T00:00:00Z");
const THREE_YEARS_AGO = new Date("2023-07-13T00:00:00Z");

// ---------- departments ----------
const departmentNames = [
  "IT Delivery", "Konstrukcia", "Vyroba", "Nakup", "Elektro", "Projektovy manazment"
];
const insDept = db.prepare("INSERT INTO departments (id, name) VALUES (?, ?)");
departmentNames.forEach((name, i) => insDept.run(i + 1, name));

// ---------- employees ----------
const firstNames = ["Jana", "Peter", "Martin", "Lucia", "Michal", "Zuzana", "Tomas", "Eva", "Marek", "Katarina", "Juraj", "Simona", "Robert", "Andrea", "Milan", "Petra", "Stefan", "Veronika", "Lukas", "Monika"];
const lastNames = ["Novak", "Horvath", "Kovac", "Varga", "Toth", "Nagy", "Balog", "Simko", "Molnar", "Baran", "Krizan", "Sabo", "Urban", "Danko", "Fabian"];
const roles = ["Projektovy manazer", "Konstrukter", "Elektrikar", "Programator PLC", "Nakupca", "Testovaci technik", "IT koordinator", "Analytik"];

const insEmp = db.prepare(`INSERT INTO employees (id, name, department_id, role, hire_date, email) VALUES (?, ?, ?, ?, ?, ?)`);
const EMP_COUNT = 60;
for (let i = 1; i <= EMP_COUNT; i++) {
  const first = pick(firstNames);
  const last = pick(lastNames);
  const dept = randInt(1, departmentNames.length);
  const role = pick(roles);
  const hire = randomDateBetween(new Date("2015-01-01"), TODAY);
  const email = `${first}.${last}${i}@allianz-example.sk`.toLowerCase();
  insEmp.run(i, `${first} ${last}`, dept, role, isoDate(hire), email);
}

// ---------- suppliers ----------
const supplierBaseNames = ["FeStal", "RoboTech", "Motorix", "PneumaCo", "SensorWorks", "WeldPro", "AutoParts", "ServoMax", "GripTech", "SafeGuard", "IronForge", "PrecisionCo", "AlfaMech", "OmegaDrive", "NordCable", "SteelBridge", "BaltComponents", "VisionSense", "TorqueLine", "ByteAutomation", "FlexArm", "CamLogic", "PowerJoint", "DynaMotion", "SchemaTech"];
const countries = ["Slovensko", "Cesko", "Nemecko", "Polsko", "Madarsko", "Rakusko", "Taliansko"];
const insSup = db.prepare(`INSERT INTO suppliers (id, name, country, lead_time_days, rating) VALUES (?, ?, ?, ?, ?)`);
supplierBaseNames.forEach((name, i) => {
  insSup.run(i + 1, `${name} s.r.o.`, pick(countries), randInt(3, 60), randFloat(2.5, 5.0, 1));
});
const SUP_COUNT = supplierBaseNames.length;

// ---------- projects ----------
const clients = ["Volkswagen Slovakia", "Kia Zilina", "Continental", "Jaguar Land Rover", "Stellantis Trnava", "Brose", "Magna", "Gestamp", "Faurecia", "Schaeffler", "ZF Friedrichshafen", "Allianz IT Bratislava", "Allianz Digital Hub"];
const projectVerbs = ["Automatizacia linky", "Robotizovane pracovisko", "Modernizacia", "Integracia MES systemu", "Digitalizacia procesu", "Vyvoj dashboardu", "Migracia databazy", "Implementacia API"];
const projectStatuses = ["planning", "in_progress", "testing", "done", "on_hold"];

const insProj = db.prepare(`INSERT INTO projects (id, name, client, manager_id, start_date, end_date, status, budget, budget_spent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const PROJ_COUNT = 80;
for (let i = 1; i <= PROJ_COUNT; i++) {
  const start = randomDateBetween(THREE_YEARS_AGO, TODAY);
  const durationDays = randInt(60, 900);
  const end = new Date(start.getTime() + durationDays * 86400000);
  const status = end > TODAY ? pick(["planning", "in_progress", "testing", "on_hold"]) : pick(["done", "done", "done", "on_hold"]);
  const budget = randFloat(20000, 800000, 0);
  // niektore projekty umyselne prekrocia rozpocet - dobre na precvicenie subquery/HAVING
  const overrun = Math.random() < 0.2;
  const budgetSpent = overrun ? randFloat(budget * 1.0, budget * 1.4, 0) : randFloat(budget * 0.3, budget * 0.99, 0);
  insProj.run(
    i,
    `${pick(projectVerbs)} - ${pick(clients)} #${i}`,
    pick(clients),
    randInt(1, EMP_COUNT),
    isoDate(start),
    status === "done" ? isoDate(end) : null,
    status,
    budget,
    budgetSpent
  );
}

// ---------- components ----------
const materials = ["S235 ocel", "Nerez 304", "Hlinik 6061", "Plast POM", "Pozinkovana ocel", "Kompozit"];
const componentTypes = ["welded", "bolted", "purchased"];
const statuses = ["vo_vyrobe", "v_planovani", "nepouzije_sa", "neurcena"];
const criticalities = ["low", "medium", "high"];
const componentBaseNames = ["Zvarana podstava", "Oplotenie", "Robot rameno", "Servo motor", "Snimac polohy", "Vibracny zasobnik", "Automaticka skrutkovacka", "Kamerovy system", "Dopravnikovy pas", "Bezpecnostny ram", "Prirubovy adapter", "Riadiaca jednotka", "Chladiaci blok", "Uchytavaci prvok"];

const insComp = db.prepare(`INSERT INTO components (id, project_id, name, material, component_type, status, criticality, supplier_id, unit_cost, qty_needed, qty_delivered, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
let compId = 1;
const COMPONENTS_PER_PROJECT_MIN = 8;
const COMPONENTS_PER_PROJECT_MAX = 25;
for (let p = 1; p <= PROJ_COUNT; p++) {
  const count = randInt(COMPONENTS_PER_PROJECT_MIN, COMPONENTS_PER_PROJECT_MAX);
  for (let c = 0; c < count; c++) {
    const qtyNeeded = randInt(1, 40);
    const status = pick(statuses);
    const qtyDelivered = status === "vo_vyrobe" ? randInt(0, qtyNeeded)
      : status === "nepouzije_sa" ? 0
      : status === "neurcena" ? 0
      : randInt(0, Math.floor(qtyNeeded * 0.5));
    const updated = randomDateBetween(THREE_YEARS_AGO, TODAY);
    insComp.run(
      compId++,
      p,
      pick(componentBaseNames),
      pick(materials),
      pick(componentTypes),
      status,
      pick(criticalities),
      randInt(1, SUP_COUNT),
      randFloat(15, 4500, 2),
      qtyNeeded,
      qtyDelivered,
      iso(updated)
    );
  }
}

// ---------- customers ----------
const customerBaseNames = ["Nordic Motors", "BalticFreight", "AlphaLogistics", "SudTrans", "KappaRetail", "OrionParts", "VegaAutomotive", "DeltaSupply", "PolarisTech", "AtlasIndustries", "MeridianGroup", "SterlingParts", "GraniteWorks", "HorizonMobility", "SummitCargo", "CascadeParts", "TerraDrive", " novaFleet", "ZenithMotors", "EchoLogistics", "PrimeAxle", "UrbanFreight", "CoreDrivetrain", "IronRoute", "BlueHarbor", "SilverLine", "CrestAuto", "MapleFreight", "RiverGate", "StoneBridge"];
const segments = ["automotive", "logistics", "retail", "manufacturing", "finance"];
const insCust = db.prepare(`INSERT INTO customers (id, name, country, segment, created_at) VALUES (?, ?, ?, ?, ?)`);
const CUST_COUNT = 400;
for (let i = 1; i <= CUST_COUNT; i++) {
  const created = randomDateBetween(THREE_YEARS_AGO, TODAY);
  insCust.run(i, `${pick(customerBaseNames)} ${i}`, pick(countries), pick(segments), isoDate(created));
}

// ---------- orders + order_items ----------
const orderStatuses = ["new", "confirmed", "shipped", "delivered", "cancelled"];
const productNames = ["Snimac polohy X200", "Servo motor SM45", "Riadiaca jednotka RJ12", "Skrutkovaci modul", "Kamera priemyselna C9", "Robot rameno RA6", "Bezpecnostny senzor", "Konvertor napatia", "Prevodovka P30", "Kabelovy zvazok", "PLC modul", "Dopravnikovy motor"];

const insOrder = db.prepare(`INSERT INTO orders (id, customer_id, order_date, status, total_amount) VALUES (?, ?, ?, ?, ?)`);
const insItem = db.prepare(`INSERT INTO order_items (id, order_id, product_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`);

const ORDER_COUNT = 2500;
let itemId = 1;

// zabezpecime, ze cast zakaznikov nema ziadnu objednavku a cast nema objednavku za posledny rok
// (dobre na precvicenie presne toho typu otazky, ktora padla na pohovore)
const customersWithOrders = new Set();

for (let i = 1; i <= ORDER_COUNT; i++) {
  const customerId = randInt(1, CUST_COUNT - 40); // poslednych ~40 zakaznikov necha bez objednavok
  customersWithOrders.add(customerId);
  // 70% objednavok za poslednych 12 mesiacov, zvysok starsie - dobre na filtrovanie podla datumu
  const orderDate = Math.random() < 0.7
    ? randomDateBetween(new Date(TODAY.getTime() - 365 * 86400000), TODAY)
    : randomDateBetween(THREE_YEARS_AGO, new Date(TODAY.getTime() - 365 * 86400000));
  const status = pick(orderStatuses);

  const itemsInOrder = randInt(1, 6);
  let total = 0;
  const itemRows = [];
  for (let k = 0; k < itemsInOrder; k++) {
    const qty = randInt(1, 25);
    const price = randFloat(8, 1200, 2);
    total += qty * price;
    itemRows.push({ product: pick(productNames), qty, price });
  }

  insOrder.run(i, customerId, iso(orderDate), status, parseFloat(total.toFixed(2)));
  for (const row of itemRows) {
    insItem.run(itemId++, i, row.product, row.qty, row.price);
  }
}

db.close();

console.log("Hotovo! Vytvorena databaza:", DB_PATH);
console.log("Tabulky: departments, employees, suppliers, projects, components, customers, orders, order_items");
console.log(`Projekty: ${PROJ_COUNT}, Komponenty: ${compId - 1}, Zakaznici: ${CUST_COUNT}, Objednavky: ${ORDER_COUNT}, Polozky objednavok: ${itemId - 1}`);
