"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/** Sides, drinks, dessert & rolls — everything beyond burgers & pizza */
const VARIETIES = [
  {
    id: "fries",
    name: "Crispy Fries",
    description: "Golden, salted, and ready to share — the side that never misses.",
    image: "/nobg/fries.png",
    href: "/menu",
  },
  {
    id: "drink",
    name: "Cold Coffee",
    description: "Chilled, creamy, and made to sip with every bite.",
    image: "/nobg/drink.png",
    href: "/menu",
  },
  {
    id: "dessert",
    name: "Sweet Treat",
    description: "A soft finish after the feast — pure comfort in every spoon.",
    image: "/nobg/desert.png",
    href: "/menu",
  },
  {
    id: "rolls",
    name: "Veg Spring Rolls",
    description: "Crispy wraps packed with fresh veg — light, crunchy, addictive.",
    image: "/nobg/roles.png",
    href: "/menu",
  },
] as const;

function VarietyCard({
  item,
}: {
  item: (typeof VARIETIES)[number];
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  /* Spin while rising; finishes very early as the item enters */
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start 75%"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [-360, 0]);

  return (
    <article className="flex w-full flex-col items-center text-center">
      <div
        ref={cardRef}
        className="relative mx-auto aspect-square w-full max-w-[180px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[300px]"
      >
        <motion.div
          className="relative h-full w-full will-change-transform"
          style={{ rotate }}
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain object-center drop-shadow-[0_16px_32px_rgba(26,26,26,0.22)] [mix-blend-mode:screen]"
            sizes="300px"
          />
        </motion.div>
      </div>

      <div className="mt-3 sm:mt-4">
        <h3 className="font-serif text-xl font-semibold tracking-tight text-svs-ink sm:text-[1.35rem]">
          {item.name}
        </h3>
        <p className="mx-auto mt-1.5 max-w-[260px] text-[13px] leading-snug text-svs-ink/45 sm:text-sm">
          {item.description}
        </p>
        <Link
          href={item.href}
          className="mt-2.5 inline-block text-[11px] font-bold uppercase tracking-[0.16em] text-svs-orange transition-colors hover:text-svs-orange-dark"
        >
          Order now
        </Link>
      </div>
    </article>
  );
}

export default function VarietyFoodSection() {
  return (
    <section
      className="relative flex min-h-0 w-full items-center overflow-hidden bg-transparent py-12 sm:py-16 lg:min-h-[100svh] lg:py-20"
      data-theory-snap
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <header className="mx-auto mb-6 max-w-2xl text-center sm:mb-8">
          <h2 className="font-serif text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-tight tracking-tight text-svs-ink">
            More on the Menu
          </h2>
          <p className="mt-2 text-sm font-medium text-svs-ink/45 sm:text-[15px]">
            Fries, drinks, sweets & rolls — the extras that complete the table
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-6">
          {VARIETIES.map((item) => (
            <div
              key={item.id}
              className="relative flex justify-center px-2 py-1 sm:px-3"
            >
              <VarietyCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
