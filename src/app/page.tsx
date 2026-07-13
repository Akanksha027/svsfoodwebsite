import Image from "next/image";
import Navbar from "@/components/Navbar";
import HeroBurger from "@/components/HeroBurger";
import DeliveringSection from "@/components/DeliveringSection";
import DealsSection from "@/components/DealsSection";
import JourneySection from "@/components/JourneySection";
import DeliveringMomentsSection from "@/components/DeliveringMomentsSection";
import Footer from "@/components/Footer";

const ingredientClass =
  "absolute z-[3] object-contain drop-shadow-lg pointer-events-none w-[56px] h-[56px] sm:w-[90px] sm:h-[90px] md:w-[140px] md:h-[140px] lg:w-[188px] lg:h-[188px]";

export default function Home() {
  return (
    <>
      <Navbar />

      <section
        className="relative w-full h-[100svh] min-h-[520px] max-h-[1100px] flex flex-col items-center overflow-hidden bg-white pt-[72px] md:pt-[88px] lg:pt-[100px]"
        id="hero-section"
      >
        {/* Left side */}
        <Image
          src="/images/cheese.png"
          alt="Cheese"
          width={188}
          height={188}
          className={`${ingredientClass} hidden md:block top-[10%] left-[-4%] lg:left-[12%] xl:left-[18%] -rotate-[18deg] animate-float1`}
        />
        <Image
          src="/images/lettuce.png"
          alt="Lettuce"
          width={188}
          height={188}
          className={`${ingredientClass} hidden md:block top-[28%] left-[-2%] lg:left-[4%] rotate-[12deg] animate-float2`}
        />
        <Image
          src="/images/tikki.png"
          alt="Tikki"
          width={188}
          height={188}
          className={`${ingredientClass} hidden lg:block top-[52%] left-[2%] xl:left-[9%] rotate-[8deg] animate-float3`}
        />
        <Image
          src="/images/tomato.png"
          alt="Tomato"
          width={188}
          height={188}
          className={`${ingredientClass} bottom-[5%] left-[-6%] sm:left-[-2%] md:left-[2%] lg:left-[4%] -rotate-[10deg] animate-float4`}
        />

        {/* Right side */}
        <Image
          src="/images/tikki.png"
          alt="Tikki"
          width={188}
          height={188}
          className={`${ingredientClass} hidden md:block top-[10%] right-[-4%] lg:right-[10%] xl:right-[15%] rotate-[22deg] animate-float3`}
        />
        <Image
          src="/images/tomato.png"
          alt="Tomato"
          width={188}
          height={188}
          className={`${ingredientClass} hidden md:block top-[28%] right-[-2%] lg:right-[6%] rotate-[15deg] animate-float4`}
        />
        <Image
          src="/images/cheese.png"
          alt="Cheese"
          width={188}
          height={188}
          className={`${ingredientClass} hidden lg:block top-[48%] right-[2%] xl:right-[16%] -rotate-[12deg] animate-float1`}
        />
        <Image
          src="/images/lettuce.png"
          alt="Lettuce"
          width={188}
          height={188}
          className={`${ingredientClass} bottom-[5%] right-[-6%] sm:right-[-2%] md:right-[2%] lg:right-[8%] rotate-[18deg] animate-float2`}
        />

        <div
          className="relative z-10 w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-10 mt-2 sm:mt-6 md:mt-0"
          id="hero-text"
        >
          <h1 className="text-[clamp(1.75rem,6.5vw,6rem)] font-extrabold leading-[1.12] text-[#03071e] max-w-[850px] tracking-tight pt-2 sm:pt-6 md:pt-[40px] lg:pt-[60px] mb-3 sm:mb-5 md:mb-[25px]">
            Your Burger Party Starts Here!
          </h1>
          <p className="text-[clamp(0.95rem,2.5vw,1.5rem)] text-[#4a5568] leading-relaxed mb-6 sm:mb-8 md:mb-10 max-w-[600px] mx-auto px-1">
            Gather your friends and family and enjoy the best burgers in town.
            Freshly made and delivered hot!
          </p>
          <a
            href="/menu"
            className="inline-flex items-center justify-center w-full max-w-[200px] sm:max-w-[240px] h-11 sm:h-[52px] md:h-[56px] px-6 sm:px-8 bg-[#FF003C] text-white text-[15px] sm:text-[17px] lg:text-[20px] font-semibold rounded-full cursor-pointer no-underline transition-all duration-300 ease-in-out hover:bg-[#e60036] hover:-translate-y-0.5 shadow-md"
            id="hero-cta"
          >
            View Our Menu
          </a>
        </div>

        <HeroBurger />
      </section>

      <DeliveringMomentsSection />
      <DealsSection />
      <JourneySection />
      <DeliveringSection />
      <Footer />
    </>
  );
}
