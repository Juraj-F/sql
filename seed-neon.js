// seed-neon.js
import process from "node:process";
import { loadEnvFile } from "node:process";

try { loadEnvFile(".env.local"); } catch {}
try { loadEnvFile(".env"); } catch {}

import { getDb } from "./lib/db.js";


function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDateBetween(start, end) {
  const startMs = start.getTime();
  const endMs = end.getTime();

  return new Date(
    startMs + Math.random() * (endMs - startMs)
  );
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

const TODAY = new Date("2026-07-13T00:00:00.000Z");
const THREE_YEARS_AGO = new Date(
  "2023-07-13T00:00:00.000Z"
);
const ONE_YEAR_AGO = new Date(
  TODAY.getTime() - 365 * 86_400_000
);

console.log("Connected");

const pool = getDb();
console.log("Pool created");

const client = await pool.connect();
console.log("Client connected");



const connectionTest = await client.query(`
  SELECT
    current_database() AS database,
    current_user AS username,
    NOW() AS connected_at
`);

console.log("Connected to Neon:", connectionTest.rows[0]);



console.log("Creating tables...");
try {
  await client.query("BEGIN");

  await client.query(`
    DROP TABLE IF EXISTS order_items CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS customers CASCADE;
    DROP TABLE IF EXISTS components CASCADE;
    DROP TABLE IF EXISTS projects CASCADE;
    DROP TABLE IF EXISTS suppliers CASCADE;
    DROP TABLE IF EXISTS employees CASCADE;
    DROP TABLE IF EXISTS departments CASCADE;

    CREATE TABLE departments (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE employees (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      department_id INTEGER
        REFERENCES departments(id),
      role TEXT NOT NULL,
      hire_date DATE NOT NULL,
      email TEXT NOT NULL UNIQUE
    );

    CREATE TABLE suppliers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      lead_time_days INTEGER NOT NULL,
      rating DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      client TEXT NOT NULL,
      manager_id INTEGER
        REFERENCES employees(id),
      start_date DATE NOT NULL,
      end_date DATE,
      status TEXT NOT NULL,
      budget NUMERIC(14, 2) NOT NULL,
      budget_spent NUMERIC(14, 2) NOT NULL
    );

    CREATE TABLE components (
      id INTEGER PRIMARY KEY,
      project_id INTEGER
        REFERENCES projects(id),
      name TEXT NOT NULL,
      material TEXT NOT NULL,
      component_type TEXT NOT NULL,
      status TEXT NOT NULL,
      criticality TEXT NOT NULL,
      supplier_id INTEGER
        REFERENCES suppliers(id),
      unit_cost NUMERIC(12, 2) NOT NULL,
      qty_needed INTEGER NOT NULL,
      qty_delivered INTEGER NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE customers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      segment TEXT NOT NULL,
      created_at DATE NOT NULL
    );

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER
        REFERENCES customers(id),
      order_date TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL,
      total_amount NUMERIC(14, 2) NOT NULL
    );

    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY,
      order_id INTEGER
        REFERENCES orders(id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price NUMERIC(12, 2) NOT NULL
    );

    CREATE INDEX idx_components_project
      ON components(project_id);

    CREATE INDEX idx_components_supplier
      ON components(supplier_id);

    CREATE INDEX idx_orders_customer
      ON orders(customer_id);

    CREATE INDEX idx_order_items_order
      ON order_items(order_id);

    CREATE INDEX idx_projects_manager
      ON projects(manager_id);
  `);

  console.log("Tables created");

    console.log("departments");
  // ---------- departments ----------
  const departmentNames = [
    "IT Delivery",
    "Konstrukcia",
    "Vyroba",
    "Nakup",
    "Elektro",
    "Projektovy manazment",
  ];

  for (
    let i = 0;
    i < departmentNames.length;
    i++
  ) {
    await client.query(
      `
        INSERT INTO departments (
          id,
          name
        )
        VALUES ($1, $2)
      `,
      [
        i + 1,
        departmentNames[i],
      ]
    );
  }

    console.log("departments created");


      console.log("employees");
  // ---------- employees ----------
  const firstNames = [
    "Jana",
    "Peter",
    "Martin",
    "Lucia",
    "Michal",
    "Zuzana",
    "Tomas",
    "Eva",
    "Marek",
    "Katarina",
    "Juraj",
    "Simona",
    "Robert",
    "Andrea",
    "Milan",
    "Petra",
    "Stefan",
    "Veronika",
    "Lukas",
    "Monika",
  ];

  const lastNames = [
    "Novak",
    "Horvath",
    "Kovac",
    "Varga",
    "Toth",
    "Nagy",
    "Balog",
    "Simko",
    "Molnar",
    "Baran",
    "Krizan",
    "Sabo",
    "Urban",
    "Danko",
    "Fabian",
  ];

  const roles = [
    "Projektovy manazer",
    "Konstrukter",
    "Elektrikar",
    "Programator PLC",
    "Nakupca",
    "Testovaci technik",
    "IT koordinator",
    "Analytik",
  ];

  const EMP_COUNT = 60;

  for (
    let i = 1;
    i <= EMP_COUNT;
    i++
  ) {
    const first = pick(firstNames);
    const last = pick(lastNames);

    const departmentId = randInt(
      1,
      departmentNames.length
    );

    const role = pick(roles);

    const hireDate = randomDateBetween(
      new Date("2015-01-01T00:00:00.000Z"),
      TODAY
    );

    const email =
      `${first}.${last}${i}@allianz-example.sk`
        .toLowerCase();

    await client.query(
      `
        INSERT INTO employees (
          id,
          name,
          department_id,
          role,
          hire_date,
          email
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
      `,
      [
        i,
        `${first} ${last}`,
        departmentId,
        role,
        isoDate(hireDate),
        email,
      ]
    );
  }
  console.log("employees created");


    console.log("suppliers");
  // ---------- suppliers ----------
  const supplierBaseNames = [
    "FeStal",
    "RoboTech",
    "Motorix",
    "PneumaCo",
    "SensorWorks",
    "WeldPro",
    "AutoParts",
    "ServoMax",
    "GripTech",
    "SafeGuard",
    "IronForge",
    "PrecisionCo",
    "AlfaMech",
    "OmegaDrive",
    "NordCable",
    "SteelBridge",
    "BaltComponents",
    "VisionSense",
    "TorqueLine",
    "ByteAutomation",
    "FlexArm",
    "CamLogic",
    "PowerJoint",
    "DynaMotion",
    "SchemaTech",
  ];

  const countries = [
    "Slovensko",
    "Cesko",
    "Nemecko",
    "Polsko",
    "Madarsko",
    "Rakusko",
    "Taliansko",
  ];

  for (
    let i = 0;
    i < supplierBaseNames.length;
    i++
  ) {
    await client.query(
      `
        INSERT INTO suppliers (
          id,
          name,
          country,
          lead_time_days,
          rating
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
        )
      `,
      [
        i + 1,
        `${supplierBaseNames[i]} s.r.o.`,
        pick(countries),
        randInt(3, 60),
        randFloat(2.5, 5.0, 1),
      ]
    );
  }

  const SUP_COUNT = supplierBaseNames.length;

  const clients = [
    "Volkswagen Slovakia",
    "Kia Zilina",
    "Continental",
    "Jaguar Land Rover",
    "Stellantis Trnava",
    "Brose",
    "Magna",
    "Gestamp",
    "Faurecia",
    "Schaeffler",
    "ZF Friedrichshafen",
    "Allianz IT Bratislava",
    "Allianz Digital Hub",
  ];

  const projectVerbs = [
    "Automatizacia linky",
    "Robotizovane pracovisko",
    "Modernizacia",
    "Integracia MES systemu",
    "Digitalizacia procesu",
    "Vyvoj dashboardu",
    "Migracia databazy",
    "Implementacia API",
  ];

  const PROJ_COUNT = 80;

  for (let i = 1; i <= PROJ_COUNT; i++) {
    const startDate = randomDateBetween(
      THREE_YEARS_AGO,
      TODAY
    );

    const durationDays = randInt(60, 900);

    const calculatedEndDate = new Date(
      startDate.getTime() +
        durationDays * 86_400_000
    );

    const status =
      calculatedEndDate > TODAY
        ? pick([
            "planning",
            "in_progress",
            "testing",
            "on_hold",
          ])
        : pick([
            "done",
            "done",
            "done",
            "on_hold",
          ]);

    const budget = randFloat(
      20_000,
      800_000,
      0
    );

    const budgetSpent =
      Math.random() < 0.2
        ? randFloat(
            budget,
            budget * 1.4,
            0
          )
        : randFloat(
            budget * 0.3,
            budget * 0.99,
            0
          );

    const clientName = pick(clients);

    await client.query(
      `
        INSERT INTO projects (
          id,
          name,
          client,
          manager_id,
          start_date,
          end_date,
          status,
          budget,
          budget_spent
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
      `,
      [
        i,
        `${pick(projectVerbs)} - ${clientName} #${i}`,
        clientName,
        randInt(1, EMP_COUNT),
        isoDate(startDate),
        status === "done"
          ? isoDate(calculatedEndDate)
          : null,
        status,
        budget,
        budgetSpent,
      ]
    );
  }


    console.log("suppliers created");

      console.log("components");

  // ---------- components ----------
  const materials = [
    "S235 ocel",
    "Nerez 304",
    "Hlinik 6061",
    "Plast POM",
    "Pozinkovana ocel",
    "Kompozit",
  ];

  const componentTypes = [
    "welded",
    "bolted",
    "purchased",
  ];

  const componentStatuses = [
    "vo_vyrobe",
    "v_planovani",
    "nepouzije_sa",
    "neurcena",
  ];

  const criticalities = [
    "low",
    "medium",
    "high",
  ];

  const componentBaseNames = [
    "Zvarana podstava",
    "Oplotenie",
    "Robot rameno",
    "Servo motor",
    "Snimac polohy",
    "Vibracny zasobnik",
    "Automaticka skrutkovacka",
    "Kamerovy system",
    "Dopravnikovy pas",
    "Bezpecnostny ram",
    "Prirubovy adapter",
    "Riadiaca jednotka",
    "Chladiaci blok",
    "Uchytavaci prvok",
  ];

  const COMPONENTS_PER_PROJECT_MIN = 8;
  const COMPONENTS_PER_PROJECT_MAX = 25;

  let componentId = 1;

  for (
    let projectId = 1;
    projectId <= PROJ_COUNT;
    projectId++
  ) {
    const componentCount = randInt(
      COMPONENTS_PER_PROJECT_MIN,
      COMPONENTS_PER_PROJECT_MAX
    );

    for (
      let i = 0;
      i < componentCount;
      i++
    ) {
      const qtyNeeded = randInt(1, 40);

      const status = pick(
        componentStatuses
      );

      let qtyDelivered;

      if (status === "vo_vyrobe") {
        qtyDelivered = randInt(
          0,
          qtyNeeded
        );
      } else if (
        status === "nepouzije_sa" ||
        status === "neurcena"
      ) {
        qtyDelivered = 0;
      } else {
        qtyDelivered = randInt(
          0,
          Math.floor(qtyNeeded * 0.5)
        );
      }

      await client.query(
        `
          INSERT INTO components (
            id,
            project_id,
            name,
            material,
            component_type,
            status,
            criticality,
            supplier_id,
            unit_cost,
            qty_needed,
            qty_delivered,
            updated_at
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,
            $7,$8,$9,$10,$11,$12
          )
        `,
        [
          componentId,
          projectId,
          pick(componentBaseNames),
          pick(materials),
          pick(componentTypes),
          status,
          pick(criticalities),
          randInt(1, SUP_COUNT),
          randFloat(
            15,
            4500,
            2
          ),
          qtyNeeded,
          qtyDelivered,
          randomDateBetween(
            THREE_YEARS_AGO,
            TODAY
          ),
        ]
      );

      componentId++;
    }
  }

    console.log("components created");

      console.log("customers");

  // ---------- customers ----------
  const customerBaseNames = [
    "Nordic Motors",
    "BalticFreight",
    "AlphaLogistics",
    "SudTrans",
    "KappaRetail",
    "OrionParts",
    "VegaAutomotive",
    "DeltaSupply",
    "PolarisTech",
    "AtlasIndustries",
    "MeridianGroup",
    "SterlingParts",
    "GraniteWorks",
    "HorizonMobility",
    "SummitCargo",
    "CascadeParts",
    "TerraDrive",
    "NovaFleet",
    "ZenithMotors",
    "EchoLogistics",
    "PrimeAxle",
    "UrbanFreight",
    "CoreDrivetrain",
    "IronRoute",
    "BlueHarbor",
    "SilverLine",
    "CrestAuto",
    "MapleFreight",
    "RiverGate",
    "StoneBridge",
  ];

  const segments = [
    "automotive",
    "logistics",
    "retail",
    "manufacturing",
    "finance",
  ];

  const CUST_COUNT = 400;

  for (
    let i = 1;
    i <= CUST_COUNT;
    i++
  ) {
    await client.query(
      `
        INSERT INTO customers (
          id,
          name,
          country,
          segment,
          created_at
        )
        VALUES (
          $1,$2,$3,$4,$5
        )
      `,
      [
        i,
        `${pick(customerBaseNames)} ${i}`,
        pick(countries),
        pick(segments),
        isoDate(
          randomDateBetween(
            THREE_YEARS_AGO,
            TODAY
          )
        ),
      ]
    );
  }
    console.log("customers created");


      console.log("orders");
  // ---------- orders + order_items ----------
  const orderStatuses = [
    "new",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const productNames = [
    "Snimac polohy X200",
    "Servo motor SM45",
    "Riadiaca jednotka RJ12",
    "Skrutkovaci modul",
    "Kamera priemyselna C9",
    "Robot rameno RA6",
    "Bezpecnostny senzor",
    "Konvertor napatia",
    "Prevodovka P30",
    "Kabelovy zvazok",
    "PLC modul",
    "Dopravnikovy motor",
  ];

  const ORDER_COUNT = 2500;
  let orderItemId = 1;

  for (
    let orderId = 1;
    orderId <= ORDER_COUNT;
    orderId++
  ) {
    // Poslednych 40 zakaznikov zostane bez objednavok.
    const customerId = randInt(
      1,
      CUST_COUNT - 40
    );

    // 70 % objednavok bude z poslednych 12 mesiacov.
    const orderDate =
      Math.random() < 0.7
        ? randomDateBetween(
            ONE_YEAR_AGO,
            TODAY
          )
        : randomDateBetween(
            THREE_YEARS_AGO,
            ONE_YEAR_AGO
          );

    const status = pick(
      orderStatuses
    );

    const itemCount = randInt(
      1,
      6
    );

    const items = [];
    let totalAmount = 0;

    for (
      let i = 0;
      i < itemCount;
      i++
    ) {
      const quantity = randInt(
        1,
        25
      );

      const unitPrice = randFloat(
        8,
        1200,
        2
      );

      totalAmount +=
        quantity * unitPrice;

      items.push({
        productName: pick(
          productNames
        ),
        quantity,
        unitPrice,
      });
    }

    await client.query(
      `
        INSERT INTO orders (
          id,
          customer_id,
          order_date,
          status,
          total_amount
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
        )
      `,
      [
        orderId,
        customerId,
        orderDate,
        status,
        Number(
          totalAmount.toFixed(2)
        ),
      ]
    );

    for (const item of items) {
      await client.query(
        `
          INSERT INTO order_items (
            id,
            order_id,
            product_name,
            quantity,
            unit_price
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5
          )
        `,
        [
          orderItemId,
          orderId,
          item.productName,
          item.quantity,
          item.unitPrice,
        ]
      );

      orderItemId++;
    }
  }

  await client.query("COMMIT");

  console.log(
    "Neon database created and seeded successfully."
  );

  console.log(
    `Departments: ${departmentNames.length}`
  );

  console.log(
    `Employees: ${EMP_COUNT}`
  );

  console.log(
    `Suppliers: ${SUP_COUNT}`
  );

  console.log(
    `Projects: ${PROJ_COUNT}`
  );

  console.log(
    `Components: ${componentId - 1}`
  );

  console.log(
    `Customers: ${CUST_COUNT}`
  );

  console.log(
    `Orders: ${ORDER_COUNT}`
  );

  console.log(
    `Order items: ${orderItemId - 1}`
  );
} catch (error) {
  await client.query("ROLLBACK");

  console.error(
    "Seed failed:",
    error
  );

  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}

  console.log("orders created");