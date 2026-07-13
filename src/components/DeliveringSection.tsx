import Image from "next/image";

export default function DeliveringSection() {
  return (
    <section
      className="relative w-full bg-[#f2ebe3] px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20 overflow-hidden"
      id="delivering-section"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-[1.75rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-bold text-[#3a1e12] mb-6 sm:mb-10 md:mb-12 tracking-tight leading-tight">
            Numbers that deliver
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-16 lg:gap-24 mb-8 sm:mb-12 max-w-[1200px]">
            <p className="text-[1rem] sm:text-[1.1rem] text-[#4B2B0A] leading-relaxed">
              Our numbers reflect more than growth—they tell the story of how
              SVSFOOD connects communities and drives impact across the region.
            </p>
            <p className="text-[1rem] sm:text-[1.1rem] text-[#4B2B0A] leading-relaxed">
              From empowering thousands of riders and partners to delivering
              billions in value, we&apos;re building connections that move the
              region forward every day.
            </p>
          </div>

          <button className="bg-[#3a1e12] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-[0.95rem] sm:text-[1.05rem] hover:bg-[#5c3a28] transition-colors w-full sm:w-auto">
            Read more about us
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-12 items-center mb-12 sm:mb-16 md:mb-24">
          <div className="relative w-full aspect-[4/5] max-h-[520px] md:max-h-none rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-lg">
            <Image
              src="/images/berlin.webp"
              alt="Man enjoying a drink"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="relative w-full aspect-[4/3] max-h-[420px] md:max-h-none rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-lg">
            <Image
              src="/images/cheesyBurger.png"
              alt="Hands holding a wrap"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="mb-4 sm:mb-8 md:mb-12">
          <h2 className="text-[1.75rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-bold text-[#3a1e12] mb-6 sm:mb-10 md:mb-12 tracking-tight leading-tight">
            About SVSFOOD
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-16 lg:gap-24 mb-8 sm:mb-12 max-w-[1200px]">
            <p className="text-[1rem] sm:text-[1.1rem] text-[#4B2B0A] leading-relaxed">
              SVSFOOD&apos;s online marketplace offers customers a convenient,
              personalised and simple way of ordering food, groceries and other
              convenience products from a wide selection of restaurants and
              retailers.
            </p>
            <p className="text-[1rem] sm:text-[1.1rem] text-[#4B2B0A] leading-relaxed">
              SVSFOOD focuses on mobile platforms and continually enhances its
              technology through data-driven insights. By optimizing the entire
              order fulfillment process—picking, packing, and delivery—it
              ensures efficient operations across the platform.
            </p>
          </div>

          <button className="bg-[#3a1e12] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-[0.95rem] sm:text-[1.05rem] hover:bg-[#5c3a28] transition-colors w-full sm:w-auto">
            Read more about us
          </button>
        </div>
      </div>
    </section>
  );
}
