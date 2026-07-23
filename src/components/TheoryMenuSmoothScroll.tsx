"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";

/**
 * Soft, cinematic scroll for /theorymenu.
 * Large screens: slower wheel + proximity snap so each section settles.
 * Small screens: snappier touch for burger flight tracking.
 */
export default function TheoryMenuSmoothScroll() {
  useEffect(() => {
    const mobileMq = window.matchMedia("(max-width: 639px)");
    const largeMq = window.matchMedia("(min-width: 1024px)");

    const isMobile = () => mobileMq.matches;
    const isLarge = () => largeMq.matches;

    const lenis = new Lenis({
      duration: isLarge() ? 3.6 : isMobile() ? 1.15 : 2.15,
      easing: (t) => 1 - Math.pow(1 - t, 3.4),
      smoothWheel: true,
      wheelMultiplier: isLarge() ? 0.32 : isMobile() ? 0.9 : 0.65,
      touchMultiplier: isMobile() ? 1.35 : 0.95,
      syncTouch: true,
      syncTouchLerp: isMobile() ? 0.12 : 0.055,
    });

    let snap: Snap | null = null;
    const snapCleanups: Array<() => void> = [];

    const setupSnap = () => {
      snapCleanups.forEach((fn) => fn());
      snapCleanups.length = 0;
      snap?.destroy();
      snap = null;

      if (!isLarge()) return;

      snap = new Snap(lenis, {
        type: "proximity",
        duration: 1.9,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        distanceThreshold: "35%",
        debounce: 90,
      });

      const nodes = document.querySelectorAll<HTMLElement>(
        "[data-theory-snap]",
      );
      nodes.forEach((el) => {
        snapCleanups.push(snap!.addElement(el, { align: "start" }));
      });
    };

    setupSnap();

    const onBreakpoint = () => {
      /* Rebuild snap when crossing desktop threshold */
      setupSnap();
    };
    largeMq.addEventListener("change", onBreakpoint);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    document.documentElement.classList.add("theorymenu-smooth");
    if (isLarge()) {
      document.documentElement.classList.add("theorymenu-snap");
    }

    const onLargeChange = () => {
      document.documentElement.classList.toggle(
        "theorymenu-snap",
        largeMq.matches,
      );
    };
    largeMq.addEventListener("change", onLargeChange);

    return () => {
      cancelAnimationFrame(frame);
      largeMq.removeEventListener("change", onBreakpoint);
      largeMq.removeEventListener("change", onLargeChange);
      snapCleanups.forEach((fn) => fn());
      snap?.destroy();
      lenis.destroy();
      document.documentElement.classList.remove(
        "theorymenu-smooth",
        "theorymenu-snap",
      );
    };
  }, []);

  return null;
}
