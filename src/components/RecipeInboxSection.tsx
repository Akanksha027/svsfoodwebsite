"use client";

import Image from "next/image";
import Link from "next/link";

type IconItem = {
  src: string;
  alt: string;
  rotate?: number;
};

const TOP_ROW: IconItem[] = [
  { src: "/nobg/vegies/im4.png", alt: "Onion", rotate: -8 },
  { src: "/nobg/vegies/im5.png", alt: "Cucumber", rotate: 4 },
  // { src: "/images/lettuce.png", alt: "Lettuce", rotate: -10 },
  { src: "/nobg/vegies/im6.png", alt: "Broccoli", rotate: -4 },
  { src: "/nobg/vegies/im1.png", alt: "Pepper", rotate: 8 },
];

const BOTTOM_ROW: IconItem[] = [
  { src: "/nobg/vegies/im2.png", alt: "Avocado", rotate: -6 },
  { src: "/images/cheese.png", alt: "Cheese", rotate: 12 },
  { src: "/nobg/vegies/im8.png", alt: "Mint", rotate: 8 },
  { src: "/nobg/vegies/im7.png", alt: "Bun", rotate: -4 },
];

const ICON_BOX =
  "relative aspect-square w-full max-w-[3rem] sm:max-w-[4rem] md:max-w-[5rem] lg:max-w-[7.5rem] xl:max-w-[8.5rem]";

function RailIcon({ item }: { item: IconItem }) {
  return (
    <div
      className={ICON_BOX}
      style={{ rotate: `${item.rotate ?? 0}deg` }}
      aria-hidden
    >
      <Image
        src={item.src}
        alt=""
        fill
        className="object-contain drop-shadow-[0_10px_20px_rgba(26,26,26,0.14)] [mix-blend-mode:screen]"
        sizes="(min-width: 1280px) 136px, (min-width: 1024px) 120px, (min-width: 768px) 80px, 64px"
      />
    </div>
  );
}

function IconRail({
  items,
  edge,
}: {
  items: IconItem[];
  edge: "top" | "bottom";
}) {
  const edgeClass =
    edge === "top"
      ? "top-0 items-start"
      : "bottom-0 items-end sm:bottom-2 lg:bottom-4";

  const cols =
    items.length === 5
      ? "grid-cols-5"
      : items.length === 4
        ? "grid-cols-4"
        : "grid-cols-6";

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-[2] grid ${cols} px-2 sm:px-6 md:px-10 lg:px-12 xl:px-16 ${edgeClass}`}
      aria-hidden
    >
      {items.map((item) => (
        <div
          key={`${edge}-${item.src}`}
          className="flex items-center justify-center"
        >
          <RailIcon item={item} />
        </div>
      ))}
    </div>
  );
}

export default function RecipeInboxSection() {
  return (
    <section
      className="relative flex min-h-[340px] w-full items-center justify-center overflow-hidden py-8 pb-12 sm:min-h-[380px] sm:py-10 sm:pb-14 lg:min-h-[400px] lg:py-11 lg:pb-16"
      data-theory-snap
      style={{
        backgroundImage: `
          radial-gradient(ellipse 85% 50% at 50% 45%, rgba(255,255,255,0.97) 0%, transparent 72%),
          linear-gradient(180deg, rgba(26,26,26,0.025) 0%, transparent 12%, transparent 88%, rgba(26,26,26,0.03) 100%),
          linear-gradient(135deg, #faf9f7 0%, #f6f4f1 40%, #f9f8f6 70%, #f3f1ee 100%)
        `,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
          mixBlendMode: "multiply",
        }}
        aria-hidden
      />

      <IconRail items={TOP_ROW} edge="top" />
      <IconRail items={BOTTOM_ROW} edge="bottom" />

      <div
        className="pointer-events-none absolute right-[-8%] bottom-1 z-[3] h-[120px] w-[88px] sm:top-1/2 sm:right-0 sm:bottom-auto sm:h-[220px] sm:w-[135px] sm:-translate-y-1/2 md:h-[280px] md:w-[170px] lg:right-[-1%] lg:h-[360px] lg:w-[220px] xl:h-[420px] xl:w-[255px]"
        aria-hidden
      >
        <Image
          src="/nobg/vegies/pan.png"
          alt=""
          fill
          className="object-contain object-right-bottom drop-shadow-[0_16px_32px_rgba(26,26,26,0.22)] sm:object-right-center"
          sizes="(min-width: 1280px) 255px, (min-width: 1024px) 220px, 88px"
          priority
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[520px] flex-col items-center px-5 text-center sm:px-8">
        <h2 className="font-bagoss text-[clamp(1.55rem,6vw,3.15rem)] font-bold leading-[1.15] tracking-tight text-svs-ink">
          Order from our store
        </h2>

        <p className="mt-2 max-w-md text-[14px] font-medium leading-relaxed text-svs-ink/70 sm:mt-3 sm:text-base">
          Fresh pure-veg favourites, made to order — why wait anywhere else?
        </p>

        <div className="relative z-[6] mt-5 sm:mt-6">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center rounded-full bg-svs-orange px-7 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_28px_rgba(241,106,52,0.35)] transition-colors hover:bg-svs-orange-dark sm:px-10 sm:py-4 sm:text-[14px]"
          >
            Order now
          </Link>
        </div>
      </div>
    </section>
  );
}
