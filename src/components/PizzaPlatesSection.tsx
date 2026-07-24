"use client";

import Image from "next/image";
import Link from "next/link";

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

function PizzaCard({
  pizza,
  index,
}: {
  pizza: (typeof PIZZAS)[number];
  index: number;
}) {
  return (
    <article className="flex w-full flex-col items-center text-center">
      <div className="relative mx-auto aspect-square w-full max-w-[220px] sm:max-w-[340px] lg:max-w-[380px]">
        <Image
          src={pizza.image}
          alt={pizza.name}
          fill
          className="object-contain object-center drop-shadow-[0_16px_32px_rgba(26,26,26,0.22)] [mix-blend-mode:screen]"
          sizes="380px"
          priority={index === 0}
        />
      </div>

      <div className="mt-3 sm:mt-4">
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
      </div>
    </article>
  );
}

export default function PizzaPlatesSection() {
  return (
    <section
      className="relative flex min-h-0 w-full items-center overflow-hidden bg-transparent py-12 sm:min-h-[100svh] sm:py-16 lg:py-20"
      data-theory-snap
    >
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 z-0 hidden h-[320px] w-[220px] sm:block sm:-bottom-20 sm:-left-12 sm:h-[560px] sm:w-[400px] lg:-bottom-28 lg:-left-16 lg:h-[920px] lg:w-[720px]"
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
      </div>

      <div
        className="pointer-events-none absolute -top-10 right-0 z-0 hidden h-[320px] w-[220px] sm:block sm:-top-20 sm:h-[560px] sm:w-[400px] lg:-top-28 lg:h-[920px] lg:w-[720px]"
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
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <header className="mx-auto mb-4 max-w-2xl text-center sm:mb-5">
          <h2 className="font-serif text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-tight tracking-tight text-svs-ink">
            Fresh from the Oven
          </h2>
          <p className="mt-2 text-sm font-medium text-svs-ink/45 sm:text-[15px]">
            Our pizzas — top view, just like they leave the kitchen
          </p>
        </header>

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
