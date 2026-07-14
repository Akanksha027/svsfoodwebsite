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
  const textOffset = isEven ? 0 : 32;
  const isLast = index === total - 1;

  return (
    <article className="relative flex flex-col shrink-0 w-[210px] sm:w-[260px] md:w-[300px] lg:w-[320px]">
      <div className="relative mb-8 sm:mb-12 md:mb-14 h-[140px] sm:h-[180px] md:h-[220px] lg:h-[240px] w-full overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] bg-svs-cream">
        <Image
          src={stop.image}
          alt={stop.imageAlt ?? stop.year}
          fill
          sizes="(max-width: 640px) 210px, (max-width: 768px) 260px, 320px"
          className="object-cover"
        />
      </div>

      <div
        className="relative flex flex-col items-start"
        style={{ marginTop: textOffset }}
      >
        <div className="relative z-10 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-svs-orange mb-3 sm:mb-4" />

        <h3 className="mb-2 sm:mb-3 text-2xl sm:text-4xl md:text-5xl font-black text-svs-ink leading-none text-left">
          {stop.year}
        </h3>

        <p className="text-[0.85rem] sm:text-[0.95rem] md:text-[1.05rem] leading-relaxed text-svs-ink/75 max-w-[280px] text-left">
          {stop.description}
        </p>

        {!isLast && (
          <svg
            className="absolute top-[6px] sm:top-[7px] left-[6px] sm:left-[7px] w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[40px] pointer-events-none -z-10"
            style={{ overflow: "visible" }}
            aria-hidden
          >
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2={isEven ? 32 : -32}
              stroke="#F16A34"
              strokeWidth="3"
              strokeDasharray="10 14"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </article>
  );
}

type PinMode = "before" | "pinning" | "after";

/**
 * Uses position:fixed (not sticky) so the panel stays locked while
 * vertical scroll drives horizontal movement - works even when
 * ancestors use overflow clipping.
 */
export default function JourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const travelRef = useRef(0);
  const startRef = useRef(0);
  const pinModeRef = useRef<PinMode>("before");

  const [sectionHeight, setSectionHeight] = useState(0);
  const [pinMode, setPinMode] = useState<PinMode>("before");

  const measure = useCallback(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const travel = Math.max(0, track.scrollWidth - window.innerWidth);
    travelRef.current = travel;
    startRef.current = section.getBoundingClientRect().top + window.scrollY;
    setSectionHeight(window.innerHeight + travel);
  }, []);

  const sync = useCallback(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Document Y of section top (stable while scrolling)
    startRef.current = section.getBoundingClientRect().top + window.scrollY;

    const travel = travelRef.current;
    const start = startRef.current;
    const end = start + travel;
    const y = window.scrollY;

    let mode: PinMode = "before";
    if (travel > 0 && y >= end) mode = "after";
    else if (travel > 0 && y >= start) mode = "pinning";

    if (mode !== pinModeRef.current) {
      pinModeRef.current = mode;
      setPinMode(mode);
    }

    if (travel <= 0) {
      track.style.transform = "translate3d(0px,0,0)";
      return;
    }

    const progress = Math.min(1, Math.max(0, (y - start) / travel));
    track.style.transform = `translate3d(${-progress * travel}px, 0, 0)`;
  }, []);

  useEffect(() => {
    measure();
    sync();

    const onResize = () => {
      measure();
      requestAnimationFrame(sync);
    };

    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => {
      measure();
      requestAnimationFrame(sync);
    });
    if (trackRef.current) ro.observe(trackRef.current);
    if (cardsRowRef.current) ro.observe(cardsRowRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [measure, sync]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        sync();
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    sync();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [sync, sectionHeight]);

  useEffect(() => {
    const imgs = Array.from(trackRef.current?.querySelectorAll("img") ?? []);
    if (imgs.length === 0) {
      const t = window.setTimeout(() => {
        measure();
        sync();
      }, 80);
      return () => window.clearTimeout(t);
    }

    let pending = imgs.length;
    const done = () => {
      pending -= 1;
      if (pending <= 0) {
        measure();
        sync();
      }
    };

    imgs.forEach((img) => {
      if (img.complete) done();
      else {
        img.addEventListener("load", done);
        img.addEventListener("error", done);
      }
    });

    return () => {
      imgs.forEach((img) => {
        img.removeEventListener("load", done);
        img.removeEventListener("error", done);
      });
    };
  }, [measure, sync]);

  const total = journeyStops.length;

  const panelClass =
    pinMode === "pinning"
      ? "fixed inset-0 z-40"
      : pinMode === "after"
        ? "absolute bottom-0 left-0 right-0"
        : "absolute top-0 left-0 right-0";

  return (
    <section
      ref={sectionRef}
      id="journey-section"
      style={{
        height: sectionHeight > 0 ? `${sectionHeight}px` : "100vh",
      }}
      className="relative w-full bg-svs-cream"
      aria-label="Company journey"
    >
      <div
        className={`${panelClass} h-[100svh] w-full overflow-hidden flex flex-col bg-svs-cream`}
      >
        <div className="shrink-0 px-4 sm:px-6 md:px-10 lg:px-16 pt-[120px] sm:pt-[96px] md:pt-[108px] lg:pt-[116px] flex flex-col items-center sm:items-start text-center sm:text-left">
          <h2 className="text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] lg:text-[2rem] font-black text-svs-ink leading-tight tracking-tight">
            {journeySectionTitle}
          </h2>
          <p className="mt-1.5 sm:mt-3 text-sm sm:text-lg md:text-xl text-svs-ink/60 max-w-[500px]">
            From a single kitchen to a nationwide favourite. Our story in
            moments.
          </p>
        </div>

        <div className="relative flex-1 min-h-0 w-full flex items-center md:items-start mt-4 sm:mt-8 md:mt-16 pb-8 sm:pb-10 md:pb-14">
          <div className="w-full pt-8 sm:pt-6 md:pt-0">
            <div
              ref={trackRef}
              className="relative md:absolute md:top-0 left-0 flex items-start will-change-transform pl-4 sm:pl-6 md:pl-10 lg:pl-16 pr-[10vw] sm:pr-[14vw] md:pr-[18vw]"
              style={{ transform: "translate3d(0px,0,0)" }}
            >
              <div
                ref={cardsRowRef}
                className="relative z-[2] flex items-start gap-8 sm:gap-12 md:gap-16 lg:gap-20"
              >
                {journeyStops.map((stop, index) => (
                  <JourneyCard
                    key={`${stop.id}-${index}`}
                    stop={stop}
                    index={index}
                    total={total}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
