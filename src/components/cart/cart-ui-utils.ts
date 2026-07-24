import type { DeliveryAddressHint } from "@/lib/reverse-geocode";
import { resolveDeliveryCoords } from "@/lib/reverse-geocode";
import type { useWebCheckout } from "@/hooks/useWebCheckout";
import type { WebsiteCustomer, WebsiteCustomerAddress } from "@/lib/website-customer-api";

export type Checkout = ReturnType<typeof useWebCheckout>;

export function hasCompleteDeliveryAddress(checkout: Checkout): boolean {
  if (checkout.orderType !== "delivery") return true;
  const hasFields =
    checkout.flat.trim().length >= 2 &&
    checkout.street.trim().length >= 3 &&
    checkout.area.trim().length >= 6;
  const coords = resolveDeliveryCoords(checkout.addressHint);
  return hasFields && (checkout.pinReady || coords != null);
}

export function pickDefaultAddress(
  customer: WebsiteCustomer | null,
): WebsiteCustomerAddress | null {
  if (!customer?.addresses.length) return null;
  return (
    customer.addresses.find((a) => a.is_default) || customer.addresses[0] || null
  );
}

export function formatDeliveryToLabel(input: {
  checkout: Checkout;
  saved?: WebsiteCustomerAddress | null;
}): string {
  const { checkout, saved } = input;
  if (saved?.formatted_address?.trim()) return saved.formatted_address.trim();
  if (saved) {
    const parts = [saved.flat, saved.street, saved.area].filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  const hint = checkout.addressHint;
  if (hint?.formatted?.trim()) return hint.formatted.trim();
  const parts = [checkout.flat, checkout.street, checkout.area].filter((p) =>
    p.trim(),
  );
  return parts.join(", ") || "Add delivery address";
}

export function hintFromCoords(
  lat: number,
  lng: number,
  formatted: string,
): DeliveryAddressHint {
  return {
    formatted,
    lat,
    lng,
    savedAt: new Date().toISOString(),
  };
}

/** Split a Google / geocode label into area + street hints for the details form. */
export function prefillAddressFromPlaceLabel(
  label: string,
  checkout: Checkout,
) {
  const parts = label
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return;

  if (parts.length >= 2) {
    checkout.setArea(`${parts[0]}, ${parts[1]}`);
    if (parts.length >= 3 && !checkout.street.trim()) {
      checkout.setStreet(parts[0]);
    }
  } else {
    checkout.setArea(parts[0]);
  }
}
