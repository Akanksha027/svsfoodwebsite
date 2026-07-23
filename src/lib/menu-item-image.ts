import type { MenuCategory, MenuItem } from "@/lib/menu-types";

export function pickImageUrl(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const c of candidates) {
    const s = String(c || "").trim();
    if (!s || s === "null" || s === "undefined") continue;
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) {
      return s;
    }
  }
  return null;
}

export function resolveItemImageUrl(
  item: Pick<MenuItem, "image_url" | "image_urls">,
  category?: Pick<MenuCategory, "image_url" | "icon_url"> | null,
): string | null {
  return (
    pickImageUrl(
      item.image_url,
      Array.isArray(item.image_urls) ? item.image_urls[0] : null,
      category?.image_url,
      category?.icon_url,
    ) ?? null
  );
}

export function resolveCategoryImageUrl(
  category?: Pick<MenuCategory, "image_url" | "icon_url"> | null,
): string | null {
  return pickImageUrl(category?.image_url, category?.icon_url);
}
