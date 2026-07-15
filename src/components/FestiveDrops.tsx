"use client";

import { useLayoutEffect, useState, type CSSProperties } from "react";
import FestiveDropFood from "@/components/FestiveDropFood";
import {
  buildFestiveParticles,
  getFestiveViewportProfile,
  festiveDropTheme,
  type FestiveDropTheme,
  type FestiveParticle,
  type FestiveViewportProfile,
} from "@/data/festive-drops";

type FestiveDropsProps = {
  theme?: FestiveDropTheme;
};

export default function FestiveDrops({
  theme = festiveDropTheme,
}: FestiveDropsProps) {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<FestiveParticle[]>([]);
  const [profile, setProfile] = useState<FestiveViewportProfile | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useLayoutEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => setReduceMotion(motionMq.matches);
    onMotionChange();
    motionMq.addEventListener("change", onMotionChange);

    const syncProfile = () => {
      setProfile(getFestiveViewportProfile(window.innerWidth));
    };

    syncProfile();
    window.addEventListener("resize", syncProfile);

    return () => {
      motionMq.removeEventListener("change", onMotionChange);
      window.removeEventListener("resize", syncProfile);
    };
  }, []);

  useLayoutEffect(() => {
    if (!profile || !theme.enabled || reduceMotion) {
      if (reduceMotion || !theme.enabled) {
        setMounted(false);
        setParticles([]);
      }
      return;
    }

    setParticles(buildFestiveParticles(theme, profile));
    setMounted(true);
  }, [theme, profile, reduceMotion]);

  if (!mounted || !theme.enabled || reduceMotion || particles.length === 0) {
    return null;
  }

  return (
    <div
      className="festive-drops-layer pointer-events-none fixed inset-0 z-[1001] overflow-hidden"
      aria-hidden
      data-festive-theme={theme.id}
      data-festive-viewport={profile?.id}
    >
      {particles.map((particle) => (
        <span
          key={`${profile?.id ?? "lg"}-${particle.id}`}
          className="festive-drop-outer"
          style={
            {
              left: `${particle.leftPercent}%`,
            } as CSSProperties
          }
        >
          <span
            className="festive-drop-track"
            style={
              {
                "--festive-rail-y": `${particle.railYpx}px`,
                "--festive-pipe-duration": `${particle.pipeDurationSec}s`,
                "--festive-pipe-delay": `${particle.pipeDelaySec}s`,
              } as CSSProperties
            }
          >
            <span
              className="festive-drop-body"
              style={
                {
                  "--festive-fall-duration": `${particle.fallDurationSec}s`,
                  "--festive-fall-delay": `${particle.fallDelaySec}s`,
                  "--festive-start-y": `${particle.startYVh}vh`,
                  "--festive-rail-y": `${particle.railYpx}px`,
                  "--festive-bounce-peak-y": `${particle.bouncePeakYpx}px`,
                  "--festive-bounce-2": `${particle.bounce2Px}px`,
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
                <FestiveDropFood
                  src={particle.imageUrl}
                  alt=""
                  size={particle.foodSizePx}
                  scale={particle.scale}
                />
              </span>
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}
