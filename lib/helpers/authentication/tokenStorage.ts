export function saveTokens(tokens: { access_token: string; refresh_token: string; expires_in: number }) {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    localStorage.setItem("expires_in", tokens.expires_in.toString());
  }
}

export function getTokens() {
  if (typeof window === "undefined") {
    return { access_token: null, refresh_token: null, expires_in: 0 };
  }
  return {
    access_token: localStorage.getItem("access_token"),
    refresh_token: localStorage.getItem("refresh_token"),
    expires_in: Number(localStorage.getItem("expires_in")),
  };
}

export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("expires_in");
  }
}
