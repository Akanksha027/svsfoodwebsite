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
import { useBodyScrollLock } from "@/lib/body-scroll-lock";

type StoryViewerProps = {
  open: boolean;
  onClose: () => void;
  slides?: StorySlide[];
};

function getDuration(slide: StorySlide): number {
  return slide.durationMs ?? DEFAULT_STORY_DURATION_MS;
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

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setProgress(0);
    setPaused(false);
  }, [open]);

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

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] bg-black flex items-stretch justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="SVS Food stories"
    >
      {/* Desktop prev arrow — outside story column */}
      {index > 0 ? (
        <button
          type="button"
          className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-[2002] w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center transition-colors"
          aria-label="Previous story"
          onClick={goPrev}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}

      {/* Story panel — header first, image fills remaining viewport */}
      <div className="flex h-[100svh] w-full justify-center px-3 sm:px-4">
        <div className="flex h-full w-full max-w-[560px] flex-col">
          {/* Progress + header — fixed strip at top */}
          <div className="shrink-0 px-1 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="mb-3 flex gap-1.5">
              {slides.map((s, i) => {
                const filled = i < index ? 1 : i === index ? progress : 0;
                return (
                  <div
                    key={s.id}
                    className="h-1 sm:h-[3px] flex-1 overflow-hidden rounded-full bg-white/40"
                  >
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${filled * 100}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white sm:text-base">
                {slide.title}
              </p>
              <div className="flex shrink-0 items-center gap-4 text-white">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-80"
                  aria-label={paused ? "Play" : "Pause"}
                  onClick={() => setPaused((p) => !p)}
                >
                  {paused ? (
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center text-2xl leading-none transition-opacity hover:opacity-80"
                  aria-label="Close stories"
                  onClick={onClose}
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Image / video frame — fills space below bars */}
          <div className="relative min-h-0 flex-1 w-full overflow-hidden bg-black">
            <div className="absolute inset-0">
              {slide.type === "video" ? (
                <video
                  ref={videoRef}
                  src={slide.src}
                  className="h-full w-full object-cover"
                  playsInline
                  muted
                />
              ) : (
                <Image
                  src={slide.src}
                  alt={slide.alt ?? slide.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 560px) 94vw, 560px"
                  priority
                />
              )}
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/65" />

            <button
              type="button"
              className="absolute inset-y-0 left-0 z-10 w-[35%]"
              aria-label="Previous"
              onClick={goPrev}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 z-10 w-[35%]"
              aria-label="Next"
              onClick={advanceStory}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
              {slide.headline ? (
                <p className="mb-4 text-xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-2xl">
                  {slide.headline}
                </p>
              ) : null}
              {slide.ctaLabel && slide.ctaHref ? (
                <Link
                  href={slide.ctaHref}
                  className="pointer-events-auto inline-block rounded-full border border-white/35 bg-white/20 px-8 py-3 text-sm font-semibold text-white no-underline backdrop-blur-md transition-colors hover:bg-white/30 sm:text-base"
                  onClick={onClose}
                >
                  {slide.ctaLabel}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop next arrow */}
      <button
        type="button"
        className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-[2002] w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center transition-colors"
        aria-label="Next story"
        onClick={advanceStory}
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>,
    document.body,
  );
}
