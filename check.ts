import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  await supabase.from('pg_tables').select('*'); // Try to fetch from pg_tables, which might fail due to RLS, or we can use another method.

  // Actually, we can fetch an existing table to see its structure if we know one, like "users" or "courses".
  await supabase.from("courses").select("*");

  await supabase.from("course_admissions").select("*");

  await supabase.from("admissions").select("*");
}
check();
