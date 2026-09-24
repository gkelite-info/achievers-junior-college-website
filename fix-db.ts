import { pool } from "./lib/db.js";

async function run() {
  try {
    await pool.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "paymentStatus" character varying(50) DEFAULT 'pending';`);
    console.log("paymentStatus column added to users table!");
  } catch (error) {
    console.error("Error modifying database:", error);
  } finally {
    process.exit(0);
  }
}

run();
