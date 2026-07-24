import Image from "next/image";
import { storeLocations } from "@/data/locations";

const VIDEO_ID = "H8ZzObFgbDk";
const YOUTUBE_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

const STORE_COUNT = storeLocations.length;
const CITY_COUNT = new Set(storeLocations.map((s) => s.city)).size;

/** Matches Zomato homepage impact pill — icons, shape, type, dividers */
const STATS = [
  {
    value: `${STORE_COUNT}`,
    label: STORE_COUNT === 1 ? "store" : "stores",
    icon: "/stats/stores.png",
    iconAlt: "Stores",
    iconClass: "h-10 w-auto lg:h-14",
  },
  {
    value: `${CITY_COUNT}`,
    label: CITY_COUNT === 1 ? "city" : "cities",
    icon: "/stats/cities.png",
    iconAlt: "Cities",
    iconClass: "h-10 w-auto lg:h-14",
  },
  {
    value: "800+",
    label: "orders daily",
    icon: "/stats/orders.png",
    iconAlt: "Orders",
    iconClass: "h-10 w-auto lg:h-14",
  },
] as const;

/** Soft looping strokes — same language as Zomato’s impact section */
function BackgroundLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <path
        d="M-60 160 C 120 40, 280 220, 460 90 S 780 40, 980 180 S 1280 300, 1520 120"
        fill="none"
        stroke="#f16a34"
        strokeWidth="1.35"
        opacity="0.18"
      />
      <path
        d="M40 720 C 220 580, 400 760, 600 640 S 960 520, 1160 680 S 1360 820, 1520 640"
        fill="none"
        stroke="#f16a34"
        strokeWidth="1.25"
        opacity="0.14"
      />
      <path
        d="M180 -10 C 340 110, 260 260, 440 340 S 720 460, 900 340 S 1140 180, 1320 280"
        fill="none"
        stroke="#f16a34"
        strokeWidth="1.1"
        opacity="0.12"
      />
      <path
        d="M60 420 C 260 300, 420 520, 620 400 S 920 280, 1120 440 S 1320 560, 1480 380"
        fill="none"
        stroke="#f16a34"
        strokeWidth="1"
        opacity="0.1"
      />
      <path
        d="M-20 560 C 160 480, 300 640, 500 540 S 820 440, 1020 580 S 1280 700, 1500 540"
        fill="none"
        stroke="#f16a34"
        strokeWidth="1"
        opacity="0.08"
      />
    </svg>
  );
}

export default function SharkTankSection() {
  return (
    <section
      id="shark-tank"
      className="relative w-full overflow-hidden bg-[#fff4ee] text-svs-ink"
      aria-labelledby="shark-tank-heading"
    >
      <BackgroundLines />

      <div className="relative mx-auto flex min-h-[min(85dvh,820px)] w-full max-w-5xl flex-col items-center justify-center px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="shark-tank-heading"
            className="text-[clamp(2rem,5.5vw,3.75rem)] font-semibold leading-[1.08] tracking-tight text-svs-ink"
          >
            SVS Foods walks
            <br />
            into the Tank
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-svs-ink/55 sm:text-lg sm:leading-8">
            A pure-veg burger brand, five Sharks, and one full pitch — watch SVS
            Foods serve their story and field the hard questions on national
            television.
          </p>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-svs-ink underline decoration-svs-ink/25 underline-offset-4 transition-colors hover:text-svs-ink/70 sm:text-base"
          >
            Watch on YouTube
            <span aria-hidden>→</span>
          </a>
        </div>

        {/* Exact Zomato impact pill — SVS numbers */}
        <div className="mt-14 w-full sm:mt-16">
          <div
            className="mx-auto flex w-fit max-w-full flex-col items-stretch rounded-2xl border-[0.64px] border-svs-orange/15 bg-white px-4 py-3 shadow-[0px_2.777px_13.401px_0px_rgba(241,106,52,0.12)] sm:flex-row sm:items-center sm:justify-center sm:gap-8 sm:rounded-[32px] sm:px-7 sm:py-6"
            role="list"
            aria-label="SVS Food at a glance"
          >
            {STATS.map((stat, index) => (
              <div key={stat.label} className="contents">
                {index > 0 ? (
                  <div
                    className="h-px w-full shrink-0 bg-svs-orange/20 sm:h-9 sm:w-px lg:h-12 xl:h-16"
                    aria-hidden
                  />
                ) : null}
                <div
                  className="flex items-center justify-between gap-4 py-2.5 sm:justify-start sm:py-0"
                  role="listitem"
                >
                  <div className="min-w-0">
                    <p className="text-2xl font-bold leading-9 text-[#596378] lg:text-3xl lg:leading-9">
                      {stat.value}
                    </p>
                    <p className="text-sm font-normal text-[#767C8F] md:text-base lg:text-lg lg:leading-7">
                      {stat.label}
                    </p>
                  </div>
                  <Image
                    src={stat.icon}
                    alt={stat.iconAlt}
                    width={64}
                    height={56}
                    className={`ml-0 shrink-0 object-contain sm:ml-4 ${stat.iconClass}`}
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
