import Image from "next/image";

export default function DeliveringMomentsSection() {
  return (
    <section className="relative w-full bg-[#f2ebe3] px-4 sm:px-6 md:px-12 lg:px-24 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="pt-12 sm:pt-16 md:pt-24 border-t border-[#e8ddd0]">
          <h2 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3rem] lg:text-[4rem] font-bold text-[#3a1e12] mb-10 sm:mb-12 md:mb-16 leading-tight tracking-tight">
            Delivering{" "}
            <span className="relative inline-block text-[#E84B10]">
              moments
              <svg
                className="absolute left-0 -bottom-1 sm:-bottom-2 w-full text-[#c4ea21]"
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
                alt="Creating Change"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6"
              />
              <h3 className="text-[1.15rem] sm:text-[1.35rem] font-extrabold text-[#3a1e12] mb-2 sm:mb-4">
                Creating Change
              </h3>
              <p className="text-[0.95rem] sm:text-[1rem] text-[#5c3a28] leading-relaxed">
                Crafting solutions that uplift lives across MENA
              </p>
            </div>

            <div className="flex flex-col items-start text-left">
              <img
                src="https://d1i1r9ggjmyhzs.cloudfront.net/uploads/ic_imperfect_forward_2a84eca16e.svg"
                alt="Local Lift"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6"
              />
              <h3 className="text-[1.15rem] sm:text-[1.35rem] font-extrabold text-[#3a1e12] mb-2 sm:mb-4">
                Local Lift
              </h3>
              <p className="text-[0.95rem] sm:text-[1rem] text-[#5c3a28] leading-relaxed">
                Helping businesses grow in their own way
              </p>
            </div>

            <div className="flex flex-col items-start text-left">
              <img
                src="https://d1i1r9ggjmyhzs.cloudfront.net/uploads/ic_imperfect_scooter_4252e3ccf0.svg"
                alt="Rider Power"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6"
              />
              <h3 className="text-[1.15rem] sm:text-[1.35rem] font-extrabold text-[#3a1e12] mb-2 sm:mb-4">
                Rider Power
              </h3>
              <p className="text-[0.95rem] sm:text-[1rem] text-[#5c3a28] leading-relaxed">
                Backing riders every step of the way
              </p>
            </div>

            <div className="flex flex-col items-start text-left">
              <img
                src="https://d1i1r9ggjmyhzs.cloudfront.net/uploads/ic_imperfect_scooter_4252e3ccf0.svg"
                alt="Tech Ties"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6"
              />
              <h3 className="text-[1.15rem] sm:text-[1.35rem] font-extrabold text-[#3a1e12] mb-2 sm:mb-4">
                Tech Ties
              </h3>
              <p className="text-[0.95rem] sm:text-[1rem] text-[#5c3a28] leading-relaxed">
                Connecting communities through innovative technology
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-start">
          <div className="relative w-full aspect-[4/5] max-h-[560px] lg:max-h-none rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-lg">
            <Image
              src="/images/delhi.jpg"
              alt="Food delivery"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col gap-8 sm:gap-10 md:gap-12 pt-0 lg:pt-4">
            <h2 className="text-[1.75rem] sm:text-[2.25rem] md:text-[2.75rem] font-bold text-[#3a1e12] leading-tight tracking-tight">
              MENA&apos;s leading on demand delivery platform
            </h2>

            <div className="flex flex-col gap-8 sm:gap-10">
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-[1.35rem] sm:text-[1.75rem] font-extrabold text-[#E84B10] mb-1">
                  Rooted in tradition
                </h3>
                <div className="bg-[#3a1e12] text-[#c4ea21] px-4 sm:px-5 py-1.5 skew-x-[-12deg] inline-block shadow-sm">
                  <span className="block skew-x-[12deg] font-bold text-[1rem] sm:text-[1.15rem] tracking-wide">
                    Arabic
                  </span>
                </div>
                <p className="text-[0.9rem] sm:text-[0.95rem] text-[#5c3a28] mt-3 font-medium">
                  Region&apos;s top cuisine - flavors closest to home
                </p>
              </div>

              <div className="flex flex-col items-start gap-1">
                <h3 className="text-[1.35rem] sm:text-[1.75rem] font-extrabold text-[#E84B10] mb-1">
                  Fresh, &amp; ultra fresh
                </h3>
                <div className="bg-[#3a1e12] text-[#c4ea21] px-4 sm:px-5 py-1.5 skew-x-[-12deg] inline-block shadow-sm">
                  <span className="block skew-x-[12deg] font-bold text-[1rem] sm:text-[1.15rem] tracking-wide">
                    17.6m potatoes
                  </span>
                </div>
                <p className="text-[0.9rem] sm:text-[0.95rem] text-[#5c3a28] mt-3 font-medium">
                  That&apos;s the weight of 400+ elephants!
                </p>
              </div>

              <div className="flex flex-col items-start gap-1">
                <h3 className="text-[1.35rem] sm:text-[1.75rem] font-extrabold text-[#E84B10] mb-1">
                  Sky-High Cravings
                </h3>
                <div className="bg-[#3a1e12] text-[#c4ea21] px-4 sm:px-5 py-1.5 skew-x-[-12deg] inline-block shadow-sm">
                  <span className="block skew-x-[12deg] font-bold text-[1rem] sm:text-[1.15rem] tracking-wide">
                    184m burgers
                  </span>
                </div>
                <p className="text-[0.9rem] sm:text-[0.95rem] text-[#5c3a28] mt-3 font-medium">
                  Enough to out-climb Mount Everest 1,000+ times.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
