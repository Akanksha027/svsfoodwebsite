"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import StoryViewer from "@/components/StoryViewer";

const iconBtn =
  "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full border-none bg-transparent text-svs-ink cursor-pointer transition-colors duration-200 hover:bg-svs-cream hover:text-svs-orange no-underline shrink-0";

const iconSvg = "w-[18px] h-[18px] sm:w-5 sm:h-5 lg:w-6 lg:h-6";

function StoryTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className={`${iconBtn} p-0`}
      id="btn-stories"
      aria-label="Open SVS stories"
      onClick={onClick}
    >
      <span className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
        <span
          className="absolute inset-0 rounded-full story-ring-spin"
          style={{ transformStyle: "flat" }}
          aria-hidden
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          >
            <circle cx="20" cy="20" r="17" strokeDasharray="22 14" />
          </svg>
        </span>
        <span className="relative z-[1] flex items-center justify-center w-[calc(100%-6px)] h-[calc(100%-6px)] rounded-full bg-svs-white">
          <svg
            className={iconSvg}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="7" y="5" width="11" height="15" rx="2.5" opacity="0.45" />
            <rect x="5" y="7" width="11" height="15" rx="2.5" fill="currentColor" fillOpacity="0.08" />
            <path
              d="M10.25 12.75 13.75 14.5 10.25 16.25z"
              fill="currentColor"
              stroke="none"
            />
          </svg>
        </span>
      </span>
    </button>
  );
}

function NavIcons({
  onNavigate,
  onOpenStories,
}: {
  onNavigate?: () => void;
  onOpenStories: () => void;
}) {
  const { itemCount } = useCart();

  return (
    <>
      <Link
        href="/cart"
        className={`${iconBtn} relative overflow-hidden w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14`}
        id="btn-cart"
        aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
        onClick={onNavigate}
      >
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className="scale-[0.17] sm:scale-[0.19] lg:scale-[0.23]">
            <span
              className="block w-[120px] h-[150px] relative nav-revolving-bag"
              style={{ perspective: "800px" }}
            >
              <span className="block w-full h-full relative revolving-bag">
                <span className="bag-top-handle bag-front-handle" />
                <span className="bag-top-handle bag-back-handle" />
                <span className="bag-face bag-front">
                  <span className="text-[14px] font-black tracking-widest text-svs-ink">
                    SVS
                  </span>
                </span>
                <span className="bag-face bag-back">
                  <span className="text-[14px] font-black tracking-widest text-svs-ink transform rotate-y-180">
                    SVS
                  </span>
                </span>
                <span className="bag-face bag-left" />
                <span className="bag-face bag-right" />
              </span>
            </span>
          </span>
        </span>
        {itemCount > 0 ? (
          <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full bg-svs-orange text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center z-10">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </Link>

      <StoryTriggerButton
        onClick={() => {
          onOpenStories();
          onNavigate?.();
        }}
      />

      <Link
        href="/locations"
        className={iconBtn}
        id="btn-location"
        aria-label="Locations"
        onClick={onNavigate}
      >
        <svg
          className={iconSvg}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </Link>

      <button
        className={iconBtn}
        id="btn-account"
        aria-label="Account"
        type="button"
      >
        <svg
          className={iconSvg}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      <Link
        href="/menu"
        className={iconBtn}
        id="btn-menu"
        aria-label="Menu"
        onClick={onNavigate}
      >
        <svg
          className={iconSvg}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M17 3h1a2 2 0 0 1 2 2v2H17V3z" />
          <path d="M17 9h3v10a2 2 0 0 1-2 2h-1" />
          <path d="M8 7h4" />
          <path d="M8 11h5" />
          <path d="M8 15h3" />
        </svg>
      </Link>
    </>
  );
}

export default function Navbar() {
  const [iconsOpen, setIconsOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iconsOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIconsOpen(false);
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setIconsOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [iconsOpen]);

  const closeIcons = () => setIconsOpen(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[1000] flex flex-nowrap items-center h-14 sm:h-16 md:h-20 lg:h-[100px] px-3 sm:px-4 md:px-6 lg:px-8 bg-svs-white/95 backdrop-blur-sm border-b border-svs-cream"
      id="main-navbar"
    >
      {/* Logo: centered on small screens, left-aligned from md up */}
      <Link
        href="/"
        className="flex items-center justify-center no-underline shrink-0 z-[1]"
        id="navbar-brand"
        aria-label="SVS Food home"
        onClick={closeIcons}
      >
        <Image
          src="/logo-with-no-bg.png"
          alt="SVS Food"
          width={65}
          height={64}
          className="h-12 w-auto sm:h-12 md:h-14 lg:h-20 xl:h-24 object-contain"
          priority
        />
      </Link>
      {/* Right cluster — stays on one row inside the bar */}
      <div className="ml-auto flex flex-nowrap items-center shrink-0 relative z-[2]">
        {/* Desktop / tablet+: all icons */}
        <div
          className="hidden md:flex flex-nowrap items-center gap-1.5 lg:gap-2"
          id="navbar-icons"
        >
          <NavIcons onOpenStories={() => setStoriesOpen(true)} />
        </div>

        {/* Small screens: 3-dot toggles icon pill */}
        <div
          ref={panelRef}
          className="relative flex items-center md:hidden"
          id="navbar-icons-mobile"
        >
          <button
            type="button"
            className={`${iconBtn} bg-svs-cream border border-svs-cream`}
            id="btn-nav-actions"
            aria-label={iconsOpen ? "Close actions" : "Open actions"}
            aria-expanded={iconsOpen}
            aria-controls="nav-actions-panel"
            onClick={() => setIconsOpen((open) => !open)}
          >
            <svg
              className={iconSvg}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {iconsOpen ? (
                <>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </>
              ) : (
                <>
                  <circle
                    cx="12"
                    cy="5"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                  <circle
                    cx="12"
                    cy="19"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                </>
              )}
            </svg>
          </button>

          <div
            id="nav-actions-panel"
            role="menu"
            className={`absolute top-full mt-2 right-0 z-[1001] flex flex-nowrap items-center gap-0.5 p-1.5 rounded-full bg-svs-white shadow-[0_10px_40px_rgba(241,106,52,0.14)] border border-svs-cream transition-all duration-200 origin-top-right ${iconsOpen
              ? "opacity-100 scale-100 visible"
              : "opacity-0 scale-95 invisible pointer-events-none"
              }`}
          >
            <NavIcons
              onNavigate={closeIcons}
              onOpenStories={() => setStoriesOpen(true)}
            />
          </div>
        </div>
      </div>

      <StoryViewer open={storiesOpen} onClose={() => setStoriesOpen(false)} />
    </nav>
  );
}
