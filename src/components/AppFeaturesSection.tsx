"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const PHONE_FRAME = "/app-features/phone-frame.png";

/** Zomato-style soft 3D feature illustrations */
const FEATURE_ICON = {
  onlyVeg: "/app-features/veg-mode.png",
  planAParty: "/app-features/plan-a-party.png",
  freshBuns: "/app-features/fresh-buns.png",
  chemicalFree: "/app-features/chemical-free.png",
  fastDelivery: "/app-features/fast-delivery.png",
  offers: "/app-features/offers.png",
  giftCards: "/app-features/gift-cards.png",
  combos: "/app-features/collections.png",
  madeFresh: "/app-features/made-fresh.png",
} as const;

const SVS_SLATE = "#3E4152";
const SVS_BORDER = "#E6E9EF";

type FeatureCardProps = {
  src: string;
  label: ReactNode;
  className?: string;
};

function FeatureCard({ src, label, className = "" }: FeatureCardProps) {
  return (
    <div
      className={`flex aspect-[26/29] w-full min-h-0 flex-col items-center overflow-hidden rounded-2xl border bg-white shadow-lg xl:rounded-3xl 2xl:rounded-[32px] ${className}`}
      style={{ borderColor: SVS_BORDER }}
    >
      {/* Zomato graphic slot — fixed ratio so every card matches */}
      <div className="flex aspect-[26/18] w-full min-h-0 shrink-0 items-center justify-center overflow-hidden px-2.5 pt-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div
        className="flex min-h-0 flex-1 items-center justify-center px-2 pb-2 text-center text-sm font-normal leading-tight xl:text-[17px] xl:leading-5"
        style={{ color: SVS_SLATE }}
      >
        {label}
      </div>
    </div>
  );
}

function MobileFeatureCard({
  src,
  label,
  className = "",
}: FeatureCardProps) {
  return (
    <div
      className={`h-[100px] w-full rounded-2xl border bg-white py-1.5 shadow-md ${className}`}
      style={{ borderColor: SVS_BORDER, transformOrigin: "top left" }}
    >
      <div
        className="flex h-full flex-col items-center justify-between gap-0.5"
        style={{ color: SVS_SLATE }}
      >
        <div className="flex w-full flex-1 items-center justify-center px-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="max-h-[58px] max-w-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="px-1 pb-1 text-center text-[12px] font-normal leading-tight">
          {label}
        </div>
      </div>
    </div>
  );
}

function PlayStoreInstallScreen() {
  return (
    <div
      className="pointer-events-none absolute inset-x-[11%] top-[7.5%] bottom-[2%] z-20 flex flex-col overflow-hidden rounded-[12%/7%] bg-white"
      aria-hidden
    >
      {/* Play Store chrome */}
      <div className="flex shrink-0 items-center gap-1.5 border-b border-black/[0.06] bg-[#f8f9fa] px-2 py-1.5 xl:px-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/google-play-icon.svg"
          alt=""
          className="h-3 w-3 object-contain xl:h-3.5 xl:w-3.5"
        />
        <span className="text-[7px] font-semibold text-[#202124] xl:text-[8px]">
          Google Play
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2.5 pb-2 pt-2.5 xl:px-3 xl:pt-3">
        <div className="flex shrink-0 gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[0.65rem] bg-svs-cream shadow-sm ring-1 ring-black/[0.06] xl:h-11 xl:w-11">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/SVS FOOD LOGO.png"
              alt=""
              className="h-[78%] w-[78%] object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-[9px] font-bold leading-tight text-[#202124] xl:text-[10px]">
              SVS Food
            </p>
            <p className="mt-0.5 text-[6.5px] font-semibold text-[#01875f] xl:text-[7.5px]">
              SVS FOOD Private Limited
            </p>
            <p className="mt-0.5 text-[6px] text-[#5f6368] xl:text-[6.5px]">
              Contains ads · In-app purchases
            </p>
          </div>
        </div>

        <div className="mt-2 flex shrink-0 items-center justify-between border-y border-black/[0.06] py-1.5 text-center">
          <div className="flex-1">
            <p className="text-[7.5px] font-bold text-[#202124] xl:text-[8.5px]">4.6 ★</p>
            <p className="text-[5.5px] text-[#5f6368]">2K reviews</p>
          </div>
          <div className="h-4 w-px bg-black/10" />
          <div className="flex-1">
            <p className="text-[7.5px] font-bold text-[#202124] xl:text-[8.5px]">10K+</p>
            <p className="text-[5.5px] text-[#5f6368]">Downloads</p>
          </div>
          <div className="h-4 w-px bg-black/10" />
          <div className="flex-1">
            <p className="text-[7.5px] font-bold text-[#202124] xl:text-[8.5px]">3+</p>
            <p className="text-[5.5px] text-[#5f6368]">Rated for</p>
          </div>
        </div>

        <div className="mt-2 flex shrink-0 items-center justify-center rounded-full bg-[#01875f] py-1.5 text-[7.5px] font-bold text-white shadow-sm xl:text-[8.5px]">
          Install
        </div>

        {/* Install art — stays inside phone screen */}
        <div className="relative mt-2 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-svs-cream to-[#ffe8dc] px-2 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cheesyBurger.png"
            alt=""
            className="h-12 w-12 object-contain drop-shadow-md xl:h-14 xl:w-14"
          />
          <p className="mt-1 text-center text-[7.5px] font-extrabold leading-tight text-svs-ink xl:text-[8.5px]">
            Get the SVS Food app
          </p>
          <p className="mt-0.5 max-w-[14ch] text-center text-[6px] leading-snug text-svs-ink/55 xl:text-[6.5px]">
            Order faster. Track live. Install now on Google Play.
          </p>
          <div className="mt-1 flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[5.5px] font-bold text-svs-orange shadow-sm ring-1 ring-svs-orange/15 xl:text-[6.5px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/google-play-icon.svg"
              alt=""
              className="h-2 w-2"
            />
            Available on Play Store
          </div>
        </div>
      </div>
    </div>
  );
}

/** Desktop layout — mirrors Zomato homepage “What’s waiting for you on the app?” */
function DesktopFeatures() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const [risen, setRisen] = useState(false);

  useEffect(() => {
    const el = phoneRef.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setRisen(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        setRisen(entry.isIntersecting);
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-white px-4 py-8 sm:py-10">
      <div className="flex w-full max-w-[1024px] flex-col items-center gap-3 xl:gap-4">
        <div className="flex flex-col items-center text-center">
          <h2
            id="app-features-heading"
            className="w-full max-w-[680px] whitespace-pre-line text-[2rem] font-semibold leading-tight text-svs-orange lg:text-5xl xl:text-6xl"
          >
            What’s waiting for you
            <br />
            on the app?
          </h2>
          <p
            className="mt-2 w-full max-w-[520px] text-base font-light text-svs-ink/60 md:text-lg xl:mt-3 xl:text-xl"
          >
            Our app is packed with features made for pure-veg food lovers —
            fresh, fast, and chemical-free.
          </p>
        </div>

        <div className="relative mx-auto grid aspect-[2/1] w-full max-w-[920px] grid-cols-6 grid-rows-2 gap-3 xl:max-w-[1024px] xl:gap-4">
          {/* Left cluster — Zomato stagger: scale 0.68 + offset toward phone */}
          <div className="relative col-span-2 col-start-1 row-span-2 grid h-full grid-cols-2 grid-rows-2 gap-3 xl:gap-4">
            <FeatureCard
              src={FEATURE_ICON.planAParty}
              label={
                <>
                  Plan a
                  <br />
                  Party
                </>
              }
              className="origin-bottom-right scale-[0.68] xl:scale-[0.72]"
            />
            <FeatureCard
              src={FEATURE_ICON.onlyVeg}
              label={<>Only Veg</>}
              className="origin-bottom-left -translate-y-5 scale-[0.68] xl:scale-[0.72]"
            />
            <FeatureCard
              src={FEATURE_ICON.fastDelivery}
              label={
                <>
                  Fast
                  <br />
                  Delivery
                </>
              }
              className="origin-top-right translate-x-5 scale-[0.68] xl:scale-[0.72]"
            />
            <FeatureCard
              src={FEATURE_ICON.giftCards}
              label={<>Gift Cards</>}
              className="origin-top-left translate-x-5 -translate-y-5 scale-[0.68] xl:scale-[0.72]"
            />
          </div>

          {/* Center phone + Play Store art — rises into view */}
          <div
            ref={phoneRef}
            className="relative col-span-2 col-start-3 row-span-2 flex h-full items-end justify-center overflow-hidden [border-radius:0_0_50%_50%/0_0_2.5rem_2.5rem] xl:[border-radius:0_0_50%_50%/0_0_3.25rem_3.25rem]"
          >
            <div
              className={`relative w-[98%] max-w-[340px] will-change-transform transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] xl:w-full xl:max-w-[380px] ${
                risen ? "translate-y-[-40%]" : "translate-y-[110%]"
              }`}
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 0%, black 86%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 0%, black 86%, transparent 100%)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PHONE_FRAME}
                alt=""
                className="relative z-10 block h-auto w-full select-none"
                loading="lazy"
              />
              <PlayStoreInstallScreen />
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[18%] bg-[linear-gradient(to_top,#FFFFFF_0%,rgba(255,255,255,0.75)_55%,rgba(255,255,255,0)_100%)]"
              aria-hidden
            />
          </div>

          {/* Right cluster — mirrored Zomato stagger */}
          <div className="relative col-span-2 col-start-5 row-span-2 grid h-full -translate-x-5 grid-cols-2 grid-rows-2 gap-3 xl:gap-4">
            <FeatureCard
              src={FEATURE_ICON.freshBuns}
              label={
                <>
                  Fresh
                  <br />
                  Buns
                </>
              }
              className="origin-bottom-right -translate-x-5 scale-[0.68] xl:scale-[0.72]"
            />
            <FeatureCard
              src={FEATURE_ICON.offers}
              label={<>Offers</>}
              className="origin-bottom-left -translate-x-5 -translate-y-5 scale-[0.68] xl:scale-[0.72]"
            />
            <FeatureCard
              src={FEATURE_ICON.chemicalFree}
              label={
                <>
                  Chemical
                  <br />
                  Free
                </>
              }
              className="origin-top-right scale-[0.68] xl:scale-[0.72]"
            />
            <FeatureCard
              src={FEATURE_ICON.combos}
              label={<>Combos</>}
              className="origin-top-left -translate-y-5 scale-[0.68] xl:scale-[0.72]"
            />
          </div>

          <div className="pointer-events-none absolute -bottom-10 left-0 h-[100px] w-full bg-[linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.5)_70%,rgba(255,255,255,0)_100%)]" />
        </div>
      </div>
    </div>
  );
}

/** Mobile layout — 3-column staggered grid */
function MobileFeatures() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col gap-8 rounded-t-3xl bg-white pt-16">
      <div className="mb-12 flex w-full flex-col items-center justify-center">
        <h2
          className="w-8/12 whitespace-pre-line text-center text-[26px] font-semibold leading-8 text-svs-orange"
        >
          What’s waiting for you on the app?
        </h2>
        <p
          className="mt-4 w-7/12 text-center text-sm font-light text-svs-ink/60"
        >
          Our app is packed with features made for pure-veg food lovers —
          fresh, fast, and chemical-free.
        </p>
      </div>

      <div className="mx-auto grid w-fit grid-cols-3 gap-4">
        <div className="flex w-[88px] flex-col gap-4">
          <MobileFeatureCard src={FEATURE_ICON.onlyVeg} label={<>Only Veg</>} />
          <MobileFeatureCard
            src={FEATURE_ICON.planAParty}
            label={
              <>
                Plan a
                <br />
                Party
              </>
            }
          />
          <MobileFeatureCard src={FEATURE_ICON.combos} label={<>Combos</>} />
        </div>
        <div className="flex w-[88px] -translate-y-8 flex-col gap-4">
          <MobileFeatureCard
            src={FEATURE_ICON.freshBuns}
            label={
              <>
                Fresh
                <br />
                Buns
              </>
            }
          />
          <MobileFeatureCard
            src={FEATURE_ICON.fastDelivery}
            label={
              <>
                Fast
                <br />
                Delivery
              </>
            }
          />
          <MobileFeatureCard src={FEATURE_ICON.offers} label={<>Offers</>} />
        </div>
        <div className="flex w-[88px] flex-col gap-4">
          <MobileFeatureCard
            src={FEATURE_ICON.chemicalFree}
            label={
              <>
                Chemical
                <br />
                Free
              </>
            }
          />
          <MobileFeatureCard src={FEATURE_ICON.giftCards} label={<>Gift Cards</>} />
          <MobileFeatureCard src={FEATURE_ICON.madeFresh} label={<>Made Fresh</>} />
        </div>
      </div>

      <p
        className="-mt-3 w-full text-center text-xl font-semibold text-svs-ink"
      >
        ...and a lot more
      </p>
    </div>
  );
}

export default function AppFeaturesSection() {
  return (
    <section
      id="app-features"
      aria-labelledby="app-features-heading"
      className="relative w-full min-h-[100dvh] bg-white"
    >
      <div className="sm:hidden">
        <MobileFeatures />
      </div>
      <div className="hidden bg-white sm:block">
        <DesktopFeatures />
      </div>
    </section>
  );
}
