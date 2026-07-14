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

/** One-shot browser geolocation; saves fix when granted. */
export function requestUserLocation(): Promise<SavedUserLocation | null> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }
  if (wasLocationDenied()) return Promise.resolve(null);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location: SavedUserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          savedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
          localStorage.removeItem(LOCATION_DENIED_KEY);
        } catch {
          /* ignore */
        }
        resolve(location);
      },
      () => {
        try {
          localStorage.setItem(LOCATION_DENIED_KEY, "1");
        } catch {
          /* ignore */
        }
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  });
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
