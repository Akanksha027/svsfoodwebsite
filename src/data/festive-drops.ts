/**
 * Static festive drop theme — replace with backend config later.
 */
export type FestiveDropGlyph = {
  glyph: string;
  weight?: number;
};

export type FestiveDropTheme = {
  enabled: boolean;
  id: string;
  name: string;
  glyphs: FestiveDropGlyph[];
  particleCount: number;
};

export const festiveDropTheme: FestiveDropTheme = {
  enabled: true,
  id: "football-kickoff",
  name: "Football kickoff",
  glyphs: [
    { glyph: "⚽", weight: 3 },
    { glyph: "🏈", weight: 1 },
  ],
  particleCount: 18,
};

export const FESTIVE_RAIL_Y_PX = 200;
export const FESTIVE_EMOJI_SIZE_PX = 52;

export const FESTIVE_LEFT_EDGE_VW = 4;
export const FESTIVE_RIGHT_EDGE_VW = 96;

export const FESTIVE_FALL_DURATION_SEC = 0.72;
/** Gap between each ball starting its rail move (follow train). */
export const FESTIVE_SLIDE_STAGGER_SEC = 0.09;
export const FESTIVE_SLIDE_SPEED_VW_PER_SEC = 42;
export const FESTIVE_PIPE_DURATION_SEC = 1.05;

function pickGlyph(glyphs: FestiveDropGlyph[], index: number): string {
  const pool = glyphs.flatMap((g) =>
    Array.from({ length: g.weight ?? 1 }, () => g.glyph),
  );
  return pool[index % pool.length] ?? glyphs[0]?.glyph ?? "⚽";
}

export type FestiveParticle = {
  id: number;
  glyph: string;
  goLeft: boolean;
  leftPercent: number;
  slideEndVw: number;
  slideDelaySec: number;
  slideDurationSec: number;
  pipeDelaySec: number;
  pipeDurationSec: number;
};

function spreadOnSide(count: number, min: number, max: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [(min + max) / 2];
  return Array.from({ length: count }, (_, i) => min + (i / (count - 1)) * (max - min));
}

function applySideQueue(particles: FestiveParticle[], goLeft: boolean): void {
  const side = particles
    .filter((p) => p.goLeft === goLeft)
    .sort((a, b) =>
      goLeft ? a.leftPercent - b.leftPercent : b.leftPercent - a.leftPercent,
    );

  side.forEach((particle, queueIndex) => {
    const travelVw = Math.abs(particle.slideEndVw);
    particle.slideDelaySec =
      FESTIVE_FALL_DURATION_SEC + queueIndex * FESTIVE_SLIDE_STAGGER_SEC;
    particle.slideDurationSec = Math.max(
      0.28,
      travelVw / FESTIVE_SLIDE_SPEED_VW_PER_SEC,
    );
    particle.pipeDelaySec =
      particle.slideDelaySec + particle.slideDurationSec;
    particle.pipeDurationSec = FESTIVE_PIPE_DURATION_SEC;
  });
}

export function buildFestiveParticles(theme: FestiveDropTheme): FestiveParticle[] {
  if (!theme.enabled) return [];

  const count = theme.particleCount;
  const leftCount = Math.ceil(count / 2);
  const rightCount = count - leftCount;

  const leftPositions = spreadOnSide(leftCount, 8, 44);
  const rightPositions = spreadOnSide(rightCount, 56, 92);

  const particles: FestiveParticle[] = [];
  let id = 0;

  for (const leftPercent of leftPositions) {
    particles.push({
      id: id++,
      glyph: pickGlyph(theme.glyphs, id),
      goLeft: true,
      leftPercent,
      slideEndVw: FESTIVE_LEFT_EDGE_VW - leftPercent,
      slideDelaySec: FESTIVE_FALL_DURATION_SEC,
      slideDurationSec: 0.4,
      pipeDelaySec: FESTIVE_FALL_DURATION_SEC + 0.4,
      pipeDurationSec: FESTIVE_PIPE_DURATION_SEC,
    });
  }

  for (const leftPercent of rightPositions) {
    particles.push({
      id: id++,
      glyph: pickGlyph(theme.glyphs, id),
      goLeft: false,
      leftPercent,
      slideEndVw: FESTIVE_RIGHT_EDGE_VW - leftPercent,
      slideDelaySec: FESTIVE_FALL_DURATION_SEC,
      slideDurationSec: 0.4,
      pipeDelaySec: FESTIVE_FALL_DURATION_SEC + 0.4,
      pipeDurationSec: FESTIVE_PIPE_DURATION_SEC,
    });
  }

  applySideQueue(particles, true);
  applySideQueue(particles, false);

  return particles;
}
