"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Momentum / eased wheel scroll for /theorymenu only */
export default function TheoryMenuSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2,
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
