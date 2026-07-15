import Image from "next/image";
import {
  BRAND_LOGO_ASPECT,
  BRAND_LOGO_MIN_HEIGHT_PX,
  BRAND_LOGO_SRC,
  type BrandLogoVariant,
} from "@/lib/brand-logos";

type BrandLogoProps = {
  variant: BrandLogoVariant;
  /** Render height in px (min 32). */
  height?: number;
  priority?: boolean;
  className?: string;
};

export default function BrandLogo({
  variant,
  height = 48,
  priority = false,
  className = "",
}: BrandLogoProps) {
  const h = Math.max(BRAND_LOGO_MIN_HEIGHT_PX, Math.round(height));
  const w = Math.round(h * BRAND_LOGO_ASPECT[variant]);
  const src = BRAND_LOGO_SRC[variant];
  const isSvg = src.endsWith(".svg");

  return (
    <Image
      src={src}
      alt="SVS Food"
      width={w}
      height={h}
      priority={priority}
      draggable={false}
      className={`block w-auto max-w-none object-contain object-left ${className}`.trim()}
      style={{ height: `${h}px`, width: "auto" }}
      unoptimized={isSvg}
    />
  );
}
