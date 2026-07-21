import HeroVideoSection from "@/components/HeroVideoSection";
import DeliveringSection from "@/components/DeliveringSection";
import DealsSection from "@/components/DealsSection";
import JourneySection from "@/components/JourneySection";
import DeliveringMomentsSection from "@/components/DeliveringMomentsSection";
import Footer from "@/components/Footer";
import FestiveDrops from "@/components/FestiveDrops";
import AppDownloadSection from "@/components/AppDownloadSection";
import CitiesWeServeSection from "@/components/CitiesWeServeSection";

export default function Home() {
  return (
    <>
      {/* <FestiveDrops /> */}
      <HeroVideoSection />

      <DeliveringMomentsSection />
      <DealsSection />
      <JourneySection />
      <DeliveringSection />
      <AppDownloadSection />
      <CitiesWeServeSection />
      <Footer />
    </>
  );
}
