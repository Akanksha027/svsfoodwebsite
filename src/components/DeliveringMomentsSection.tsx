import Image from "next/image";

export default function DeliveringMomentsSection() {
  return (
    <section className="relative w-full bg-svs-cream px-4 sm:px-6 md:px-12 lg:px-24 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="pt-12 sm:pt-16 md:pt-24 border-t border-svs-cream">
          <h2 className="text-[1.75rem] sm:text-[2rem] md:text-[2.5rem] lg:text-[2.5rem] font-bold text-svs-ink mb-10 sm:mb-12 md:mb-16 leading-tight tracking-tight">
            Delivering{" "}
            <span className="relative inline-block text-svs-orange">
              moments
              <svg
                className="absolute left-0 -bottom-1 sm:-bottom-2 w-full text-svs-yellow"
                viewBox="0 0 120 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 8 Q 30 2 60 5 T 118 6"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8 mb-14 sm:mb-20 md:mb-24">
            <div className="flex flex-col items-start text-left">
              <img
                src="https://d1i1r9ggjmyhzs.cloudfront.net/uploads/ic_imperfect_favorites_31a3c72077.svg"
                alt="Fresh burgers"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6"
              />
              <h3 className="text-[1.15rem] sm:text-[1.35rem] font-extrabold text-svs-ink mb-2 sm:mb-4">
                Made Fresh
              </h3>
              <p className="text-[0.95rem] sm:text-[1rem] text-svs-ink/75 leading-relaxed">
                Burgers grilled to order, never sitting under a lamp
              </p>
            </div>

            <div className="flex flex-col items-start text-left">
              <img
                src="https://d1i1r9ggjmyhzs.cloudfront.net/uploads/ic_imperfect_forward_2a84eca16e.svg"
                alt="Local kitchens"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6"
              />
              <h3 className="text-[1.15rem] sm:text-[1.35rem] font-extrabold text-svs-ink mb-2 sm:mb-4">
                Local Kitchens
              </h3>
              <p className="text-[0.95rem] sm:text-[1rem] text-svs-ink/75 leading-relaxed">
                Neighbourhood outlets built for dine-in, takeaway &amp; delivery
              </p>
            </div>

            <div className="flex flex-col items-start text-left">
              <img
                src="https://d1i1r9ggjmyhzs.cloudfront.net/uploads/ic_imperfect_scooter_4252e3ccf0.svg"
                alt="Fast delivery"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6"
              />
              <h3 className="text-[1.15rem] sm:text-[1.35rem] font-extrabold text-svs-ink mb-2 sm:mb-4">
                Hot Delivery
              </h3>
              <p className="text-[0.95rem] sm:text-[1rem] text-svs-ink/75 leading-relaxed">
                Doorstep delivery that keeps every bite piping hot
              </p>
            </div>

            <div className="flex flex-col items-start text-left">
              <img
                src="https://d1i1r9ggjmyhzs.cloudfront.net/uploads/ic_imperfect_scooter_4252e3ccf0.svg"
                alt="Easy ordering"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6"
              />
              <h3 className="text-[1.15rem] sm:text-[1.35rem] font-extrabold text-svs-ink mb-2 sm:mb-4">
                Easy Ordering
              </h3>
              <p className="text-[0.95rem] sm:text-[1rem] text-svs-ink/75 leading-relaxed">
                Order online, at the kiosk, or walk in. Same great menu.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-start">
          <div className="relative w-full aspect-[4/5] max-h-[560px] lg:max-h-none rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-lg">
            <Image
              src="/images/svs.jpg"
              alt="SVS Food burgers ready to serve"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col gap-8 sm:gap-10 md:gap-12 pt-0 lg:pt-4">
            <h2 className="text-[1.5rem] sm:text-[1.85rem] md:text-[2rem] lg:text-[2rem] font-bold text-svs-ink leading-tight tracking-tight">
              India&apos;s favourite smash-burger kitchen
            </h2>

            <div className="flex flex-col gap-6 sm:gap-7">
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-[1.25rem] sm:text-[1.5rem] font-extrabold text-svs-orange mb-0.5">
                  Freshly Baked Buns
                </h3>
                <div className="bg-svs-ink text-white px-3.5 sm:px-4 py-1 skew-x-[-12deg] inline-block shadow-sm">
                  <span className="block skew-x-[12deg] font-bold text-[0.95rem] sm:text-[1.05rem] tracking-wide">
                    We bake our own
                  </span>
                </div>
                <p className="text-[0.85rem] sm:text-[0.9rem] text-svs-ink/75 mt-1.5 font-medium">
                  Ensuring the softest, freshest bite with every single burger
                </p>
              </div>

              <div className="flex flex-col items-start gap-1">
                <h3 className="text-[1.25rem] sm:text-[1.5rem] font-extrabold text-svs-orange mb-0.5">
                  Tech-Driven Experience
                </h3>
                <div className="bg-svs-ink text-white px-3.5 sm:px-4 py-1 skew-x-[-12deg] inline-block shadow-sm">
                  <span className="block skew-x-[12deg] font-bold text-[0.95rem] sm:text-[1.05rem] tracking-wide">
                    Fully automated
                  </span>
                </div>
                <p className="text-[0.85rem] sm:text-[0.9rem] text-svs-ink/75 mt-1.5 font-medium">
                  Complete technological adaptation for seamless, rapid service
                </p>
              </div>

              <div className="flex flex-col items-start gap-1">
                <h3 className="text-[1.25rem] sm:text-[1.5rem] font-extrabold text-svs-orange mb-0.5">
                  World-Level Standards
                </h3>
                <div className="bg-svs-ink text-white px-3.5 sm:px-4 py-1 skew-x-[-12deg] inline-block shadow-sm">
                  <span className="block skew-x-[12deg] font-bold text-[0.95rem] sm:text-[1.05rem] tracking-wide">
                    Global expansion
                  </span>
                </div>
                <p className="text-[0.85rem] sm:text-[0.9rem] text-svs-ink/75 mt-1.5 font-medium">
                  Scaling up our kitchens to bring our flavours to the world
                </p>
              </div>

              <div className="flex flex-col items-start gap-1">
                <h3 className="text-[1.25rem] sm:text-[1.5rem] font-extrabold text-svs-orange mb-0.5">
                  Seamless & Fast
                </h3>
                <div className="bg-svs-ink text-white px-3.5 sm:px-4 py-1 skew-x-[-12deg] inline-block shadow-sm">
                  <span className="block skew-x-[12deg] font-bold text-[0.95rem] sm:text-[1.05rem] tracking-wide">
                    Less human interaction
                  </span>
                </div>
                <p className="text-[0.85rem] sm:text-[0.9rem] text-svs-ink/75 mt-1.5 font-medium">
                  Designed for maximum efficiency and a zero-fuss ordering experience
                </p>
              </div>

              <div className="flex flex-col items-start gap-1">
                <h3 className="text-[1.25rem] sm:text-[1.5rem] font-extrabold text-svs-orange mb-0.5">
                  100% Pure Veg
                </h3>
                <div className="bg-svs-ink text-white px-3.5 sm:px-4 py-1 skew-x-[-12deg] inline-block shadow-sm">
                  <span className="block skew-x-[12deg] font-bold text-[0.95rem] sm:text-[1.05rem] tracking-wide">
                    Pure & Authentic
                  </span>
                </div>
                <p className="text-[0.85rem] sm:text-[0.9rem] text-svs-ink/75 mt-1.5 font-medium">
                  Authentic, purely vegetarian recipes honoring deep-rooted traditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
