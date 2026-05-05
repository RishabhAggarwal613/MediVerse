/** Open Google Maps for turn-by-turn directions (no Maps API usage charge for this URL). */

export interface PracticeMapsDestinationInput {
  /** Degrees — used when both are finite numbers. */
  latitude?: number | null;
  longitude?: number | null;
  /** Free-text fallback when coords missing. */
  address?: string | null;
}

export function googleMapsDirectionsUrl(
  dest: PracticeMapsDestinationInput,
): string | null {
  const lat = dest.latitude ?? null;
  const lng = dest.longitude ?? null;
  if (
    lat != null &&
    lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  const addr = dest.address?.trim();
  if (addr) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
  }
  return null;
}

export function googleMapsSearchUrl(
  dest: PracticeMapsDestinationInput,
): string | null {
  const lat = dest.latitude ?? null;
  const lng = dest.longitude ?? null;
  if (
    lat != null &&
    lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  const addr = dest.address?.trim();
  if (addr) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
  }
  return null;
}
