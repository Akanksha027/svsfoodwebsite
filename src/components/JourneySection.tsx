"use client";

import Image from "next/image";
import {
  journeyClosingLine,
  journeySectionTitle,
  journeyStops,
  type JourneyStop,
} from "@/data/journey";

/**
 * Talabat corporate "big moments" flow:
 * - Normal vertical page scroll
 * - Timeline track only moves on explicit horizontal scroll / swipe
 * - Dashed orange line via repeating SVG behind the years
 */
function JourneyCard({ stop }: { stop: JourneyStop }) {
  return (
    <article
      tabIndex={0}
      className="shrink-0 snap-center w-[250px] sm:w-[280px] md:w-[300px]"
    >
      <div className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl aspect-[202/163] bg-svs-cream">
        <Image
          src={stop.image}
          alt={stop.imageAlt ?? stop.year}
          fill
          sizes="(max-width: 640px) 250px, (max-width: 768px) 280px, 300px"
          className="object-cover object-center"
          unoptimized={stop.image.startsWith("/journey/")}
        />
      </div>

      <div className="pt-7 md:pt-8">
        {/* Spacer so the orange line sits through the year row */}
        <div className="h-24" aria-hidden />

        <h3 className="mb-5 md:mb-6 text-[32px] leading-[35px] md:text-[44px] md:leading-[49px] font-bold text-svs-ink">
          <span className="relative z-10">{stop.year}</span>
        </h3>

        <p className="mb-3 text-[0.95rem] md:text-[1.05rem] font-extrabold text-svs-ink leading-snug">
          {stop.title}
        </p>


        <p className="text-[0.85rem] md:text-[0.95rem] leading-[25px] text-svs-ink/75">
          {stop.description}
        </p>
      </div>
    </article>
  );
}

export default function JourneySection() {
  return (
    <section
      id="journey-section"
      className="relative w-full bg-svs-cream overflow-x-hidden px-0 pt-10 pb-10 md:pt-20 md:pb-20"
      aria-label="Company journey"
    >
      <div className="mx-auto w-full px-6 md:px-10 lg:px-16">
        <h2 className="font-bold mb-5 text-[32px] leading-[35px] md:text-[44px] md:leading-[49px] text-svs-ink">
          <span className="relative z-10">{journeySectionTitle}</span>
        </h2>
      </div>

      {/* Native horizontal scroll only — vertical wheel scrolls the page */}
      <div
        className="relative mt-8 md:mt-12 overflow-x-auto overscroll-x-contain snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-label="Journey timeline"
      >
        <div className="relative flex w-fit flex-row pr-6">
          {/* Left inset spacer — line + cards share the same start edge */}
          <div
            className="shrink-0 w-6 md:w-28 lg:w-36"
            aria-hidden
          />

          <div className="relative flex flex-row gap-6 md:gap-14 lg:gap-16">
            <div
              className="pointer-events-none absolute inset-x-0 z-[1] h-[64px] bg-repeat-x bg-left-bottom bg-[length:1400px_auto] top-[calc(250px*163/202+1.75rem+2.75rem)] sm:top-[calc(280px*163/202+1.75rem+2.75rem)] md:top-[calc(300px*163/202+2rem+2.75rem)]"
              style={{ backgroundImage: "url(/journey/yearoverview.svg)" }}
              aria-hidden
            />

            {journeyStops.map((stop) => (
              <JourneyCard key={stop.id} stop={stop} />
            ))}

            <div
              tabIndex={0}
              className="shrink-0 snap-center w-[250px] sm:w-[280px] md:w-[300px]"
            >
              <div
                className="w-full aspect-[202/163] rounded-2xl md:rounded-3xl"
                aria-hidden
              />
              <div className="pt-7 md:pt-8">
                <div className="h-24" aria-hidden />
                <p className="relative z-10 bg-svs-cream text-xl sm:text-2xl md:text-[1.75rem] font-black text-svs-ink leading-snug">
                  &ldquo;{journeyClosingLine}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
