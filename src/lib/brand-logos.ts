/**
 * Official SVS Food logo assets — public/logo/
 *
 * | Variant   | Use on              | File          |
 * |-----------|---------------------|---------------|
 * | on-orange | SVS Orange surfaces | on-orange.png |
 * | on-ink    | Dark / hero (white) | on-ink.svg    |
 * | on-white  | Light / cream pages | on-white.svg  |
 * | on-mark   | Compact orange mark | on-mark.svg   |
 */
export type BrandLogoVariant =
  | "on-orange"
  | "on-ink"
  | "on-white"
  | "on-cream"
  | "on-mark"
  | "theme";

export const BRAND_LOGO_SRC: Record<BrandLogoVariant, string> = {
  "on-orange": "/logo/on-orange.png",
  /** White + orange mark for dark / hero backgrounds. */
  "on-ink": "/logo/on-ink.svg",
  /** Ink + orange mark for light backgrounds. */
  "on-white": "/logo/on-white.svg",
  "on-cream": "/logo/on-cream.svg",
  /** All-orange transparent mark for white navbar. */
  "on-mark": "/logo/on-mark.svg",
  "theme": "/logo/SVS FOOD LOGO.svg",
};

/** Width / height per variant. */
export const BRAND_LOGO_ASPECT: Record<BrandLogoVariant, number> = {
  "on-orange": 1,
  "on-ink": 580 / 480,
  "on-white": 580 / 480,
  "on-cream": 580 / 480,
  "on-mark": 580 / 480,
  "theme": 580 / 480,
};

/** Digital minimum logo height per brand guidelines. */
export const BRAND_LOGO_MIN_HEIGHT_PX = 32;
