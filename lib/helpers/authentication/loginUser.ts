"use server";

import { supabase } from "../../supabaseClient";

export async function loginUser(email: string, password: string) {
  try {
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
      .select("authUserId, firstName, lastName, role, isActive, email")
      .eq("authUserId", authData.user.id)
      .maybeSingle();

    if (!userProfile || profileError) {
      await supabase.auth.signOut();

      return {
        success: false,
        error: "User profile not found.",
      };
    }

    if (!userProfile.isActive) {
      await supabase.auth.signOut();

      return {
        success: false,
        error: "Your account is inactive.",
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
