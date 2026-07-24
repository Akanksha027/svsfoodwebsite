"use client";

import Image from "next/image";
import Link from "next/link";
import { type RefObject } from "react";

/** Top 3 Recommended burgers from live svsfood.com/products/burgers */
const SPECIALTIES = [
  {
    id: "jain",
    name: "Jain Burger",
    description:
      "A classic Jain burger with raw banana patty and sauces — pure, thoughtful flavour without onion or garlic.",
    image: "/combo/vegBurgerDairy.png",
    href: "/menu",
    receivesFlight: false,
  },
  {
    id: "maharaja",
    name: "Maharaja Burger",
    description:
      "Crispy aloo & paneer patty with special sauce — the royal bite that keeps topping the recommend list.",
    image: "/nobg/burger.png",
    href: "/menu",
    receivesFlight: true,
  },
  {
    id: "jumbo-paneer",
    name: "Jumbo Paneer",
    description:
      "Loaded with a jumbo thick paneer patty for the ultimate big bite — rich, hearty, and made to share.",
    image: "/combo/burgerVada.png",
    href: "/menu",
    receivesFlight: false,
  },
] as const;

const FLOATS = [
  {
    id: "left-tomato",
    src: "/images/tomato.png",
    className:
      "absolute left-[-4%] top-[4%] z-[2] hidden h-16 w-16 opacity-50 sm:left-[1%] sm:block sm:h-28 sm:w-28 sm:opacity-100 md:left-[2%] md:h-40 md:w-40 lg:left-[3%] lg:h-52 lg:w-52",
  },
  {
    id: "left-cheese",
    src: "/images/cheese.png",
    className:
      "absolute left-[-2%] top-[38%] z-[2] hidden h-14 w-14 -rotate-[16deg] opacity-50 sm:left-[2%] sm:block sm:h-24 sm:w-24 sm:opacity-100 md:left-[3%] md:h-36 md:w-36 lg:left-[4%] lg:h-44 lg:w-44",
  },
  {
    id: "left-lettuce",
    src: "/images/lettuce.png",
    className:
      "absolute bottom-[6%] left-[-4%] z-[2] hidden h-14 w-14 rotate-[10deg] opacity-50 sm:left-[1%] sm:block sm:h-24 sm:w-24 sm:opacity-100 md:left-[2%] md:h-36 md:w-36 lg:left-[3%] lg:h-48 lg:w-48",
  },
  {
    id: "right-cheese",
    src: "/images/cheese.png",
    className:
      "absolute right-[-4%] top-[4%] z-[2] hidden h-16 w-16 rotate-[18deg] opacity-50 sm:right-[1%] sm:block sm:h-28 sm:w-28 sm:opacity-100 md:right-[2%] md:h-40 md:w-40 lg:right-[3%] lg:h-52 lg:w-52",
  },
  {
    id: "right-tomato",
    src: "/images/tomato.png",
    className:
      "absolute bottom-[6%] right-[-4%] z-[2] hidden h-14 w-14 rotate-[12deg] opacity-50 sm:right-[1%] sm:block sm:h-24 sm:w-24 sm:opacity-100 md:right-[2%] md:h-36 md:w-36 lg:right-[3%] lg:h-48 lg:w-48",
  },
] as const;

type WhatsOnOurPlateSectionProps = {
  landingRef?: RefObject<HTMLDivElement | null>;
};

export default function WhatsOnOurPlateSection({
  landingRef,
}: WhatsOnOurPlateSectionProps = {}) {
  return (
    <section
      className="relative z-20 isolate w-full overflow-hidden bg-transparent py-12 sm:py-20 lg:min-h-[100svh] lg:py-24"
      data-theory-snap
    >
      {FLOATS.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-none select-none ${item.className}`}
          aria-hidden
        >
          <Image
            src={item.src}
            alt=""
            width={220}
            height={220}
            className="h-full w-full object-contain drop-shadow-[0_14px_24px_rgba(26,26,26,0.18)] [mix-blend-mode:screen]"
            priority
          />
        </div>
      ))}

      <div className="relative z-10 mx-auto max-w-[1100px] px-5 sm:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-tight tracking-tight text-svs-ink">
            What&apos;s on our Plate
          </h2>
          <p className="mt-3 text-sm font-medium text-svs-ink/45 sm:text-[15px]">
            Our top recommended burger specialties — fresh from the grill
          </p>
        </header>

        <div className="relative mt-10 grid grid-cols-1 gap-10 sm:mt-14 sm:grid-cols-3 sm:gap-6 lg:mt-16 lg:gap-8">
          {SPECIALTIES.map((item, index) => {
            const isLanding = item.receivesFlight;

            return (
              <article
                key={item.id}
                className={`group relative flex flex-col items-center text-center ${
                  isLanding ? "order-first sm:order-none" : ""
                }`}
              >
                <div className="relative mx-auto flex h-[200px] w-full max-w-[240px] items-center justify-center sm:h-[260px] sm:max-w-[280px] lg:h-[300px] lg:max-w-[320px] [perspective:900px]">
                  {isLanding ? (
                    <div
                      ref={landingRef}
                      className="relative h-full w-full"
                      aria-label="Maharaja burger landing spot"
                    />
                  ) : (
                    <div className="h-full w-full">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={360}
                        height={360}
                        className="h-full w-full object-contain drop-shadow-[0_28px_40px_rgba(26,26,26,0.22)] [mix-blend-mode:screen] [transform:rotateX(18deg)] transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="320px"
                        priority={index === 0}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mt-6 font-serif text-xl font-semibold tracking-tight text-svs-ink sm:text-[1.35rem]">
                    {item.name}
                  </h3>
                  <p className="mt-2.5 max-w-[240px] text-[13px] leading-relaxed text-svs-ink/45 sm:text-sm">
                    {item.description}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.16em] text-svs-orange transition-colors hover:text-svs-orange-dark"
                  >
                    Order now
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
