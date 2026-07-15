import Navbar from "@/components/Navbar";
import HeroVideoSection from "@/components/HeroVideoSection";
import DeliveringSection from "@/components/DeliveringSection";
import DealsSection from "@/components/DealsSection";
import JourneySection from "@/components/JourneySection";
import DeliveringMomentsSection from "@/components/DeliveringMomentsSection";
import Footer from "@/components/Footer";
import BagossScope from "@/components/BagossScope";
import FestiveDrops from "@/components/FestiveDrops";

export default function Home() {
  return (
    <BagossScope>
      <Navbar variant="hero" />
      {/* <FestiveDrops /> */}
      <HeroVideoSection />

      <DeliveringMomentsSection />
      <DealsSection />
      <JourneySection />
      <DeliveringSection />
      <Footer />
    </BagossScope>
  );
}
