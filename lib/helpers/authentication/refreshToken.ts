import { supabase } from "../../supabaseClient";

export async function refreshToken(refresh_token: string) {
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const session = data.session;

    return {
      success: true,
      tokens: {
        access_token: session?.access_token,
        refresh_token: session?.refresh_token,
        expires_in: session?.expires_in,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
