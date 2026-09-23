const { Pool } = require('pg');
const pool = new Pool({
  host: 'db.mzbctopjpftwnkqpuqhf.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Sbose1011@!@#$%',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const s = await pool.query("SELECT * FROM vault.secrets");
    console.log('vault.secrets:', s.rows);
  } catch (e) {
    console.log('vault.secrets error:', e.message);
  }
  try {
    const s2 = await pool.query("SELECT * FROM auth.instances");
    console.log('auth.instances:', s2.rows);
  } catch (e) {
    console.log('auth.instances error:', e.message);
  }
  await pool.end();
}

main().catch(console.error);
