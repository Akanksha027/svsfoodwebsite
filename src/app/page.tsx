import HeroVideoSection from "@/components/HeroVideoSection";
import DeliveringSection from "@/components/DeliveringSection";
import SharkTankSection from "@/components/SharkTankSection";
import JourneySection from "@/components/JourneySection";
import DeliveringMomentsSection from "@/components/DeliveringMomentsSection";
import Footer from "@/components/Footer";
import FestiveDrops from "@/components/FestiveDrops";
import AppDownloadSection from "@/components/AppDownloadSection";
import CitiesWeServeSection from "@/components/CitiesWeServeSection";

export default function Home() {
  return (
    <main className="overflow-x-clip">
      {/* <FestiveDrops /> */}
      <HeroVideoSection />

      <DeliveringMomentsSection />
      <SharkTankSection />
      <JourneySection />
      {/* <DeliveringSection /> */}
      <AppDownloadSection />
      <CitiesWeServeSection />
      <Footer />
    </main>
  );
}
