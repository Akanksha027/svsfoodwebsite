"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type IconItem = {
  src: string;
  alt: string;
  delay: number;
  rotate?: number;
};

/** Top rail — small & mid screens */
const TOP_ROW: IconItem[] = [
  { src: "/nobg/vegies/im4.png", alt: "Onion", delay: 0, rotate: -8 },
  { src: "/nobg/vegies/im5.png", alt: "Cucumber", delay: 0.05, rotate: 4 },
  { src: "/images/lettuce.png", alt: "Lettuce", delay: 0.1, rotate: -10 },
  { src: "/nobg/vegies/im6.png", alt: "Broccoli", delay: 0.14, rotate: -4 },
  { src: "/nobg/vegies/im1.png", alt: "Pepper", delay: 0.18, rotate: 8 },
];

/** Bottom rail — small & mid screens */
const BOTTOM_ROW: IconItem[] = [
  { src: "/nobg/vegies/im2.png", alt: "Avocado", delay: 0.08, rotate: -6 },
  { src: "/images/cheese.png", alt: "Cheese", delay: 0.12, rotate: 12 },
  { src: "/nobg/vegies/im8.png", alt: "Mint", delay: 0.16, rotate: 8 },
  { src: "/nobg/vegies/im7.png", alt: "Bun", delay: 0.2, rotate: -4 },
  { src: "/nobg/vegies/im3.png", alt: "Chili", delay: 0.24, rotate: 22 },
];

/** Large-screen corner scatter (text stays clear in the center) */
const DESKTOP_FLOATERS: (IconItem & { pos: string })[] = [
  {
    src: "/nobg/vegies/im4.png",
    alt: "Onion",
    pos: "left-[3%] top-[4%]",
    delay: 0,
    rotate: -8,
  },
  {
    src: "/nobg/vegies/im5.png",
    alt: "Cucumber",
    pos: "left-[20%] top-[3%]",
    delay: 0.06,
    rotate: 4,
  },
  {
    src: "/nobg/vegies/im6.png",
    alt: "Broccoli",
    pos: "right-[34%] top-[4%]",
    delay: 0.1,
    rotate: -6,
  },
  {
    src: "/images/lettuce.png",
    alt: "Lettuce",
    pos: "left-[2%] top-[36%]",
    delay: 0.08,
    rotate: -12,
  },
  {
    src: "/images/tikki.png",
    alt: "Tikki",
    pos: "right-[30%] top-[36%]",
    delay: 0.12,
    rotate: 8,
  },
  {
    src: "/nobg/vegies/im1.png",
    alt: "Pepper",
    pos: "left-[3%] top-[58%]",
    delay: 0.14,
    rotate: 8,
  },
  {
    src: "/nobg/vegies/im3.png",
    alt: "Chili",
    pos: "right-[28%] top-[58%]",
    delay: 0.16,
    rotate: 24,
  },
  {
    src: "/nobg/vegies/im2.png",
    alt: "Avocado",
    pos: "left-[3%] bottom-[4%]",
    delay: 0.18,
    rotate: -6,
  },
  {
    src: "/images/cheese.png",
    alt: "Cheese",
    pos: "left-[20%] bottom-[3%]",
    delay: 0.2,
    rotate: 14,
  },
  {
    src: "/nobg/vegies/im8.png",
    alt: "Mint",
    pos: "right-[42%] bottom-[3%]",
    delay: 0.22,
    rotate: 10,
  },
  {
    src: "/nobg/vegies/im7.png",
    alt: "Bun",
    pos: "right-[28%] bottom-[4%]",
    delay: 0.24,
    rotate: -4,
  },
];

function RailIcon({
  item,
  className,
}: {
  item: IconItem;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative shrink-0 ${className ?? ""}`}
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
        sizes="80px"
      />
    </motion.div>
  );
}

export default function RecipeInboxSection() {
  return (
    <section
      className="relative flex min-h-[52svh] w-full items-center justify-center overflow-hidden py-16 sm:min-h-[58svh] sm:py-20 lg:min-h-[60svh] lg:py-14"
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

      {/* ——— Small & mid: icons in a top line + bottom line (text clear) ——— */}
      <div
        className="pointer-events-none absolute inset-x-0 top-3 z-[2] flex items-center justify-between px-3 sm:top-5 sm:px-8 md:px-12 lg:hidden"
        aria-hidden
      >
        {TOP_ROW.map((item) => (
          <RailIcon
            key={`top-${item.src}`}
            item={item}
            className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20"
          />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-3 z-[2] flex items-center justify-between px-3 sm:bottom-5 sm:px-8 md:px-12 lg:hidden"
        aria-hidden
      >
        {BOTTOM_ROW.map((item) => (
          <RailIcon
            key={`bot-${item.src}`}
            item={item}
            className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20"
          />
        ))}
      </div>

      {/* ——— Large: corner scatter + pan ——— */}
      <div className="pointer-events-none absolute inset-0 z-[2] hidden lg:block" aria-hidden>
        {DESKTOP_FLOATERS.map((item) => (
          <motion.div
            key={`desk-${item.src}-${item.pos}`}
            className={`absolute h-[145px] w-[145px] ${item.pos}`}
            style={{ rotate: item.rotate ?? 0 }}
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.75,
              delay: item.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Image
              src={item.src}
              alt=""
              fill
              className="object-contain drop-shadow-[0_12px_24px_rgba(26,26,26,0.16)] [mix-blend-mode:screen]"
              sizes="145px"
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="pointer-events-none absolute -right-20 top-[-4%] z-[1] hidden h-[110%] w-[540px] lg:block"
        initial={{ opacity: 0, x: 36 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      >
        <Image
          src="/nobg/vegies/pan.png"
          alt=""
          fill
          className="object-contain object-right-top drop-shadow-[0_16px_32px_rgba(26,26,26,0.2)] [mix-blend-mode:screen]"
          sizes="540px"
          priority
        />
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-[520px] flex-col items-center px-6 text-center sm:px-8">
        <motion.h2
          className={`${playfair.className} text-[clamp(1.55rem,6vw,3.15rem)] font-bold leading-[1.15] tracking-tight text-svs-ink`}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Order from our store
        </motion.h2>

        <motion.p
          className="mt-3 max-w-md text-[14px] font-medium leading-relaxed text-svs-ink/70 sm:mt-5 sm:text-base"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          Fresh pure-veg favourites, made to order — why wait anywhere else?
        </motion.p>

        <motion.div
          className="relative z-[6] mt-7 sm:mt-10"
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
