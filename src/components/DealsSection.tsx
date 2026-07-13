"use client";

import Image from "next/image";
import { useEffect, useRef, type RefObject } from "react";

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
        indices: number[]
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
    <section className="w-full bg-white py-10 sm:py-14 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 font-sans overflow-hidden">
      <div className="w-full max-w-[1500px] mx-auto flex flex-col gap-8 sm:gap-10 md:gap-12">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3 sm:gap-4 px-1">
          <h2 className="text-[1.75rem] sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#1a1a1a] tracking-tight leading-tight">
            Hot Burgers, Hotter Deals
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl">
            From shareable combos to solo cravings, pick the offer that matches
            your hunger.
          </p>
        </div>

        {/* First Row: Two Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 w-full">
          {/* Card 1: Red */}
          <div
            ref={card1Ref}
            className="relative w-full min-h-[360px] sm:min-h-[400px] md:min-h-[460px] lg:min-h-[589px] rounded-[1.5rem] sm:rounded-[2rem] bg-[#f16a35] text-white p-5 sm:p-8 md:p-12 flex flex-col overflow-hidden shadow-sm"
          >
            <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:gap-8 pb-28 sm:pb-36">
              <h3 className="text-2xl sm:text-3xl font-black tracking-wide">
                Spicy Duo Deal
              </h3>
              <ul className="flex flex-col gap-2 sm:gap-3 ml-5 list-disc text-base sm:text-lg font-medium">
                <li>1 Classic Peri Peri Burger</li>
                <li>1 Spicy Paneer Burger</li>
              </ul>
              <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pr-0 sm:pr-4">
                <button className="bg-white text-black font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-full text-sm hover:bg-gray-100 transition-colors shadow-sm">
                  Order Now
                </button>
                <div className="text-base sm:text-xl font-medium tracking-wide">
                  <span className="font-black text-xl sm:text-2xl">₹399</span>{" "}
                  - Save ₹80
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-0 pointer-events-none">
              <div className="absolute bottom-0 left-[-30%] sm:left-[-25%] w-[95%] sm:w-[100%] lg:w-[110%] translate-y-[52%] sm:translate-y-[50%]">
                <div
                  ref={(el) => {
                    burgerRefs.current[0] = el;
                  }}
                  className="w-full origin-center"
                >
                  <Image
                    src="/images/hamburgerrr.png"
                    alt="Burger"
                    width={600}
                    height={600}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
              <div className="absolute bottom-0 right-[-30%] sm:right-[-25%] w-[95%] sm:w-[100%] lg:w-[110%] translate-y-[52%] sm:translate-y-[50%]">
                <div
                  ref={(el) => {
                    burgerRefs.current[1] = el;
                  }}
                  className="w-full origin-center"
                >
                  <Image
                    src="/images/hamburgerrr.png"
                    alt="Burger"
                    width={600}
                    height={600}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Yellow */}
          <div
            ref={card2Ref}
            className="relative w-full min-h-[360px] sm:min-h-[400px] md:min-h-[460px] lg:min-h-[589px] rounded-[1.5rem] sm:rounded-[2rem] bg-[#FFC000] text-black p-5 sm:p-8 md:p-12 flex flex-col overflow-hidden shadow-sm"
          >
            <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:gap-8 pb-28 sm:pb-36">
              <h3 className="text-2xl sm:text-3xl font-black tracking-wide">
                Cheese Lovers Pair
              </h3>
              <ul className="flex flex-col gap-2 sm:gap-3 ml-5 list-disc text-base sm:text-lg font-medium">
                <li>1 Double Cheese Burger</li>
                <li>1 Loaded Fries</li>
              </ul>
              <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pr-0 sm:pr-4">
                <button className="bg-white text-black font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-full text-sm hover:bg-gray-100 transition-colors shadow-sm">
                  Order Now
                </button>
                <div className="text-base sm:text-xl font-medium tracking-wide">
                  <span className="font-black text-xl sm:text-2xl">₹349</span>{" "}
                  - Save ₹70
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-0 pointer-events-none">
              <div className="absolute bottom-0 left-[-30%] sm:left-[-25%] w-[95%] sm:w-[100%] lg:w-[110%] translate-y-[52%] sm:translate-y-[50%]">
                <div
                  ref={(el) => {
                    burgerRefs.current[2] = el;
                  }}
                  className="w-full origin-center"
                >
                  <Image
                    src="/images/hamburgerrr.png"
                    alt="Burger"
                    width={600}
                    height={600}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
              <div className="absolute bottom-0 right-[-30%] sm:right-[-25%] w-[95%] sm:w-[100%] lg:w-[110%] translate-y-[52%] sm:translate-y-[50%]">
                <div
                  ref={(el) => {
                    burgerRefs.current[3] = el;
                  }}
                  className="w-full origin-center"
                >
                  <Image
                    src="/images/hamburgerrr.png"
                    alt="Burger"
                    width={600}
                    height={600}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Full Width Card */}
        <div
          ref={card3Ref}
          className="relative w-full min-h-[380px] sm:min-h-[440px] md:min-h-[560px] lg:min-h-[828px] mx-auto rounded-[1.5rem] sm:rounded-[2rem] bg-[#1c1c1e] text-white p-5 sm:p-8 md:p-10 lg:p-20 flex flex-col overflow-hidden shadow-sm"
        >
          <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:gap-10 w-full pb-32 sm:pb-40 md:pb-48">
            <h3 className="text-2xl sm:text-3xl lg:text-[40px] font-black tracking-wide leading-tight max-w-[800px]">
              Family Feast Combo
            </h3>
            <ul className="flex flex-col gap-2 sm:gap-4 ml-5 list-disc text-base sm:text-lg lg:text-2xl font-medium text-gray-200 max-w-[800px]">
              <li>2 Signature Smash Burgers</li>
              <li>2 Soft Drinks + 1 Large Fries</li>
            </ul>
            <div className="mt-2 sm:mt-4 lg:mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 w-full">
              <button className="bg-white text-black font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full text-sm sm:text-base lg:text-lg hover:bg-gray-100 transition-colors shadow-sm w-fit">
                Order Now
              </button>
              <div className="text-lg sm:text-xl lg:text-3xl font-medium tracking-wide sm:text-right">
                <span className="font-black text-xl sm:text-2xl lg:text-[40px]">
                  ₹599
                </span>{" "}
                - Save ₹120
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0 pointer-events-none">
            <div className="absolute bottom-0 left-[-20%] sm:left-[-15%] w-[80%] sm:w-[85%] lg:w-[90%] translate-y-[52%] sm:translate-y-[50%]">
              <div
                ref={(el) => {
                  burgerRefs.current[4] = el;
                }}
                className="w-full origin-center"
              >
                <Image
                  src="/images/hamburgerrr.png"
                  alt="Burger"
                  width={1000}
                  height={1000}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
            <div className="absolute bottom-0 right-[-20%] sm:right-[-15%] w-[80%] sm:w-[85%] lg:w-[90%] translate-y-[52%] sm:translate-y-[50%]">
              <div
                ref={(el) => {
                  burgerRefs.current[5] = el;
                }}
                className="w-full origin-center"
              >
                <Image
                  src="/images/hamburgerrr.png"
                  alt="Burger"
                  width={1000}
                  height={1000}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
