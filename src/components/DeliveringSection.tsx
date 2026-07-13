export default function DeliveringSection() {
  const features = [
    {
      id: "creating-change",
      icon: (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
        >
          <g transform="rotate(-15 24 24)">
            <path
              d="M24 38C13 29 8 21 8 13C8 8.5 11.5 5 16 5C20 5 23 8 24 10C25 8 28 5 32 5C36.5 5 40 8.5 40 13C40 21 35 29 24 38Z"
              fill="#E84B10"
            />
          </g>
          <path
            d="M16 8L14 3M24 10L26 4M34 16L39 12"
            stroke="#3a1e12"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "Creating Change",
      desc: "Crafting solutions that uplift lives across MENA",
    },
    {
      id: "local-lift",
      icon: (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
        >
          <path d="M22 14L34 24L22 34Z" fill="#E84B10" />
          <path d="M30 14L42 24L30 34Z" fill="#E84B10" />
          <path
            d="M6 18H14M10 24H18M6 30H14"
            stroke="#3a1e12"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "Local Lift",
      desc: "Helping businesses grow in their own way",
    },
    {
      id: "rider-power",
      icon: (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
        >
          <path d="M10 10H20V22H10Z" fill="#3a1e12" />
          <path d="M8 22H24C28 22 32 25 32 30V32H8V22Z" fill="#E84B10" />
          <path
            d="M30 32C30 32 38 32 40 32C42 32 42 28 42 28L36 16H32"
            stroke="#E84B10"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="34" r="5" fill="#f2ebe3" stroke="#3a1e12" strokeWidth="3.5" />
          <circle cx="34" cy="34" r="5" fill="#f2ebe3" stroke="#3a1e12" strokeWidth="3.5" />
          <path d="M30 16H34" stroke="#3a1e12" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      ),
      title: "Rider Power",
      desc: "Backing riders every step of the way",
    },
    {
      id: "tech-ties",
      icon: (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
        >
          <g transform="rotate(15 24 24)">
            <rect x="14" y="8" width="20" height="32" rx="3" fill="#E84B10" />
            <path d="M18 12H26" stroke="#3a1e12" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="36" r="1.5" fill="#3a1e12" />
          </g>
          <path
            d="M30 6L32 1M38 12L43 8M14 10L10 6"
            stroke="#3a1e12"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "Tech Ties",
      desc: "Connecting communities through innovative technology",
    },
  ];

  return (
    <section
      className="relative w-full min-h-0 lg:min-h-screen bg-[#f2ebe3] overflow-hidden px-4 sm:px-6 md:px-10 pt-10 sm:pt-12 md:pt-16 pb-10 sm:pb-12 md:pb-0"
      id="delivering-section"
    >
      <div className="w-full max-w-[1400px] mx-auto">
        <h2 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3rem] lg:text-[4rem] font-bold text-[#1a0a00] mb-10 sm:mb-14 md:mb-20 leading-tight">
          Delivering{" "}
          <span className="relative inline-block text-[#E84B10]">
            moments
            <svg
              className="absolute left-0 -bottom-1 w-full"
              viewBox="0 0 120 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6 Q30 2 60 5 Q90 8 118 4"
                stroke="#E84B10"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12 sm:mb-16 md:mb-24">
          {features.map((f) => (
            <div key={f.id} className="flex flex-col gap-3 sm:gap-4" id={f.id}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-start mb-1 sm:mb-2">
                {f.icon}
              </div>
              <h3 className="text-[1.2rem] sm:text-[1.35rem] lg:text-[1.5rem] font-extrabold text-[#1a0a00] leading-tight">
                {f.title}
              </h3>
              <p className="text-[0.95rem] sm:text-[1.05rem] lg:text-[1.1rem] text-[#4B2B0A] leading-relaxed max-w-[300px]">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block absolute left-0 bottom-[100px] lg:bottom-[140px] w-[70%] lg:w-[65%] pointer-events-none select-none">
        <svg
          viewBox="0 0 900 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M-20 20 C 100 10, 300 10, 450 100 C 600 190, 750 240, 920 180"
            stroke="#E84B10"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      <div className="w-full max-w-[1400px] mx-auto relative z-10 pt-6 sm:pt-10 md:pt-[80px]">
        <p className="text-[clamp(1.75rem,7vw,7.5rem)] font-black uppercase leading-[1.05] text-[#1a0a00] tracking-tight">
          Crafting Flavour And
          <br />
          Driving <span className="text-[#E84B10]">Taste</span>
        </p>
      </div>
    </section>
  );
}
