"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useMemo, useRef, useState } from "react";
import { computeTotals, useCart } from "@/context/CartContext";
import { useMenuCart } from "@/context/MenuCartContext";
import { storeDisplayName } from "@/data/locations";
import { formatInr } from "@/lib/menu-api";
import StoryViewer from "@/components/StoryViewer";
import ChangeLocationPanel from "@/components/ChangeLocationPanel";
import { useMenuDeliveryLocationLine } from "@/hooks/useMenuDeliveryLocationLine";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";

const SVS_ORANGE = "#f16a34";
const HANDLING_FEE = 2;

const iconBtnBase =
  "flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full border-none bg-transparent cursor-pointer transition-colors duration-200 no-underline shrink-0";

const iconBtnDefault = `${iconBtnBase} text-svs-ink/70 hover:bg-svs-cream hover:text-svs-orange`;
const iconBtnHero = `${iconBtnBase} text-white hover:bg-white/15 hover:text-white`;

const iconSvg = "w-5 h-5 sm:w-[22px] sm:h-[22px] lg:w-7 lg:h-7";
const storyRingSize = "w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12";

function GiftCardNavIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 9.5h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 21.5H4A1.5 1.5 0 0 1 2.5 20v-9A1.5 1.5 0 0 1 4 9.5z" />
      <path d="M12 9.5v12" />
      <path d="M12 9.5c0-3.1 2-5.5 4.25-5.5 1.45 0 2.75.95 2.75 2.45 0 1.65-1.45 3.05-3.35 3.05H12z" />
      <path d="M12 9.5c0-3.1-2-5.5-4.25-5.5-1.45 0-2.75.95-2.75 2.45 0 1.65 1.45 3.05 3.35 3.05H12z" />
      <path d="M6.5 14.5h3.5" strokeWidth="1.4" />
      <circle cx="17" cy="16.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function truncateText(text: string, max = 48) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function StoryTriggerButton({
  onClick,
  hero,
}: {
  onClick: () => void;
  hero?: boolean;
}) {
  const iconBtn = hero ? iconBtnHero : iconBtnDefault;
  const ringClass = hero ? "text-white" : "text-svs-orange";
  const innerClass = hero
    ? "bg-transparent text-white"
    : "bg-svs-cream text-svs-ink";

  return (
    <button
      type="button"
      className={`${iconBtn} p-0`}
      id="btn-stories"
      aria-label="Open SVS stories"
      onClick={onClick}
    >
      <span className={`relative flex items-center justify-center ${storyRingSize}`}>
        <span
          className={`absolute inset-0 rounded-full story-ring-spin ${ringClass}`}
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
        <span
          className={`relative z-[1] flex items-center justify-center w-[calc(100%-7px)] h-[calc(100%-7px)] rounded-full ${innerClass}`}
        >
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
            {!hero ? (
              <rect
                x="5"
                y="7"
                width="11"
                height="15"
                rx="2.5"
                stroke="currentColor"
                strokeOpacity="0.28"
                fill="none"
              />
            ) : null}
            <rect x="7" y="5" width="11" height="15" rx="2.5" fill="none" />
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

/** Center bar on menu page: delivery info — opens change-location panel. */
function MenuCenterBar({
  onOpenLocation,
  anchorRef,
  open,
}: {
  onOpenLocation: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
}) {
  const { store } = useCart();
  const fallback = truncateText(
    `${storeDisplayName(store)} · ${store.address}`,
  );
  const locationLine = useMenuDeliveryLocationLine(fallback);

  return (
    <button
      ref={anchorRef}
      type="button"
      onClick={onOpenLocation}
      className="flex min-w-0 flex-col justify-center h-12 sm:h-14 ml-1.5 sm:ml-4 md:ml-8 lg:ml-10 xl:ml-12 px-0.5 sm:px-1 border-0 bg-transparent cursor-pointer text-left group shrink max-w-[min(52vw,480px)] sm:max-w-[min(62vw,480px)]"
      id="menu-nav-center-bar"
      aria-label="Change delivery location"
      aria-expanded={open}
    >
      <span className="text-[11px] sm:text-[15px] font-bold leading-tight text-gray-900 group-hover:text-[#f16a34] transition-colors truncate">
        Delivering in few minutes
      </span>
      <span className="mt-0.5 flex min-w-0 max-w-full items-center gap-0.5 text-[10px] sm:text-[13px] text-gray-500">
        <svg
          className="h-3.5 w-3.5 shrink-0 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="truncate min-w-0">{locationLine}</span>
        <svg
          className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-[#f16a34] ml-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </button>
  );
}

function OrangeCartButton() {
  const { itemCount, subtotal } = useCart();
  const { openCart, toggleCart, isOpen } = useMenuCart();

  const grandTotal = useMemo(() => {
    const totals = computeTotals({ subtotal, orderType: "takeaway" });
    return totals.grandTotal + HANDLING_FEE;
  }, [subtotal]);

  return (
    <button
      type="button"
      onClick={() => (isOpen ? toggleCart() : openCart())}
      className="hidden lg:inline-flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2 text-white shadow-sm cursor-pointer border-0 transition-opacity hover:opacity-95 mr-2"
      style={{ backgroundColor: SVS_ORANGE }}
      id="menu-nav-cart"
      aria-label={`Open cart, ${itemCount} items, ${formatInr(grandTotal)}`}
      aria-expanded={isOpen}
    >
      <svg
        className="h-5 w-5 lg:h-[22px] lg:w-[22px] shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-sm font-bold">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </span>
        <span className="text-[13px] font-semibold opacity-95 tabular-nums">
          {formatInr(grandTotal)}
        </span>
      </span>
    </button>
  );
}

function NavIcons({
  onNavigate,
  onOpenStories,
  hero = false,
  menuMode = false,
  homePage = false,
  accountPage = false,
  onAccount,
}: {
  onNavigate?: () => void;
  onOpenStories: () => void;
  hero?: boolean;
  menuMode?: boolean;
  homePage?: boolean;
  accountPage?: boolean;
  onAccount: () => void;
}) {
  const { itemCount } = useCart();
  const iconBtn = menuMode
    ? `${iconBtnBase} w-9 h-9 sm:w-10 sm:h-10 text-svs-ink/70 hover:bg-white/60 hover:text-svs-orange`
    : hero
      ? iconBtnHero
      : iconBtnDefault;
  const svgClass = menuMode ? "w-[18px] h-[18px] sm:w-5 sm:h-5" : iconSvg;
  const showCartAndLocation = !menuMode && !homePage;

  return (
    <>
      {showCartAndLocation ? (
        <Link
          href="/cart"
          className={`${iconBtn} relative overflow-hidden w-12 h-12 sm:w-[52px] sm:h-[52px] lg:w-16 lg:h-16`}
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
      ) : null}

      {!menuMode ? (
        <StoryTriggerButton
          hero={hero}
          onClick={() => {
            onOpenStories();
            onNavigate?.();
          }}
        />
      ) : null}

      {showCartAndLocation && !accountPage ? (
        <Link
          href="/locations"
          className={iconBtn}
          id="btn-location"
          aria-label="Locations"
          onClick={onNavigate}
        >
          <svg
            className={svgClass}
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
      ) : null}

      <Link
        href="/account?tab=gift-cards"
        className={iconBtn}
        id="btn-gift-cards"
        aria-label="Gift cards"
        onClick={onNavigate}
      >
        <GiftCardNavIcon className={svgClass} />
      </Link>

      <button
        className={iconBtn}
        id="btn-account"
        aria-label="Account"
        type="button"
        onClick={onAccount}
      >
        <svg
          className={svgClass}
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

      {!menuMode ? (
        <Link
          href="/menu"
          className={iconBtn}
          id="btn-menu"
          aria-label="Menu"
          onClick={onNavigate}
        >
          <svg
            className={svgClass}
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
      ) : null}
    </>
  );
}

export default function Navbar({
  variant = "default",
  menuMode = false,
  homePage = false,
  accountPage = false,
}: {
  variant?: "default" | "hero";
  /** Blinkit-style delivery + cart — menu page only */
  menuMode?: boolean;
  /** Home `/` — hide cart + location icons in the bar */
  homePage?: boolean;
  /** Account/profile — sit slightly lower with white page bg */
  accountPage?: boolean;
}) {
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const locationAnchorRef = useRef<HTMLButtonElement>(null);
  const hero = variant === "hero";
  const { customer, openLogin, openAccountMenu } = useWebsiteAuth();
  const { closeCart, isOpen: cartOpen } = useMenuCart();

  const handleAccount = () => {
    if (cartOpen) closeCart();
    if (locationOpen) setLocationOpen(false);
    if (customer) openAccountMenu();
    else openLogin();
  };

  const openLocationPanel = () => {
    if (cartOpen) closeCart();
    setLocationOpen(true);
  };

  return (
    <nav
      data-navbar-variant={hero ? "hero" : "default"}
      data-menu-mode={menuMode ? "true" : "false"}
      data-account-page={accountPage ? "true" : "false"}
      style={{ backgroundColor: menuMode ? "#fff4ee" : "transparent" }}
      className={`fixed left-0 right-0 z-[1400] flex flex-nowrap ${menuMode ? "items-center" : "items-end"} h-14 sm:h-16 md:h-20 lg:h-[72px] px-3 sm:px-4 md:px-6 lg:px-8 transition-[background-color,border-color,color,box-shadow,top] duration-300 border-b border-transparent shadow-none ${
        accountPage
          ? "top-3 sm:top-4 lg:top-5 pb-3 sm:pb-3.5 lg:pb-4"
          : menuMode
            ? "top-0 pb-0"
            : "top-0 pb-1.5 sm:pb-2 lg:pb-2.5"
      } ${menuMode ? "bg-svs-cream" : "bg-transparent"} ${hero ? "text-white" : "text-gray-500"}`}
      id="main-navbar"
    >
      <Link
        href="/"
        className={`flex items-center justify-center no-underline shrink-0 z-[1] ${
          menuMode ? "self-center pr-0.5" : "pr-2"
        }`}
        id="navbar-brand"
        aria-label="SVS Food home"
      >
        <BrandLogo
          variant={hero ? "on-ink" : "on-mark"}
          height={menuMode ? 42 : 52}
          priority
        />
      </Link>

      {menuMode ? (
        <MenuCenterBar
          anchorRef={locationAnchorRef}
          open={locationOpen}
          onOpenLocation={openLocationPanel}
        />
      ) : null}

      {menuMode ? <div className="min-w-2 flex-1" aria-hidden /> : null}

      <div className="ml-auto flex flex-nowrap items-center shrink-0 relative z-[2] gap-0 sm:gap-1 lg:gap-2">
        {menuMode ? <OrangeCartButton /> : null}
        <div
          className={`flex flex-nowrap items-center ${menuMode ? "gap-0 sm:gap-0.5" : "gap-0.5 sm:gap-1.5 lg:gap-2"}`}
          id="navbar-icons"
        >
          <NavIcons
            hero={hero}
            menuMode={menuMode}
            homePage={homePage}
            accountPage={accountPage}
            onNavigate={() => {
              if (cartOpen) closeCart();
              if (locationOpen) setLocationOpen(false);
            }}
            onOpenStories={() => setStoriesOpen(true)}
            onAccount={handleAccount}
          />
        </div>
      </div>

      <StoryViewer open={storiesOpen} onClose={() => setStoriesOpen(false)} />
      {menuMode ? (
        <ChangeLocationPanel
          open={locationOpen}
          anchorRef={locationAnchorRef}
          onClose={() => setLocationOpen(false)}
        />
      ) : null}
    </nav>
  );
}
