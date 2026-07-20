/** Shared Cloud Run API used by kiosk + website (same backend). */
export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://svs-kiosk-backend-49698216377.asia-southeast1.run.app"
).replace(/\/+$/, "");

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://svsfood.com"
).replace(/\/+$/, "");

/** Stable device id for website channel (satisfies x-device-id). */
export const WEB_DEVICE_ID = "web_svs_food";

export const SELECTED_STORE_KEY = "svs_selected_store";

export const WEBSITE_CUSTOMER_TOKEN_KEY = "svs_website_customer_token";
export const WEBSITE_CUSTOMER_EXPIRES_KEY = "svs_website_customer_expires_at";
