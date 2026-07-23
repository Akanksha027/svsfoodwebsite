"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const FRAME_COUNT = 240;
const FRAME_PATH = (i: number) =>
  `/animate-frames/frame_${String(i).padStart(4, "0")}.jpg`;

/** Stay put until ~frame 100, then finish top-left shrink by ~frame 140. */
const MOVE_START_FRAME = 100;
const MOVE_END_FRAME = 140;

function copyProgress(p: number) {
  const frame = p * (FRAME_COUNT - 1);
  if (frame <= MOVE_START_FRAME) return 0;
  if (frame >= MOVE_END_FRAME) return 1;
  const t = (frame - MOVE_START_FRAME) / (MOVE_END_FRAME - MOVE_START_FRAME);
  return 1 - Math.pow(1 - t, 2.4);
}

export default function HeroVideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const rafRef = useRef(0);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img?.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 1 || h < 1) return;

    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const images: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    imagesRef.current = images;

    const loadOne = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          images[i] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = FRAME_PATH(i + 1);
      });

    (async () => {
      const firstBatch = 24;
      await Promise.all(
        Array.from({ length: firstBatch }, (_, i) => loadOne(i)),
      );
      if (cancelled) return;
      setReady(true);
      drawFrame(0);

      for (let i = firstBatch; i < FRAME_COUNT; i += 16) {
        const end = Math.min(i + 16, FRAME_COUNT);
        await Promise.all(
          Array.from({ length: end - i }, (_, j) => loadOne(i + j)),
        );
        if (cancelled) return;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [drawFrame]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const total = section.offsetHeight - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
        const p = total > 0 ? scrolled / total : 0;
        progressRef.current = p;
        setProgress(p);

        const frameIndex = Math.min(
          FRAME_COUNT - 1,
          Math.max(0, Math.round(p * (FRAME_COUNT - 1))),
        );
        drawFrame(frameIndex);
      });
    };

    const onResize = () => {
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(progressRef.current * (FRAME_COUNT - 1))),
      );
      drawFrame(frameIndex);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [drawFrame, ready]);

  const t = copyProgress(progress);
  // Move + scale the whole block; typography inside stays fixed (no reflow).
  const scale = 1 - t * 0.38;
  const xPct = 50 - t * 32; // 50% → ~18%
  const yPct = 28 - t * 16; // 28% → ~12% (starts higher)
  const gap = 1.15;

  return (
    <section
      id="hero-section"
      ref={sectionRef}
      className="relative h-[420vh] bg-black"
      aria-label="Hero"
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
        />
        {!ready && <div className="absolute inset-0 bg-black" aria-hidden />}

        {/* Soft vignette so type stays readable */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute z-10 flex flex-col items-start will-change-transform"
          style={{
            left: `${xPct}%`,
            top: `${yPct}%`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            gap: `${gap}rem`,
            transformOrigin: "center center",
          }}
        >
          <h1 className="font-bagoss text-left text-[clamp(2.35rem,7.5vw,4.5rem)] font-bold leading-[0.92] tracking-[-0.03em] text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.5)]">
            <span className="block whitespace-nowrap">We make our</span>
            <span className="block whitespace-nowrap text-[#f16a34]">own buns</span>
          </h1>
          <Link
            href="/menu"
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-[#f16a34] px-6 py-2.5 text-[0.95rem] font-semibold text-white shadow-lg shadow-black/25 transition hover:brightness-110 active:scale-[0.98] sm:px-7 sm:py-3 sm:text-base"
          >
            Order now
          </Link>
        </div>
      </div>
    </section>
  );
}
