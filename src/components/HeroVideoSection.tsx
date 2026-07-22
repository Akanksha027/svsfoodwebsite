"use client";

import Image from "next/image";

import { useEffect, useRef } from "react";
import AnimatedOrderButton from "@/components/AnimatedOrderButton";

const HERO_VIDEO_SRC = "/bg.mp4";

const HERO_LINES = [
  "We make our own buns",
] as const;

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
      className="relative w-full h-[100svh] min-h-[480px] max-h-[1200px] overflow-hidden bg-svs-ink"
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
        {/* Absolute positioned logo so it doesn't push the centered text down */}
        <div className="absolute top-[2%] sm:top-[4%] md:top-[5%] left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
          <Image
            src="/svsherosectionlogo.png"
            alt="SVS Hero Logo"
            width={480}
            height={240}
            className="w-[200px] sm:w-[280px] md:w-[360px] lg:w-[440px] object-contain drop-shadow-lg"
            priority
          />
        </div>
        
        <div className="flex w-full flex-col items-center gap-8 sm:gap-10">
          <div className="flex flex-col items-center gap-4 sm:gap-6 mt-16 sm:mt-24">
            <h1
              className="max-w-[min(96vw,28ch)] text-center text-[clamp(2.25rem,6.5vw,5rem)] font-medium leading-[1.1] tracking-[0.02em] text-[#faf3dc] uppercase drop-shadow-md"
              id="hero-text"
            >
              &lsquo;{HERO_LINES[0]}&rsquo;
            </h1>
          </div>

          <AnimatedOrderButton />
        </div>
      </div>
    </section>
  );
}
