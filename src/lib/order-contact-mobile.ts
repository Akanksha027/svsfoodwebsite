import { normalizeIndianMobile } from "@/lib/indian-phone";

function storageKey(customerId: string) {
  return `svs_order_contact_mobile:${customerId}`;
}

/** Preferred order contact (not login phone). Profile PATCH does not accept alternate_phone. */
export function getPreferredOrderContact(customerId: string): string {
  if (typeof window === "undefined") return "";
  try {
    return normalizeIndianMobile(
      window.localStorage.getItem(storageKey(customerId)) || "",
    );
  } catch {
    return "";
  }
}

export function setPreferredOrderContact(
  customerId: string,
  mobile: string | null,
) {
  if (typeof window === "undefined") return;
  const next = normalizeIndianMobile(mobile || "");
  try {
    if (!next) {
      window.localStorage.removeItem(storageKey(customerId));
    } else {
      window.localStorage.setItem(storageKey(customerId), next);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function resolveOrderContactMobile(input: {
  customerId: string;
  loginPhone: string;
  alternatePhone?: string | null;
}): string {
  const preferred = getPreferredOrderContact(input.customerId);
  const alt = normalizeIndianMobile(input.alternatePhone || "");
  return preferred || alt || normalizeIndianMobile(input.loginPhone);
}
