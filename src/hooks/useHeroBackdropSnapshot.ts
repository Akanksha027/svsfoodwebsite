"use client";

import { useEffect, useState } from "react";
import {
  captureHeroCanvasBackdrop,
  isOverHeroSection,
} from "@/lib/hero-backdrop";

/** Freeze the current hero video frame for modal backgrounds on `/`. */
export function useHeroBackdropSnapshot(active: boolean, enabled: boolean) {
  const [backdropUrl, setBackdropUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !enabled) {
      setBackdropUrl(null);
      return;
    }

    const capture = () => {
      if (!isOverHeroSection()) {
        setBackdropUrl(null);
        return;
      }
      setBackdropUrl(captureHeroCanvasBackdrop());
    };

    capture();
    const id = requestAnimationFrame(capture);
    return () => cancelAnimationFrame(id);
  }, [active, enabled]);

  return backdropUrl;
}
