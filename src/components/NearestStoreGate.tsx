"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { resolveStoreLocation } from "@/data/locations";
import { SELECTED_STORE_KEY } from "@/lib/config";
import { prefetchStoreMenu } from "@/lib/menu-api";
import {
  nearestStoreSlugFromSavedLocation,
  rememberNearestStoreFromCoords,
  requestUserLocation,
  wasLocationDenied,
} from "@/lib/user-location";

type Props = {
  /** When true, URL already has an explicit ?store= (user/deep-link choice). */
  hasStoreParam: boolean;
  /** Current store slug rendered by the server. */
  currentStoreId: string;
  query?: string;
};

/**
 * When /menu has no ?store=, pick the closest outlet from saved GPS
 * (or request location once), then redirect so menu + orders match.
 */
export default function NearestStoreGate({
  hasStoreParam,
  currentStoreId,
  query = "",
}: Props) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (hasStoreParam) return;

    const redirectToStore = (slug: string) => {
      if (slug === currentStoreId) return;
      const params = new URLSearchParams();
      params.set("store", slug);
      if (query.trim()) params.set("q", query.trim());
      router.replace(`/menu?${params.toString()}`);
      router.refresh();
    };

    const run = async () => {
      let slug = nearestStoreSlugFromSavedLocation();

      if (!slug && !wasLocationDenied()) {
        const loc = await requestUserLocation();
        if (loc) {
          const nearest = rememberNearestStoreFromCoords(loc.lat, loc.lng);
          slug = nearest.id;
          prefetchStoreMenu(nearest.backendStoreId);
        }
      }

      if (slug) {
        prefetchStoreMenu(resolveStoreLocation(slug).backendStoreId);
        redirectToStore(slug);
        return;
      }

      try {
        const stored = localStorage.getItem(SELECTED_STORE_KEY);
        if (stored) redirectToStore(stored);
      } catch {
        /* ignore */
      }
    };

    void run();
  }, [hasStoreParam, currentStoreId, query, router]);

  return null;
}
