"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type RefObject } from "react";
import { ArrowRight } from "lucide-react";
import WhatsOnOurPlateSection from "@/components/WhatsOnOurPlateSection";
// import PizzaPlatesSection from "@/components/PizzaPlatesSection";
import VarietyFoodSection from "@/components/VarietyFoodSection";
import RecipeInboxSection from "@/components/RecipeInboxSection";
import Footer from "@/components/Footer";
import ScrollFlyingBurger, {
  FLYING_BURGER_SRC,
} from "@/components/ScrollFlyingBurger";

const imgClass =
  "h-full w-full scale-[1.22] object-contain drop-shadow-[0_18px_32px_rgba(26,26,26,0.22)] [mix-blend-mode:screen]";

function HeroEdgeDecor() {
  const edgeTop =
    "pointer-events-none absolute top-[5%] z-[2] sm:top-[4%] lg:top-[2%]";

  return (
    <>
      <div
        className={`${edgeTop} -left-4 h-[120px] w-[120px] opacity-70 sm:-left-10 sm:h-[240px] sm:w-[240px] sm:opacity-100 md:-left-14 md:h-[320px] md:w-[320px] lg:-left-16 lg:h-[400px] lg:w-[400px]`}
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
      </div>

      <div
        className={`${edgeTop} -right-2 h-[120px] w-[72px] opacity-70 sm:-right-8 sm:h-[240px] sm:w-[150px] sm:opacity-100 md:-right-10 md:h-[320px] md:w-[190px] lg:-right-12 lg:h-[420px] lg:w-[240px]`}
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
      </div>
    </>
  );
}

/**
 * Tight combo cluster:
 * drink (back) < fries < burger < dessert (front).
 */
function HeroComboStage({
  startRef,
}: {
  startRef: RefObject<HTMLDivElement | null>;
  trackRef: RefObject<HTMLElement | null>;
}) {
  return (
    <div className="relative order-1 mx-auto flex w-full max-w-full items-center justify-center px-1 lg:order-2">
      <div className="relative mx-auto aspect-[34/30] w-full max-w-[min(100%,300px)] sm:max-w-[410px] md:max-w-[480px] lg:max-w-[520px]">
        <div className="absolute bottom-[14%] left-[-2%] z-[2] h-[82%] w-[48%] sm:left-[-4%]">
          <Image
            src="/nobg/drink.png"
            alt=""
            fill
            className={imgClass}
            sizes="(max-width: 640px) 140px, 250px"
            priority
          />
        </div>

        <div className="absolute bottom-[12%] right-[-2%] z-[3] h-[86%] w-[50%] sm:right-[-6%]">
          <Image
            src="/nobg/fries.png"
            alt=""
            fill
            className={imgClass}
            sizes="(max-width: 640px) 150px, 260px"
            priority
          />
        </div>

        <div
          ref={startRef}
          className="absolute bottom-[14%] left-1/2 z-[5] h-[68%] w-[52%] -translate-x-1/2"
          aria-label="Veg Delight burger"
        >
          <Image
            src="/nobg/burger.png"
            alt=""
            fill
            className={imgClass}
            sizes="(max-width: 640px) 160px, 280px"
            priority
          />
        </div>

        <div className="absolute bottom-[10%] left-1/3 z-[8] h-[44%] w-[46%] -translate-x-[58%]">
          <Image
            src="/nobg/desert.png"
            alt=""
            fill
            className={imgClass}
            sizes="(max-width: 640px) 110px, 200px"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default function TheoryMenuPage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);

  return (
    <main className="relative w-full overflow-x-clip bg-white">
      <div ref={trackRef} className="relative">
        <div
          data-theory-snap
          className="relative min-h-[100svh] overflow-x-clip sm:overflow-x-visible"
        >
          <HeroEdgeDecor />

          <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col px-4 pb-28 pt-[4.75rem] sm:px-10 sm:pb-16 sm:pt-24 lg:px-16 lg:pt-28">
            <section className="relative mt-1 flex flex-1 flex-col justify-center pb-4 sm:mt-4 sm:pb-8">
              <h1
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[22%] z-0 w-full -translate-x-1/2 -translate-y-1/2 select-none text-center font-black uppercase leading-none tracking-tighter text-svs-orange sm:top-[24%] min-[1027px]:top-[32%] min-[1027px]:sm:top-[34%]"
                style={{ fontSize: "clamp(2.75rem, 18vw, 12rem)" }}
              >
                SVSFOOD
              </h1>

              <div className="relative flex flex-col items-center justify-center gap-5 py-4 sm:min-h-[420px] sm:gap-8 sm:py-6 lg:min-h-[520px] lg:flex-row lg:items-center lg:justify-center lg:gap-0">
                <div className="relative z-[12] order-2 flex w-full max-w-sm flex-col self-start px-1 lg:order-1 lg:absolute lg:left-0 lg:top-[60%] lg:w-auto lg:self-auto xl:left-2">
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
        </div>

        <WhatsOnOurPlateSection landingRef={landingRef} />
      </div>

      <ScrollFlyingBurger
        trackRef={trackRef}
        startRef={startRef}
        endRef={landingRef}
        src={FLYING_BURGER_SRC}
      />

      {/* <PizzaPlatesSection /> */}
      <VarietyFoodSection />
      <RecipeInboxSection />
      <Footer />
    </main>
  );
}
