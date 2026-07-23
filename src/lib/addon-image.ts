/**
 * Bundled addon imagery — Petpooja addon rows don't carry image URLs.
 * Keep in sync with kiosk-app/utils/addon-image.ts (same files under
 * kiosk-app/assets/addons/ → public/addons/ here).
 */
const ADDON_IMAGE_REGISTRY: Record<string, string> = {
  lettuce: "/addons/Lettuce.jpg",
};

export function resolveAddonImageUrl(
  optionName: string | null | undefined,
): string | null {
  if (!optionName) return null;
  const key = optionName.trim().toLowerCase();
  if (!key) return null;
  return ADDON_IMAGE_REGISTRY[key] ?? null;
}
