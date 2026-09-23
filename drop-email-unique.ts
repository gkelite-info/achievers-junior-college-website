import fs from "fs";
import pg from "pg";

const envLocal = fs.readFileSync(".env.local", "utf8");
envLocal.split("\n").forEach(line => {
  const [key, ...valParts] = line.split("=");
  const val = valParts.join("=");
  if (key && val) process.env[key.trim()] = val.trim();
});

const rawPassword = process.env.DBPASSWORD || "";
const password = rawPassword.startsWith("'") && rawPassword.endsWith("'") ? rawPassword.slice(1, -1) : rawPassword;
const host = process.env.DBHOSTNAME || "localhost";
const isSupabaseHost = host.includes("supabase.co");

const pool = new pg.Pool({
  host,
  port: Number(process.env.DBPORT || 5432),
  database: process.env.DBNAME || "postgres",
  user: process.env.DBUSERNAME || "postgres",
  password,
  ssl: isSupabaseHost ? { rejectUnauthorized: false } : undefined,
});

async function run() {
  try {
    const res = await pool.query('ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key');
    console.log("Successfully dropped users_email_key constraint");
  } catch(e) {
    console.error("Error:", e);
  } finally {
    await pool.end();
  }
}
run();
