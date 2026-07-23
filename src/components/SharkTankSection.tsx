"use client";

import { useState } from "react";

export default function SharkTankSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoId = "H8ZzObFgbDk";
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <section
      id="shark-tank"
      className="relative w-full overflow-hidden bg-white text-svs-ink"
      aria-labelledby="shark-tank-heading"
    >
      <div className="pointer-events-none absolute -top-20 left-1/2 h-[280px] w-[520px] -translate-x-1/2 rounded-full bg-svs-orange/8 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-11">
        {/* Eyebrow */}
        <div className="mb-2.5 flex items-center gap-2 sm:mb-3">
          <span className="h-px w-6 bg-svs-orange sm:w-8" />
          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-svs-orange sm:text-[10px] sm:tracking-[0.26em] md:text-xs">
            Shark Tank India &middot; Season 5
          </span>
        </div>

        {/* Headline + stats */}
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-7">
            <h2
              id="shark-tank-heading"
              className="font-serif text-[1.45rem] font-medium leading-[1.12] tracking-tight text-svs-ink sm:text-[1.85rem] md:text-3xl lg:text-[2.25rem]"
            >
              SVS Foods walks{" "}
              <span className="text-svs-orange">into the Tank.</span>
            </h2>
            <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-svs-ink/55 sm:text-[13px] md:text-[14px]">
              A burger brand, five Sharks, and one full pitch — watch SVS Foods
              serve their story and field the hard questions.
            </p>
          </div>

          <div className="flex md:col-span-5 md:justify-end">
            <div className="flex w-full justify-between gap-4 border-t border-svs-ink/10 pt-3 sm:w-auto sm:justify-start sm:gap-6 md:border-l md:border-t-0 md:border-svs-ink/10 md:pl-6 md:pt-0 lg:gap-7">
              <div>
                <p className="font-serif text-xl text-svs-ink sm:text-2xl">S5</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-svs-ink/40">
                  Season
                </p>
              </div>
              <div>
                <p className="font-serif text-xl text-svs-ink sm:text-2xl">Full</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-svs-ink/40">
                  Pitch
                </p>
              </div>
              <div>
                <p className="font-serif text-xl text-svs-ink sm:text-2xl">5</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-svs-ink/40">
                  Sharks
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video — capped height so the section fits one screen */}
        <div className="mt-4 sm:mt-5">
          <div className="relative mx-auto aspect-video w-full max-w-full overflow-hidden rounded-xl border border-svs-ink/10 bg-svs-cream shadow-[0_14px_40px_-20px_rgba(26,26,26,0.22)] sm:max-w-[560px] sm:rounded-2xl md:max-w-[600px]">
            {!isPlaying ? (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                aria-label="Play the SVS Foods Shark Tank India pitch video"
                className="group absolute inset-0 h-full w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt="SVS Foods pitch on Shark Tank India Season 5"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-svs-ink/70 via-svs-ink/15 to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-svs-orange shadow-[0_10px_28px_rgba(241,106,52,0.45)] transition duration-300 group-hover:scale-110 group-hover:bg-svs-orange-dark sm:h-16 sm:w-16">
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-0.5 h-5 w-5 fill-white sm:h-7 sm:w-7"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
                <span className="absolute bottom-3 left-3 right-3 flex flex-col gap-1 text-left sm:bottom-4 sm:left-4 sm:right-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[11px] font-medium text-white drop-shadow sm:text-sm">
                    SVS Foods &middot; Full Pitch &middot; S5
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/90 sm:text-[10px]">
                    Watch on YouTube
                  </span>
                </span>
              </button>
            ) : (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="SVS Foods के Burger खाकर नहीं आया Aman को मजा | Shark Tank India S5 | Full Pitch"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          <div className="mt-2.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-svs-ink/45 sm:text-sm">
              Full pitch as aired on Shark Tank India, Season 5.
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-svs-orange transition-colors hover:text-svs-orange-dark sm:text-sm"
            >
              Watch on YouTube &rarr;
            </a>
          </div>
        </div>

        {/* Compact footer CTA */}
        <div className="mt-4 flex flex-col items-start justify-between gap-2.5 border-t border-svs-ink/10 pt-3 sm:mt-5 sm:flex-row sm:items-center sm:pt-4">
          <p className="max-w-md text-xs text-svs-ink/45">
            SVS Foods&apos; full Shark Tank India appearance.
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-svs-orange/40 bg-white px-3.5 py-1.5 text-xs font-semibold text-svs-orange transition-colors hover:bg-svs-orange hover:text-white"
          >
            See the full episode
          </a>
        </div>
      </div>
    </section>
  );
}
