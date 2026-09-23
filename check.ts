import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mzbctopjpftwnkqpuqhf.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16YmN0b3BqcGZ0d25rcXB1cWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTY5MTksImV4cCI6MjEwNTI5MjkxOX0.QQTMMDiztcU-O3ruU0Tjc9163PRVwLvThOGJixE2kWg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('pg_tables').select('*'); // Try to fetch from pg_tables, which might fail due to RLS, or we can use another method.
  
  // Actually, we can fetch an existing table to see its structure if we know one, like "users" or "courses".
  const { data: c, error: errC } = await supabase.from("courses").select("*");
  console.log("courses error:", errC);
  console.log("courses:", c);
  
  const { data: c2, error: errC2 } = await supabase.from("course_admissions").select("*");
  console.log("course_admissions error:", errC2);
  console.log("course_admissions:", c2);
  
  const { data: s, error: errS } = await supabase.from("admissions").select("*");
  console.log("admissions error:", errS);
  console.log("admissions:", s);
}
check();
