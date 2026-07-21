"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";

function DealImagePair({
  src,
  alt,
  refs,
  indices,
  blend = false,
  size = "default",
}: {
  src: string;
  alt: string;
  refs: MutableRefObject<(HTMLDivElement | null)[]>;
  indices: [number, number];
  blend?: boolean;
  size?: "default" | "pizza" | "vada";
}) {
  const blendClass = blend ? "mix-blend-multiply" : "";
  // Greatly increase max-h on all mobile/tablet screens so images can scale up freely
  const imgClass = `w-full h-auto max-h-[380px] sm:max-h-[460px] md:max-h-[540px] lg:max-h-none object-contain ${blendClass}`;

  if (size === "pizza") {
    return (
      <div className="absolute inset-x-0 bottom-0 h-[42%] sm:h-[46%] md:h-[50%] lg:h-[55%] pointer-events-none">
        <div className="absolute bottom-0 left-[-25%] sm:left-[-20%] md:left-[-15%] lg:left-[-4%] w-[85%] sm:w-[80%] md:w-[75%] lg:w-[68%] translate-y-[18%] sm:translate-y-[22%] lg:translate-y-[28%] z-10">
          <div
            ref={(el) => {
              refs.current[indices[0]] = el;
            }}
            className="w-full origin-center"
          >
            <Image
              src={src}
              alt={alt}
              width={1000}
              height={1000}
              className={imgClass}
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 80vw, 35vw"
            />
          </div>
        </div>
        <div className="absolute bottom-0 right-[-25%] sm:right-[-20%] md:right-[-15%] lg:right-[-4%] w-[85%] sm:w-[80%] md:w-[75%] lg:w-[68%] translate-y-[20%] sm:translate-y-[24%] lg:translate-y-[30%] z-20">
          <div
            ref={(el) => {
              refs.current[indices[1]] = el;
            }}
            className="w-full origin-center"
          >
            <Image
              src={src}
              alt={alt}
              width={1000}
              height={1000}
              className={imgClass}
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 80vw, 35vw"
            />
          </div>
        </div>
      </div>
    );
  }

  // Determine positions and widths based on size
  const isVada = size === "vada";
  
  // Maintain the strong overlap across sm and md
  const leftClass = isVada 
    ? "left-[-12%] sm:left-[-12%] md:left-[-10%]"
    : "left-[-5%] sm:left-[-5%] md:left-[-4%]";
    
  const rightClass = isVada 
    ? "right-[-12%] sm:right-[-12%] md:right-[-10%]"
    : "right-[-5%] sm:right-[-5%] md:right-[-4%]";
    
  // Keep widths massive on sm and md
  const widthClass = isVada
    ? "w-[85%] sm:w-[85%] md:w-[82%]"
    : "w-[72%] sm:w-[72%] md:w-[68%]";

  return (
    <div className="absolute inset-x-0 bottom-0 h-[40%] sm:h-[44%] md:h-[48%] lg:h-[52%] pointer-events-none">
      <div className={`absolute bottom-0 ${leftClass} lg:left-[-15%] ${widthClass} lg:w-[90%] translate-y-[12%] sm:translate-y-[18%] lg:translate-y-[28%]`}>
        <div
          ref={(el) => {
            refs.current[indices[0]] = el;
          }}
          className="w-full origin-center"
        >
          <Image
            src={src}
            alt={alt}
            width={600}
            height={600}
            className={imgClass}
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 65vw, 30vw"
          />
        </div>
      </div>
      <div className={`absolute bottom-0 ${rightClass} lg:right-[-15%] ${widthClass} lg:w-[90%] translate-y-[14%] sm:translate-y-[20%] lg:translate-y-[28%]`}>
        <div
          ref={(el) => {
            refs.current[indices[1]] = el;
          }}
          className="w-full origin-center"
        >
          <Image
            src={src}
            alt={alt}
            width={600}
            height={600}
            className={imgClass}
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 65vw, 30vw"
          />
        </div>
      </div>
    </div>
  );
}

export default function DealsSection() {
  const burgerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const triggerPoint = window.innerHeight * 0.4;

      const updateBurgers = (
        cardRef: RefObject<HTMLDivElement | null>,
        indices: number[],
      ) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();

        let visibleScroll = triggerPoint - rect.top;
        if (visibleScroll < 0) visibleScroll = 0;

        const rotation = visibleScroll * 0.03;

        indices.forEach((idx) => {
          const el = burgerRefs.current[idx];
          if (el) el.style.transform = `rotate(${rotation}deg)`;
        });
      };

      updateBurgers(card1Ref, [0, 1]);
      updateBurgers(card2Ref, [2, 3]);
      updateBurgers(card3Ref, [4, 5]);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full bg-svs-white py-10 sm:py-14 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 font-sans overflow-hidden">
      <div className="w-full max-w-[1500px] mx-auto flex flex-col gap-8 sm:gap-10 md:gap-12">
        <div className="text-center flex flex-col items-center gap-3 sm:gap-4 px-1">
          <h2 className="text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] lg:text-[2rem] font-black text-svs-ink tracking-tight leading-tight">
            Hot Burgers, Hotter Deals
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-svs-ink/80 max-w-2xl">
            From shareable combos to solo cravings, pick the offer that matches
            your hunger.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 w-full">
          <div
            ref={card1Ref}
            className="relative w-full min-h-[320px] sm:min-h-[380px] md:min-h-[440px] lg:min-h-[589px] rounded-[1.5rem] sm:rounded-[2rem] bg-svs-orange text-white p-5 sm:p-8 md:p-12 flex flex-col overflow-hidden shadow-sm"
          >
            <div className="relative z-10 flex flex-col gap-3 sm:gap-5 lg:gap-8 pb-[38%] sm:pb-[40%] lg:pb-36">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide">
                Supreme Duo Deal
              </h3>
              <ul className="flex flex-col gap-1.5 sm:gap-2.5 ml-5 list-disc text-sm sm:text-base md:text-lg font-medium">
                <li>2 Supreme Burgers</li>
                <li>1 Soft Drink</li>
              </ul>
              <div className="mt-1 sm:mt-3">
                <Link
                  href="/menu"
                  className="bg-svs-white text-svs-ink font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-full text-sm hover:bg-svs-cream transition-colors shadow-sm inline-block text-center"
                >
                  Order Now
                </Link>
              </div>
            </div>
            <DealImagePair
              src="/combo/Supremee.png"
              alt="Supreme Burger"
              refs={burgerRefs}
              indices={[0, 1]}
            />
          </div>

          <div
            ref={card2Ref}
            className="relative w-full min-h-[320px] sm:min-h-[380px] md:min-h-[440px] lg:min-h-[589px] rounded-[1.5rem] sm:rounded-[2rem] bg-svs-yellow text-svs-ink p-5 sm:p-8 md:p-12 flex flex-col overflow-hidden shadow-sm"
          >
            <div className="relative z-10 flex flex-col gap-3 sm:gap-5 lg:gap-8 pb-[38%] sm:pb-[40%] lg:pb-36">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide">
                Burger Vada Pair
              </h3>
              <ul className="flex flex-col gap-1.5 sm:gap-2.5 ml-5 list-disc text-sm sm:text-base md:text-lg font-medium">
                <li>2 Burger Vadas</li>
                <li>1 Soft Drink</li>
              </ul>
              <div className="mt-1 sm:mt-3">
                <Link
                  href="/menu"
                  className="bg-svs-white text-svs-ink font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-full text-sm hover:bg-svs-cream transition-colors shadow-sm inline-block text-center"
                >
                  Order Now
                </Link>
              </div>
            </div>
            <DealImagePair
              src="/combo/burgerVada.png"
              alt="Burger Vada"
              refs={burgerRefs}
              indices={[2, 3]}
              blend
              size="vada"
            />
          </div>
        </div>

        <div
          ref={card3Ref}
          className="relative w-full min-h-[340px] sm:min-h-[400px] md:min-h-[520px] lg:min-h-[828px] mx-auto rounded-[1.5rem] sm:rounded-[2rem] bg-svs-ink text-white p-5 sm:p-8 md:p-10 lg:p-20 flex flex-col overflow-hidden shadow-sm"
        >
          <div className="relative z-10 flex flex-col gap-3 sm:gap-5 lg:gap-10 w-full pb-[42%] sm:pb-[44%] md:pb-48">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-[40px] font-black tracking-wide leading-tight max-w-[800px]">
              Family Feast Combo
            </h3>
            <ul className="flex flex-col gap-1.5 sm:gap-3 ml-5 list-disc text-sm sm:text-base md:text-lg lg:text-2xl font-medium text-white/80 max-w-[800px]">
              <li>2 Signature Smash Burgers</li>
              <li>2 Soft Drinks + 1 Large Fries</li>
            </ul>
            <div className="mt-1 sm:mt-3 lg:mt-8">
              <Link
                href="/menu"
                className="bg-svs-white text-svs-ink font-bold py-2.5 sm:py-3.5 px-6 sm:px-10 rounded-full text-sm sm:text-base lg:text-lg hover:bg-svs-cream transition-colors shadow-sm inline-block text-center"
              >
                Order Now
              </Link>
            </div>
          </div>
          <DealImagePair
            src="/combo/pizza.png"
            alt="Pizza"
            refs={burgerRefs}
            indices={[4, 5]}
            size="pizza"
          />
        </div>
      </div>
    </section>
  );
}
