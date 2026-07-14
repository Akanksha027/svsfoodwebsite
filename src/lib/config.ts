/** Shared Cloud Run API used by kiosk + website (same backend). */
export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://svs-kiosk-backend-49698216377.asia-southeast1.run.app"
).replace(/\/+$/, "");

/** Stable device id for website channel (satisfies x-device-id). */
export const WEB_DEVICE_ID = "web_svs_food";

export const SELECTED_STORE_KEY = "svs_selected_store";
