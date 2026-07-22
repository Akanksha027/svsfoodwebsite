import Link from "next/link";
import Image from "next/image";

const BOX_ITEMS = [
  { name: "Classic Smash", qty: "1Pc" },
  { name: "Loaded Fries", qty: "1Pc" },
  { name: "Cheese Burst", qty: "1Pc" },
  { name: "Cold Drink", qty: "1Pc" },
] as const;

const FEATURES = [
  {
    title: "No Artificial Additives",
    desc: "Pure ingredients, real flavours.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M9 3v3M15 3v3M7 21h10a2 2 0 0 0 2-2v-4.5a6.5 6.5 0 0 0-13 0V19a2 2 0 0 0 2 2z" strokeLinecap="round" />
        <path d="M9 14h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "100% Pure Veg",
    desc: "Naturally fresh, nothing compromised.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M12 21c4-3.2 7-6.2 7-10a5 5 0 0 0-10 0c0 1.2.3 2.3.8 3.3" strokeLinecap="round" />
        <path d="M5 14c2.5-1 4.5-3 5.5-5.5" strokeLinecap="round" />
        <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Made Fresh Daily",
    desc: "Grilled to order, never under a lamp.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5l1.5 1.5M19 5l-1.5 1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Hot Delivery",
    desc: "Doorstep delivery that stays piping hot.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4 14h11l2-5H8L4 14z" strokeLinejoin="round" />
        <circle cx="8" cy="18" r="1.6" />
        <circle cx="15" cy="18" r="1.6" />
        <path d="M17 9h2.5l1.5 4H17" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

export default function DeliveringMomentsSection() {
  return (
    <section
      className="relative w-full overflow-hidden bg-svs-cream px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 py-14 sm:py-16 md:py-20 lg:py-24"
      id="delivering-moments"
      aria-labelledby="flavour-delivered-heading"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)_minmax(0,0.95fr)] lg:gap-4 xl:gap-8">
          {/* Quote bubble */}
          <aside className="relative order-2 mx-auto w-full max-w-sm lg:order-1 lg:mx-0 lg:max-w-none lg:self-center">
            <div className="relative rounded-[1.35rem] bg-svs-orange px-6 py-7 text-white shadow-[0_18px_40px_rgba(241,106,52,0.28)] sm:px-7 sm:py-8">
              <span
                className="mb-3 block font-serif text-5xl leading-none text-white/90"
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="text-[0.98rem] sm:text-[1.05rem] font-medium leading-relaxed tracking-tight">
                Absolutely love SVS Food! Everything is always fresh, delicious,
                and made with care. The perfect spot for a smash-burger craving!
              </p>
              <span
                className="absolute -right-2 top-1/2 hidden h-5 w-5 -translate-y-1/2 rotate-45 bg-svs-orange lg:block"
                aria-hidden
              />
            </div>
          </aside>

          {/* Center: bag + food only, transparent background */}
          <div className="relative order-1 mx-auto flex w-full max-w-[520px] items-center justify-center sm:max-w-[580px] lg:order-2 lg:max-w-none">
            <Image
              src="/images/order-types/takeaway-open-nobg.png"
              alt="SVS Food bag with burger and fries"
              width={900}
              height={900}
              className="h-auto w-full max-w-[420px] object-contain drop-shadow-[0_22px_32px_rgba(26,26,26,0.2)] sm:max-w-[480px] lg:max-w-[520px]"
              priority={false}
            />
          </div>

          {/* Headline + menu list + CTA */}
          <div className="order-3 flex flex-col items-start lg:pl-2">
            <h2
              id="flavour-delivered-heading"
              className="max-w-[18ch] text-[1.55rem] sm:text-[1.85rem] md:text-[2.05rem] font-black uppercase leading-[1.12] tracking-tight text-svs-ink"
            >
              Flavour delivered in every bag,{" "}
              <span className="relative inline text-svs-orange">
                always fresh!
                <span
                  className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-svs-orange/70"
                  aria-hidden
                />
              </span>
            </h2>

            <ul className="mt-7 w-full max-w-sm space-y-3.5 sm:mt-8 sm:space-y-4">
              {BOX_ITEMS.map((item) => (
                <li
                  key={item.name}
                  className="flex items-baseline gap-3 text-[0.95rem] sm:text-[1.02rem] font-semibold text-svs-ink"
                >
                  <span className="shrink-0">{item.name}</span>
                  <span
                    className="mb-1 min-w-0 flex-1 border-b border-dotted border-svs-ink/25"
                    aria-hidden
                  />
                  <span className="shrink-0 tabular-nums text-svs-ink/70">
                    {item.qty}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/menu"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-svs-ink px-6 py-3.5 text-[0.95rem] font-bold text-white transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-svs-orange focus-visible:ring-offset-2 sm:mt-9 sm:px-7 sm:text-[1rem]"
            >
              Order Your Bag Today
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15"
                aria-hidden
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* Feature row */}
        <div className="mt-14 grid grid-cols-1 gap-8 border-t border-svs-ink/8 pt-10 sm:mt-16 sm:grid-cols-2 sm:gap-10 lg:mt-20 lg:grid-cols-4 lg:gap-6 lg:pt-12">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-svs-orange/12 text-svs-orange [&_svg]:h-5 [&_svg]:w-5">
                {feature.icon}
              </span>
              <p className="text-[0.9rem] sm:text-[0.95rem] leading-snug text-svs-ink/75">
                <span className="font-extrabold text-svs-orange">
                  {feature.title}:
                </span>{" "}
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
