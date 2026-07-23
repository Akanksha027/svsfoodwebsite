"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, type RefObject } from "react";

/** Official SVS menu pizzas — cutouts on black (screen-blend on page bg) */
const PIZZAS = [
  {
    id: "veggie-loaded",
    name: "Veggie Loaded",
    description:
      "Bursting with capsicum, onion, tomato & cheese — fresh from our oven.",
    image: "/combo/veggie-loaded-menu.png",
    href: "/menu",
  },
  {
    id: "margherita",
    name: "Margherita",
    description: "Classic pizza with a blanket of delicious cheese.",
    image: "/combo/margherita-menu.png",
    href: "/menu",
  },
] as const;

const softEase = [0.25, 0.1, 0.25, 1] as const;

/**
 * Left accent: veggies toss up from the basket as the section opens,
 * then settle back down as you scroll past.
 */
function LeftVeggieToss({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* rise → hold at peak → fall back into the basket */
  const y = useTransform(
    scrollYProgress,
    [0, 0.28, 0.48, 0.72, 1],
    [260, 40, 0, 90, 280],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.28, 0.48, 0.72, 1],
    [0.78, 0.94, 1, 0.96, 0.82],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.48, 0.78, 1],
    [0.15, 0.85, 1, 0.75, 0.2],
  );
  /* Reveal from the basket upward, then tuck back down */
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.28, 0.48, 0.72, 1],
    [
      "inset(62% 0% 0% 0%)",
      "inset(18% 0% 0% 0%)",
      "inset(0% 0% 0% 0%)",
      "inset(22% 0% 0% 0%)",
      "inset(68% 0% 0% 0%)",
    ],
  );
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.28, 0.48, 0.72, 1],
    [-4, -1.5, 0, 1.5, 3],
  );

  return (
    <motion.div
      className="pointer-events-none absolute -bottom-10 -left-6 z-0 hidden h-[320px] w-[220px] origin-bottom-left will-change-transform sm:block sm:-bottom-20 sm:-left-12 sm:h-[560px] sm:w-[400px] lg:-bottom-28 lg:-left-16 lg:h-[920px] lg:w-[720px]"
      style={{ y, scale, opacity, clipPath, rotate }}
      aria-hidden
    >
      <Image
        src="/theorymenu/left.png"
        alt=""
        fill
        className="object-contain object-left-bottom [mix-blend-mode:screen]"
        sizes="720px"
        priority
      />
    </motion.div>
  );
}

/**
 * Right accent: slides in from the top-right corner as the section arrives,
 * then retreats back off to the right as it scrolls away.
 */
function RightCornerSlide({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* off-right → settle in → slide back off-right */
  const x = useTransform(
    scrollYProgress,
    [0, 0.28, 0.48, 0.72, 1],
    [280, 60, 0, 80, 320],
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.28, 0.48, 0.72, 1],
    [-80, -20, 0, -30, -100],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.28, 0.48, 0.72, 1],
    [0.82, 0.95, 1, 0.96, 0.84],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.48, 0.78, 1],
    [0.1, 0.8, 1, 0.7, 0.15],
  );
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.28, 0.48, 0.72, 1],
    [6, 2, 0, -2, -5],
  );

  return (
    <motion.div
      className="pointer-events-none absolute -top-10 right-0 z-0 hidden h-[320px] w-[220px] origin-top-right will-change-transform sm:block sm:-top-20 sm:h-[560px] sm:w-[400px] lg:-top-28 lg:h-[920px] lg:w-[720px]"
      style={{ x, y, scale, opacity, rotate }}
      aria-hidden
    >
      <Image
        src="/theorymenu/bg.png"
        alt=""
        fill
        className="object-contain object-right-top [mix-blend-mode:screen]"
        sizes="720px"
        priority
      />
    </motion.div>
  );
}

function PizzaCard({
  pizza,
}: {
  pizza: (typeof PIZZAS)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  /*
    Spin while the pizza rises into view; finishes when its top
    hits 30% of the viewport, then stays locked at 0° (static).
  */
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start 30%"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [-360, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const imgOpacity = useTransform(scrollYProgress, [0, 0.12, 1], [0, 0.9, 1]);
  const copyOpacity = useTransform(scrollYProgress, [0.55, 1], [0, 1]);
  const copyY = useTransform(scrollYProgress, [0.55, 1], [12, 0]);

  return (
    <article className="flex w-full flex-col items-center text-center">
      <div
        ref={cardRef}
        className="relative mx-auto aspect-square w-full max-w-[220px] sm:max-w-[340px] lg:max-w-[380px]"
      >
        <motion.div
          className="relative h-full w-full will-change-transform"
          style={{
            rotate,
            scale,
            opacity: imgOpacity,
          }}
        >
          <Image
            src={pizza.image}
            alt={pizza.name}
            fill
            className="object-contain object-center drop-shadow-[0_16px_32px_rgba(26,26,26,0.22)] [mix-blend-mode:screen]"
            sizes="380px"
            priority
          />
        </motion.div>
      </div>

      <motion.div
        className="mt-3 sm:mt-4"
        style={{ opacity: copyOpacity, y: copyY }}
      >
        <h3 className="font-serif text-xl font-semibold tracking-tight text-svs-ink sm:text-[1.35rem]">
          {pizza.name}
        </h3>
        <p className="mx-auto mt-1.5 max-w-[280px] text-[13px] leading-snug text-svs-ink/45 sm:text-sm">
          {pizza.description}
        </p>
        <Link
          href={pizza.href}
          className="mt-2.5 inline-block text-[11px] font-bold uppercase tracking-[0.16em] text-svs-orange transition-colors hover:text-svs-orange-dark"
        >
          Order now
        </Link>
      </motion.div>
    </article>
  );
}

export default function PizzaPlatesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.28, once: false });

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-0 w-full items-center overflow-hidden bg-transparent py-12 sm:min-h-[100svh] sm:py-16 lg:py-20"
      data-theory-snap
    >
      {/* Left accent — veggies toss up from basket, then settle back on scroll */}
      <LeftVeggieToss sectionRef={sectionRef} />

      {/* Right accent — slides in from the corner, retreats as section leaves */}
      <RightCornerSlide sectionRef={sectionRef} />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <motion.header
          className="mx-auto mb-4 max-w-2xl text-center sm:mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.7, ease: softEase }}
        >
          <h2 className="font-serif text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-tight tracking-tight text-svs-ink">
            Fresh from the Oven
          </h2>
          <p className="mt-2 text-sm font-medium text-svs-ink/45 sm:text-[15px]">
            Our pizzas — top view, just like they leave the kitchen
          </p>
        </motion.header>

        <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-2 sm:gap-8 lg:gap-12">
          {PIZZAS.map((pizza, index) => (
            <div
              key={pizza.id}
              className="relative flex justify-center px-2 py-1 sm:px-4"
            >
              <PizzaCard pizza={pizza} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
