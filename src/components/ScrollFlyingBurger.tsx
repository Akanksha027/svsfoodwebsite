"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  type RefObject,
} from "react";

export const FLYING_BURGER_SRC = "/nobg/burger.png";

/** Match combo food scale at rest; ease to 1 as it settles into the landing slot. */
const COMBO_SCALE = 1.22;

type ScrollFlyingBurgerProps = {
  trackRef: RefObject<HTMLElement | null>;
  startRef: RefObject<HTMLElement | null>;
  endRef: RefObject<HTMLElement | null>;
  src?: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

type LockedHold = {
  /** Fixed viewport center — burger stays here while the page scrolls */
  cx: number;
  cy: number;
  w: number;
  h: number;
};

/**
 * Sticky scroll handoff (burger stays in the background):
 * 1) Burger holds fixed on screen while dessert / combo / page scroll OVER it.
 * 2) As the Maharaja slot approaches, it slowly shrinks into place.
 * 3) Settles in the slot (visible through the transparent landing pad).
 */
export default function ScrollFlyingBurger({
  startRef,
  endRef,
  src = FLYING_BURGER_SRC,
}: ScrollFlyingBurgerProps) {
  const left = useMotionValue(0);
  const top = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const scale = useMotionValue(COMBO_SCALE);
  const opacity = useMotionValue(0);

  const lockedHold = useRef<LockedHold | null>(null);

  const syncPosition = useCallback(() => {
    const startEl = startRef.current;
    const endEl = endRef.current;
    if (!startEl || !endEl) return;

    const s = startEl.getBoundingClientRect();
    const e = endEl.getBoundingClientRect();
    if (s.width < 4 || e.width < 4) return;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    const liveCx = s.left + s.width / 2;
    const liveCy = s.top + s.height / 2;
    const endCx = e.left + e.width / 2;
    const endCy = e.top + e.height / 2;

    /* Lock the on-screen hold pose while still at (or back at) the top */
    if (scrollY < 4 || !lockedHold.current) {
      lockedHold.current = {
        cx: liveCx,
        cy: liveCy,
        w: s.width,
        h: s.height,
      };
    }

    const hold = lockedHold.current;
    const holdCx = hold.cx;
    const holdCy = hold.cy;
    const holdW = hold.w;
    const holdH = hold.h;

    /*
      Progress from “sticky at combo” → “settled in slot”:
      Landing far below hold → t = 0 (burger stays put).
      Landing meets hold → t = 1 (fully placed).
    */
    const morphRange = Math.max(vh * 0.55, 220);
    const delta = endCy - holdCy;
    const t = Math.min(1, Math.max(0, 1 - delta / morphRange));
    const ease = easeOutCubic(t);

    const w = holdW + (e.width - holdW) * ease;
    const h = holdH + (e.height - holdH) * ease;
    const cx = holdCx + (endCx - holdCx) * ease;
    const cy = holdCy + (endCy - holdCy) * ease;

    left.set(cx - w / 2);
    top.set(cy - h / 2);
    width.set(w);
    height.set(h);
    scale.set(COMBO_SCALE + (1 - COMBO_SCALE) * ease);

    /*
      At page top: combo’s own burger (under dessert) is visible.
      Once scrolling: hand off to this fixed BG layer so dessert
      and the rest of the UI scroll across ON TOP of the burger.
    */
    const sticky = scrollY > 6;
    opacity.set(sticky ? 1 : 0);
    startEl.style.visibility = sticky ? "hidden" : "visible";
  }, [startRef, endRef, left, top, width, height, scale, opacity]);

  useEffect(() => {
    lockedHold.current = null;
    syncPosition();

    let raf = 0;
    const tick = () => {
      syncPosition();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      lockedHold.current = null;
      syncPosition();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [syncPosition]);

  return (
    <motion.div
      /* Between fries (z-3) and dessert (z-8): sides pass under, dessert over */
      className="pointer-events-none fixed z-[6] will-change-[left,top,width,height,transform]"
      style={{
        left,
        top,
        width,
        height,
        scale,
        opacity,
      }}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-contain drop-shadow-[0_18px_32px_rgba(26,26,26,0.22)]"
        sizes="(max-width: 768px) 70vw, 400px"
        priority
      />
    </motion.div>
  );
}
