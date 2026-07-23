"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState, type RefObject } from "react";
import { ChevronUp, ChevronDown, ArrowRight } from "lucide-react";
import WhatsOnOurPlateSection from "@/components/WhatsOnOurPlateSection";
import PizzaPlatesSection from "@/components/PizzaPlatesSection";
import VarietyFoodSection from "@/components/VarietyFoodSection";
import RecipeInboxSection from "@/components/RecipeInboxSection";
import Footer from "@/components/Footer";
import TheoryMenuSmoothScroll from "@/components/TheoryMenuSmoothScroll";
import ScrollFlyingBurger, {
  FLYING_BURGER_SRC,
} from "@/components/ScrollFlyingBurger";

/** Right-side category items (cycle vertically) */
const categoryItems = [
  { name: "Burger", image: "/nobg/burger.png" },
  { name: "Fries", image: "/nobg/fries.png" },
  { name: "Drink", image: "/nobg/drink.png" },
  { name: "Dessert", image: "/nobg/desert.png" },
] as const;

const AUTO_MS = 2800;

const imgClass =
  "h-full w-full scale-[1.22] object-contain drop-shadow-[0_18px_32px_rgba(26,26,26,0.22)] [mix-blend-mode:screen]";

/**
 * Spices (top-left) + tomato (top-right): flush to screen edges.
 * On load — slide in from left/right. On scroll down — slide back out.
 */
function HeroEdgeDecor({
  heroRef,
}: {
  heroRef: RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const spicesEnter = useMotionValue(-220);
  const tomatoEnter = useMotionValue(220);

  useEffect(() => {
    const controlsA = animate(spicesEnter, 0, {
      duration: 1.15,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.15,
    });
    const controlsB = animate(tomatoEnter, 0, {
      duration: 1.15,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.28,
    });
    return () => {
      controlsA.stop();
      controlsB.stop();
    };
  }, [spicesEnter, tomatoEnter]);

  /* After load, scroll pushes them back off-screen */
  const spicesOut = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    [0, 0, -80, -240],
  );
  const tomatoOut = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    [0, 0, 80, 240],
  );
  const edgeOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 0.85, 1],
    [1, 1, 0.55, 0],
  );

  const spicesX = useTransform(
    [spicesEnter, spicesOut],
    ([enter, out]) => (enter as number) + (out as number),
  );
  const tomatoX = useTransform(
    [tomatoEnter, tomatoOut],
    ([enter, out]) => (enter as number) + (out as number),
  );

  const edgeTop =
    "pointer-events-none absolute top-[5%] z-[2] will-change-transform sm:top-[4%] lg:top-[2%]";

  return (
    <>
      <motion.div
        className={`${edgeTop} -left-4 h-[120px] w-[120px] opacity-70 sm:-left-10 sm:h-[240px] sm:w-[240px] sm:opacity-100 md:-left-14 md:h-[320px] md:w-[320px] lg:-left-16 lg:h-[400px] lg:w-[400px]`}
        style={{ x: spicesX, opacity: edgeOpacity }}
        aria-hidden
      >
        <Image
          src="/nobg/spices.png"
          alt=""
          fill
          className="object-contain object-left-top drop-shadow-[0_16px_28px_rgba(26,26,26,0.18)] [mix-blend-mode:screen]"
          sizes="(max-width: 640px) 120px, 400px"
          priority
        />
      </motion.div>

      <motion.div
        className={`${edgeTop} -right-2 h-[120px] w-[72px] opacity-70 sm:-right-8 sm:h-[240px] sm:w-[150px] sm:opacity-100 md:-right-10 md:h-[320px] md:w-[190px] lg:-right-12 lg:h-[420px] lg:w-[240px]`}
        style={{ x: tomatoX, opacity: edgeOpacity }}
        aria-hidden
      >
        <Image
          src="/nobg/toato.png"
          alt=""
          fill
          className="object-contain object-right-top drop-shadow-[0_16px_28px_rgba(26,26,26,0.18)] [mix-blend-mode:screen]"
          sizes="(max-width: 640px) 72px, 240px"
          priority
        />
      </motion.div>
    </>
  );
}

/**
 * Tight combo cluster (reference layout):
 * drink + fries behind, burger center overlapping both,
 * dessert front over drink/burger base — no gaps.
 */
function HeroComboStage({
  startRef,
}: {
  startRef: RefObject<HTMLDivElement | null>;
  trackRef: RefObject<HTMLElement | null>;
}) {
  return (
    <div className="relative z-10 order-1 mx-auto flex w-full max-w-full items-center justify-center px-1 lg:order-2">
      <div className="relative mx-auto aspect-[34/30] w-full max-w-[min(100%,300px)] sm:max-w-[410px] md:max-w-[480px] lg:max-w-[520px]">
        <motion.div
          className="absolute bottom-[14%] left-[-2%] z-[2] h-[82%] w-[48%] sm:left-[-4%]"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/nobg/drink.png"
            alt=""
            fill
            className={imgClass}
            sizes="(max-width: 640px) 140px, 250px"
            priority
          />
        </motion.div>

        <motion.div
          className="absolute bottom-[12%] right-[-2%] z-[2] h-[86%] w-[50%] sm:right-[-6%]"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        >
          <Image
            src="/nobg/fries.png"
            alt=""
            fill
            className={imgClass}
            sizes="(max-width: 640px) 150px, 260px"
            priority
          />
        </motion.div>

        {/* Measurement pad only — visible burger is ScrollFlyingBurger */}
        <div
          ref={startRef}
          className="absolute bottom-[14%] left-1/2 z-[4] h-[68%] w-[52%] -translate-x-1/2"
          aria-label="Veg Delight burger"
        />

        <motion.div
          className="absolute bottom-[6%] left-[10%] z-[6] h-[36%] w-[40%]"
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: 4.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.15,
          }}
        >
          <Image
            src="/nobg/desert.png"
            alt=""
            fill
            className={imgClass}
            sizes="(max-width: 640px) 110px, 200px"
            priority
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function TheoryMenuPage() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);

  const next = () => {
    setDirection(1);
    setActive((p) => (p + 1) % categoryItems.length);
  };

  const prev = () => {
    setDirection(-1);
    setActive((p) => (p - 1 + categoryItems.length) % categoryItems.length);
  };

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setDirection(1);
      setActive((p) => (p + 1) % categoryItems.length);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, active]);

  return (
    <main className="relative w-full overflow-x-clip bg-white">
      <TheoryMenuSmoothScroll />

      <div ref={trackRef} className="relative">
        {/* Full-bleed hero shell so edge accents can touch screen left/right */}
        <div
          data-theory-snap
          className="relative min-h-[100svh] overflow-x-clip sm:overflow-x-visible"
        >
          <HeroEdgeDecor heroRef={heroRef} />

          <div
            ref={heroRef}
            className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col px-4 pb-28 pt-[4.75rem] sm:px-10 sm:pb-16 sm:pt-24 lg:px-16 lg:pt-28"
          >
          <section className="relative mt-1 flex flex-1 flex-col justify-center pb-4 sm:mt-4 sm:pb-8">
            <h1
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[30%] z-0 w-full -translate-x-1/2 -translate-y-1/2 select-none text-center font-black uppercase leading-none tracking-tighter text-svs-orange sm:top-[34%] md:top-[32%]"
              style={{ fontSize: "clamp(2.75rem, 18vw, 12rem)" }}
            >
              SVSFOOD
            </h1>

            <div className="relative z-10 flex flex-col items-center justify-center gap-5 py-4 sm:min-h-[420px] sm:gap-8 sm:py-6 lg:min-h-[520px] lg:flex-row lg:items-center lg:justify-center lg:gap-0">
              <div className="relative z-10 order-2 flex w-full max-w-sm flex-col self-start px-1 lg:order-1 lg:absolute lg:left-0 lg:top-[60%] lg:w-auto lg:self-auto xl:left-2">
                <h2 className="text-[1.75rem] font-black uppercase leading-[0.95] tracking-tight text-svs-ink sm:text-4xl md:text-[2.65rem]">
                  Veg Delight
                  <br />
                  Combo
                </h2>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-svs-ink/50 sm:mt-4 sm:text-sm">
                  Pure veg burger with dairy sides
                </p>

                <Link
                  href="/menu"
                  className="group mt-7 inline-flex w-fit items-center gap-0 rounded-full bg-svs-orange py-2.5 pl-6 pr-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_28px_rgba(241,106,52,0.35)] transition-colors hover:bg-svs-orange-dark sm:mt-12 sm:pl-7"
                >
                  Add to bag
                  <span className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-svs-ink transition-transform group-hover:translate-x-0.5 sm:ml-4 sm:h-9 sm:w-9">
                    <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                  </span>
                </Link>
              </div>

              <HeroComboStage startRef={startRef} trackRef={trackRef} />
            </div>
          </section>
          </div>

          {/* Category rail — smaller on mobile, sits lower so it doesn't cover the combo */}
          <div
            className="absolute bottom-4 right-0 z-30 flex items-center sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="mr-2 flex flex-col overflow-hidden rounded-full border border-black/20 bg-svs-ink shadow-[0_8px_24px_rgba(26,26,26,0.25)] sm:mr-3">
              <button
                type="button"
                onClick={next}
                aria-label="Next category"
                className="flex h-9 w-9 items-center justify-center text-white/65 transition-colors hover:bg-white/10 hover:text-white sm:h-11 sm:w-11"
              >
                <ChevronUp className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} />
              </button>
              <span className="mx-2.5 h-px bg-white/15 sm:mx-3" aria-hidden />
              <button
                type="button"
                onClick={prev}
                aria-label="Previous category"
                className="flex h-9 w-9 items-center justify-center text-white/65 transition-colors hover:bg-white/10 hover:text-white sm:h-11 sm:w-11"
              >
                <ChevronDown className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} />
              </button>
            </div>

            <div className="relative h-24 w-24 overflow-hidden bg-svs-cream sm:h-[140px] sm:w-[140px] md:h-[168px] md:w-[168px]">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={active}
                  custom={direction}
                  initial={{
                    x: direction > 0 ? "100%" : "-100%",
                    opacity: 0,
                  }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{
                    x: direction > 0 ? "-100%" : "100%",
                    opacity: 0,
                  }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={categoryItems[active].image}
                    alt={categoryItems[active].name}
                    fill
                    className="object-cover [mix-blend-mode:multiply]"
                    sizes="(max-width: 640px) 96px, 168px"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <WhatsOnOurPlateSection landingRef={landingRef} />
      </div>

      <ScrollFlyingBurger
        trackRef={trackRef}
        startRef={startRef}
        endRef={landingRef}
        src={FLYING_BURGER_SRC}
      />

      <PizzaPlatesSection />
      <VarietyFoodSection />
      <RecipeInboxSection />
      <Footer />
    </main>
  );
}
