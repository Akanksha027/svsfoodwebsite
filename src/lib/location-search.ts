import { BACKEND_URL } from "@/lib/config";

export type LocationSearchResult = {
  id: string;
  label: string;
  lat?: number;
  lng?: number;
  /** Google Places id — resolve via `resolvePlaceLocation` when lat/lng absent. */
  placeId?: string;
};

function pickSearchLabel(data: Record<string, unknown>): string {
  const addr = (data.address ?? {}) as Record<string, string>;
  const parts = [
    addr.house_number,
    addr.road,
    addr.neighbourhood,
    addr.suburb,
    addr.residential,
    addr.village,
    addr.town,
    addr.city,
    addr.state,
    addr.postcode,
  ].filter(Boolean);
  const unique = [...new Set(parts)];
  if (unique.length > 0) return unique.join(", ");
  const name = typeof data.display_name === "string" ? data.display_name : "";
  return name.split(",").slice(0, 5).join(",").trim();
}

type SearchOptions = {
  lat?: number;
  lng?: number;
};

async function searchWithGooglePlaces(
  query: string,
  options?: SearchOptions,
): Promise<LocationSearchResult[] | null> {
  const params = new URLSearchParams({ q: query });
  if (options?.lat != null && Number.isFinite(options.lat)) {
    params.set("lat", String(options.lat));
  }
  if (options?.lng != null && Number.isFinite(options.lng)) {
    params.set("lng", String(options.lng));
  }

  const res = await fetch(
    `${BACKEND_URL}/website/places/autocomplete?${params}`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;

  const body = (await res.json()) as {
    success?: boolean;
    data?: {
      results?: Array<{
        id?: string;
        place_id?: string;
        label?: string;
        lat?: number;
        lng?: number;
      }>;
      provider?: string;
    };
  };

  if (body?.data?.provider === "unconfigured") return null;

  const rows = body?.data?.results;
  if (!Array.isArray(rows)) return null;

  const mapped: LocationSearchResult[] = [];
  for (const row of rows) {
    const placeId = row.place_id || row.id;
    const label = row.label?.trim();
    if (!placeId || !label) continue;
    const lat = row.lat != null ? Number(row.lat) : undefined;
    const lng = row.lng != null ? Number(row.lng) : undefined;
    mapped.push({
      id: placeId,
      placeId,
      label,
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
    });
  }
  return mapped;
}

/** Resolve a Google place_id to coordinates + label. */
export async function resolvePlaceLocation(
  placeId: string,
): Promise<LocationSearchResult | null> {
  const id = placeId.trim();
  if (!id) return null;

  try {
    const res = await fetch(
      `${BACKEND_URL}/website/places/details?${new URLSearchParams({ place_id: id })}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as {
      success?: boolean;
      data?: {
        place_id?: string;
        label?: string;
        lat?: number;
        lng?: number;
      };
    };
    const data = body?.data;
    if (!data?.label || data.lat == null || data.lng == null) return null;
    const lat = Number(data.lat);
    const lng = Number(data.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      id: data.place_id || id,
      placeId: data.place_id || id,
      label: data.label,
      lat,
      lng,
    };
  } catch {
    return null;
  }
}

/** Forward geocode — Google Places via backend, Nominatim fallback. */
export async function searchDeliveryLocations(
  query: string,
  options?: SearchOptions,
): Promise<LocationSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  try {
    const google = await searchWithGooglePlaces(q, options);
    if (google?.length) return google;
  } catch {
    /* fall through */
  }

  if (q.length < 3) return [];

  const params = new URLSearchParams({
    q,
    format: "json",
    addressdetails: "1",
    limit: "8",
    countrycodes: "in",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "SVSFoodWebsite/1.0 (delivery location search)",
      },
    },
  );
  if (!res.ok) return [];

  const rows = (await res.json()) as Array<Record<string, unknown>>;
  const mapped: LocationSearchResult[] = [];
  for (const [index, row] of rows.entries()) {
    const lat = Number(row.lat);
    const lng = Number(row.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const label = pickSearchLabel(row);
    if (!label) continue;
    mapped.push({
      id: String(row.place_id ?? index),
      label,
      lat,
      lng,
    });
  }
  return mapped;
}
