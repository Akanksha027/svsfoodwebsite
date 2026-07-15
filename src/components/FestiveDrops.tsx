"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  buildFestiveParticles,
  FESTIVE_EMOJI_SIZE_PX,
  FESTIVE_FALL_DURATION_SEC,
  festiveDropTheme,
  type FestiveDropTheme,
  type FestiveParticle,
} from "@/data/festive-drops";

type FestiveDropsProps = {
  theme?: FestiveDropTheme;
};

export default function FestiveDrops({
  theme = festiveDropTheme,
}: FestiveDropsProps) {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<FestiveParticle[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => setReduceMotion(mq.matches);
    onMotionChange();
    mq.addEventListener("change", onMotionChange);

    if (!theme.enabled || mq.matches) {
      return () => mq.removeEventListener("change", onMotionChange);
    }

    setParticles(buildFestiveParticles(theme));
    setMounted(true);

    return () => mq.removeEventListener("change", onMotionChange);
  }, [theme]);

  if (!mounted || !theme.enabled || reduceMotion || particles.length === 0) {
    return null;
  }

  return (
    <div
      className="festive-drops-layer pointer-events-none fixed inset-0 z-[1001] overflow-hidden"
      aria-hidden
      data-festive-theme={theme.id}
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="festive-drop-outer"
          style={
            {
              left: `${particle.leftPercent}%`,
              fontSize: `${FESTIVE_EMOJI_SIZE_PX}px`,
              "--festive-fall-duration": `${FESTIVE_FALL_DURATION_SEC}s`,
              "--festive-pipe-duration": `${particle.pipeDurationSec}s`,
              "--festive-pipe-delay": `${particle.pipeDelaySec}s`,
            } as CSSProperties
          }
        >
          <span
            className="festive-drop-inner"
            style={
              {
                "--festive-slide-x": `${particle.slideEndVw}vw`,
                "--festive-slide-duration": `${particle.slideDurationSec}s`,
                "--festive-slide-delay": `${particle.slideDelaySec}s`,
              } as CSSProperties
            }
          >
            {particle.glyph}
          </span>
        </span>
      ))}
    </div>
  );
}
