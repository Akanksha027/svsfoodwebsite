import Navbar from "@/components/Navbar";
import LocationsSection from "@/components/LocationsSection";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Locations | SVS FOOD — Stores across India",
  description:
    "Find your nearest SVS FOOD restaurant in Satna and Jabalpur, Madhya Pradesh. Visit us for dine-in, takeaway, or delivery.",
  alternates: {
    canonical: "/locations",
  },
};

export default function LocationsPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <LocationsSection />
      </main>
      <Footer />
    </>
  );
}
