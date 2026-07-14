import pg from "pg";

const { Pool } = pg;

const globalForDb = globalThis;

function createPool() {
  const connectionString = process.env.NEON_DB;

  if (!connectionString) {
    throw new Error(
      "NEON_DB is not defined. Copy .env.example to .env.local and add your Neon connection string."
    );
  }

  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export function getDb() {
  if (!globalForDb.__sqlPracticePool) {
    globalForDb.__sqlPracticePool = createPool();
  }

  return globalForDb.__sqlPracticePool;
}

export function query(text, params = []) {
  return getDb().query(text, params);
}
