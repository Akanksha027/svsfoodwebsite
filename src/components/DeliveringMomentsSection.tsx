import Link from "next/link";
import Image from "next/image";

export default function DeliveringMomentsSection() {
  return (
    <section
      className="relative w-full overflow-hidden bg-white px-4 py-10 sm:px-6 sm:py-14 md:px-10 md:py-16 lg:px-16 lg:py-20 xl:px-24"
      id="delivering-moments"
      aria-labelledby="flavour-delivered-heading"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)_minmax(0,0.95fr)] lg:gap-4 xl:gap-8">
          {/* Quote bubble */}
          <aside className="relative order-2 mx-auto w-full max-w-sm lg:order-1 lg:mx-0 lg:max-w-none lg:self-center">
            <div className="relative rounded-[1.25rem] bg-svs-orange px-5 py-6 text-white shadow-[0_18px_40px_rgba(241,106,52,0.28)] sm:rounded-[1.35rem] sm:px-7 sm:py-8">
              <span
                className="mb-2 block font-serif text-4xl leading-none text-white/90 sm:mb-3 sm:text-5xl"
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="text-[0.92rem] font-medium leading-relaxed tracking-tight sm:text-[1.05rem]">
                Absolutely love SVS Food! Everything is always fresh, delicious,
                and made with care. The perfect spot for a smash every craving!
              </p>
              <span
                className="absolute -right-2 top-1/2 hidden h-5 w-5 -translate-y-1/2 rotate-45 bg-svs-orange lg:block"
                aria-hidden
              />
            </div>
          </aside>

          {/* Center: bag + food */}
          <div className="relative order-1 mx-auto flex w-full max-w-[min(100%,420px)] items-center justify-center sm:max-w-[480px] lg:order-2 lg:max-w-none">
            <Image
              src="/images/order-types/takeaway-open-nobg.png"
              alt="SVS Food bag with burger and fries"
              width={900}
              height={900}
              className="h-auto w-full max-w-[280px] object-contain drop-shadow-[0_22px_32px_rgba(26,26,26,0.2)] min-[400px]:max-w-[320px] sm:max-w-[400px] md:max-w-[460px] lg:max-w-[520px]"
              priority={false}
            />
          </div>

          {/* Headline + CTA */}
          <div className="order-3 flex flex-col items-center text-center lg:items-start lg:pl-2 lg:text-left">
            <h2
              id="flavour-delivered-heading"
              className="max-w-[20ch] text-[1.35rem] font-black uppercase leading-[1.12] tracking-tight text-svs-ink sm:text-[1.65rem] md:text-[1.85rem] lg:max-w-[18ch] lg:text-[2.05rem]"
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

            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-svs-ink px-5 py-3 text-[0.875rem] font-bold text-white transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-svs-orange focus-visible:ring-offset-2 sm:mt-8 sm:gap-3 sm:px-7 sm:py-3.5 sm:text-[1rem]"
            >
              Order Your Bag Today
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 sm:h-7 sm:w-7"
                aria-hidden
              >
                <svg
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5"
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
      </div>
    </section>
  );
}
