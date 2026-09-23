import pg from "pg";

const { Pool } = pg;

// Singleton connection pool for PostgreSQL (Supabase database)
const globalForPg = globalThis as unknown as { pgPool?: pg.Pool };

const rawPassword = process.env.DBPASSWORD || "";
const password = rawPassword.startsWith("'") && rawPassword.endsWith("'") 
  ? rawPassword.slice(1, -1) 
  : rawPassword;

const host = process.env.DBHOSTNAME || "localhost";
const isSupabaseHost = host.includes("supabase.co");

export const pool =
  globalForPg.pgPool ||
  new Pool({
    host,
    port: Number(process.env.DBPORT || 5432),
    database: process.env.DBNAME || "postgres",
    user: process.env.DBUSERNAME || "postgres",
    password,
    connectionTimeoutMillis: 10000,
    max: 10,
    ssl: isSupabaseHost || process.env.DBSSL === "true" 
      ? { rejectUnauthorized: false } 
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
