/**
 * Company journey timeline data.
 * Update this file to change years, copy, and images — the UI maps over it automatically.
 */
export type JourneyStop = {
  id: string;
  year: string;
  description: string;
  /** Path under /public or a remote image URL allowed in next.config */
  image: string;
  imageAlt?: string;
};

export const journeyStops: JourneyStop[] = [
  {
    id: "stop-2004",
    year: "2004",
    description:
      "SVSFOOD launches its first kitchen with a goal: to make ordering burgers simple & easy",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    imageAlt: "First SVSFOOD burger kitchen",
  },
  {
    id: "stop-2012",
    year: "2012",
    description: "Expansion across the city with new outlets and late-night delivery",
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
    imageAlt: "Friends sharing burgers",
  },
  {
    id: "stop-2015",
    year: "2015",
    description: "Launch of our signature smash burgers and secret house sauces",
    image:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80",
    imageAlt: "Signature smash burger",
  },
  {
    id: "stop-2018",
    year: "2018",
    description:
      "SVSFOOD joins a wider food family and scales kitchens across the region",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80",
    imageAlt: "Growing SVSFOOD kitchens",
  },
  {
    id: "stop-2021",
    year: "2021",
    description: "Own-delivery fleet goes live — hotter burgers, faster doors",
    image:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80",
    imageAlt: "Delivery of fresh burgers",
  },
  {
    id: "stop-2024",
    year: "2024",
    description: "App-first ordering, loyalty rewards, and 50+ menu favourites",
    image:
      "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=80",
    imageAlt: "SVSFOOD menu favourites",
  },
  {
    id: "stop-2025a",
    year: "2015",
    description: "Launch of our signature smash burgers and secret house sauces",
    image:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80",
    imageAlt: "Signature smash burger",
  },
  {
    id: "stop-2025b",
    year: "2018",
    description:
      "SVSFOOD joins a wider food family and scales kitchens across the region",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80",
    imageAlt: "Growing SVSFOOD kitchens",
  },
  {
    id: "stop-2025c",
    year: "2021",
    description: "Own-delivery fleet goes live — hotter burgers, faster doors",
    image:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80",
    imageAlt: "Delivery of fresh burgers",
  },
  {
    id: "stop-2025d",
    year: "2024",
    description: "App-first ordering, loyalty rewards, and 50+ menu favourites",
    image:
      "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=80",
    imageAlt: "SVSFOOD menu favourites",
  },
];

/** Section heading — edit freely */
export const journeySectionTitle = "The big moments that made us.";
