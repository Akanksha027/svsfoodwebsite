/**
 * Official SVS Food logo assets — public/logo/
 *
 * | Variant   | Background   | File           |
 * |-----------|--------------|----------------|
 * | on-orange | SVS Orange   | on-orange.png  |
 * | on-ink    | SVS Ink      | on-ink.png     |
 * | on-mark   | White navbar | logo-with-no-bg.png (all orange) |
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
  "on-ink": "/logo/on-ink.png",
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
