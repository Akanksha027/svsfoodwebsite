/**
 * Static story slides — replace with backend data later.
 */
export type StorySlide = {
  id: string;
  type: "image" | "video";
  src: string;
  /** Short label top-left inside the card */
  title: string;
  /** Optional line above the CTA */
  headline?: string;
  /** Display duration for images (ms). Videos use media length when available. */
  durationMs?: number;
  ctaLabel?: string;
  ctaHref?: string;
  alt?: string;
};

export const DEFAULT_STORY_DURATION_MS = 5000;

export const storySlides: StorySlide[] = [
  {
    id: "story-1",
    type: "image",
    src: "/images/hamburgerrr.png",
    title: "NEW BURGERS",
    headline: "Stacked high. Served hot.",
    durationMs: 5000,
    ctaLabel: "Shop Now",
    ctaHref: "/menu",
    alt: "SVS signature burger",
  },
  {
    id: "story-2",
    type: "image",
    src: "/images/cheesyBurger.png",
    title: "CHEESE LOVERS",
    headline: "Melted. Loaded. Legendary.",
    durationMs: 5000,
    ctaLabel: "Shop Now",
    ctaHref: "/menu",
    alt: "Cheesy SVS burger",
  },
  {
    id: "story-3",
    type: "image",
    src: "/images/svs.jpg",
    title: "FRESH DROP",
    headline: "Straight from our kitchen.",
    durationMs: 5500,
    ctaLabel: "Shop Now",
    ctaHref: "/menu",
    alt: "Fresh from SVS kitchen",
  },
  {
    id: "story-4",
    type: "image",
    src: "/images/cust1.jpg",
    title: "SVS MOMENTS",
    headline: "Cravings, sorted.",
    durationMs: 5000,
    ctaLabel: "Shop Now",
    ctaHref: "/locations",
    alt: "SVS Food experience",
  },
];
