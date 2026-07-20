"use client";

import { useEffect, useRef, useState } from "react";

const MAX_VALUE = 99;
const DEFAULT_MS = 220;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

type RollingCounterProps = {
  /** Integer quantity, clamped to 0..99. */
  value: number;
  fontSize?: number;
  color?: string;
  className?: string;
  durationMs?: number;
};

/**
 * DaisyUI-style vertical-roll digit (same shape as kiosk `FastCountdown`).
 * One column 0..99 slides into a clipped window on each +/- tap.
 */
export function RollingCounter({
  value,
  fontSize = 14,
  color = "#ffffff",
  className = "",
  durationMs = DEFAULT_MS,
}: RollingCounterProps) {
  const safe = Math.max(0, Math.min(MAX_VALUE, Math.floor(value)));
  const rowH = fontSize;
  const slotWidth = Math.ceil(fontSize * 0.72) * (safe >= 10 ? 2 : 1);
  // Widen enough for "99" so layout doesn't jump 9→10.
  const windowWidth = Math.max(slotWidth, Math.ceil(fontSize * 0.72) * 2);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ height: rowH, width: windowWidth }}
      aria-hidden
    >
      <div
        className="flex flex-col items-center will-change-transform"
        style={{
          transform: `translateY(${-safe * rowH}px)`,
          transition: `transform ${durationMs}ms ${EASING}`,
        }}
      >
        {Array.from({ length: MAX_VALUE + 1 }).map((_, i) => (
          <span
            key={i}
            className="flex items-center justify-center font-bold tabular-nums leading-none select-none"
            style={{
              height: rowH,
              fontSize,
              color,
              lineHeight: `${rowH}px`,
            }}
          >
            {i}
          </span>
        ))}
      </div>
      <span className="sr-only">{safe}</span>
    </div>
  );
}

type DigitRollProps = {
  digit: number;
  fontSize: number;
  color: string;
  durationMs: number;
};

function DigitRoll({ digit, fontSize, color, durationMs }: DigitRollProps) {
  const rowH = fontSize;
  const slotWidth = Math.ceil(fontSize * 0.62);
  const [mounted, setMounted] = useState(false);
  const translateY = mounted ? -digit * rowH : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Re-trigger when digit changes after mount (state already drives transform).
  }, [digit]);

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: slotWidth, height: rowH }}
    >
      <div
        className="flex flex-col items-center will-change-transform"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: mounted
            ? `transform ${durationMs}ms ${EASING}`
            : "none",
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="flex items-center justify-center font-extrabold tabular-nums leading-none select-none"
            style={{
              height: rowH,
              fontSize,
              color,
              lineHeight: `${rowH}px`,
            }}
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

type AnimatedPriceProps = {
  /** Rupee amount (floored). */
  value: number;
  fontSize?: number;
  color?: string;
  prefix?: string | null;
  durationMs?: number;
  className?: string;
};

/**
 * Per-digit rolling price — same idea as kiosk `AnimatedPrice`.
 */
export function AnimatedPrice({
  value,
  fontSize = 18,
  color = "#ffffff",
  prefix = "₹",
  durationMs = 240,
  className = "",
}: AnimatedPriceProps) {
  const safe = Math.max(0, Math.floor(value));
  const digits = String(safe).split("").map((d) => Number(d));
  const positionsFromRight = digits.map((_, i) => digits.length - i);
  const prevLen = useRef(digits.length);

  useEffect(() => {
    prevLen.current = digits.length;
  }, [digits.length]);

  return (
    <div
      className={`inline-flex items-center ${className}`}
      aria-label={`${prefix ?? ""}${safe}`}
    >
      {prefix ? (
        <span
          className="font-extrabold leading-none select-none"
          style={{ fontSize, color, lineHeight: `${fontSize}px` }}
          aria-hidden
        >
          {prefix}
        </span>
      ) : null}
      {digits.map((d, i) => (
        <DigitRoll
          key={`pos-${positionsFromRight[i]}`}
          digit={d}
          fontSize={fontSize}
          color={color}
          durationMs={durationMs}
        />
      ))}
    </div>
  );
}
