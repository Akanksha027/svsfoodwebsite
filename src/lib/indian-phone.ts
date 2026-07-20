/** Strip to digits only. */
export function digitsOnly(raw: string): string {
  return String(raw || "").replace(/\D/g, "");
}

/**
 * Normalize user/autofill input to at most 10 digits (Indian mobile without +91).
 * Handles +91 prefix, leading 0, and paste of full international numbers.
 */
export function formatIndianMobileInput(raw: string): string {
  let d = digitsOnly(raw);
  if (!d) return "";

  if (d.startsWith("91") && d.length > 10) {
    d = d.slice(2);
  } else if (d.startsWith("0") && d.length > 10) {
    d = d.slice(1);
  }

  if (d.length > 10) {
    d = d.slice(-10);
  }

  return d.slice(0, 10);
}

/** Same rules as input formatting; for compare/API when value may include +91. */
export function normalizeIndianMobile(raw: string): string {
  return formatIndianMobileInput(raw);
}

export const INDIAN_MOBILE_RE = /^[6-9][0-9]{9}$/;

export function isValidIndianMobile(raw: string): boolean {
  return INDIAN_MOBILE_RE.test(normalizeIndianMobile(raw));
}
