import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white pt-6 sm:pt-8 md:pt-10 pb-4 sm:pb-6 flex flex-col items-center overflow-hidden font-sans">
      <div className="w-[95%] max-w-[1500px] bg-white rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 sm:mb-6 shadow-sm border border-gray-50">
        <div className="text-[13px] sm:text-[15px]">
          <p className="font-bold text-gray-900 mb-1 tracking-tight leading-snug">
            Feel the luxury of premium burgers with SVS Food, fast food done
            right in India
          </p>
          <p className="text-gray-400 cursor-pointer hover:underline text-xs">
            Read more...
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-5 text-[13px] sm:text-[15px] font-semibold text-gray-800">
          <Link href="/menu" className="hover:text-black">
            View menu
          </Link>
          <Link href="#" className="hover:text-black">
            Deals &amp; combos
          </Link>
          <Link href="#" className="hover:text-black">
            Store locator
          </Link>
          <Link href="/contact" className="hover:text-black">
            Contact us
          </Link>
        </div>
      </div>

      <div className="w-[95%] max-w-[1500px] bg-white rounded-2xl sm:rounded-[2rem] px-4 sm:px-8 md:px-10 py-8 sm:py-12 md:py-16 flex flex-col gap-10 lg:flex-row lg:justify-between lg:items-start relative shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 lg:gap-x-12 xl:gap-x-20 w-full lg:w-auto">
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <h4 className="font-bold text-gray-900 mb-1 sm:mb-2 text-[15px] sm:text-[16px] tracking-wide">
              Connect with us
            </h4>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Call
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Text (WhatsApp)
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Instagram
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              YouTube
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              LinkedIn
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 sm:gap-3">
            <h4 className="font-bold text-gray-900 mb-1 sm:mb-2 text-[15px] sm:text-[16px] tracking-wide">
              Order Support
            </h4>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Track your order
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Delivery info
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Cancellation policy
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              FAQs
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Terms &amp; conditions
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 sm:gap-3 sm:col-span-2 md:col-span-1">
            <h4 className="font-bold text-gray-900 mb-1 sm:mb-2 text-[15px] sm:text-[16px] tracking-wide">
              We are SVS Food
            </h4>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Our story
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Walk-in Stores
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Collaborations
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Careers
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Media
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Blogs
            </Link>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between sm:justify-start gap-6 sm:gap-12 lg:gap-16 w-full lg:w-auto lg:pr-4 xl:pr-12">
          <h2 className="text-2xl sm:text-4xl md:text-5xl text-gray-500 font-serif italic tracking-wider opacity-80">
            SVSFOOD
          </h2>

          <div
            className="w-[90px] h-[110px] sm:w-[140px] sm:h-[175px] md:w-[180px] md:h-[225px] relative mt-2 sm:mt-6 md:mt-10 shrink-0"
            style={{ perspective: "800px" }}
          >
            <div className="w-full h-full relative revolving-bag scale-[0.75] sm:scale-100 md:scale-[1.1] origin-center">
              <div className="bag-top-handle bag-front-handle"></div>
              <div className="bag-top-handle bag-back-handle"></div>
              <div className="bag-face bag-front">
                <span className="text-[10px] sm:text-[12px] font-black tracking-widest text-gray-800">
                  SVSFOOD
                </span>
              </div>
              <div className="bag-face bag-back">
                <span className="text-[10px] sm:text-[12px] font-black tracking-widest text-gray-800 transform rotate-y-180">
                  SVSFOOD
                </span>
              </div>
              <div className="bag-face bag-left"></div>
              <div className="bag-face bag-right"></div>
            </div>
            <div className="absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 w-[70px] sm:w-[110px] md:w-[140px] h-[12px] sm:h-[18px] bg-black/10 rounded-[100%] blur-[8px]"></div>
          </div>
        </div>

        <p className="w-full text-center lg:text-right text-[10px] sm:text-[11px] text-gray-400 font-semibold tracking-wider leading-relaxed px-2 lg:absolute lg:bottom-6 lg:right-10 lg:px-0">
          © 2025 SVSFOOD RETAIL PRIVATE LIMITED. ALL RIGHTS RESERVED
        </p>
      </div>
    </footer>
  );
}
