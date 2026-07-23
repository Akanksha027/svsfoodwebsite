/**
 * Company journey timeline data.
 * Update this file to change years, copy, and images — the UI maps over it automatically.
 */
export type JourneyStop = {
  id: string;
  year: string;
  title: string;
  description: string;
  /** Path under /public or a remote image URL allowed in next.config */
  image: string;
  imageAlt?: string;
};

export const journeyStops: JourneyStop[] = [
  {
    id: "stop-2013",
    year: "2017–2018",
    title: "Ideation & Research",
    description:
      "Years spent understanding customer preferences, studying global QSR brands, experimenting with recipes, and building the foundation for a brand that would redefine vegetarian dining.",
    image: "/journey/im1.png",
    imageAlt: "SVS Food kitchen team experimenting with burger recipes",
  },
  {
    id: "stop-2018",
    year: "2018",
    title: "The Beginning",
    description:
      "SVS Food was born with a mission to serve fresh, hygienic, and 100% pure vegetarian food with speed and consistency.",
    image: "/journey/NEV00857.jpg",
    imageAlt: "Guests dining at the first SVS Food restaurant",
  },
  {
    id: "stop-2019",
    year: "2019",
    title: "Building Trust",
    description:
      "With growing customer love, SVS Food focused on quality, service, and creating unforgettable food experiences.",
    image: "/journey/NEV00805.jpg",
    imageAlt: "A family enjoying SVS Food together",
  },
  {
    id: "stop-2020",
    year: "2020",
    title: "Standing Strong",
    description:
      "A year of resilience, learning, and strengthening the promise of safe and hygienic food.",
    image: "/journey/cust3.png",
    imageAlt: "SVS Food team serving customers through challenging times",
  },
  {
    id: "stop-2021",
    year: "2021",
    title: "Perfecting the Craft",
    description:
      "From recipes to operations, every detail was refined to deliver speed, consistency, and satisfaction.",
    image: "/journey/NEV00796.jpg",
    imageAlt: "SVS Food burgers, fries, and refined in-house recipes",
  },
  {
    id: "stop-2022",
    year: "2022",
    title: "Innovation Begins",
    description:
      "The journey accelerated with smarter systems, stronger operations, and a vision to build India's most loved pure-veg QSR brand.",
    image: "/journey/im2.png",
    imageAlt: "SVS Food staff using digital POS and ordering systems",
  },
  {
    id: "stop-2023",
    year: "2023",
    title: "Redefining Vegetarian QSR",
    description:
      "SVS Food strengthened its identity with preservative-free in-house buns and a menu designed for every vegetarian family.",
    image: "/journey/NEV00687.jpg",
    imageAlt: "SVS Food branded packaging, desserts, and menu variety",
  },
  {
    id: "stop-2025",
    year: "2025",
    title: "Beyond Expectations",
    description:
      "More stores, more customers, and a stronger belief that pure vegetarian food can compete on the biggest stage.",
    image: "/journey/NEV00749.jpg",
    imageAlt: "Friends celebrating with SVS Food burgers",
  },
  {
    id: "stop-2026",
    year: "2026",
    title: "From Satna to the Nation",
    description:
      "With thousands of happy customers and national recognition, SVS Food continues its mission to become the world's largest pure vegetarian food chain.",
    image: "/journey/NEV00667.jpg",
    imageAlt: "SVS Food order packed with Rewa Road branding",
  },
];

export const journeySectionTitle = "Milestones that shaped us";

export const journeySectionSubtitle =
  "From ideation to a growing movement — the milestones that shaped SVS Food.";

export const journeyClosingLine =
  "Our journey is measured in trust, innovation, and every smile we serve.";
