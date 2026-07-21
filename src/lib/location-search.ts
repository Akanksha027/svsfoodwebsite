export type LocationSearchResult = {
  id: string;
  label: string;
  lat: number;
  lng: number;
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

/** Forward geocode via OpenStreetMap Nominatim (India-biased). */
export async function searchDeliveryLocations(
  query: string,
): Promise<LocationSearchResult[]> {
  const q = query.trim();
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
  return rows
    .map((row, index) => {
      const lat = Number(row.lat);
      const lng = Number(row.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const label = pickSearchLabel(row);
      if (!label) return null;
      return {
        id: String(row.place_id ?? index),
        label,
        lat,
        lng,
      };
    })
    .filter((r): r is LocationSearchResult => r != null);
}
