"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  storeLocations,
  storeDisplayName,
  resolveStoreLocation,
} from "@/data/locations";
import { SELECTED_STORE_KEY } from "@/lib/config";
import { useCart } from "@/context/CartContext";

function MenuStorePickerInner({ currentStoreId }: { currentStoreId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setStoreId } = useCart();
  const current = resolveStoreLocation(currentStoreId);

  const onSelect = (slug: string) => {
    if (slug === currentStoreId) return;
    try {
      localStorage.setItem(SELECTED_STORE_KEY, slug);
      localStorage.setItem("svs_menu_browse_store", slug);
    } catch {
      /* ignore */
    }
    setStoreId(slug);

    const params = new URLSearchParams(searchParams.toString());
    params.set("store", slug);
    const q = params.toString();
    router.replace(q ? `/menu?${q}` : "/menu");
    router.refresh();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-3 mt-3 border-t border-svs-cream w-full">
      <span className="text-[13px] sm:text-[14px] font-semibold text-svs-ink/50 shrink-0">
        Ordering from
      </span>
      <label htmlFor="menu-store-picker" className="sr-only">
        Select outlet
      </label>
      <select
        id="menu-store-picker"
        value={currentStoreId}
        onChange={(e) => onSelect(e.target.value)}
        className="flex-1 min-w-0 max-w-full sm:max-w-[320px] h-9 rounded-lg border border-svs-cream bg-svs-cream/80 px-2.5 text-[13px] sm:text-[14px] font-semibold text-svs-ink cursor-pointer focus:outline-none focus:ring-1 focus:ring-svs-orange/30"
      >
        {storeLocations.map((s) => (
          <option key={s.id} value={s.id}>
            {storeDisplayName(s)} · {s.backendStoreId}
          </option>
        ))}
      </select>
      <span className="text-[11px] font-mono text-svs-ink/40 tabular-nums shrink-0">
        {current.backendStoreId}
      </span>
    </div>
  );
}

export default function MenuStorePicker({
  currentStoreId,
}: {
  currentStoreId: string;
}) {
  return (
    <Suspense fallback={null}>
      <MenuStorePickerInner currentStoreId={currentStoreId} />
    </Suspense>
  );
}
