import { BACKEND_URL, WEB_DEVICE_ID } from "@/lib/config";
import type { MenuPayload } from "@/lib/menu-types";
import { writeMenuCache } from "@/lib/menu-cache";

type ApiEnvelope = {
  success?: boolean;
  data?: MenuPayload;
  error?: { message?: string };
};

function menuHeaders(storeId: string): HeadersInit {
  return {
    "x-device-id": WEB_DEVICE_ID,
    "x-store-id": storeId,
    Accept: "application/json",
  };
}

async function parseMenuResponse(res: Response): Promise<MenuPayload> {
  if (!res.ok) {
    throw new Error(`Menu request failed (${res.status})`);
  }
  const body = (await res.json()) as ApiEnvelope;
  if (!body?.data?.categories || !body?.data?.items) {
    throw new Error(body?.error?.message || "Invalid menu response");
  }
  return {
    categories: body.data.categories,
    items: body.data.items,
  };
}

/** Server / RSC fetch (Next cache). */
export async function fetchStoreMenu(storeId: string): Promise<MenuPayload> {
  const res = await fetch(`${BACKEND_URL}/menu`, {
    headers: menuHeaders(storeId),
    next: { revalidate: 60 },
  });
  return parseMenuResponse(res);
}

/** Browser fetch — writes localStorage cache on success. */
export async function fetchStoreMenuClient(
  storeId: string,
  options?: { writeCache?: boolean },
): Promise<MenuPayload> {
  const res = await fetch(`${BACKEND_URL}/menu`, {
    headers: menuHeaders(storeId),
    cache: "no-store",
  });
  const menu = await parseMenuResponse(res);
  if (options?.writeCache !== false) {
    writeMenuCache(storeId, menu);
  }
  return menu;
}

/** Background warm-up for faster later visits. */
export function prefetchStoreMenu(storeId: string): void {
  if (typeof window === "undefined" || !storeId) return;
  void fetchStoreMenuClient(storeId).catch(() => {
    /* best-effort */
  });
}

export function prefetchStoreMenus(storeIds: string[]): void {
  for (const id of storeIds) {
    prefetchStoreMenu(id);
  }
}

export function formatInr(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

export function titleCaseName(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
}
