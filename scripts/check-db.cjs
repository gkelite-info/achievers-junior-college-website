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
  const users = await pool.query('SELECT "userId", "applicationNumber", "firstName", "lastName", "email", "mobileNumber", "createdAt" FROM public.users ORDER BY "createdAt" DESC');
  console.log('Total users:', users.rows.length);
  console.log(JSON.stringify(users.rows, null, 2));
  await pool.end();
}

main().catch(console.error);
