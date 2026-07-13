"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  journeySectionTitle,
  journeyStops,
  type JourneyStop,
} from "@/data/journey";

function JourneyCard({
  stop,
  index,
  total,
}: {
  stop: JourneyStop;
  index: number;
  total: number;
}) {
  const isEven = index % 2 === 0;
  const textOffset = isEven ? 0 : 40;
  const isLast = index === total - 1;

  return (
    <article
      className="relative flex flex-col shrink-0 w-[200px] sm:w-[260px] md:w-[300px] lg:w-[320px]"
      id={stop.id}
    >
      <div className="relative mb-8 sm:mb-12 md:mb-16 h-[140px] sm:h-[180px] md:h-[220px] lg:h-[240px] w-full overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] bg-[#e8ddd0]">
        <Image
          src={stop.image}
          alt={stop.imageAlt ?? stop.year}
          fill
          sizes="(max-width: 640px) 200px, (max-width: 768px) 260px, 320px"
          className="object-cover"
        />
      </div>

      <div
        className="relative flex flex-col items-start mt-0 sm:mt-0"
        style={{ marginTop: `clamp(0px, ${textOffset * 0.6}px, ${textOffset}px)` }}
      >
        <div className="relative z-10 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#E84B10] mb-3 sm:mb-4" />

        <h3 className="mb-2 sm:mb-3 text-2xl sm:text-4xl md:text-5xl font-black text-[#4a1c0a] leading-none text-left">
          {stop.year}
        </h3>

        <p className="text-[0.85rem] sm:text-[0.95rem] md:text-[1.05rem] leading-relaxed text-[#5c3a28] max-w-[280px] text-left">
          {stop.description}
        </p>

        {!isLast && (
          <svg
            className="absolute top-[6px] sm:top-[7px] left-[6px] sm:left-[7px] w-[calc(100%+40px)] sm:w-[calc(100%+64px)] md:w-[calc(100%+80px)] h-[40px] pointer-events-none -z-10"
            style={{ overflow: "visible" }}
          >
            {isEven ? (
              <line
                x1="0"
                y1="0"
                x2="100%"
                y2="40"
                stroke="#E84B10"
                strokeWidth="3"
                strokeDasharray="10 14"
                strokeLinecap="round"
              />
            ) : (
              <line
                x1="0"
                y1="0"
                x2="100%"
                y2="-40"
                stroke="#E84B10"
                strokeWidth="3"
                strokeDasharray="10 14"
                strokeLinecap="round"
              />
            )}
          </svg>
        )}
      </div>
    </article>
  );
}

export default function JourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [sectionHeight, setSectionHeight] = useState("100svh");

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const overflowX = Math.max(0, track.scrollWidth - window.innerWidth);
    // Shorter pin distance on small screens so it doesn't feel endless
    const multiplier = window.innerWidth < 640 ? 0.85 : 1;
    setSectionHeight(`${window.innerHeight + overflowX * multiplier}px`);
  }, []);

  const updateTransform = useCallback(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const maxScroll = section.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) {
      track.style.transform = "translate3d(0,0,0)";
      return;
    }

    const start = section.offsetTop;
    const raw = (window.scrollY - start) / maxScroll;
    const progress = Math.min(1, Math.max(0, raw));
    const maxX = Math.max(0, track.scrollWidth - window.innerWidth);
    track.style.transform = `translate3d(${-progress * maxX}px, 0, 0)`;
  }, []);

  useEffect(() => {
    measure();
    const onResize = () => {
      measure();
      updateTransform();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure, updateTransform]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        updateTransform();
        rafRef.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateTransform();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [updateTransform, sectionHeight]);

  useEffect(() => {
    const id = window.setTimeout(measure, 150);
    return () => window.clearTimeout(id);
  }, [measure]);

  const total = journeyStops.length;

  return (
    <section
      ref={sectionRef}
      id="journey-section"
      style={{ height: sectionHeight }}
      className="relative w-full bg-[#f2ebe3] overflow-hidden"
      aria-label="Company journey"
    >
      <div className="sticky top-[72px] md:top-[88px] lg:top-[100px] h-[calc(100svh-72px)] md:h-[calc(100svh-88px)] lg:h-[calc(100svh-100px)] overflow-hidden flex flex-col pb-8 sm:pb-12 md:pb-16">
        <div className="shrink-0 px-4 sm:px-6 md:px-10 lg:px-16 pt-6 sm:pt-8 md:pt-10">
          <h2 className="text-[1.5rem] sm:text-[2rem] md:text-[3rem] lg:text-[3.5rem] font-black text-[#1a0a00] leading-tight tracking-tight max-w-[16ch] sm:max-w-none">
            {journeySectionTitle}
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-lg md:text-xl text-[#7a5a3a] max-w-[500px]">
            From a single kitchen to a nationwide favourite — our story in
            moments.
          </p>
        </div>

        <div className="relative w-full mt-10 sm:mt-14 md:mt-20 flex-1 min-h-0">
          <div
            ref={trackRef}
            className="absolute top-0 left-0 h-full flex items-start will-change-transform pl-4 sm:pl-6 md:pl-10 lg:pl-16 pr-4"
            style={{ transform: "translate3d(0,0,0)" }}
          >
            <div className="relative z-[2] flex items-start gap-8 sm:gap-12 md:gap-16 lg:gap-20">
              {journeyStops.map((stop, index) => (
                <JourneyCard
                  key={stop.id}
                  stop={stop}
                  index={index}
                  total={total}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
