import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mzbctopjpftwnkqpuqhf.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16YmN0b3BqcGZ0d25rcXB1cWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTY5MTksImV4cCI6MjEwNTI5MjkxOX0.QQTMMDiztcU-O3ruU0Tjc9163PRVwLvThOGJixE2kWg",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored if called from a Server Component when middleware refreshes sessions
          }
        },
      },
    }
  );
}
