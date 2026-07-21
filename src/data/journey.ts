/**
 * Company journey timeline data.
 * Update this file to change years, copy, and images — the UI maps over it automatically.
 */
export type JourneyStop = {
  id: string;
  year: string;
  title: string;
  tagline: string;
  description: string;
  /** Path under /public or a remote image URL allowed in next.config */
  image: string;
  imageAlt?: string;
};

export const journeyStops: JourneyStop[] = [
  {
    id: "stop-2013",
    year: "2013–2017",
    title: "Ideation & Research",
    tagline:
      "Five years of dreaming, learning, and reimagining what pure vegetarian fast food could become.",
    description:
      "Years spent understanding customer preferences, studying global QSR brands, experimenting with recipes, and building the foundation for a brand that would redefine vegetarian dining.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    imageAlt: "Recipe research and food experimentation",
  },
  {
    id: "stop-2018",
    year: "2018",
    title: "The Beginning",
    tagline: "One small outlet in Satna, one big dream for the future.",
    description:
      "SVS Food was born with a mission to serve fresh, hygienic, and 100% pure vegetarian food with speed and consistency.",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    imageAlt: "First SVS Food outlet",
  },
  {
    id: "stop-2019",
    year: "2019",
    title: "Building Trust",
    tagline: "Every smile became our motivation to do better.",
    description:
      "With growing customer love, SVS Food focused on quality, service, and creating unforgettable food experiences.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    imageAlt: "Happy customers at SVS Food",
  },
  {
    id: "stop-2020",
    year: "2020",
    title: "Standing Strong",
    tagline: "When the world slowed down, our commitment only grew stronger.",
    description:
      "A year of resilience, learning, and strengthening the promise of safe and hygienic food.",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    imageAlt: "Safe and hygienic kitchen operations",
  },
  {
    id: "stop-2021",
    year: "2021",
    title: "Perfecting the Craft",
    tagline: "We didn't just serve food—we crafted an experience.",
    description:
      "From recipes to operations, every detail was refined to deliver speed, consistency, and satisfaction.",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    imageAlt: "Crafting the SVS Food experience",
  },
  {
    id: "stop-2022",
    year: "2022",
    title: "Innovation Begins",
    tagline: "Tradition met technology to create something extraordinary.",
    description:
      "The journey accelerated with smarter systems, stronger operations, and a vision to build India's most loved pure-veg QSR brand.",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80",
    imageAlt: "Innovation in operations",
  },
  {
    id: "stop-2023",
    year: "2023",
    title: "Redefining Vegetarian QSR",
    tagline: "Fresh buns, Jain options, and innovation at every step.",
    description:
      "SVS Food strengthened its identity with preservative-free in-house buns and a menu designed for every vegetarian family.",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    imageAlt: "Fresh in-house buns and vegetarian menu",
  },
  {
    id: "stop-2024",
    year: "2024",
    title: "Powered by Technology",
    tagline: "Ordering became smarter, faster, and more seamless.",
    description:
      "With self-order kiosks, WhatsApp tracking, and digital ordering experiences, SVS Food embraced the future of food service.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    imageAlt: "Digital ordering and kiosks",
  },
  {
    id: "stop-2025",
    year: "2025",
    title: "Beyond Expectations",
    tagline: "From a local favorite to a growing movement.",
    description:
      "More stores, more customers, and a stronger belief that pure vegetarian food can compete on the biggest stage.",
    image:
      "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=80",
    imageAlt: "Growing SVS Food stores",
  },
  {
    id: "stop-2026",
    year: "2026",
    title: "From Satna to the Nation",
    tagline: "A dream that started on Rewa Road is now inspiring millions.",
    description:
      "With thousands of happy customers and national recognition, SVS Food continues its mission to become the world's largest pure vegetarian food chain.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    imageAlt: "SVS Food expanding nationwide",
  },
];

export const journeySectionTitle = "Our journey.";

export const journeySectionSubtitle =
  "From ideation to a growing movement — the milestones that shaped SVS Food.";

export const journeyClosingLine =
  "Our journey is measured in trust, innovation, and every smile we serve.";
