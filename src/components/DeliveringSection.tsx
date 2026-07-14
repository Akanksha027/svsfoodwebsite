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
              Every order tells a story: friends sharing a table, a late-night
              craving, or a quick takeaway between meetings. SVS Food is built
              around those everyday moments.
            </p>
            <p className="text-[1rem] sm:text-[1.1rem] text-[#4B2B0A] leading-relaxed">
              From our kitchens to your door (or tray), we focus on speed,
              consistency, and burgers that taste the same every time you come
              back.
            </p>
          </div>

          <button className="bg-[#3a1e12] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-[0.95rem] sm:text-[1.05rem] hover:bg-[#5c3a28] transition-colors w-full sm:w-auto">
            Read more about us
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-12 items-start mb-12 sm:mb-16 md:mb-24">
          <div className="relative w-full aspect-[4/5] max-h-[520px] md:max-h-none rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-lg">
            <Image
              src="/images/cust1.jpg"
              alt="Guest enjoying SVS Food"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col gap-5 sm:gap-8 md:gap-12">
            <div className="relative w-full aspect-[4/3] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-lg">
              <Image
                src="/images/cust2.jpg"
                alt="Hands holding a cheesy burger"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="relative w-full aspect-[4/3] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-lg">
              <Image
                src="/images/cust3.png"
                alt="Delicious SVS Hamburger"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-8 md:mb-12">
          <h2 className="text-[1.75rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-bold text-[#3a1e12] mb-6 sm:mb-10 md:mb-12 tracking-tight leading-tight">
            About SVS Food
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-16 lg:gap-24 mb-8 sm:mb-12 max-w-[1200px]">
            <p className="text-[1rem] sm:text-[1.1rem] text-[#4B2B0A] leading-relaxed">
              SVS Food is a burger-first kitchen brand. Order dine-in,
              takeaway, or home delivery from the same menu online, on our
              self-ordering kiosks, or at the counter.
            </p>
            <p className="text-[1rem] sm:text-[1.1rem] text-[#4B2B0A] leading-relaxed">
              We keep the experience simple: clear menus, honest prices, and
              kitchens that cook to order so your burger lands hot, whether
              you&apos;re eating in or ordering for home.
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
