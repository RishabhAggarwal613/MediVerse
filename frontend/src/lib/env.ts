/** Public env accessors (validated at runtime in dev builds). */

export function getApiBaseUrl(): string {
  const base =
    typeof process.env.NEXT_PUBLIC_API_BASE_URL === "string"
      ? process.env.NEXT_PUBLIC_API_BASE_URL.trim()
      : "";
  return base.replace(/\/$/, "") || "http://localhost:8080/api";
}

/** Backend URL starting Google OAuth (`/oauth2/authorization/google`). */
export function getGoogleOAuthUrl(): string {
  const u =
    typeof process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL === "string"
      ? process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL.trim()
      : "";
  return (
    u || "http://localhost:8080/oauth2/authorization/google"
  );
}
