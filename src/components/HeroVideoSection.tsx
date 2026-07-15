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

      <div className="relative z-[2] flex h-full flex-col justify-end px-5 pb-10 sm:px-8 sm:pb-12 md:px-10 md:pb-14 lg:px-14 lg:pb-16">
        <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="flex flex-col gap-2 sm:gap-3">
            <p className="text-svs-white/90 text-[0.95rem] sm:text-[1.1rem] md:text-[1.25rem] font-medium tracking-wide max-w-[400px] leading-snug">
              From Our Oven to Your Plate — Fresh, Vegetarian, Unforgettable.
            </p>
            <h1
              className="max-w-[16ch] text-left text-[clamp(1.75rem,5.5vw,3.75rem)] font-bold uppercase leading-[1.05] tracking-[0.02em] text-[#f3e8c8]"
              id="hero-text"
            >
              <span className="text-[#faf3dc]">&lsquo;we make our own buns&rsquo;</span>
            </h1>
          </div>

          <Link
            href="/menu"
            className="inline-flex w-fit shrink-0 items-center justify-center bg-[#c8dff0] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] text-svs-ink no-underline transition-colors hover:bg-[#dceaf5] sm:px-9 sm:py-4 sm:text-xs"
          >
            Order now
          </Link>
        </div>
      </div>
    </section>
  );
}
