/**
 * Static festive drop theme — replace with backend config later.
 */
export type FestiveFoodCategory = "pizza" | "burger" | "drink" | "roll";

export type FestiveDropGlyph = {
  category: FestiveFoodCategory;
  name: string;
  imageUrl: string;
  weight?: number;
};

export type FestiveDropTheme = {
  enabled: boolean;
  id: string;
  name: string;
  glyphs: FestiveDropGlyph[];
  particleCount: number;
};

/** Category images (background-removed) from Satna store menu. */
export const festiveDropTheme: FestiveDropTheme = {
  enabled: true,
  id: "menu-categories",
  name: "Menu categories",
  glyphs: [
    {
      category: "pizza",
      name: "Pizza",
      imageUrl:
        "https://kalrtjvnbtauikrrvgxt.supabase.co/storage/v1/object/public/menu-media/categories/cat_pp_store_24475_542962/main/1780568214906-WhatsApp-Image-2026-06-02-at-1.09.27-PM-Large-Background-Removed.png",
      weight: 1,
    },
    {
      category: "burger",
      name: "Burgers",
      imageUrl:
        "https://kalrtjvnbtauikrrvgxt.supabase.co/storage/v1/object/public/menu-media/categories/cat_pp_store_24475_542961/main/1780937279962-supremee-BURGER-Background-Removed.png",
      weight: 1,
    },
    {
      category: "drink",
      name: "Beverages",
      imageUrl:
        "https://kalrtjvnbtauikrrvgxt.supabase.co/storage/v1/object/public/menu-media/categories/cat_pp_store_24475_542968/main/1780663548428-Cold-Coffee-Craze-2-Background-Removed.png",
      weight: 1,
    },
    {
      category: "roll",
      name: "Naan & Wraps",
      imageUrl:
        "https://kalrtjvnbtauikrrvgxt.supabase.co/storage/v1/object/public/menu-media/categories/cat_pp_store_24475_2430322/main/1780935408028-Cheese-Chatpata-Naan-Background-Removed.png",
      weight: 1,
    },
  ],
  particleCount: 18,
};

export const FESTIVE_RAIL_Y_PX = 100;
export const FESTIVE_FOOD_SIZE_PX = 72;

export const FESTIVE_LEFT_EDGE_VW = 4;
export const FESTIVE_RIGHT_EDGE_VW = 96;

export type FestiveViewportProfile = {
  id: "sm" | "md" | "lg";
  particleCount: number;
  railYpx: number;
  foodSizePx: number;
  leftEdgeVw: number;
  rightEdgeVw: number;
  leftSpread: [number, number];
  centerSpread: [number, number];
  rightSpread: [number, number];
  fallStaggerSec: number;
  slideStaggerSec: number;
  slideSpeedVwPerSec: number;
};

export function getFestiveViewportProfile(width: number): FestiveViewportProfile {
  if (width < 640) {
    return {
      id: "sm",
      particleCount: 10,
      railYpx: 64,
      foodSizePx: 38,
      leftEdgeVw: 6,
      rightEdgeVw: 94,
      leftSpread: [10, 36],
      centerSpread: [42, 58],
      rightSpread: [64, 90],
      fallStaggerSec: 0.09,
      slideStaggerSec: 0.07,
      slideSpeedVwPerSec: 38,
    };
  }

  if (width < 1024) {
    return {
      id: "md",
      particleCount: 14,
      railYpx: 84,
      foodSizePx: 46,
      leftEdgeVw: 5,
      rightEdgeVw: 95,
      leftSpread: [8, 36],
      centerSpread: [40, 60],
      rightSpread: [64, 92],
      fallStaggerSec: 0.1,
      slideStaggerSec: 0.075,
      slideSpeedVwPerSec: 40,
    };
  }

  return {
    id: "lg",
    particleCount: 18,
    railYpx: FESTIVE_RAIL_Y_PX,
    foodSizePx: FESTIVE_FOOD_SIZE_PX,
    leftEdgeVw: FESTIVE_LEFT_EDGE_VW,
    rightEdgeVw: FESTIVE_RIGHT_EDGE_VW,
    leftSpread: [8, 36],
    centerSpread: [40, 60],
    rightSpread: [64, 92],
    fallStaggerSec: FESTIVE_FALL_STAGGER_SEC,
    slideStaggerSec: FESTIVE_SLIDE_STAGGER_SEC,
    slideSpeedVwPerSec: FESTIVE_SLIDE_SPEED_VW_PER_SEC,
  };
}

/** Base fall time before per-ball variation. */
export const FESTIVE_FALL_DURATION_SEC = 2.4;
/** Stagger when each ball starts falling (spread impact on the rail). */
export const FESTIVE_FALL_STAGGER_SEC = 0.11;
/** Gap between each ball starting its rail move (follow train). */
export const FESTIVE_SLIDE_STAGGER_SEC = 0.08;
export const FESTIVE_SLIDE_SPEED_VW_PER_SEC = 44;
export const FESTIVE_PIPE_DURATION_SEC = 1.45;

function pickFood(
  glyphs: FestiveDropGlyph[],
  index: number,
): FestiveDropGlyph {
  const pool = glyphs.flatMap((g) =>
    Array.from({ length: g.weight ?? 1 }, () => g),
  );
  return pool[index % pool.length] ?? glyphs[0]!;
}

/** Deterministic 0–1 jitter (stable per id, no hydration issues). */
function jitter(id: number, salt: number): number {
  return ((id * 17 + salt * 31) % 97) / 97;
}

function particleMotion(id: number, profile: FestiveViewportProfile) {
  const j1 = jitter(id, 1);
  const j2 = jitter(id, 2);
  const j3 = jitter(id, 3);
  const j4 = jitter(id, 4);
  const j5 = jitter(id, 5);

  const railScale = profile.railYpx / FESTIVE_RAIL_Y_PX;
  const railYpx =
    profile.railYpx + Math.round((j1 - 0.5) * 22 * railScale);
  const bounceHeightPx = Math.round((38 + j2 * 52) * railScale);
  const bouncePeakYpx = Math.max(
    profile.railYpx * 0.35,
    railYpx - bounceHeightPx,
  );
  const bounce2Px = Math.max(4, Math.round((6 + j3 * 16) * railScale));

  return {
    fallDelaySec: id * profile.fallStaggerSec * 0.55,
    fallDurationSec: FESTIVE_FALL_DURATION_SEC + (j4 - 0.5) * 0.55,
    startYVh: -(34 + j5 * 8),
    scale: 0.9 + jitter(id, 7) * 0.22,
    foodSizePx: profile.foodSizePx,
    railYpx,
    bouncePeakYpx,
    bounce2Px,
  };
}

export type FestiveParticle = {
  id: number;
  category: FestiveFoodCategory;
  name: string;
  imageUrl: string;
  foodSizePx: number;
  scale: number;
  goLeft: boolean;
  leftPercent: number;
  slideEndVw: number;
  fallDelaySec: number;
  fallDurationSec: number;
  startYVh: number;
  railYpx: number;
  bouncePeakYpx: number;
  bounce2Px: number;
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

function applySideQueue(
  particles: FestiveParticle[],
  goLeft: boolean,
  profile: FestiveViewportProfile,
): void {
  const side = particles
    .filter((p) => p.goLeft === goLeft)
    .sort((a, b) =>
      goLeft ? a.leftPercent - b.leftPercent : b.leftPercent - a.leftPercent,
    );

  side.forEach((particle, queueIndex) => {
    const travelVw = Math.abs(particle.slideEndVw);
    const landedAt =
      particle.fallDelaySec + particle.fallDurationSec;
    particle.slideDelaySec =
      landedAt + queueIndex * profile.slideStaggerSec;
    particle.slideDurationSec = Math.max(
      0.22,
      travelVw / profile.slideSpeedVwPerSec,
    );
    particle.pipeDelaySec =
      particle.slideDelaySec + particle.slideDurationSec;
    particle.pipeDurationSec = FESTIVE_PIPE_DURATION_SEC;
  });
}

function createParticle(
  id: number,
  leftPercent: number,
  goLeft: boolean,
  glyphs: FestiveDropGlyph[],
  profile: FestiveViewportProfile,
): FestiveParticle {
  const motion = particleMotion(id, profile);
  const food = pickFood(glyphs, id);
  return {
    id,
    category: food.category,
    name: food.name,
    imageUrl: food.imageUrl,
    goLeft,
    leftPercent,
    slideEndVw: goLeft
      ? profile.leftEdgeVw - leftPercent
      : profile.rightEdgeVw - leftPercent,
    ...motion,
    slideDelaySec: 0,
    slideDurationSec: 0.6,
    pipeDelaySec: 0,
    pipeDurationSec: FESTIVE_PIPE_DURATION_SEC,
  };
}

export function buildFestiveParticles(
  theme: FestiveDropTheme,
  profile: FestiveViewportProfile,
): FestiveParticle[] {
  if (!theme.enabled) return [];

  const count = Math.min(theme.particleCount, profile.particleCount);
  const leftCount = Math.floor(count / 3);
  const centerCount = Math.floor(count / 3);
  const rightCount = count - leftCount - centerCount;

  const leftPositions = spreadOnSide(
    leftCount,
    profile.leftSpread[0],
    profile.leftSpread[1],
  );
  const centerPositions = spreadOnSide(
    centerCount,
    profile.centerSpread[0],
    profile.centerSpread[1],
  );
  const rightPositions = spreadOnSide(
    rightCount,
    profile.rightSpread[0],
    profile.rightSpread[1],
  );

  const particles: FestiveParticle[] = [];
  let id = 0;

  for (const leftPercent of leftPositions) {
    particles.push(
      createParticle(id++, leftPercent, true, theme.glyphs, profile),
    );
  }

  for (const leftPercent of centerPositions) {
    const goLeft = leftPercent <= 50;
    particles.push(
      createParticle(id++, leftPercent, goLeft, theme.glyphs, profile),
    );
  }

  for (const leftPercent of rightPositions) {
    particles.push(
      createParticle(id++, leftPercent, false, theme.glyphs, profile),
    );
  }

  applySideQueue(particles, true, profile);
  applySideQueue(particles, false, profile);

  return particles;
}
