"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DEFAULT_STORY_DURATION_MS,
  storySlides,
  type StorySlide,
} from "@/data/stories";

type StoryViewerProps = {
  open: boolean;
  onClose: () => void;
  slides?: StorySlide[];
};

function getDuration(slide: StorySlide): number {
  return slide.durationMs ?? DEFAULT_STORY_DURATION_MS;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      aria-hidden
    >
      {dir === "left" ? (
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function StoryViewer({
  open,
  onClose,
  slides = storySlides,
}: StoryViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const indexRef = useRef(0);
  const onCloseRef = useRef(onClose);
  const total = slides.length;
  const slide = slides[index];

  indexRef.current = index;
  onCloseRef.current = onClose;

  const advanceStory = useCallback(() => {
    const current = indexRef.current;
    if (current >= total - 1) {
      onCloseRef.current();
      return;
    }
    setIndex(current + 1);
    setProgress(0);
  }, [total]);

  const goPrev = useCallback(() => {
    setIndex((current) => Math.max(0, current - 1));
    setProgress(0);
  }, []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setProgress(0);
    setPaused(false);
  }, [open]);

  // No scroll lock and no canvas snapshot — live sticky hero stays under the dim and scrolls.

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") advanceStory();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, advanceStory, goPrev]);

  useEffect(() => {
    if (!open || paused || !slide || slide.type === "video") return;

    const duration = getDuration(slide);
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        advanceStory();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, paused, slide, index, advanceStory]);

  useEffect(() => {
    const video = videoRef.current;
    if (!open || !slide || slide.type !== "video" || !video) return;

    video.currentTime = 0;
    if (paused) {
      video.pause();
      return;
    }

    void video.play().catch(() => {
      /* autoplay blocked */
    });

    const onTime = () => {
      if (!video.duration) return;
      setProgress(video.currentTime / video.duration);
    };
    const onEnded = () => advanceStory();

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
      video.pause();
    };
  }, [open, paused, slide, index, advanceStory]);

  if (!mounted || !open || !slide) return null;

  const showPrev = index > 0;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[2000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="SVS Food stories"
    >
      {/* Dim only — no pointer capture so page (incl. sticky hero) keeps scrolling */}
      <div className="absolute inset-0 bg-black/70" aria-hidden />

      <div className="relative z-[1] flex max-h-[100svh] w-full items-center justify-center px-11 sm:px-16">
        <div className="pointer-events-auto relative flex items-center justify-center">
          <button
            type="button"
            className={`absolute right-full z-10 mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white shadow-sm backdrop-blur-md transition-colors hover:bg-white/40 sm:mr-4 sm:h-11 sm:w-11 ${
              showPrev ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-label="Previous story"
            onClick={goPrev}
            tabIndex={showPrev ? 0 : -1}
          >
            <Chevron dir="left" />
          </button>

          <div className="relative flex w-[min(72vw,calc((100svh-4.5rem)*9/16),400px)] flex-col sm:w-[min(48vw,calc((100svh-4.5rem)*9/16),400px)]">
            {/* Progress bars — fill over each slide duration */}
            <div className="mb-2.5 flex gap-1.5 px-0.5 sm:mb-3">
              {slides.map((s, i) => {
                const filled = i < index ? 1 : i === index ? progress : 0;
                return (
                  <div
                    key={s.id}
                    className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35"
                  >
                    <div
                      className="h-full origin-left rounded-full bg-white"
                      style={{
                        width: `${filled * 100}%`,
                        transition: i === index ? "none" : "width 0.2s ease",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div
              className="relative w-full overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
              style={{ aspectRatio: "9 / 16" }}
            >
              <button
                type="button"
                className="absolute right-2.5 top-2.5 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-xl leading-none text-svs-ink/70 transition-colors hover:bg-black/10 hover:text-svs-ink"
                aria-label="Close stories"
                onClick={onClose}
              >
                ×
              </button>

              <button
                type="button"
                className="absolute inset-y-0 left-0 z-20 w-[32%]"
                aria-label="Previous"
                onClick={goPrev}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 z-20 w-[32%]"
                aria-label="Next"
                onClick={advanceStory}
              />
              <button
                type="button"
                className="absolute inset-x-[32%] inset-y-0 z-20"
                aria-label={paused ? "Play" : "Pause"}
                onClick={() => setPaused((p) => !p)}
              />

              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
                <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-svs-ink sm:text-sm">
                  {slide.title}
                </p>

                <div className="relative mx-auto mt-3 w-full flex-1 min-h-0 sm:mt-4">
                  {slide.type === "video" ? (
                    <video
                      ref={videoRef}
                      src={slide.src}
                      className="absolute inset-0 h-full w-full object-contain"
                      playsInline
                      muted
                    />
                  ) : (
                    <Image
                      src={slide.src}
                      alt={slide.alt ?? slide.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 420px) 86vw, 400px"
                      priority
                    />
                  )}
                </div>

                <div className="mt-3 flex flex-col items-center gap-2.5 text-center sm:mt-4 sm:gap-3">
                  {slide.headline ? (
                    <p className="text-[1.05rem] font-extrabold leading-snug tracking-tight text-svs-ink sm:text-[1.2rem]">
                      {slide.headline}
                    </p>
                  ) : null}
                  {slide.ctaLabel && slide.ctaHref ? (
                    <Link
                      href={slide.ctaHref}
                      className="pointer-events-auto inline-flex min-h-10 items-center justify-center rounded-full bg-[#cfcfcf] px-8 py-2.5 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#bdbdbd] sm:min-h-11 sm:px-10 sm:text-sm"
                      onClick={onClose}
                    >
                      {slide.ctaLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="absolute left-full z-10 ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white shadow-sm backdrop-blur-md transition-colors hover:bg-white/40 sm:ml-4 sm:h-11 sm:w-11"
            aria-label="Next story"
            onClick={advanceStory}
          >
            <Chevron dir="right" />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
