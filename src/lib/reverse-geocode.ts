import { readSavedUserLocation } from "@/lib/user-location";

const ADDRESS_HINT_KEY = "svs_delivery_address_hint";

export type DeliveryAddressHint = {
  formatted: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  lat: number;
  lng: number;
  savedAt: string;
};

function roundCoord(n: number) {
  return Math.round(n * 10000) / 10000;
}

function hintCacheKey(lat: number, lng: number) {
  return `${roundCoord(lat)},${roundCoord(lng)}`;
}

export function readCachedAddressHint(): DeliveryAddressHint | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADDRESS_HINT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DeliveryAddressHint;
    if (parsed?.formatted && typeof parsed.lat === "number") return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function writeCachedAddressHint(hint: DeliveryAddressHint) {
  try {
    localStorage.setItem(ADDRESS_HINT_KEY, JSON.stringify(hint));
  } catch {
    /* ignore */
  }
}

function pickDisplayName(data: Record<string, unknown>): string {
  const addr = (data.address ?? {}) as Record<string, string>;
  const parts = [
    addr.neighbourhood,
    addr.suburb,
    addr.residential,
    addr.road,
    addr.quarter,
    addr.village,
    addr.town,
    addr.city,
    addr.county,
    addr.state,
    addr.postcode,
  ].filter(Boolean);
  const unique = [...new Set(parts)];
  if (unique.length > 0) return unique.join(", ");
  const name = typeof data.display_name === "string" ? data.display_name : "";
  return name.split(",").slice(0, 4).join(",").trim();
}

/** Reverse-geocode saved GPS into a human-readable area line (cached). */
export async function fetchDeliveryAddressHint(): Promise<DeliveryAddressHint | null> {
  const loc = readSavedUserLocation();
  if (!loc) return readCachedAddressHint();

  const cached = readCachedAddressHint();
  if (
    cached &&
    hintCacheKey(cached.lat, cached.lng) === hintCacheKey(loc.lat, loc.lng)
  ) {
    return cached;
  }

  try {
    const params = new URLSearchParams({
      lat: String(loc.lat),
      lon: String(loc.lng),
      format: "json",
      addressdetails: "1",
      zoom: "18",
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "SVSFoodWebsite/1.0 (checkout delivery)",
        },
      },
    );
    if (!res.ok) return cached;
    const data = (await res.json()) as Record<string, unknown>;
    const addr = (data.address ?? {}) as Record<string, string>;
    const hint: DeliveryAddressHint = {
      formatted: pickDisplayName(data),
      suburb: addr.suburb || addr.neighbourhood || addr.residential,
      city: addr.city || addr.town || addr.village || addr.county,
      state: addr.state,
      postcode: addr.postcode,
      lat: loc.lat,
      lng: loc.lng,
      savedAt: new Date().toISOString(),
    };
    if (hint.formatted) writeCachedAddressHint(hint);
    return hint.formatted ? hint : cached;
  } catch {
    return cached;
  }
}

export function composeDeliveryAddress(input: {
  flat: string;
  street: string;
  area: string;
  landmark?: string;
  pincode?: string;
}): string {
  const lines = [
    input.flat.trim(),
    input.street.trim(),
    input.area.trim(),
    input.landmark?.trim(),
    input.pincode?.trim() ? `PIN ${input.pincode.trim()}` : "",
  ].filter(Boolean);
  return lines.join(", ");
}
