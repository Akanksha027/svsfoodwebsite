import Image from "next/image";
import Navbar from "@/components/Navbar";
import HeroBurger from "@/components/HeroBurger";
import HeroSearchBox from "@/components/HeroSearchBox";
import DeliveringSection from "@/components/DeliveringSection";
import DealsSection from "@/components/DealsSection";
import JourneySection from "@/components/JourneySection";
import DeliveringMomentsSection from "@/components/DeliveringMomentsSection";
import Footer from "@/components/Footer";
import BagossScope from "@/components/BagossScope";

const ingredientClass =
  "absolute z-[3] object-contain drop-shadow-lg pointer-events-none w-[64px] h-[64px] sm:w-[88px] sm:h-[88px] md:w-[140px] md:h-[140px] lg:w-[188px] lg:h-[188px]";

export default function Home() {
  return (
    <BagossScope>
      <Navbar />

      <section
        className="relative w-full h-[100svh] min-h-[560px] max-h-[1100px] flex flex-col items-center overflow-hidden bg-svs-white pt-[72px] md:pt-[88px] lg:pt-[100px]"
        id="hero-section"
      >
        {/* ===== LEFT SIDE - visible on all screens ===== */}
        <Image
          src="/images/cheese.png"
          alt="Cheese"
          width={188}
          height={188}
          className={`${ingredientClass} top-[14%] left-[-2%] sm:left-[1%] md:left-[-2%] lg:left-[12%] xl:left-[18%] -rotate-[18deg] animate-float1`}
        />
        <Image
          src="/images/lettuce.png"
          alt="Lettuce"
          width={188}
          height={188}
          className={`${ingredientClass} top-[32%] left-[-4%] sm:left-[0%] md:left-[-1%] lg:left-[4%] rotate-[12deg] animate-float2`}
        />
        <Image
          src="/images/tikki.png"
          alt="Tikki"
          width={188}
          height={188}
          className={`${ingredientClass} top-[50%] left-[-3%] sm:left-[1%] md:left-[1%] lg:left-[2%] xl:left-[9%] rotate-[8deg] animate-float3`}
        />
        <Image
          src="/images/tomato.png"
          alt="Tomato"
          width={188}
          height={188}
          className={`${ingredientClass} top-[68%] left-[-5%] sm:left-[-1%] md:left-[2%] lg:left-[4%] -rotate-[10deg] animate-float4`}
        />

        {/* ===== RIGHT SIDE - visible on all screens ===== */}
        <Image
          src="/images/tikki.png"
          alt="Tikki"
          width={188}
          height={188}
          className={`${ingredientClass} top-[14%] right-[-2%] sm:right-[1%] md:right-[-2%] lg:right-[10%] xl:right-[15%] rotate-[22deg] animate-float3`}
        />
        <Image
          src="/images/tomato.png"
          alt="Tomato" 
          width={188}
          height={188}
          className={`${ingredientClass} top-[32%] right-[-4%] sm:right-[0%] md:right-[-1%] lg:right-[6%] rotate-[15deg] animate-float4`}
        />
        <Image
          src="/images/cheese.png"
          alt="Cheese"
          width={188}
          height={188}
          className={`${ingredientClass} top-[50%] right-[-3%] sm:right-[1%] md:right-[1%] lg:right-[2%] xl:right-[16%] -rotate-[12deg] animate-float1`}
        />
        <Image
          src="/images/lettuce.png"
          alt="Lettuce"
          width={188}
          height={188}
          className={`${ingredientClass} top-[68%] right-[-5%] sm:right-[-1%] md:right-[2%] lg:right-[8%] rotate-[18deg] animate-float2`}
        />

        {/* ===== CENTERED HERO COPY ===== */}
        <div
          className="relative z-10 flex-1 w-full flex flex-col items-center justify-center text-center px-5 sm:px-10 md:px-8 pb-[22%] sm:pb-[24%] md:pb-[18%] lg:pb-[14%]"
          id="hero-text"
        >
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.12] text-svs-ink max-w-[320px] sm:max-w-[480px] md:max-w-[700px] lg:max-w-[850px] tracking-tight mb-5 sm:mb-5 md:mb-6">
            Cravings, sorted.
          </h1>
          <p className="text-[clamp(0.95rem,2.8vw,1.5rem)] text-svs-ink/65 leading-relaxed mb-6 sm:mb-7 md:mb-9 max-w-[280px] sm:max-w-[420px] md:max-w-[560px] mx-auto">
            From bold wraps to loaded sides. Order dine-in, takeaway, or
            delivery. Fresh from our kitchen, every time.
          </p>
          <HeroSearchBox />
        </div>

        <HeroBurger />
      </section>

      <DeliveringMomentsSection />
      <DealsSection />
      <JourneySection />
      <DeliveringSection />
      <Footer />
    </BagossScope>
  );
}
