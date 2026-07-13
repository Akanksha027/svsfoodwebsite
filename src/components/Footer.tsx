import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#f3f4f6] pt-6 sm:pt-8 md:pt-10 pb-4 sm:pb-6 flex flex-col items-center overflow-hidden font-sans">
      {/* Top banner */}
      <div className="w-[95%] bg-white rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 sm:mb-6 shadow-sm">
        <div className="text-[13px] sm:text-[15px]">
          <p className="font-bold text-gray-900 mb-1 tracking-tight leading-snug">
            Feel the Luxury of Premium Burgers with SVSFOOD - Best Fast Food Brand
            in India
          </p>
          <p className="text-gray-400 cursor-pointer hover:underline text-xs">
            Read more...
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-5 text-[13px] sm:text-[15px] font-semibold text-gray-800">
          <Link href="#" className="hover:text-black">
            Popular searches
          </Link>
          <Link href="#" className="hover:text-black">
            Shop by category
          </Link>
          <Link href="#" className="hover:text-black">
            Shop by style
          </Link>
          <Link href="#" className="hover:text-black">
            Shop by color
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="w-[95%] bg-white rounded-2xl sm:rounded-[2rem] px-5 sm:px-8 md:px-10 py-8 sm:py-12 md:py-16 flex flex-col gap-10 lg:flex-row lg:justify-between lg:items-start relative shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 lg:gap-x-16 xl:gap-x-24 w-full lg:w-auto">
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
              Make a return/Exchange
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Refund/Exchange policy
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Track your order
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Shipping policy
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              FAQ&apos;s
            </Link>
            <Link href="#" className="text-[14px] sm:text-[15px] text-gray-500 hover:text-black">
              Terms
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 sm:gap-3">
            <h4 className="font-bold text-gray-900 mb-1 sm:mb-2 text-[15px] sm:text-[16px] tracking-wide">
              We are SVSFOOD
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

        <div className="flex flex-row items-center justify-between sm:justify-start gap-8 sm:gap-12 lg:gap-16 w-full lg:w-auto lg:pr-4 xl:pr-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-gray-500 font-serif italic tracking-wider opacity-80">
            SVSFOOD
          </h2>

          <div
            className="w-[80px] h-[100px] sm:w-[100px] sm:h-[125px] md:w-[120px] md:h-[150px] relative mt-4 sm:mt-6 md:mt-10 shrink-0"
            style={{ perspective: "800px" }}
          >
            <div className="w-full h-full relative revolving-bag scale-[0.7] sm:scale-[0.85] md:scale-100 origin-center">
              <div className="bag-top-handle bag-front-handle"></div>
              <div className="bag-top-handle bag-back-handle"></div>
              <div className="bag-face bag-front">
                <span className="text-[10px] font-black tracking-widest text-gray-800">
                  SVSFOOD
                </span>
              </div>
              <div className="bag-face bag-back">
                <span className="text-[10px] font-black tracking-widest text-gray-800 transform rotate-y-180">
                  SVSFOOD
                </span>
              </div>
              <div className="bag-face bag-left"></div>
              <div className="bag-face bag-right"></div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[60px] sm:w-[80px] h-[12px] sm:h-[15px] bg-black/10 rounded-[100%] blur-[6px]"></div>
          </div>
        </div>

        <p className="w-full text-center lg:text-right text-[10px] sm:text-[11px] text-gray-400 font-semibold tracking-wider lg:absolute lg:bottom-6 lg:right-10">
          © 2025 SVSFOOD RETAIL PRIVATE LIMITED. ALL RIGHTS RESERVED
        </p>
      </div>
    </footer>
  );
}
