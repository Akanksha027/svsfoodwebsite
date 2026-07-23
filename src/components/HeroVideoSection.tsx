"use client";

import { useEffect, useRef } from "react";

const HERO_VIDEO_SRC = "/homeani.webm";

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
      className="relative w-full h-[100svh] min-h-[480px] max-h-[1200px] overflow-hidden bg-white"
      id="hero-section"
    >
      <video
        ref={videoRef}
        className="absolute bottom-12 md:bottom-24 right-0 md:right-8 w-full md:w-[45%] lg:w-[40%] h-[80%] md:h-[70%] object-contain object-center pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      >
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      </video>

      <div className="relative z-[2] flex h-full flex-col items-center md:items-start justify-center px-5 pb-10 sm:px-8 sm:pb-12 md:px-10 md:pb-14 lg:px-14 lg:pb-16">
        {/* Placeholder for future content if needed */}
      </div>
    </section>
  );
}
