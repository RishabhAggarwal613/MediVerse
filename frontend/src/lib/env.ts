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

/** Browser key restricted to Maps JavaScript API + Places + Geocoder (reverse geocode on map clicks). Optional — picker degrades gracefully. */
export function getGoogleMapsApiKey(): string {
  const k =
    typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim()
      : "";
  return k;
}

/**
 * Must match backend {@code mediverse.appointment.booking-horizon-days} (default 7) for sane date UI.
 */
export function getBookingHorizonDays(): number {
  const raw = process.env.NEXT_PUBLIC_BOOKING_HORIZON_DAYS;
  if (typeof raw === "string" && raw.trim()) {
    const n = Number.parseInt(raw.trim(), 10);
    if (Number.isFinite(n) && n > 0 && n <= 366) return n;
  }
  return 7;
}
