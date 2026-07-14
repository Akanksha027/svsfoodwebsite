"use client";

import DottedGlobe from "@/components/DottedGlobe";
import LocationCards from "@/components/LocationCards";

export default function LocationsSection() {
  return (
    <section
      className="relative w-full min-h-[100svh] bg-white pt-[72px] sm:pt-[80px] md:pt-[100px] lg:pt-[108px] pb-8 sm:pb-12 md:pb-16 flex flex-col items-center overflow-x-clip"
      id="locations-hero"
    >
      {/* Rounded stage — height & globe offset scale by breakpoint */}
      <div className="relative w-[94%] sm:w-[95%] h-[min(48svh,380px)] sm:h-[min(55svh,520px)] md:h-[min(65svh,640px)] lg:h-[min(70svh,720px)] min-h-[260px] sm:min-h-[340px] md:min-h-[420px] rounded-[1rem] sm:rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.25rem] overflow-hidden shadow-[0_16px_40px_rgba(40,100,160,0.14)] sm:shadow-[0_24px_60px_rgba(40,100,160,0.16)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #c9e7f8 0%, #a7d6f2 45%, #8ec8ea 100%)",
          }}
        />

        <div className="absolute top-3 sm:top-5 md:top-7 left-3 sm:left-5 md:left-8 z-20">
          <span className="inline-flex items-center px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md bg-white text-[10px] sm:text-[11px] md:text-xs font-medium text-gray-900 shadow-sm tracking-wide border border-black/10">
            Stores across India
          </span>
        </div>

        {/* Globe: smaller top offset & scale on phones */}
        <div className="absolute left-1/2 top-[72px] sm:top-[100px] md:top-[130px] lg:top-[150px] -translate-x-1/2 w-[min(210%,780px)] sm:w-[min(195%,960px)] md:w-[min(185%,1100px)] lg:w-[min(185%,1200px)] z-10 aspect-square">
          <DottedGlobe />
        </div>
      </div>

      <LocationCards />
    </section>
  );
}
