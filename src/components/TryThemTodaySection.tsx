import {
  DEFAULT_BACKEND_STORE_ID,
  storeLocations,
} from "@/data/locations";
import { fetchStoreMenu } from "@/lib/menu-api";
import type { MenuPayload } from "@/lib/menu-types";
import TryThemTodayClient from "@/components/TryThemTodayClient";

async function loadMenu(): Promise<MenuPayload | null> {
  const storeId =
    storeLocations[0]?.backendStoreId ?? DEFAULT_BACKEND_STORE_ID;
  try {
    return await fetchStoreMenu(storeId);
  } catch {
    return null;
  }
}

export default async function TryThemTodaySection() {
  const menu = await loadMenu();
  if (!menu?.categories?.length || !menu.items?.length) {
    return null;
  }

  return <TryThemTodayClient menu={menu} />;
}
