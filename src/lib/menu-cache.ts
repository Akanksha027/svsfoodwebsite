import type { MenuPayload } from "@/lib/menu-types";

const CACHE_VERSION = 1;
const KEY_PREFIX = "svs_menu_cache_v1";

type MenuCacheEntry = {
  v: number;
  savedAt: string;
  menu: MenuPayload;
};

function cacheKey(storeId: string) {
  return `${KEY_PREFIX}:${storeId}`;
}

export function readMenuCache(storeId: string): MenuPayload | null {
  if (typeof window === "undefined" || !storeId) return null;
  try {
    const raw = localStorage.getItem(cacheKey(storeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MenuCacheEntry;
    if (
      parsed?.v !== CACHE_VERSION ||
      !parsed.menu?.categories ||
      !parsed.menu?.items
    ) {
      return null;
    }
    return parsed.menu;
  } catch {
    return null;
  }
}

export function writeMenuCache(storeId: string, menu: MenuPayload): void {
  if (typeof window === "undefined" || !storeId) return;
  try {
    const entry: MenuCacheEntry = {
      v: CACHE_VERSION,
      savedAt: new Date().toISOString(),
      menu,
    };
    localStorage.setItem(cacheKey(storeId), JSON.stringify(entry));
  } catch {
    /* quota or private mode */
  }
}

export function clearMenuCache(storeId?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (storeId) {
      localStorage.removeItem(cacheKey(storeId));
      return;
    }
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${KEY_PREFIX}:`)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* ignore */
  }
}
