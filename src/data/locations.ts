/**
 * Store locations — edit this file to add/update outlets.
 * `backendStoreId` must match Petpooja / Cloud Run store ids.
 */
export type StoreLocation = {
  id: string;
  /** Backend `stores.id` used by GET /menu */
  backendStoreId: string;
  city: string;
  label?: string;
  address: string;
  phone: string;
  directionsUrl: string;
  image: string;
  /** Approximate outlet coordinates for nearest-store selection */
  lat: number;
  lng: number;
};

export const DEFAULT_BACKEND_STORE_ID = "store_24475";

export const storeLocations: StoreLocation[] = [
  {
    id: "satna",
    backendStoreId: "store_24475",
    city: "Satna",
    address:
      "Rewa Rd, in front of gold palace jewellers, Railway Colony, Satna, Madhya Pradesh 485001",
    phone: "7869717041",
    directionsUrl:
      "https://www.google.com/maps?sca_esv=20b4b65056ec4911&sxsrf=APpeQnvQiOLciYVctLGHBWlxrRnzQy2_bw:1783934977440&biw=1920&bih=958&uact=5&gs_lp=Egxnd3Mtd2l6LXNlcnAiCHN2cyBmb29kMgQQIxgnMgQQIxgnMgQQIxgnMgsQLhiABBjHARivATIIEAAYgAQYyQMyBRAAGIAEMgoQABiABBiKBRhDMgUQABiABDIFEAAYgAQyBRAAGIAESLYHUM4DWIgFcAF4AZABAJgByQGgAd4CqgEFMC4xLjG4AQPIAQD4AQGYAgKgAqEBwgIKEAAYRxjWBBiwA8ICDRAAGIAEGIoFGEMYsAOYAwCIBgGQBgqSBwMxLjGgB8kSsgcDMC4xuAeeAcIHBTAuMS4xyAcJgAgB&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=Kat_2I-bf4Q5MQ9upYRUetQB&daddr=Rewa+Rd,+in+front+of+gold+palace+jewellers,+Railway+Colony,+Satna,+Madhya+Pradesh+485001",
    image: "/images/location.png",
    lat: 24.5754,
    lng: 80.8322,
  },
  {
    id: "jabalpur-narmada",
    backendStoreId: "store_71581",
    city: "Jabalpur",
    label: "Bandariya Tiraha",
    address:
      "Ojas Imperia, Bandariya Tiraha, Narmada Rd, Jabalpur, Madhya Pradesh 482001",
    phone: "7869717041",
    directionsUrl:
      "https://www.google.com/maps/dir/24.5597591,80.836723/SVS+FOOD,+Ojas+Imperia,+Bandariya+Tiraha,+Narmada+Rd,+Jabalpur,+Madhya+Pradesh+482001/@23.8542938,79.722748,9z/data=!3m1!4b1!4m17!1m7!3m6!1s0x3981ad6d9df79349:0x1949edf0cd6f0725!2sSVS+FOOD!8m2!3d23.1437071!4d79.9270865!16s%2Fg%2F11q42ws3pg!4m8!1m1!4e1!1m5!1m1!1s0x3981ad6d9df79349:0x1949edf0cd6f0725!2m2!1d79.9270865!2d23.1437071?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D",
    image: "/images/location.png",
    lat: 23.1437071,
    lng: 79.9270865,
  },
  {
    id: "jabalpur-civic",
    backendStoreId: "store_120161",
    city: "Jabalpur",
    label: "Civic Centre",
    address:
      "Civic Centre, Awadhpuri, Marhatal, Jabalpur, Madhya Pradesh 482002",
    phone: "7869717041",
    directionsUrl:
      "https://www.google.com/maps?vet=10CAAQoqAOahcKEwjw6O_-q8-VAxUAAAAAHQAAAAAQFg..i&pvq=Cg0vZy8xMWtrMDh4amh2Ig4KCHN2cyBmb29kEAIYAw&lqi=CiBzdnMgZm9vZCBzYW1kYXJpeWEgbWFsbCBqYWJhbHB1ckj6g7mExLGAgAhaOBAAEAEYABgBGAIYAxgEIiBzdnMgZm9vZCBzYW1kYXJpeWEgbWFsbCBqYWJhbHB1cioGCAIQABABkgEXc2VsZl9zZXJ2aWNlX3Jlc3RhdXJhbnQ&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KTt9o99Ar4E5MUOmIAHn-7dF&daddr=Civik+centre,+Awadhpuri,+Marhatal,+Jabalpur,+Madhya+Pradesh+482002",
    image: "/images/location.png",
    lat: 23.1686,
    lng: 79.9339,
  },
];

export function resolveStoreLocation(
  slugOrBackendId?: string | null,
): StoreLocation {
  if (!slugOrBackendId) {
    return storeLocations[0]!;
  }
  const bySlug = storeLocations.find((s) => s.id === slugOrBackendId);
  if (bySlug) return bySlug;
  const byBackend = storeLocations.find(
    (s) => s.backendStoreId === slugOrBackendId,
  );
  return byBackend ?? storeLocations[0]!;
}

export function storeDisplayName(store: StoreLocation): string {
  if (store.label) return `${store.city} · ${store.label}`;
  return store.city;
}

/** Haversine distance in km. */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Pick the outlet closest to the user coordinates. */
export function findNearestStore(lat: number, lng: number): StoreLocation {
  let best = storeLocations[0]!;
  let bestDist = Infinity;
  for (const store of storeLocations) {
    const d = distanceKm(lat, lng, store.lat, store.lng);
    if (d < bestDist) {
      bestDist = d;
      best = store;
    }
  }
  return best;
}

/** Rough open window for status badge (IST). Prefer getPolicyStatusLabel when policies are loaded. */
export function getStoreStatusLabel(
  now = new Date(),
  hours?: {
    open?: string;
    closingSoon?: string;
    close?: string;
  },
): "Open now" | "Closing soon" | "Closed" {
  const parse = (hhmm: string, fallback: number) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
    if (!m) return fallback;
    return Number(m[1]) * 60 + Number(m[2]);
  };
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  const mins = hour * 60 + minute;
  const open = parse(hours?.open || "10:00", 10 * 60);
  const closingSoon = parse(hours?.closingSoon || "21:30", 21 * 60 + 30);
  const close = parse(hours?.close || "22:30", 22 * 60 + 30);
  if (mins >= open && mins < closingSoon) return "Open now";
  if (mins >= closingSoon && mins < close) return "Closing soon";
  return "Closed";
}
