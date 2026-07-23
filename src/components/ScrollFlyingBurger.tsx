"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export const FLYING_BURGER_SRC = "/nobg/burger.png";

type ScrollFlyingBurgerProps = {
  trackRef: RefObject<HTMLElement | null>;
  startRef: RefObject<HTMLElement | null>;
  endRef: RefObject<HTMLElement | null>;
  src?: string;
};

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const MOBILE_MQ = "(max-width: 639px)";

function useIsMobile() {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_MQ).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mobile;
}

type LockedStart = {
  pageCx: number;
  pageCy: number;
  w: number;
  h: number;
};

/**
 * One continuous burger (always visible).
 * Mobile: leaves the combo on the first scroll pixels; fully landed when
 * Maharaja center hits 50% of the viewport.
 */
export default function ScrollFlyingBurger({
  trackRef,
  startRef,
  endRef,
  src = FLYING_BURGER_SRC,
}: ScrollFlyingBurgerProps) {
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end center"],
  });

  const left = useMotionValue(0);
  const top = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const opacity = useMotionValue(0);

  const lockedStart = useRef<LockedStart | null>(null);
  /** Maharaja center Y (viewport) at page top — flight starts from here */
  const lockedTakeoffEndCy = useRef<number | null>(null);

  const syncPosition = useCallback(
    (rawProgress: number) => {
      const startEl = startRef.current;
      const endEl = endRef.current;
      if (!startEl || !endEl) return;

      const s = startEl.getBoundingClientRect();
      const e = endEl.getBoundingClientRect();
      if (s.width < 4 || e.width < 4) return;

      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      const liveStartCx = s.left + s.width / 2;
      const liveStartCy = s.top + s.height / 2;
      const endCx = e.left + e.width / 2;
      const endCy = e.top + e.height / 2;

      /* Refresh anchors while still at (or back at) the top */
      if (scrollY < 4) {
        lockedStart.current = {
          pageCx: liveStartCx + scrollX,
          pageCy: liveStartCy + scrollY,
          w: s.width,
          h: s.height,
        };
        lockedTakeoffEndCy.current = endCy;
      } else {
        if (!lockedStart.current) {
          lockedStart.current = {
            pageCx: liveStartCx + scrollX,
            pageCy: liveStartCy + scrollY,
            w: s.width,
            h: s.height,
          };
        }
        if (lockedTakeoffEndCy.current == null) {
          lockedTakeoffEndCy.current = endCy;
        }
      }

      const startW = lockedStart.current.w;
      const startH = lockedStart.current.h;
      const startCx = lockedStart.current.pageCx - scrollX;
      const startCy = lockedStart.current.pageCy - scrollY;

      let t: number;
      let move: number;
      let sizeHold: number;

      if (isMobile) {
        const landY = vh * 0.5;
        const takeoffY = Math.max(
          lockedTakeoffEndCy.current ?? endCy,
          landY + 1,
        );
        /*
          Any scroll that lifts Maharaja immediately raises t.
          t = 1 exactly when Maharaja center is at mid-screen.
        */
        t = Math.min(
          1,
          Math.max(0, (takeoffY - endCy) / (takeoffY - landY)),
        );
        move = t;
        sizeHold = 0.55;
      } else {
        /* Desktop: start right away (no 0.02 dead zone), finish over track */
        t = Math.min(1, Math.max(0, rawProgress / 0.75));
        move = easeInOutCubic(t);
        sizeHold = 0.82;
      }

      let sizeT = 0;
      if (t > sizeHold) {
        sizeT = easeOutCubic((t - sizeHold) / (1 - sizeHold));
      }

      const w = startW + (e.width - startW) * sizeT;
      const h = startH + (e.height - startH) * sizeT;

      const cx = startCx + (endCx - startCx) * move;
      const cy = startCy + (endCy - startCy) * move;

      left.set(cx - w / 2);
      top.set(cy - h / 2);
      width.set(w);
      height.set(h);
      opacity.set(1);
    },
    [isMobile, startRef, endRef, left, top, width, height, opacity],
  );

  useMotionValueEvent(scrollYProgress, "change", syncPosition);

  useEffect(() => {
    lockedStart.current = null;
    lockedTakeoffEndCy.current = null;
    syncPosition(scrollYProgress.get());

    let raf = 0;
    const tick = () => {
      syncPosition(scrollYProgress.get());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      lockedStart.current = null;
      lockedTakeoffEndCy.current = null;
      syncPosition(scrollYProgress.get());
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [scrollYProgress, syncPosition]);

  return (
    <motion.div
      className="pointer-events-none fixed z-[60] will-change-[left,top,width,height]"
      style={{
        left,
        top,
        width,
        height,
        opacity,
      }}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-contain drop-shadow-[0_24px_40px_rgba(26,26,26,0.28)] [mix-blend-mode:screen]"
        sizes="(max-width: 768px) 70vw, 400px"
        priority
      />
    </motion.div>
  );
}
