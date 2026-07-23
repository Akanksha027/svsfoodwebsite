import type { Metadata } from "next";
import ScrollFrameAnimation from "@/components/ScrollFrameAnimation";

export const metadata: Metadata = {
  title: "Animate | SVS Food",
  description: "Scroll-driven animation from the SVS Food home video.",
  robots: { index: false, follow: false },
};

export default function AnimatePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <ScrollFrameAnimation />
    </main>
  );
}
