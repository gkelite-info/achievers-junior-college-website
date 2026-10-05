"use server";

import { createClient } from "../../supabaseServer";

export async function loginUser(email: string, password: string) {
  try {
    const supabase = await createClient();

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error("Supabase Auth Error:", authError);
      return {
        success: false,
        error: authError?.message || "Invalid email or password.",
      };
    }

    const {
      data: userProfile,
      error: profileError,
    } = await supabase
      .from("auth_users")
      .select("authUserId, firstName, lastName, role, isActive, email, mobile, gender")
      .eq("authUserId", authData.user.id)
      .maybeSingle();

    if (!userProfile || profileError) {
      await supabase.auth.signOut();

      return {
        success: false,
        error: "User profile not found. Please contact administration.",
      };
    }

    if (!userProfile.isActive) {
      await supabase.auth.signOut();

      return {
        success: false,
        error: "Your account is inactive. Please contact administration.",
      };
    }

    return {
      success: true,
      session: authData.session,
      user: userProfile,
    };
  } catch (err) {
    console.error("Login Server Action Error:", err);

    return {
      success: false,
      error: "An unexpected server error occurred.",
    };
  }
}

export async function logoutUser() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (err) {
    console.error("Logout Server Action Error:", err);
    return { success: false, error: "Failed to sign out on server." };
  }
}
