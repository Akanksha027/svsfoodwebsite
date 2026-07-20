export const SVS_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.app.uengage.svsfood&hl=en_IN";

export const SVS_APP_STORE_URL =
  "https://apps.apple.com/in/app/svs-food/id1577576347";

/** Canonical app landing — QR / “Get the app” points here. */
export const APP_DOWNLOAD_URL = "https://app.svsfood.com";

/** Legacy on-site path (redirects / picks store from User-Agent). */
export const APP_DOWNLOAD_PATH = "/app";

export function appDownloadPageUrl(_siteOrigin?: string) {
  return APP_DOWNLOAD_URL;
}

export function storeUrlForUserAgent(userAgent: string): string | null {
  const ua = userAgent || "";
  if (/android/i.test(ua)) return SVS_PLAY_STORE_URL;
  if (/iphone|ipad|ipod/i.test(ua)) return SVS_APP_STORE_URL;
  return null;
}

/** QR image for a store URL (scannable, no extra deps). */
export function storeQrImageUrl(targetUrl: string, size = 128) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=6&data=${encodeURIComponent(targetUrl)}`;
}
