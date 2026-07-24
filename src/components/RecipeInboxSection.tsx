"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type IconItem = {
  src: string;
  alt: string;
  delay: number;
  rotate?: number;
};

/** Top rail — equal slots */
const TOP_ROW: IconItem[] = [
  { src: "/nobg/vegies/im4.png", alt: "Onion", delay: 0, rotate: -8 },
  { src: "/nobg/vegies/im5.png", alt: "Cucumber", delay: 0.05, rotate: 4 },
  { src: "/images/lettuce.png", alt: "Lettuce", delay: 0.1, rotate: -10 },
  { src: "/nobg/vegies/im6.png", alt: "Broccoli", delay: 0.14, rotate: -4 },
  { src: "/nobg/vegies/im1.png", alt: "Pepper", delay: 0.18, rotate: 8 },
];

/** Bottom rail — equal slots */
const BOTTOM_ROW: IconItem[] = [
  { src: "/nobg/vegies/im2.png", alt: "Avocado", delay: 0.08, rotate: -6 },
  { src: "/images/cheese.png", alt: "Cheese", delay: 0.12, rotate: 12 },
  { src: "/nobg/vegies/im8.png", alt: "Mint", delay: 0.16, rotate: 8 },
  { src: "/nobg/vegies/im7.png", alt: "Bun", delay: 0.2, rotate: -4 },
];

/**
 * Uniform icon box — scales up on large screens, always square & same size.
 */
const ICON_BOX =
  "relative aspect-square w-full max-w-[3rem] sm:max-w-[4rem] md:max-w-[5rem] lg:max-w-[7.5rem] xl:max-w-[8.5rem]";

function RailIcon({ item }: { item: IconItem }) {
  return (
    <motion.div
      className={ICON_BOX}
      style={{ rotate: item.rotate ?? 0 }}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.65,
        delay: item.delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      aria-hidden
    >
      <Image
        src={item.src}
        alt=""
        fill
        className="object-contain drop-shadow-[0_10px_20px_rgba(26,26,26,0.14)] [mix-blend-mode:screen]"
        sizes="(min-width: 1280px) 136px, (min-width: 1024px) 120px, (min-width: 768px) 80px, 64px"
      />
    </motion.div>
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
    items.length === 6
      ? "grid-cols-6"
      : items.length === 5
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

      {/* Top + bottom rails — equal spacing */}
      <IconRail items={TOP_ROW} edge="top" />
      <IconRail items={BOTTOM_ROW} edge="bottom" />

      {/* Pan — mobile: bottom-right; sm+: right edge, vertically centered */}
      <motion.div
        className="pointer-events-none absolute right-[-8%] bottom-1 z-[3] h-[120px] w-[88px] sm:top-1/2 sm:right-0 sm:bottom-auto sm:h-[220px] sm:w-[135px] sm:-translate-y-1/2 md:h-[280px] md:w-[170px] lg:right-[-1%] lg:h-[360px] lg:w-[220px] xl:h-[420px] xl:w-[255px]"
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      >
        <Image
          src="/nobg/vegies/pan.png"
          alt=""
          fill
          className="object-contain object-right-bottom sm:object-right-center drop-shadow-[0_16px_32px_rgba(26,26,26,0.22)]"
          sizes="(min-width: 1280px) 255px, (min-width: 1024px) 220px, 88px"
          priority
        />
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-[520px] flex-col items-center px-5 text-center sm:px-8">
        <motion.h2
          className="font-bagoss text-[clamp(1.55rem,6vw,3.15rem)] font-bold leading-[1.15] tracking-tight text-svs-ink"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Order from our store
        </motion.h2>

        <motion.p
          className="mt-2 max-w-md text-[14px] font-medium leading-relaxed text-svs-ink/70 sm:mt-3 sm:text-base"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          Fresh pure-veg favourites, made to order — why wait anywhere else?
        </motion.p>

        <motion.div
          className="relative z-[6] mt-5 sm:mt-6"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/menu"
            className="inline-flex items-center justify-center rounded-full bg-svs-orange px-7 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_28px_rgba(241,106,52,0.35)] transition-colors hover:bg-svs-orange-dark sm:px-10 sm:py-4 sm:text-[14px]"
          >
            Order now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
