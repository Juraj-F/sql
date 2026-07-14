export const TABLES = [
  "departments",
  "employees",
  "suppliers",
  "projects",
  "components",
  "customers",
  "orders",
  "order_items",
];

export const EXAMPLE_QUERIES = [
  {
    title: "1. Základný SELECT s filtrom",
    description: "Komponenty s vysokou kritickosťou vo fáze plánovania.",
    sql: `SELECT id, name, material, criticality, status
FROM components
WHERE criticality = 'high'
  AND status = 'v_planovani'
ORDER BY id;`,
  },
  {
    title: "2. INNER JOIN",
    description: "Objednávky spolu s menom zákazníka a jeho krajinou.",
    sql: `SELECT
  o.id AS order_id,
  c.name AS customer,
  c.country,
  o.order_date,
  o.total_amount
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.order_date DESC
LIMIT 50;`,
  },
  {
    title: "3. LEFT JOIN + anti-join",
    description: "Zákazníci bez objednávky za posledných 365 dní.",
    sql: `SELECT c.id, c.name, c.country
FROM customers c
LEFT JOIN orders o
  ON c.id = o.customer_id
  AND o.order_date >= CURRENT_DATE - INTERVAL '365 days'
WHERE o.id IS NULL
ORDER BY c.name;`,
  },
  {
    title: "4. GROUP BY + agregácie",
    description: "Počet komponentov a priemerná cena podľa kritickosti.",
    sql: `SELECT
  criticality,
  COUNT(*) AS pocet,
  ROUND(AVG(unit_cost), 2) AS priemerna_cena
FROM components
GROUP BY criticality
ORDER BY priemerna_cena DESC;`,
  },
  {
    title: "5. GROUP BY + HAVING",
    description: "Dodávatelia dodávajúci viac než 40 komponentov.",
    sql: `SELECT
  s.name,
  COUNT(c.id) AS pocet_komponentov
FROM suppliers s
JOIN components c ON c.supplier_id = s.id
GROUP BY s.id, s.name
HAVING COUNT(c.id) > 40
ORDER BY pocet_komponentov DESC;`,
  },
  {
    title: "6. Prekročený rozpočet",
    description: "Projekty, ktoré prekročili svoj rozpočet.",
    sql: `SELECT
  name,
  client,
  budget,
  budget_spent,
  ROUND(budget_spent - budget, 2) AS prekrocenie
FROM projects
WHERE budget_spent > budget
ORDER BY prekrocenie DESC;`,
  },
  {
    title: "7. Viacnásobný JOIN",
    description: "Projekty, manažéri a počet kritických komponentov.",
    sql: `SELECT
  p.name AS project,
  e.name AS manager,
  COUNT(c.id) AS pocet_kritickych
FROM projects p
JOIN employees e ON e.id = p.manager_id
LEFT JOIN components c
  ON c.project_id = p.id
  AND c.criticality = 'high'
GROUP BY p.id, p.name, e.name
ORDER BY pocet_kritickych DESC
LIMIT 20;`,
  },
  {
    title: "8. Dátumové filtrovanie",
    description: "Objednávky vytvorené za posledných 30 dní.",
    sql: `SELECT id, order_date, status, total_amount
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY order_date DESC;`,
  },
  {
    title: "9. ROW_NUMBER",
    description: "Tri najdrahšie komponenty v každom projekte.",
    sql: `SELECT project_id, name, unit_cost, rn
FROM (
  SELECT
    project_id,
    name,
    unit_cost,
    ROW_NUMBER() OVER (
      PARTITION BY project_id
      ORDER BY unit_cost DESC
    ) AS rn
  FROM components
) ranked
WHERE rn <= 3
ORDER BY project_id, rn;`,
  },
  {
    title: "10. CASE WHEN",
    description: "Rozdelenie objednávok do cenových pásiem.",
    sql: `SELECT
  CASE
    WHEN total_amount < 500 THEN 'maly'
    WHEN total_amount < 2000 THEN 'stredny'
    ELSE 'velky'
  END AS kategoria,
  COUNT(*) AS pocet
FROM orders
GROUP BY kategoria
ORDER BY pocet DESC;`,
  },
  {
    title: "11. Korelovaná subquery",
    description: "Komponenty drahšie než priemer vlastného projektu.",
    sql: `SELECT c.project_id, c.name, c.unit_cost
FROM components c
WHERE c.unit_cost > (
  SELECT AVG(c2.unit_cost)
  FROM components c2
  WHERE c2.project_id = c.project_id
)
ORDER BY c.project_id
LIMIT 30;`,
  },
  {
    title: "12. Percento nedodania",
    description: "Percento nedodaných kusov pri komponentoch vo výrobe.",
    sql: `SELECT
  id,
  name,
  qty_needed,
  qty_delivered,
  ROUND(
    100.0 * (qty_needed - qty_delivered) / qty_needed,
    1
  ) AS percento_chyba
FROM components
WHERE status = 'vo_vyrobe'
  AND qty_needed > 0
ORDER BY percento_chyba DESC
LIMIT 30;`,
  },
];
