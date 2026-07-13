import Image from "next/image";
import Navbar from "@/components/Navbar";
import HeroBurger from "@/components/HeroBurger";
import DeliveringSection from "@/components/DeliveringSection";
import Footer from "@/components/Footer";

const ingredientClass =
  "absolute z-[3] object-contain drop-shadow-lg pointer-events-none w-[72px] h-[72px] sm:w-[110px] sm:h-[110px] md:w-[150px] md:h-[150px] lg:w-[188px] lg:h-[188px]";

export default function Home() {
  return (
    <>
      <Navbar />

      <section
        className="relative w-full h-[100svh] min-h-[600px] flex flex-col items-center overflow-hidden bg-white pt-[72px] md:pt-[88px] lg:pt-[100px]"
        id="hero-section"
      >
        {/* Left side — kept at edges; smaller on mobile */}
        <Image
          src="/images/cheese.png"
          alt="Cheese"
          width={188}
          height={188}
          className={`${ingredientClass} top-[10%] left-[-4%] sm:left-[2%] lg:left-[18%] -rotate-[18deg] animate-float1`}
        />
        <Image
          src="/images/lettuce.png"
          alt="Lettuce"
          width={188}
          height={188}
          className={`${ingredientClass} top-[28%] left-[-2%] sm:left-[1%] lg:left-[5%] rotate-[12deg] animate-float2`}
        />
        <Image
          src="/images/tikki.png"
          alt="Tikki"
          width={188}
          height={188}
          className={`${ingredientClass} hidden sm:block top-[52%] left-[-3%] sm:left-[2%] lg:left-[9%] rotate-[8deg] animate-float3`}
        />
        <Image
          src="/images/tomato.png"
          alt="Tomato"
          width={188}
          height={188}
          className={`${ingredientClass} bottom-[6%] left-[-5%] sm:left-[1%] lg:left-[4%] -rotate-[10deg] animate-float4`}
        />

        {/* Right side */}
        <Image
          src="/images/tikki.png"
          alt="Tikki"
          width={188}
          height={188}
          className={`${ingredientClass} top-[10%] right-[-4%] sm:right-[2%] lg:right-[15%] rotate-[22deg] animate-float3`}
        />
        <Image
          src="/images/tomato.png"
          alt="Tomato"
          width={188}
          height={188}
          className={`${ingredientClass} top-[28%] right-[-2%] sm:right-[1%] lg:right-[8%] rotate-[15deg] animate-float4`}
        />
        <Image
          src="/images/cheese.png"
          alt="Cheese"
          width={188}
          height={188}
          className={`${ingredientClass} hidden sm:block top-[48%] right-[-3%] sm:right-[2%] lg:right-[16%] -rotate-[12deg] animate-float1`}
        />
        <Image
          src="/images/lettuce.png"
          alt="Lettuce"
          width={188}
          height={188}
          className={`${ingredientClass} bottom-[6%] right-[-5%] sm:right-[1%] lg:right-[8%] rotate-[18deg] animate-float2`}
        />

        <div
          className="relative z-10 w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10"
          id="hero-text"
        >
          <h1 className="text-[clamp(1.85rem,7vw,6rem)] font-extrabold leading-[1.15] text-[#03071e] max-w-[850px] tracking-tight pt-4 sm:pt-8 md:pt-[40px] lg:pt-[60px] mb-4 sm:mb-5 md:mb-[25px]">
            Your Burger Party Starts Here!
          </h1>
          <p className="text-[clamp(0.95rem,2.2vw,1.5rem)] text-[#4a5568] leading-relaxed mb-6 sm:mb-8 md:mb-10 max-w-[600px] mx-auto px-1">
            Gather your friends and family and enjoy the best burgers in town.
            Freshly made and delivered hot!
          </p>
          <a
            href="/menu"
            className="inline-flex items-center justify-center w-full max-w-[220px] sm:max-w-[240px] h-11 sm:h-12 px-6 sm:px-9 bg-[#FF003C] text-white text-base sm:text-[18px] lg:text-[20px] font-semibold rounded-full cursor-pointer no-underline transition-all duration-300 ease-in-out hover:bg-[#e60036] hover:-translate-y-0.5"
            id="hero-cta"
          >
            View Our Menu
          </a>
        </div>

        <HeroBurger />
      </section>

      <DeliveringSection />
      <Footer />
    </>
  );
}
