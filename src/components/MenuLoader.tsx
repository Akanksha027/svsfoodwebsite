"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { StoreLocation } from "@/data/locations";
import { storeLocations } from "@/data/locations";
import MenuBrowser from "@/components/MenuBrowser";
import { readMenuCache, writeMenuCache } from "@/lib/menu-cache";
import { fetchStoreMenuClient, prefetchStoreMenu } from "@/lib/menu-api";
import type { MenuPayload } from "@/lib/menu-types";

type MenuLoaderProps = {
  store: StoreLocation;
  initialQuery?: string;
  /** Optional server-fetched menu (SEO / cold start). */
  initialMenu?: MenuPayload | null;
  initialError?: string | null;
};

function resolveInitialMenu(
  storeId: string,
  initialMenu: MenuPayload | null | undefined,
): MenuPayload | null {
  if (typeof window !== "undefined") {
    const cached = readMenuCache(storeId);
    if (cached) return cached;
  }
  return initialMenu ?? null;
}

export default function MenuLoader({
  store,
  initialQuery = "",
  initialMenu = null,
  initialError = null,
}: MenuLoaderProps) {
  const storeId = store.backendStoreId;
  const [menu, setMenu] = useState<MenuPayload | null>(() =>
    resolveInitialMenu(storeId, initialMenu),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    () => (resolveInitialMenu(storeId, initialMenu) ? null : initialError),
  );
  const prefetchedOthers = useRef(false);

  // Instant swap when outlet changes — show cached menu immediately.
  useLayoutEffect(() => {
    const cached = readMenuCache(storeId);
    if (cached) {
      setMenu(cached);
      setErrorMessage(null);
      return;
    }
    if (initialMenu) {
      setMenu(initialMenu);
      writeMenuCache(storeId, initialMenu);
      setErrorMessage(null);
      return;
    }
    setMenu(null);
    setErrorMessage(initialError);
  }, [storeId, initialMenu, initialError]);

  // Always refresh in background so prices/availability stay current.
  useEffect(() => {
    let cancelled = false;
    void fetchStoreMenuClient(storeId)
      .then((fresh) => {
        if (cancelled) return;
        setMenu(fresh);
        setErrorMessage(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage((prev) => {
          if (readMenuCache(storeId)) return null;
          return err instanceof Error
            ? err.message
            : "Could not load the menu. Please try again.";
        });
      });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  // Warm other outlets while user browses (testing / store switch).
  useEffect(() => {
    if (prefetchedOthers.current) return;
    prefetchedOthers.current = true;
    const others = storeLocations
      .map((s) => s.backendStoreId)
      .filter((id) => id !== storeId);
    const id = window.setTimeout(() => {
      for (const id of others) prefetchStoreMenu(id);
    }, 1200);
    return () => window.clearTimeout(id);
  }, [storeId]);

  return (
    <MenuBrowser
      store={store}
      initialQuery={initialQuery}
      menu={menu}
      errorMessage={errorMessage}
    />
  );
}
