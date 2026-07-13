"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function HeroBurger() {
  const imgRef = useRef<HTMLDivElement>(null);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const DEG_PER_PX = 0.055; // scroll spin
    const LERP = 0.06; // smooth easing

    const tick = () => {
      const diff = targetRotation.current - currentRotation.current;
      currentRotation.current += diff * LERP;

      if (imgRef.current) {
        imgRef.current.style.transform = `rotate(${currentRotation.current}deg)`;
      }

      // Keep animating while there's still a meaningful difference
      if (Math.abs(diff) > 0.01) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        rafId.current = null;
      }
    };

    const onScroll = () => {
      // Clockwise as you scroll down; anticlockwise as you scroll back up
      targetRotation.current = window.scrollY * DEG_PER_PX;

      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[5] w-full flex justify-center pointer-events-none"
      aria-hidden={false}
    >
      <div className="translate-y-[28%] sm:translate-y-[26%] md:translate-y-[28%]">
        <div
          ref={imgRef}
          className="will-change-transform origin-center"
          style={{ transform: "rotate(0deg)" }}
        >
          <Image
            src="/images/hamburgerrr.png"
            alt="Delicious SVS Food hamburger"
            width={1500}
            height={1500}
            className="w-[min(78vw,320px)] sm:w-[min(80vw,380px)] md:w-[min(80vw,440px)] lg:w-[min(75vw,540px)] xl:w-[min(70vw,600px)] h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
            loading="eager"
            priority
          />
        </div>
      </div>
    </div>
  );
}
