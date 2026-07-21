import type { WebsiteCustomerAddress } from "@/lib/website-customer-api";
import {
  cacheDeliveryAddressHint,
  type DeliveryAddressHint,
} from "@/lib/reverse-geocode";
import {
  rememberNearestStoreFromCoords,
  writeSavedUserLocation,
} from "@/lib/user-location";

export const MENU_DELIVERY_LOCATION_KEY = "svs_menu_delivery_location";
export const MENU_DELIVERY_LOCATION_EVENT = "svs:menu-delivery-location";

export type MenuDeliveryLocation = {
  displayLine: string;
  lat: number | null;
  lng: number | null;
  source: "detected" | "saved" | "search";
  addressId?: string;
  label?: string;
};

export function formatSavedAddressDisplay(addr: WebsiteCustomerAddress): string {
  if (addr.formatted_address?.trim()) return addr.formatted_address.trim();
  return [addr.flat, addr.street, addr.area, addr.landmark, addr.pincode]
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join(", ");
}

export function readMenuDeliveryLocation(): MenuDeliveryLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MENU_DELIVERY_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MenuDeliveryLocation;
    if (parsed?.displayLine) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveMenuDeliveryLocation(location: MenuDeliveryLocation): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MENU_DELIVERY_LOCATION_KEY, JSON.stringify(location));
  } catch {
    /* ignore */
  }
  dispatchMenuDeliveryLocationChange();
}

export function dispatchMenuDeliveryLocationChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MENU_DELIVERY_LOCATION_EVENT));
}

/** Persist selection for navbar, checkout GPS hint, and nearest-store routing. */
export function applyMenuDeliverySelection(input: {
  displayLine: string;
  lat: number | null;
  lng: number | null;
  source: MenuDeliveryLocation["source"];
  addressId?: string;
  label?: string;
}): void {
  saveMenuDeliveryLocation({
    displayLine: input.displayLine,
    lat: input.lat,
    lng: input.lng,
    source: input.source,
    addressId: input.addressId,
    label: input.label,
  });

  if (input.lat != null && input.lng != null) {
    writeSavedUserLocation({
      lat: input.lat,
      lng: input.lng,
      savedAt: new Date().toISOString(),
    });
    const hint: DeliveryAddressHint = {
      formatted: input.displayLine,
      lat: input.lat,
      lng: input.lng,
      savedAt: new Date().toISOString(),
    };
    cacheDeliveryAddressHint(hint);
    rememberNearestStoreFromCoords(input.lat, input.lng);
  }
}

export function applySavedAddressSelection(addr: WebsiteCustomerAddress): void {
  applyMenuDeliverySelection({
    displayLine: formatSavedAddressDisplay(addr),
    lat: addr.latitude,
    lng: addr.longitude,
    source: "saved",
    addressId: addr.id,
    label: addr.label,
  });
}
