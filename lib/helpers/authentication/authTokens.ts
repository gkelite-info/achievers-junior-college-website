import { supabase } from "../../supabaseClient";

export async function debugTokens() {
  const { data } = await supabase.auth.getSession();

  if (!data || !data.session) {
    console.log("No active session found.");
    return;
  }
  console.log("Session details:", data.session);
}

export async function checkAccessTokenValidity() {
  const { data } = await supabase.auth.getSession();

  if (!data || !data.session) {
    return false;
  }

  const expiresAt = (data.session.expires_at || 0) * 1000;
  const now = Date.now();
  
  return expiresAt > now;
}

export async function testRefreshToken() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    console.error("Refresh failed", error);
  } else {
    console.log("Session refreshed successfully", data.session);
  }
}

export async function testProtectedQuery() {
  const { data, error } = await supabase.from("auth_users").select("*").limit(1);
  if (error) {
    console.error("Protected query failed", error);
  } else {
    console.log("Protected query succeeded", data);
  }
}
