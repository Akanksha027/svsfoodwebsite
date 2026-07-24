import { BACKEND_URL } from "@/lib/config";
import { distanceKm, resolveStoreLocation } from "@/data/locations";

export type WebsiteStorePolicy = {
  store_id: string;
  store_name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  delivery_radius_km: number;
  delivery_fee: number;
  delivery_min_order: number;
  delivery_open_time: string;
  delivery_close_time: string;
  delivery_closing_soon_time: string;
  web_cod_enabled: boolean;
  web_ordering_enabled: boolean;
  web_enforce_hours: boolean;
  web_enforce_radius: boolean;
};

const DEFAULT_POLICY: Omit<
  WebsiteStorePolicy,
  "store_id" | "store_name" | "location"
> = {
  latitude: null,
  longitude: null,
  delivery_radius_km: 6,
  delivery_fee: 40,
  delivery_min_order: 0,
  delivery_open_time: "10:00",
  delivery_close_time: "22:30",
  delivery_closing_soon_time: "21:30",
  web_cod_enabled: true,
  web_ordering_enabled: true,
  web_enforce_hours: true,
  web_enforce_radius: true,
};

let cache: { at: number; stores: WebsiteStorePolicy[] } | null = null;
const CACHE_MS = 60_000;

type ApiEnvelope = {
  success?: boolean;
  data?: { stores?: WebsiteStorePolicy[] };
};

export function defaultStorePolicy(
  storeId: string,
  storeName = storeId,
): WebsiteStorePolicy {
  const loc = resolveStoreLocation(storeId);
  return {
    store_id: storeId,
    store_name: storeName,
    location: null,
    ...DEFAULT_POLICY,
    latitude: loc.lat,
    longitude: loc.lng,
  };
}

export async function fetchWebsiteStorePolicies(options?: {
  force?: boolean;
}): Promise<WebsiteStorePolicy[]> {
  if (
    !options?.force &&
    cache &&
    Date.now() - cache.at < CACHE_MS
  ) {
    return cache.stores;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/website/store-policies`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`policies ${res.status}`);
    const body = (await res.json()) as ApiEnvelope;
    const stores = (body?.data?.stores || []).map(normalizePolicy);
    cache = { at: Date.now(), stores };
    return stores;
  } catch {
    return cache?.stores ?? [];
  }
}

function normalizePolicy(raw: WebsiteStorePolicy): WebsiteStorePolicy {
  const fallback = defaultStorePolicy(raw.store_id, raw.store_name);
  return {
    store_id: raw.store_id,
    store_name: raw.store_name || fallback.store_name,
    location: raw.location ?? null,
    latitude:
      raw.latitude != null && Number.isFinite(Number(raw.latitude))
        ? Number(raw.latitude)
        : fallback.latitude,
    longitude:
      raw.longitude != null && Number.isFinite(Number(raw.longitude))
        ? Number(raw.longitude)
        : fallback.longitude,
    delivery_radius_km: Number(
      raw.delivery_radius_km ?? fallback.delivery_radius_km,
    ),
    delivery_fee: Number(raw.delivery_fee ?? fallback.delivery_fee),
    delivery_min_order: Number(
      raw.delivery_min_order ?? fallback.delivery_min_order,
    ),
    delivery_open_time: String(
      raw.delivery_open_time || fallback.delivery_open_time,
    ),
    delivery_close_time: String(
      raw.delivery_close_time || fallback.delivery_close_time,
    ),
    delivery_closing_soon_time: String(
      raw.delivery_closing_soon_time || fallback.delivery_closing_soon_time,
    ),
    web_cod_enabled: raw.web_cod_enabled !== false,
    web_ordering_enabled: raw.web_ordering_enabled !== false,
    web_enforce_hours: raw.web_enforce_hours !== false,
    web_enforce_radius: raw.web_enforce_radius !== false,
  };
}

export async function getPolicyForStore(
  storeId: string,
): Promise<WebsiteStorePolicy> {
  const stores = await fetchWebsiteStorePolicies();
  return (
    stores.find((s) => s.store_id === storeId) ||
    defaultStorePolicy(storeId)
  );
}

/** Parse HH:MM to minutes from midnight. */
export function timeToMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
  if (!m) return 0;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return 0;
  return h * 60 + min;
}

/** IST wall-clock minutes (Asia/Kolkata). */
export function nowMinutesIst(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  return hour * 60 + minute;
}

export function getPolicyStatusLabel(
  policy: Pick<
    WebsiteStorePolicy,
    "delivery_open_time" | "delivery_close_time" | "delivery_closing_soon_time"
  >,
  now = new Date(),
): "Open now" | "Closing soon" | "Closed" {
  const mins = nowMinutesIst(now);
  const open = timeToMinutes(policy.delivery_open_time);
  const closingSoon = timeToMinutes(policy.delivery_closing_soon_time);
  const close = timeToMinutes(policy.delivery_close_time);
  if (mins >= open && mins < closingSoon) return "Open now";
  if (mins >= closingSoon && mins < close) return "Closing soon";
  return "Closed";
}

export function isWithinDeliveryHours(
  policy: WebsiteStorePolicy,
  now = new Date(),
): boolean {
  if (!policy.web_enforce_hours) return true;
  const mins = nowMinutesIst(now);
  const open = timeToMinutes(policy.delivery_open_time);
  const close = timeToMinutes(policy.delivery_close_time);
  return mins >= open && mins < close;
}

export function outletCoords(policy: WebsiteStorePolicy): {
  lat: number;
  lng: number;
} {
  if (
    policy.latitude != null &&
    policy.longitude != null &&
    Number.isFinite(policy.latitude) &&
    Number.isFinite(policy.longitude)
  ) {
    return { lat: policy.latitude, lng: policy.longitude };
  }
  const loc = resolveStoreLocation(policy.store_id);
  return { lat: loc.lat, lng: loc.lng };
}

export function deliveryDistanceKm(
  policy: WebsiteStorePolicy,
  lat: number,
  lng: number,
): number {
  const pin = outletCoords(policy);
  return distanceKm(lat, lng, pin.lat, pin.lng);
}

export function isWithinDeliveryRadius(
  policy: WebsiteStorePolicy,
  lat: number,
  lng: number,
): boolean {
  if (!policy.web_enforce_radius) return true;
  return deliveryDistanceKm(policy, lat, lng) <= policy.delivery_radius_km;
}

export function assertCheckoutAllowed(input: {
  policy: WebsiteStorePolicy;
  orderType: "dine_in" | "takeaway" | "delivery";
  subtotal: number;
  payMethod: "upi" | "card" | "cod";
  deliveryLat?: number | null;
  deliveryLng?: number | null;
}): void {
  const { policy, orderType, subtotal, payMethod } = input;

  if (!policy.web_ordering_enabled) {
    throw new Error(
      "Online ordering is paused for this outlet. Please try another store or call us.",
    );
  }

  if (
    (orderType === "delivery" || orderType === "takeaway") &&
    !isWithinDeliveryHours(policy)
  ) {
    throw new Error(
      `We're closed for orders right now. Open ${policy.delivery_open_time}–${policy.delivery_close_time} IST.`,
    );
  }

  if (orderType === "delivery") {
    if (subtotal < policy.delivery_min_order) {
      throw new Error(
        `Minimum order for delivery is ₹${Math.round(policy.delivery_min_order)}.`,
      );
    }
    const lat = input.deliveryLat;
    const lng = input.deliveryLng;
    if (
      lat != null &&
      lng != null &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      !isWithinDeliveryRadius(policy, lat, lng)
    ) {
      const km = deliveryDistanceKm(policy, lat, lng).toFixed(1);
      throw new Error(
        `Sorry, you're about ${km} km away. We deliver within ${policy.delivery_radius_km} km of this outlet.`,
      );
    }
  }

  if (
    payMethod === "cod" &&
    (orderType === "delivery" || orderType === "takeaway") &&
    !policy.web_cod_enabled
  ) {
    throw new Error("Cash payment is not available for this outlet. Please pay online.");
  }
}
