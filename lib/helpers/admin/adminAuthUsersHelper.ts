import { supabase } from "@/lib/supabaseClient";

export interface AuthUser {
  authUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getAdminAuthUserById(authUserId: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase
      .from("auth_users")
      .select("*")
      .eq("authUserId", authUserId)
      .single();

    if (error) {
      console.error("Error fetching admin auth user:", error.message);
      return null;
    }

    return data as AuthUser;
  } catch (err) {
    console.error("Unexpected error fetching admin auth user:", err);
    return null;
  }
}
