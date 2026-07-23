"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Momentum / eased wheel scroll for /theorymenu only.
 * Touch is snappier so scroll-linked burger flight tracks the finger.
 */
export default function TheoryMenuSmoothScroll() {
  useEffect(() => {
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639px)").matches;

    const lenis = new Lenis({
      duration: isMobile ? 1.15 : 2.15,
      easing: (t) =>
        t === 1 ? 1 : 1 - Math.pow(2, -11 * t),
      smoothWheel: true,
      wheelMultiplier: isMobile ? 0.9 : 0.72,
      touchMultiplier: isMobile ? 1.35 : 0.95,
      syncTouch: true,
      syncTouchLerp: isMobile ? 0.12 : 0.06,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    document.documentElement.classList.add("theorymenu-smooth");

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      document.documentElement.classList.remove("theorymenu-smooth");
    };
  }, []);

  return null;
}
