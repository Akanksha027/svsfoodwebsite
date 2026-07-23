"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import WhatsOnOurPlateSection from "@/components/WhatsOnOurPlateSection";

function IconTwitter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

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

        <div className="absolute bottom-10 left-0 hidden flex-col items-center gap-5 pl-2 text-svs-ink/35 lg:flex">
          <a href="#" aria-label="Facebook" className="hover:text-svs-orange">
            <IconFacebook className="h-4 w-4" />
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-svs-orange">
            <IconTwitter className="h-4 w-4" />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-svs-orange">
            <IconInstagram className="h-4 w-4" />
          </a>
        </div>
      </div>

      <WhatsOnOurPlateSection />
    </main>
  );
}
