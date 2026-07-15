/**
 * Official SVS Food logo assets — public/logo/
 *
 * | Variant   | Background   | File           |
 * |-----------|--------------|----------------|
 * | on-orange | SVS Orange   | on-orange.png  |
 * | on-ink    | SVS Ink      | on-ink.png     |
 * | on-white  | Pure White   | on-white.svg   |
 * | on-cream  | Warm Cream   | on-cream.svg   |
 */
export type BrandLogoVariant = "on-orange" | "on-ink" | "on-white" | "on-cream";

export const BRAND_LOGO_SRC: Record<BrandLogoVariant, string> = {
  "on-orange": "/logo/on-orange.png",
  "on-ink": "/logo/on-ink.svg",
  "on-white": "/logo/on-white.svg",
  "on-cream": "/logo/on-cream.svg",
};

/** Cropped mark proportions (width / height) — matches transparent SVG viewBox. */
export const BRAND_LOGO_ASPECT = 580 / 480;

/** Digital minimum logo height per brand guidelines. */
export const BRAND_LOGO_MIN_HEIGHT_PX = 32;
