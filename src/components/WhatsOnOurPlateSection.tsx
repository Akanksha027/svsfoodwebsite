"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronRight, Play, Volume2 } from "lucide-react";

/** Top 3 Recommended burgers from live svsfood.com/products/burgers */
const SPECIALTIES = [
  {
    id: "jain",
    name: "Jain Burger",
    description:
      "A classic Jain burger with raw banana patty and sauces — pure, thoughtful flavour without onion or garlic.",
    image: "/images/tikki.png",
    href: "/menu",
  },
  {
    id: "maharaja",
    name: "Maharaja Burger",
    description:
      "Crispy aloo & paneer patty with special sauce — the royal bite that keeps topping the recommend list.",
    image: "/images/cheesyBurger.png",
    href: "/menu",
  },
  {
    id: "jumbo-paneer",
    name: "Jumbo Paneer",
    description:
      "Loaded with a jumbo thick paneer patty for the ultimate big bite — rich, hearty, and made to share.",
    image: "/images/hamburgerrr.png",
    href: "/menu",
  },
] as const;

const TABS = ["Classics", "Specialties", "Spicy"] as const;

const FLOATS = [
  {
    src: "/images/tomato.png",
    className:
      "absolute left-[2%] top-[8%] hidden h-16 w-16 sm:block md:left-[4%] md:top-[10%] md:h-20 md:w-20 lg:h-24 lg:w-24",
    delay: 0,
  },
  {
    src: "/images/lettuce.png",
    className:
      "absolute left-[8%] top-[28%] hidden h-14 w-14 -rotate-[18deg] md:block lg:left-[6%] lg:h-16 lg:w-16",
    delay: 0.4,
  },
  {
    src: "/images/cheese.png",
    className:
      "absolute bottom-[18%] left-[3%] hidden h-14 w-14 rotate-12 sm:block md:h-16 md:w-16",
    delay: 0.8,
  },
  {
    src: "/images/tomato.png",
    className:
      "absolute right-[3%] top-[12%] hidden h-14 w-14 rotate-[22deg] sm:block md:right-[5%] md:h-16 md:w-16 lg:h-20 lg:w-20",
    delay: 0.2,
  },
  {
    src: "/images/lettuce.png",
    className:
      "absolute bottom-[22%] right-[4%] hidden h-16 w-16 -rotate-[8deg] md:block lg:right-[6%]",
    delay: 0.6,
  },
  {
    src: "/images/tikki.png",
    className:
      "absolute right-[10%] top-[36%] hidden h-12 w-12 rotate-[12deg] opacity-80 lg:block",
    delay: 1,
  },
] as const;

export default function WhatsOnOurPlateSection() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Specialties");
  const [featured, setFeatured] = useState(1);

  return (
    <section className="relative isolate w-full overflow-hidden bg-[#f7f4ef] py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 20% 10%, rgba(241,106,52,0.06), transparent 55%), radial-gradient(ellipse 70% 45% at 85% 20%, rgba(26,26,26,0.04), transparent 50%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(241,106,52,0.05), transparent 55%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      {FLOATS.map((item, i) => (
        <motion.div
          key={`${item.src}-${i}`}
          className={`pointer-events-none select-none ${item.className}`}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
          aria-hidden
        >
          <Image
            src={item.src}
            alt=""
            width={120}
            height={120}
            className="h-full w-full object-contain drop-shadow-[0_10px_18px_rgba(26,26,26,0.12)]"
          />
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto max-w-[1100px] px-5 sm:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-tight tracking-tight text-svs-ink">
            What&apos;s on our Plate
          </h2>
          <p className="mt-3 text-sm font-medium text-svs-ink/45 sm:text-[15px]">
            Our top recommended burger specialties — fresh from the grill
          </p>

          <nav
            className="mt-8 flex items-center justify-center gap-8 sm:gap-10"
            aria-label="Plate categories"
          >
            {TABS.map((item) => {
              const active = item === tab;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`relative pb-2 text-[13px] font-semibold tracking-wide transition-colors sm:text-sm ${
                    active
                      ? "text-svs-ink"
                      : "text-svs-ink/40 hover:text-svs-ink/65"
                  }`}
                >
                  {item}
                  {active ? (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-svs-orange" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </header>

        <div className="relative mt-12 grid grid-cols-1 gap-12 sm:mt-14 sm:grid-cols-3 sm:gap-6 lg:mt-16 lg:gap-10">
          {SPECIALTIES.map((item, index) => {
            const isCenter = index === featured;
            return (
              <article
                key={item.id}
                className="group relative flex flex-col items-center text-center"
              >
                <button
                  type="button"
                  onClick={() => setFeatured(index)}
                  className="relative mx-auto aspect-square w-[78%] max-w-[240px] overflow-hidden rounded-full bg-white shadow-[0_18px_40px_rgba(26,26,26,0.1)] ring-1 ring-black/5 transition-transform duration-500 group-hover:scale-[1.03] sm:w-[88%] lg:max-w-[260px]"
                  aria-label={`View ${item.name}`}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center p-3"
                    sizes="260px"
                  />
                  {isCenter ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-white/25 backdrop-blur-[1px]">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-svs-ink shadow-md ring-1 ring-black/5">
                        <Play
                          className="ml-0.5 h-6 w-6 fill-current"
                          strokeWidth={1.5}
                        />
                      </span>
                    </span>
                  ) : null}
                </button>

                <h3 className="mt-7 font-serif text-xl font-semibold tracking-tight text-svs-ink sm:text-[1.35rem]">
                  {item.name}
                </h3>
                <p className="mt-2.5 max-w-[240px] text-[13px] leading-relaxed text-svs-ink/45 sm:text-sm">
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-svs-orange transition-colors hover:text-svs-orange-dark"
                >
                  Order now
                </Link>
              </article>
            );
          })}

          <button
            type="button"
            onClick={() => setFeatured((p) => (p + 1) % SPECIALTIES.length)}
            aria-label="Next specialty"
            className="absolute -right-2 top-[18%] hidden h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/55 text-svs-ink/40 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-svs-ink lg:flex xl:-right-6"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="relative mx-auto mt-14 max-w-xl sm:mt-16">
          <div className="flex items-center justify-between rounded-full bg-white/55 px-5 py-2.5 text-svs-ink/45 shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-xs font-medium tabular-nums">
              <Play className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
              <span>0:07 / 0:07</span>
            </div>
            <Volume2 className="h-4 w-4" strokeWidth={1.6} />
          </div>
          <div className="relative mx-4 mt-2 h-[2px] rounded-full bg-svs-ink/10">
            <span className="absolute inset-y-0 left-0 w-full rounded-full bg-svs-ink/25" />
            <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow ring-1 ring-black/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
