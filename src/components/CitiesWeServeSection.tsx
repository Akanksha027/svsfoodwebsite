import Link from "next/link";

type CityCard = {
  name: string;
  status: "live" | "coming_soon";
  href?: string;
};

const CITIES: CityCard[] = [
  { name: "Satna", status: "live", href: "/locations" },
  { name: "Jabalpur", status: "live", href: "/locations" },
  { name: "Mumbai", status: "coming_soon" },
  { name: "Gwalior", status: "coming_soon" },
  { name: "Bhopal", status: "coming_soon" },
  { name: "Ahmedabad", status: "coming_soon" },
];

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function CitiesWeServeSection() {
  return (
    <section
      className="relative w-full bg-svs-cream py-10 sm:py-14 md:py-16 px-4 sm:px-6 md:px-8 overflow-hidden"
      id="cities-we-serve"
    >
      {/* Soft map-like wash behind cards */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(241,106,52,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 20% 70%, rgba(26,26,26,0.04), transparent 50%)",
        }}
      />

      <div className="relative w-[95%] max-w-[1500px] mx-auto">
        <h2 className="text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] font-bold text-svs-ink tracking-tight mb-5 sm:mb-7 md:mb-8">
          Cities we serve in India
        </h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 list-none p-0 m-0">
          {CITIES.map((city) => {
            const isLive = city.status === "live";
            const sub = isLive ? "See more places" : "Coming soon";
            const content = (
              <>
                <span className="min-w-0">
                  <span className="block text-[1rem] sm:text-[1.05rem] md:text-[1.125rem] font-bold text-svs-ink leading-tight">
                    {city.name}
                  </span>
                  <span
                    className={`mt-1 block text-[0.85rem] sm:text-[0.9rem] ${
                      isLive ? "text-svs-ink/55" : "text-svs-orange font-semibold"
                    }`}
                  >
                    {sub}
                  </span>
                </span>
                <ChevronRight
                  className={`w-5 h-5 shrink-0 ${
                    isLive ? "text-svs-ink/40" : "text-svs-ink/25"
                  }`}
                />
              </>
            );

            const className =
              "flex items-center justify-between gap-4 w-full rounded-2xl bg-svs-white px-5 sm:px-6 py-4 sm:py-5 shadow-[0_1px_3px_rgba(26,26,26,0.04)] border border-svs-ink/[0.04] text-left no-underline transition-colors";

            if (isLive && city.href) {
              return (
                <li key={city.name}>
                  <Link
                    href={city.href}
                    className={`${className} hover:border-svs-orange/25 hover:shadow-[0_4px_16px_rgba(241,106,52,0.08)]`}
                  >
                    {content}
                  </Link>
                </li>
              );
            }

            return (
              <li key={city.name}>
                <div
                  className={`${className} opacity-90 cursor-default`}
                  aria-disabled="true"
                >
                  {content}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
