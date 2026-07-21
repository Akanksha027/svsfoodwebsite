import { findNearestStore, type StoreLocation } from "@/data/locations";
import { SELECTED_STORE_KEY } from "@/lib/config";

export const USER_LOCATION_KEY = "svs_user_location";
const LOCATION_DENIED_KEY = `${USER_LOCATION_KEY}_denied`;

export type SavedUserLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
  savedAt: string;
};

export type LocationFailReason =
  | "unsupported"
  | "denied"
  | "unavailable"
  | "timeout"
  | "error";

export type LocationRequestResult =
  | { ok: true; location: SavedUserLocation }
  | { ok: false; reason: LocationFailReason; message: string };

export function readSavedUserLocation(): SavedUserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedUserLocation;
    if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function wasLocationDenied(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LOCATION_DENIED_KEY) === "1";
}

export function clearLocationDenied(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCATION_DENIED_KEY);
  } catch {
    /* ignore */
  }
}

function persistLocation(location: SavedUserLocation) {
  try {
    localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
    localStorage.removeItem(LOCATION_DENIED_KEY);
  } catch {
    /* ignore */
  }
}

/** Save GPS coords from a saved address or search pick (no browser prompt). */
export function writeSavedUserLocation(input: {
  lat: number;
  lng: number;
  accuracy?: number;
  savedAt?: string;
}): void {
  persistLocation({
    lat: input.lat,
    lng: input.lng,
    accuracy: input.accuracy,
    savedAt: input.savedAt ?? new Date().toISOString(),
  });
}

function markPermissionDenied() {
  try {
    localStorage.setItem(LOCATION_DENIED_KEY, "1");
  } catch {
    /* ignore */
  }
}

function fail(
  reason: LocationFailReason,
  message: string,
): LocationRequestResult {
  return { ok: false, reason, message };
}

async function queryPermissionState(): Promise<PermissionState | null> {
  try {
    if (!navigator.permissions?.query) return null;
    const status = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });
    return status.state;
  } catch {
    return null;
  }
}

/**
 * Request a fresh GPS fix. Use `force: true` to retry even after a past denial
 * (clears our sticky flag and calls the browser again so the prompt can appear
 * when the OS allows it).
 */
export async function requestUserLocationDetailed(options?: {
  force?: boolean;
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<LocationRequestResult> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return fail(
      "unsupported",
      "This browser can’t share location. Try Chrome or Safari, or another device.",
    );
  }

  if (options?.force) {
    clearLocationDenied();
  } else if (wasLocationDenied()) {
    return fail(
      "denied",
      "Location is blocked. Tap “Share location” and allow access when asked — or enable it in your browser settings.",
    );
  }

  const perm = await queryPermissionState();
  if (perm === "denied" && !options?.force) {
    return fail(
      "denied",
      "Location is blocked for this site. Open browser settings → Site settings → Location → Allow, then try again.",
    );
  }

  const timeoutMs = options?.timeoutMs ?? 20000;
  const maximumAgeMs = options?.maximumAgeMs ?? 60_000;
  const enableHighAccuracy = options?.highAccuracy ?? true;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location: SavedUserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          savedAt: new Date().toISOString(),
        };
        persistLocation(location);
        resolve({ ok: true, location });
      },
      (err) => {
        const code = err?.code;
        // 1 PERMISSION_DENIED · 2 POSITION_UNAVAILABLE · 3 TIMEOUT
        if (code === 1) {
          markPermissionDenied();
          resolve(
            fail(
              "denied",
              "Allow location when your browser asks — we only use it as your delivery pin for the rider.",
            ),
          );
          return;
        }
        // Never sticky-block on timeout / unavailable — user can retry.
        clearLocationDenied();
        if (code === 3) {
          resolve(
            fail(
              "timeout",
              "Couldn’t get a GPS fix in time. Move near a window, turn on Location Services, and try again.",
            ),
          );
          return;
        }
        if (code === 2) {
          resolve(
            fail(
              "unavailable",
              "Location is temporarily unavailable. Turn on Location Services / GPS and try again.",
            ),
          );
          return;
        }
        resolve(
          fail(
            "error",
            "Couldn’t read your location. Please try again in a moment.",
          ),
        );
      },
      {
        enableHighAccuracy,
        timeout: timeoutMs,
        maximumAge: maximumAgeMs,
      },
    );
  });
}

/** One-shot browser geolocation; saves fix when granted. */
export async function requestUserLocation(options?: {
  force?: boolean;
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<SavedUserLocation | null> {
  const result = await requestUserLocationDetailed(options);
  return result.ok ? result.location : null;
}

/** Nearest outlet slug from saved GPS, if any. */
export function nearestStoreSlugFromSavedLocation(): string | null {
  return rememberNearestStoreFromSavedLocation()?.id ?? null;
}

/** Resolve nearest outlet from saved GPS and persist as selected store. */
export function rememberNearestStoreFromSavedLocation(): StoreLocation | null {
  const loc = readSavedUserLocation();
  if (!loc) return null;
  const nearest = findNearestStore(loc.lat, loc.lng);
  try {
    localStorage.setItem(SELECTED_STORE_KEY, nearest.id);
  } catch {
    /* ignore */
  }
  return nearest;
}

export function rememberNearestStoreFromCoords(
  lat: number,
  lng: number,
): StoreLocation {
  const nearest = findNearestStore(lat, lng);
  try {
    localStorage.setItem(SELECTED_STORE_KEY, nearest.id);
  } catch {
    /* ignore */
  }
  return nearest;
}
