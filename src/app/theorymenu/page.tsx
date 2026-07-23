"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import WhatsOnOurPlateSection from "@/components/WhatsOnOurPlateSection";
import PizzaPlatesSection from "@/components/PizzaPlatesSection";
import TheoryMenuSmoothScroll from "@/components/TheoryMenuSmoothScroll";

/** Fixed center combo */
const CENTER_COMBO = {
  name: "Veg Delight Combo",
  image: "/combo/burgerFries.png",
} as const;

/** Right-side category items (cycle vertically) */
const categoryItems = [
  { name: "Burger & Fries", image: "/combo/burgerFries.png" },
  { name: "Supreme", image: "/combo/Supremee.png" },
  { name: "Vada Burger", image: "/combo/burgerVada.png" },
  { name: "Pizza Combo", image: "/combo/pizza.png" },
] as const;

const AUTO_MS = 2800;
const THUMB = 104;
const GAP = 12;

export default function TheoryMenuPage() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const next = () => {
    setDirection(1);
    setActive((p) => (p + 1) % categoryItems.length);
  };

  const prev = () => {
    setDirection(-1);
    setActive((p) => (p - 1 + categoryItems.length) % categoryItems.length);
  };

  const goTo = (index: number) => {
    setDirection(index > active ? 1 : -1);
    setActive(index);
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
    <main className="relative w-full bg-white">
      <TheoryMenuSmoothScroll />
      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col overflow-hidden px-6 pt-20 sm:px-10 sm:pt-24 lg:px-16 lg:pt-28">
        <section className="relative mt-2 flex flex-1 flex-col justify-center pb-8 sm:mt-4">
          {/* BURGERS — shifted down */}
          <h1
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[36%] z-0 w-full -translate-x-1/2 -translate-y-1/2 select-none text-center font-black uppercase leading-none tracking-tighter text-svs-orange sm:top-[34%] md:top-[32%]"
            style={{ fontSize: "clamp(4.5rem, 16vw, 12rem)" }}
          >
            BURGERS
          </h1>

          {/* Main stage: left copy + centered combo */}
          <div className="relative z-10 flex min-h-[420px] flex-col items-center justify-center gap-8 py-6 lg:min-h-[520px] lg:flex-row lg:items-center lg:justify-center lg:gap-0">
            {/* LEFT copy + CTA */}
            <div className="relative z-10 order-2 flex w-full max-w-sm flex-col self-start lg:order-1 lg:absolute lg:left-0 lg:top-[60%] lg:w-auto lg:self-auto xl:left-2">
              <h2 className="text-3xl font-black uppercase leading-[0.95] tracking-tight text-svs-ink sm:text-4xl md:text-[2.65rem]">
                Veg Delight
                <br />
                Combo
              </h2>
              <p className="mt-4 text-sm font-medium uppercase tracking-wide text-svs-ink/50">
                Pure veg burger with dairy sides
              </p>

              <Link
                href="/menu"
                className="group mt-10 inline-flex w-fit items-center gap-0 rounded-full bg-svs-orange py-2.5 pl-7 pr-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_28px_rgba(241,106,52,0.35)] transition-colors hover:bg-svs-orange-dark sm:mt-12"
              >
                Add to bag
                <span className="ml-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-svs-ink transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                </span>
              </Link>
            </div>

            {/* CENTER — fixed combo */}
            <div className="relative z-10 order-1 mx-auto flex w-full max-w-[760px] items-center justify-center lg:order-2 lg:max-w-[880px]">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-[420px] w-full sm:h-[520px] md:h-[600px] lg:h-[680px]"
              >
                <Image
                  src={CENTER_COMBO.image}
                  alt={CENTER_COMBO.name}
                  fill
                  priority
                  className="object-contain drop-shadow-[0_28px_48px_rgba(26,26,26,0.2)] [mix-blend-mode:screen]"
                  sizes="(max-width: 768px) 96vw, 880px"
                />
              </motion.div>
            </div>
          </div>

          {/* RIGHT CORNER — vertical pill nav + vertical thumb carousel */}
          <div
            className="relative z-20 mt-6 flex justify-end lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2 xl:right-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Forward / back pill — stacked chevrons like reference */}
              <div className="flex flex-col overflow-hidden rounded-full border border-black/20 bg-svs-ink shadow-[0_8px_24px_rgba(26,26,26,0.25)]">
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next category"
                  className="flex h-11 w-11 items-center justify-center text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </button>
                <span className="mx-3 h-px bg-white/15" aria-hidden />
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous category"
                  className="flex h-11 w-11 items-center justify-center text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </button>
              </div>

              {/* Vertical sliding thumbnails */}
              <div
                className="relative overflow-hidden"
                style={{
                  width: THUMB,
                  height: THUMB + 88 + GAP,
                }}
              >
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={active}
                    custom={direction}
                    initial={{ y: direction > 0 ? THUMB + GAP : -(THUMB + GAP), opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: direction > 0 ? -(THUMB + GAP) : THUMB + GAP, opacity: 0 }}
                    transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-0 top-0 flex flex-col items-center gap-3"
                  >
                    <button
                      type="button"
                      onClick={() => goTo(active)}
                      className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-svs-orange/30 bg-svs-cream shadow-md ring-2 ring-svs-orange/15"
                      aria-label={categoryItems[active].name}
                    >
                      <Image
                        src={categoryItems[active].image}
                        alt={categoryItems[active].name}
                        fill
                        className="object-cover [mix-blend-mode:multiply]"
                        sizes="112px"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-svs-cream opacity-60"
                      aria-label={`Next: ${categoryItems[(active + 1) % categoryItems.length].name}`}
                    >
                      <Image
                        src={categoryItems[(active + 1) % categoryItems.length].image}
                        alt={categoryItems[(active + 1) % categoryItems.length].name}
                        fill
                        className="object-cover [mix-blend-mode:multiply]"
                        sizes="88px"
                      />
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

        
        </section>
      </div>

      <WhatsOnOurPlateSection />
      <PizzaPlatesSection />
    </main>
  );
}
