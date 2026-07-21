import type { ReactNode } from "react";
import { APP_DOWNLOAD_URL } from "@/lib/app-store-links";

const PARTNER_URL = "https://connect.svsfood.com";
const CAREERS_URL = "https://careers.svsfood.com";

const CREAM = "#FFF4EE";
const INK = "#3D2314";
const ORANGE = "#F16A34";

function WavyEdge({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      className={`block w-full h-[10px] sm:h-[12px] ${flip ? "rotate-180" : ""}`}
      viewBox="0 0 1200 12"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0 6 Q30 0 60 6 T120 6 T180 6 T240 6 T300 6 T360 6 T420 6 T480 6 T540 6 T600 6 T660 6 T720 6 T780 6 T840 6 T900 6 T960 6 T1020 6 T1080 6 T1140 6 T1200 6 V12 H0 Z"
        fill={CREAM}
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 160 180" className="w-full h-full overflow-visible" aria-hidden>
      {/* Motion lines */}
      <path d="M30 40 L14 26" stroke={ORANGE} strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M24 56 L6 50" stroke={ORANGE} strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M28 72 L10 76" stroke={ORANGE} strokeWidth="5.5" strokeLinecap="round" fill="none" />

      {/* Phone body — solid orange like reference */}
      <rect
        x="42"
        y="16"
        width="90"
        height="150"
        rx="20"
        ry="20"
        fill={ORANGE}
        stroke={INK}
        strokeWidth="5.5"
      />
      {/* White heart */}
      <path
        d="M87 118c0 0-26-17-26-36c0-11 8.5-18 18-18c5.2 0 9 2.5 10.5 5.5C91 66.5 94.8 64 100 64c9.5 0 18 7 18 18c0 19-26 36-26 36z"
        fill="#ffffff"
      />
    </svg>
  );
}

function PartnerIcon() {
  return (
    <svg viewBox="0 0 120 100" className="w-[72px] h-[60px] sm:w-[88px] sm:h-[72px] shrink-0" aria-hidden>
      {/* Dashed arc */}
      <path
        d="M28 38 Q60 8 92 38"
        fill="none"
        stroke={INK}
        strokeWidth="2.5"
        strokeDasharray="3 5"
        strokeLinecap="round"
      />
      {/* Hearts */}
      <path
        d="M48 28c0 0-6-4-6-8c0-2.5 2-4 4-4c1.2 0 2 .6 2.5 1.4C49 17.6 49.8 17 51 17c2 0 4 1.5 4 4c0 4-6 8-6 8z"
        fill={ORANGE}
      />
      <path
        d="M68 24c0 0-5.5-3.5-5.5-7c0-2.2 1.8-3.5 3.5-3.5c1 0 1.8.5 2.2 1.2c.4-.7 1.2-1.2 2.2-1.2c1.8 0 3.5 1.3 3.5 3.5c0 3.5-5.5 7-5.5 7z"
        fill={ORANGE}
      />
      {/* Left hand + phone */}
      <ellipse cx="38" cy="78" rx="18" ry="10" fill={ORANGE} stroke={INK} strokeWidth="2.5" />
      <rect x="26" y="48" width="22" height="34" rx="4" fill={ORANGE} stroke={INK} strokeWidth="2.5" />
      <rect x="30" y="52" width="14" height="22" rx="2" fill="#fff" />
      {/* Right hand + phone */}
      <ellipse cx="82" cy="78" rx="18" ry="10" fill={ORANGE} stroke={INK} strokeWidth="2.5" />
      <rect x="72" y="48" width="22" height="34" rx="4" fill={ORANGE} stroke={INK} strokeWidth="2.5" />
      <rect x="76" y="52" width="14" height="22" rx="2" fill="#fff" />
    </svg>
  );
}

function CareerIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-[64px] h-[64px] sm:w-[76px] sm:h-[76px] shrink-0" aria-hidden>
      {/* Sparkles */}
      <path d="M58 10 L58 22" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M68 16 L78 8" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M72 26 L84 24" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      {/* Star */}
      <path
        d="M50 28 L56.5 44 L74 44.5 L60 55.5 L65 72 L50 62.5 L35 72 L40 55.5 L26 44.5 L43.5 44 Z"
        fill={ORANGE}
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StoreBadge({
  href,
  label,
  sub,
  children,
}: {
  href: string;
  label: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 bg-[#1a1a1a] text-white rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 hover:bg-[#2a2a2a] transition-colors no-underline shrink-0"
    >
      {children}
      <span className="leading-tight text-left">
        <span className="block text-[8px] sm:text-[9px] font-medium opacity-80 tracking-wide">
          {sub}
        </span>
        <span className="block text-[12px] sm:text-[13px] font-bold">{label}</span>
      </span>
    </a>
  );
}

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" aria-hidden>
      <path d="M3.18 23.76c.35.2.76.22 1.13.04l12.12-7-3.4-3.4L3.18 23.76z" fill="#EA4335" />
      <path
        d="M21.54 10.07l-2.66-1.54-3.78 3.47 3.78 3.48 2.69-1.56a1.57 1.57 0 0 0 0-2.73l-.03-.12z"
        fill="#FBBC04"
      />
      <path
        d="M3.18.24A1.5 1.5 0 0 0 2.5 1.5v21a1.5 1.5 0 0 0 .68 1.26l.1.06 11.76-11.76v-.28L3.18.24z"
        fill="#4285F4"
      />
      <path
        d="M13.07 12l3.92-3.91-12.08-6.98a1.6 1.6 0 0 0-1.73.13L13.07 12z"
        fill="#34A853"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="white" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.19 1.28-2.17 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.77M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AppGalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#CF0A2C" />
      <path
        d="M8 9.2c0-.66.54-1.2 1.2-1.2h5.6c.66 0 1.2.54 1.2 1.2v5.6c0 .66-.54 1.2-1.2 1.2H9.2c-.66 0-1.2-.54-1.2-1.2V9.2z"
        fill="white"
      />
      <path d="M12 7.2v1.6M9.5 12h5" stroke="#CF0A2C" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function AppDownloadSection() {
  return (
    <section
      className="w-full bg-svs-white py-10 sm:py-14 md:py-16 px-4 sm:px-6 md:px-8"
      id="app-download-section"
    >
      <div className="w-[95%] max-w-[1500px] mx-auto flex flex-col gap-5 sm:gap-6 md:gap-7">
        {/* Top banner */}
        <div className="overflow-hidden">
          <WavyEdge />
          <div
            className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 md:gap-14 px-6 sm:px-10 md:px-14 py-8 sm:py-10 md:py-12"
            style={{ backgroundColor: CREAM }}
          >
            <div className="shrink-0 w-[110px] sm:w-[140px] md:w-[160px] -rotate-[8deg] drop-shadow-md">
              <PhoneIcon />
            </div>

            <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left min-w-0">
              <div>
                <h2
                  className="text-[1.5rem] sm:text-[1.85rem] md:text-[2.15rem] font-extrabold leading-tight tracking-tight"
                  style={{ color: INK }}
                >
                  Get the SVS Food app
                </h2>
                <p
                  className="mt-1.5 sm:mt-2 text-[0.95rem] sm:text-[1.05rem] md:text-[1.15rem] font-medium"
                  style={{ color: INK }}
                >
                  Get what you need, when you need it
                </p>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 sm:gap-3">
                <StoreBadge href={APP_DOWNLOAD_URL} sub="GET IT ON" label="Google Play">
                  <GooglePlayIcon />
                </StoreBadge>
                <StoreBadge href={APP_DOWNLOAD_URL} sub="Available on the" label="App Store">
                  <AppleIcon />
                </StoreBadge>
                <StoreBadge href={APP_DOWNLOAD_URL} sub="EXPLORE IT ON" label="AppGallery">
                  <AppGalleryIcon />
                </StoreBadge>
              </div>
            </div>
          </div>
          <WavyEdge flip />
        </div>

        {/* Partner + Career cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 md:gap-7">
          <article
            className="rounded-[1.25rem] sm:rounded-[1.5rem] px-5 sm:px-7 md:px-8 py-6 sm:py-7 md:py-8 flex flex-col gap-5 sm:gap-6"
            style={{ backgroundColor: CREAM }}
          >
            <div className="flex items-start gap-4 sm:gap-5">
              <PartnerIcon />
              <div className="min-w-0 pt-0.5">
                <h3
                  className="text-[1.15rem] sm:text-[1.35rem] md:text-[1.5rem] font-extrabold leading-tight"
                  style={{ color: INK }}
                >
                  Become a partner
                </h3>
                <p
                  className="mt-1.5 sm:mt-2 text-[0.9rem] sm:text-[0.95rem] leading-relaxed"
                  style={{ color: INK, opacity: 0.85 }}
                >
                  Reach more customers &amp; achieve remarkable growth. Write your
                  next chapter with SVS Food.
                </p>
              </div>
            </div>
            <a
              href={PARTNER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto w-full text-center rounded-full font-bold text-[0.9rem] sm:text-[0.95rem] py-3 sm:py-3.5 px-6 text-white no-underline transition-opacity hover:opacity-90"
              style={{ backgroundColor: ORANGE }}
            >
              Find out more
            </a>
          </article>

          <article
            className="rounded-[1.25rem] sm:rounded-[1.5rem] px-5 sm:px-7 md:px-8 py-6 sm:py-7 md:py-8 flex flex-col gap-5 sm:gap-6"
            style={{ backgroundColor: CREAM }}
          >
            <div className="flex items-start gap-4 sm:gap-5">
              <CareerIcon />
              <div className="min-w-0 pt-0.5">
                <h3
                  className="text-[1.15rem] sm:text-[1.35rem] md:text-[1.5rem] font-extrabold leading-tight"
                  style={{ color: INK }}
                >
                  Grow in your career
                </h3>
                <p
                  className="mt-1.5 sm:mt-2 text-[0.9rem] sm:text-[0.95rem] leading-relaxed"
                  style={{ color: INK, opacity: 0.85 }}
                >
                  Join an amazing bunch of people who work behind the scenes to make
                  SVS Food happen.
                </p>
              </div>
            </div>
            <a
              href={CAREERS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto w-full text-center rounded-full font-bold text-[0.9rem] sm:text-[0.95rem] py-3 sm:py-3.5 px-6 text-white no-underline transition-opacity hover:opacity-90"
              style={{ backgroundColor: ORANGE }}
            >
              See open job opportunities
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
