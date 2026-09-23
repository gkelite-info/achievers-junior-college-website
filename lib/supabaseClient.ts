import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mzbctopjpftwnkqpuqhf.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16YmN0b3BqcGZ0d25rcXB1cWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTY5MTksImV4cCI6MjEwNTI5MjkxOX0.QQTMMDiztcU-O3ruU0Tjc9163PRVwLvThOGJixE2kWg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
