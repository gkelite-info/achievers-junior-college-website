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

export async function updateAdminAuthUser(
  authUserId: string,
  payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    gender?: string;
  }
): Promise<{ success: boolean; data?: AuthUser; message?: string }> {
  try {
    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authUserId, ...payload }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || "Failed to update profile" };
    }

    return { success: true, data: data.data };
  } catch (err: any) {
    console.error("Error in updateAdminAuthUser:", err);
    return { success: false, message: err.message || "Unexpected error updating profile" };
  }
}

