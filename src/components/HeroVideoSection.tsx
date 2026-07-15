"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const HERO_VIDEO_SRC = "/bf.mp4";

export default function HeroVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      /* autoplay may be blocked until interaction */
    });
  }, []);

  return (
    <section
      className="relative w-full h-[100svh] min-h-[520px] max-h-[1200px] overflow-hidden bg-svs-ink"
      id="hero-section"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      >
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      </video>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55"
        aria-hidden
      />

      <div className="relative z-[2] flex h-full flex-col items-center justify-center px-5 pb-10 sm:px-8 sm:pb-12 md:px-10 md:pb-14 lg:px-14 lg:pb-16 text-center">
        <div className="flex w-full flex-col items-center gap-8 sm:gap-10">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <p className="text-svs-white/90 text-[1rem] sm:text-[1.15rem] md:text-[1.25rem] font-medium tracking-wide max-w-[500px] leading-snug">
              From Our Oven to Your Plate — Fresh, Vegetarian, Unforgettable.
            </p>
            <h1
              className="max-w-[20ch] text-center text-[clamp(2rem,6vw,4.5rem)] font-bold uppercase leading-[1.05] tracking-[0.02em] text-[#f3e8c8]"
              id="hero-text"
            >
              <span className="text-[#faf3dc]">&lsquo;we make our own buns&rsquo;</span>
            </h1>
          </div>

          <Link
            href="/menu"
            className="inline-flex w-fit shrink-0 items-center justify-center bg-[#c8dff0] px-8 py-4 text-[12px] font-bold uppercase tracking-[0.22em] text-svs-ink no-underline transition-colors hover:bg-[#dceaf5] sm:px-10 sm:py-4 sm:text-[13px]"
          >
            Order now
          </Link>
        </div>
      </div>
    </section>
  );
}
