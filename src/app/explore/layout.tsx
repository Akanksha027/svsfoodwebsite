import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore | SVS Food",
  description: "Discover SVS Food combos, burgers, and favourites.",
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
