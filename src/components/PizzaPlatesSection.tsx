"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Real SVS pizza — local top-view asset.
 * (Only one pizza file in /public; both trays use it until a second is added.)
 */
const PIZZAS = [
  {
    id: "farmhouse",
    name: "Farmhouse Special",
    description:
      "Loaded paneer, peppers, olives & corn on a golden crust — served hot on our wooden tray.",
    image: "/combo/pizza.png",
    rotate: 0,
    href: "/menu",
  },
  {
    id: "classic",
    name: "Classic Veg Pizza",
    description:
      "Fresh from our kitchen — cheesy toppings on a crisp base, plated on the wooden tray.",
    image: "/combo/pizza.png",
    rotate: 28,
    href: "/menu",
  },
] as const;

const spinEase = [0.16, 1, 0.3, 1] as const;
const softEase = [0.25, 0.1, 0.25, 1] as const;

function PizzaOnTray({
  pizza,
  index,
  inView,
}: {
  pizza: (typeof PIZZAS)[number];
  index: number;
  inView: boolean;
}) {
  /** Left tray leans slightly right, right tray slightly left — stereo depth */
  const tiltY = index === 0 ? 10 : -10;
  const outX = 20;

  return (
    <article className="flex w-full flex-col items-center text-center">
      <div
        className="relative mx-auto aspect-square w-full max-w-[360px] sm:max-w-[400px] lg:max-w-[460px]"
        style={{
          perspective: "1100px",
          perspectiveOrigin: "50% 42%",
        }}
      >
        <motion.div
          className="relative h-full w-full will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
          initial={{
            rotateY: -360,
            rotateX: 42,
            z: -120,
            scale: 0.68,
            opacity: 0,
          }}
          animate={
            inView
              ? {
                  rotateY: tiltY,
                  rotateX: outX,
                  z: 88,
                  scale: 1.04,
                  opacity: 1,
                }
              : {
                  rotateY: -360,
                  rotateX: 42,
                  z: -120,
                  scale: 0.68,
                  opacity: 0,
                }
          }
          transition={{
            rotateY: {
              duration: 2.9,
              delay: inView ? 0.1 + index * 0.22 : 0,
              ease: spinEase,
            },
            rotateX: {
              duration: 2.4,
              delay: inView ? 0.1 + index * 0.22 : 0,
              ease: spinEase,
            },
            z: {
              duration: 2.4,
              delay: inView ? 0.1 + index * 0.22 : 0,
              ease: spinEase,
            },
            scale: {
              duration: 2.3,
              delay: inView ? 0.1 + index * 0.22 : 0,
              ease: spinEase,
            },
            opacity: {
              duration: 1.3,
              delay: inView ? 0.1 + index * 0.22 : 0,
              ease: "easeOut",
            },
          }}
        >
          {/* Ground shadow — sells the lift off the page */}
          <div
            className="absolute left-[14%] top-[72%] z-0 h-[14%] w-[58%] rounded-[50%] bg-black/18 blur-xl"
            style={{ transform: "translateZ(-40px) rotateX(78deg)" }}
            aria-hidden
          />

          {/* Tray + pizza — tilted toward viewer */}
          <div
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/tray.png"
                alt=""
                fill
                className="object-contain drop-shadow-[0_32px_48px_rgba(26,26,26,0.32)] [mix-blend-mode:screen]"
                sizes="460px"
                priority
                aria-hidden
              />
            </div>

            <div
              className="absolute z-10"
              style={{
                left: "8%",
                top: "1%",
                width: "76%",
                height: "76%",
                transform: "translateZ(28px)",
              }}
            >
              <Image
                src={pizza.image}
                alt={pizza.name}
                fill
                className="object-contain object-center drop-shadow-[0_18px_28px_rgba(26,26,26,0.35)] [mix-blend-mode:screen]"
                style={{
                  transform: `rotate(${pizza.rotate}deg)`,
                }}
                sizes="360px"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{
          duration: 0.8,
          delay: inView ? 1.1 + index * 0.15 : 0,
          ease: softEase,
        }}
      >
        <h3 className="mt-8 font-serif text-xl font-semibold tracking-tight text-svs-ink sm:text-[1.4rem]">
          {pizza.name}
        </h3>
        <p className="mx-auto mt-2.5 max-w-[280px] text-[13px] leading-relaxed text-svs-ink/45 sm:text-sm">
          {pizza.description}
        </p>
        <Link
          href={pizza.href}
          className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.16em] text-svs-orange transition-colors hover:text-svs-orange-dark"
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
      className="relative w-full overflow-visible bg-transparent py-16 sm:py-20 lg:py-24"
    >
      <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8">
        <motion.header
          className="mx-auto mb-12 max-w-2xl text-center sm:mb-14 lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.9, ease: softEase }}
        >
          <h2 className="font-serif text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-tight tracking-tight text-svs-ink">
            Fresh from the Oven
          </h2>
          <p className="mt-3 text-sm font-medium text-svs-ink/45 sm:text-[15px]">
            Our pizzas, served on the wooden tray — top view, just like they leave the kitchen
          </p>
        </motion.header>

        <div className="grid grid-cols-1 items-start gap-14 sm:grid-cols-2 sm:gap-10 lg:gap-16">
          {PIZZAS.map((pizza, index) => (
            <div
              key={pizza.id}
              className="relative flex justify-center px-2 py-4 sm:px-4 sm:py-6"
            >
              <PizzaOnTray pizza={pizza} index={index} inView={inView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
