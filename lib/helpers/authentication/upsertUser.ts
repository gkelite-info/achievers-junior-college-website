import { supabase } from "../../supabaseClient";

export const upsertUser = async (payload: {
  authUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender: string;
  role?: string;
}) => {
  try {
    const {
      authUserId,
      firstName,
      lastName,
      email,
      mobile,
      gender,
      role,
    } = payload;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("auth_users")
      .insert(
        {
          authUserId,
          firstName,
          lastName,
          email,
          mobile,
          gender,
          role: role ?? "Admin",
          isActive: true,
          updatedAt: now,
          createdAt: now,
        }
      )
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // PostgreSQL unique violation code
        return {
          success: false,
          error: "An account with this email address already exists.",
        };
      }
      throw error;
    }

    return {
      success: true,
      message: "User saved successfully",
      data,
    };
  } catch (err: any) {
    console.error("UPSERT PERSONAL DETAILS ERROR:", err.message);
    let message = "Something went wrong";

    if (err.code === "23505") {
      if (err.message.includes("email")) {
        message = "Email is already registered";
      } else {
        message = "Duplicate record already exists";
      }
    }
    return { success: false, error: message };
  }
};
