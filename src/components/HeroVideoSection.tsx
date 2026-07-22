"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedOrderButton from "@/components/AnimatedOrderButton";

const HERO_VIDEO_SRC = "/bg.mp4";

const HERO_LINES = [
  "We make our own buns",
] as const;

const TYPE_MS = 70;
const DELETE_MS = 40;
const HOLD_MS = 1800;
const GAP_MS = 450;

export default function HeroVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [display, setDisplay] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      /* autoplay may be blocked until interaction */
    });
  }, []);

  useEffect(() => {
    const full = HERO_LINES[lineIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (display.length < full.length) {
        timer = setTimeout(() => {
          setDisplay(full.slice(0, display.length + 1));
        }, TYPE_MS);
      } else {
        timer = setTimeout(() => setPhase("holding"), HOLD_MS);
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("deleting"), GAP_MS);
    } else if (phase === "deleting") {
      if (display.length > 0) {
        timer = setTimeout(() => {
          setDisplay(display.slice(0, -1));
        }, DELETE_MS);
      } else {
        timer = setTimeout(() => {
          setLineIndex((i) => (i + 1) % HERO_LINES.length);
          setPhase("typing");
        }, GAP_MS);
      }
    }

    return () => clearTimeout(timer);
  }, [display, phase, lineIndex]);

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
        <div className="flex w-full flex-col items-center gap-8 sm:gap-10">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <h1
              className="max-w-[min(96vw,28ch)] text-center text-[clamp(1.45rem,4.6vw,3.75rem)] font-bold leading-[1.2] tracking-[0.02em] text-[#faf3dc] uppercase"
              id="hero-text"
              aria-live="polite"
            >
              <span className="relative inline-grid justify-items-center">
                <span
                  className="invisible col-start-1 row-start-1 whitespace-nowrap"
                  aria-hidden
                >
                  &lsquo;{HERO_LINES[0]}&rsquo;
                </span>
                <span className="col-start-1 row-start-1 whitespace-nowrap">
                  {display ? (
                    <>
                      &lsquo;{display}
                      <span className="hero-type-caret" aria-hidden />
                      &rsquo;
                    </>
                  ) : (
                    <>
                      &lsquo;
                      <span className="hero-type-caret" aria-hidden />
                      &rsquo;
                    </>
                  )}
                </span>
              </span>
            </h1>
          </div>

          <AnimatedOrderButton />
        </div>
      </div>
    </section>
  );
}
