"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FRAME_COUNT = 240;
const FRAME_PAD = 4;

function frameSrc(index: number): string {
  const n = String(index + 1).padStart(FRAME_PAD, "0");
  return `/animate-frames/frame_${n}.jpg`;
}

/**
 * Scroll-scrubbed frame sequence from hero.mp4 (24fps → 240 frames).
 * Sticky full-viewport canvas; scroll progress maps 0→1 across the tall track.
 */
export default function ScrollFrameAnimation() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const frameIndexRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = imagesRef.current[index];
    if (!img || !img.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const pixelW = Math.max(1, Math.round(cssW * dpr));
    const pixelH = Math.max(1, Math.round(cssH * dpr));

    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const scale = Math.max(cssW / img.naturalWidth, cssH / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const dx = (cssW - drawW) / 2;
    const dy = (cssH - drawH) / 2;
    ctx.drawImage(img, dx, dy, drawW, drawH);
  }, []);

  // Preload frames; show first as soon as it lands
  useEffect(() => {
    let cancelled = false;
    imagesRef.current = new Array(FRAME_COUNT).fill(null);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (cancelled) return;
        if (i === 0 || i === frameIndexRef.current) {
          drawFrame(i);
        }
      };
      img.src = frameSrc(i);
      imagesRef.current[i] = img;
    }

    const onResize = () => drawFrame(frameIndexRef.current);
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [drawFrame]);

  // Scroll → frame
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const track = trackRef.current;
        if (!track) return;

        const rect = track.getBoundingClientRect();
        const total = track.offsetHeight - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
        const p = total > 0 ? scrolled / total : 0;
        const index = Math.min(
          FRAME_COUNT - 1,
          Math.max(0, Math.round(p * (FRAME_COUNT - 1))),
        );

        setProgress(p);
        if (index !== frameIndexRef.current) {
          frameIndexRef.current = index;
          setFrameIndex(index);
          drawFrame(index);
        } else {
          drawFrame(index);
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [drawFrame]);

  return (
    <div
      ref={trackRef}
      className="relative bg-black"
      style={{ height: "400vh" }}
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="h-full w-full block"
          aria-label="Scroll animation from home video"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-5 pb-6 pt-20 sm:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Scroll to play
            </p>
            <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">
              Frame {frameIndex + 1} / {FRAME_COUNT}
            </p>
          </div>
          <div className="w-32 sm:w-40">
            <div className="h-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#f16a34]"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
