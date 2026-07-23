"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useMemo, useRef, useState, useEffect } from "react";
import { computeTotals, useCart } from "@/context/CartContext";
import { useMenuCart } from "@/context/MenuCartContext";
import { storeDisplayName } from "@/data/locations";
import { formatInr } from "@/lib/menu-api";
import StoryViewer from "@/components/StoryViewer";
import ChangeLocationPanel from "@/components/ChangeLocationPanel";
import { useMenuDeliveryLocationLine } from "@/hooks/useMenuDeliveryLocationLine";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import MenuNavSearch from "@/components/MenuNavSearch";
import { useRouter, usePathname } from "next/navigation";

const SVS_ORANGE = "#f16a34";
const HANDLING_FEE = 2;

const iconBtnBase =
  "flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full border-none bg-transparent cursor-pointer transition-colors duration-200 no-underline shrink-0";

const iconBtnDefault = `${iconBtnBase} text-gray-400 hover:bg-black/5 hover:text-gray-600`;
const iconBtnHero = `${iconBtnBase} text-white hover:bg-white/15 hover:text-white`;

const navOrderBtn =
  "flex items-center justify-center relative overflow-visible w-12 h-12 sm:w-[52px] sm:h-[52px] lg:w-14 lg:h-14 rounded-full border-none bg-transparent cursor-pointer transition-[color,transform] duration-300 no-underline shrink-0 text-gray-400 hover:text-gray-600 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/40 focus-visible:ring-offset-2";

const navOrderBtnHero = `${navOrderBtn} text-white hover:text-white focus-visible:ring-white/50`;

const iconSvg = "w-5 h-5 sm:w-[22px] sm:h-[22px] lg:w-7 lg:h-7";

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

  return (
    <button
      type="button"
      className={iconBtn}
      id="btn-stories"
      aria-label="Watch SVS stories"
      onClick={onClick}
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
        <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
        <path d="M10.5 9.75v4.5l4.25-2.25L10.5 9.75z" fill="currentColor" stroke="none" />
      </svg>
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
      className="menu-nav-delivery flex min-w-0 flex-col justify-center h-10 sm:h-12 md:h-14 ml-0 px-0 sm:px-1 border-0 bg-transparent cursor-pointer text-left group"
      id="menu-nav-center-bar"
      aria-label="Change delivery location"
      aria-expanded={open}
    >
      <div className="relative w-fit flex flex-col">
        {/* Top Text (Determines Width) */}
        <span className="text-[11px] min-[400px]:text-[12px] sm:text-[13px] md:text-[15px] font-bold leading-tight text-gray-900 group-hover:text-[#f16a34] transition-colors whitespace-nowrap">
          <span className="md:hidden">Delivering to</span>
          <span className="hidden md:inline">Delivering in few minutes</span>
        </span>

        {/* Invisible Spacer to give proper height */}
        <span className="mt-0.5 flex w-full min-w-0 items-center gap-1 text-[10px] min-[400px]:text-[11px] sm:text-[12px] md:text-[13px] opacity-0 pointer-events-none select-none h-[15px] sm:h-[18px]" aria-hidden>
          &nbsp;
        </span>

        {/* Absolute Bottom Text (Restricted to Width) */}
        <span className="absolute bottom-0 left-0 w-full flex min-w-0 items-center gap-1 text-[10px] min-[400px]:text-[11px] sm:text-[12px] md:text-[13px] text-gray-500">
          <svg
            className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 shrink-0 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="truncate min-w-0 flex-1">{locationLine}</span>
          <svg
            className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-[#f16a34]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
    </button>
  );
}

function OrangeCartButton({
  compact = false,
  stacked = false,
}: {
  /** Icon-only on smaller desktop widths. */
  compact?: boolean;
  /** Full-width row inside mobile menu. */
  stacked?: boolean;
}) {
  const { itemCount, subtotal } = useCart();
  const { openCart, toggleCart, isOpen } = useMenuCart();

  const grandTotal = useMemo(() => {
    if (itemCount <= 0) return 0;
    const totals = computeTotals({ subtotal, orderType: "takeaway" });
    return totals.grandTotal + HANDLING_FEE;
  }, [itemCount, subtotal]);

  const open = () => (isOpen ? toggleCart() : openCart());

  if (stacked) {
    return (
      <button
        type="button"
        onClick={open}
        className="flex h-11 w-full shrink-0 items-center gap-3 rounded-xl border-0 px-4 text-white shadow-sm cursor-pointer transition-opacity hover:opacity-95"
        style={{ backgroundColor: SVS_ORANGE }}
        id="menu-nav-cart-mobile"
        aria-label={`Open cart, ${itemCount} items, ${formatInr(grandTotal)}`}
        aria-expanded={isOpen}
      >
        <svg
          className="h-5 w-5 shrink-0"
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
        <span className="flex flex-1 flex-col items-start leading-tight text-left">
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

  return (
    <button
      type="button"
      onClick={open}
      className={`hidden lg:inline-flex relative shrink-0 items-center gap-2 rounded-lg text-white shadow-sm cursor-pointer border-0 transition-opacity hover:opacity-95 ${
        compact ? "px-2.5 py-2" : "px-3.5 py-2"
      } mr-0 sm:mr-2`}
      style={{ backgroundColor: SVS_ORANGE }}
      id="menu-nav-cart"
      aria-label={`Open cart, ${itemCount} items, ${formatInr(grandTotal)}`}
      aria-expanded={isOpen}
    >
      <svg
        className="h-[18px] w-[18px] sm:h-5 sm:w-5 lg:h-[22px] lg:w-[22px] shrink-0"
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
      <span className={`${compact ? "hidden xl:flex" : "flex"} flex-col items-start leading-tight`}>
        <span className="text-sm font-bold">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </span>
        <span className="text-[13px] font-semibold opacity-95 tabular-nums">
          {formatInr(grandTotal)}
        </span>
      </span>
      {compact && itemCount > 0 ? (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-svs-orange xl:hidden">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </button>
  );
}

function MobileMenuButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
  hero?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${iconBtnBase} text-black hover:bg-black/5 hover:text-black lg:hidden`}
      aria-expanded={open}
      aria-controls="mobile-nav-panel"
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onClick}
    >
      <span className="relative flex h-[10px] w-[20px] flex-col justify-center" aria-hidden>
        <span
          className={`absolute left-0 block h-[2px] w-full rounded-full bg-black transition-all duration-200 ${
            open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
          }`}
        />
        <span
          className={`absolute left-0 block h-[2px] w-full rounded-full bg-black transition-all duration-200 ${
            open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
          }`}
        />
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
  cartPage = false,
  stacked = false,
  onAccount,
}: {
  onNavigate?: () => void;
  onOpenStories: () => void;
  hero?: boolean;
  menuMode?: boolean;
  homePage?: boolean;
  accountPage?: boolean;
  cartPage?: boolean;
  stacked?: boolean;
  onAccount: () => void;
}) {
  const { itemCount } = useCart();
  const iconBtn = menuMode
    ? `${iconBtnBase} w-8 h-8 min-[400px]:w-9 min-[400px]:h-9 sm:w-10 sm:h-10 text-gray-400 hover:bg-white/60 hover:text-gray-500`
    : hero
      ? iconBtnHero
      : iconBtnDefault;
  const stackedBtn = stacked
    ? `${iconBtn} !w-full !h-11 !max-w-none !rounded-xl justify-start gap-3 px-4 !text-black hover:!bg-black/5 hover:!text-black`
    : iconBtn;
  const svgClass = menuMode
    ? "w-4 h-4 min-[400px]:w-[18px] min-[400px]:h-[18px] sm:w-5 sm:h-5"
    : iconSvg;
  const showCartAndLocation = !menuMode && !homePage;
  const btn = stacked ? stackedBtn : iconBtn;

  return (
    <>
      {showCartAndLocation && !cartPage ? (
        accountPage ? (
          stacked ? (
            <OrangeCartButton stacked />
          ) : (
            <OrangeCartButton />
          )
        ) : (
          <Link
            href="/cart"
            className={`${btn} relative overflow-visible ${
              stacked
                ? ""
                : "w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12"
            }`}
            id="btn-cart"
            aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
            onClick={onNavigate}
          >
            {!stacked ? (
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
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="text-sm font-semibold">Cart{itemCount ? ` (${itemCount})` : ""}</span>
              </>
            )}
            {!stacked && itemCount > 0 ? (
              <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full bg-svs-orange text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center z-10">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
        )
      ) : null}

      {!menuMode && !cartPage ? (
        <StoryTriggerButton
          hero={hero}
          onClick={() => {
            onOpenStories();
            onNavigate?.();
          }}
        />
      ) : null}

      {showCartAndLocation && !accountPage && !cartPage ? (
        <Link
          href="/locations"
          className={btn}
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
          {stacked ? <span className="text-sm font-semibold">Locations</span> : null}
        </Link>
      ) : null}

      <Link
        href="/account?tab=gift-cards"
        className={`${btn} ${menuMode && !stacked ? "hidden sm:flex" : ""}`}
        id="btn-gift-cards"
        aria-label="Gift cards"
        onClick={onNavigate}
      >
        <GiftCardNavIcon className={svgClass} />
        {stacked ? <span className="text-sm font-semibold">Gift cards</span> : null}
      </Link>

      <button
        className={btn}
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
        {stacked ? <span className="text-sm font-semibold">Account</span> : null}
      </button>

      {!menuMode && !accountPage ? (
        <Link
          href="/menu"
          className={
            stacked
              ? `${btn} !justify-start`
              : homePage
                ? `${hero ? navOrderBtnHero : navOrderBtn} w-10 h-10 sm:w-11 sm:h-11 lg:w-16 lg:h-16 xl:w-20 xl:h-20`
                : `${iconBtn} relative flex items-center justify-center`
          }
          id="btn-menu"
          aria-label="Order now"
          onClick={onNavigate}
        >
          <img
            src="/Package.png"
            alt="Order now"
            className={
              stacked
                ? "h-6 w-6 object-contain"
                : homePage
                  ? "h-9 w-9 sm:h-10 sm:w-10 lg:h-14 lg:w-14 xl:h-16 xl:w-16 object-contain hover:scale-110 transition-transform duration-200"
                  : "w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 object-contain hover:scale-110 transition-transform duration-200"
            }
          />
          {stacked ? <span className="text-sm font-semibold">Order now</span> : null}
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
  cartPage = false,
}: {
  variant?: "default" | "hero";
  /** Blinkit-style delivery + cart — menu page only */
  menuMode?: boolean;
  /** Home `/` — hide cart + location icons in the bar */
  homePage?: boolean;
  /** Account/profile — sit slightly lower with white page bg */
  accountPage?: boolean;
  /** Cart page — hide the cart bag icon */
  cartPage?: boolean;
}) {
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locationAnchorRef = useRef<HTMLButtonElement>(null);
  const hero = variant === "hero";
  const { customer, openLogin, openAccountMenu } = useWebsiteAuth();
  const { closeCart, isOpen: cartOpen } = useMenuCart();
  const router = useRouter();
  const pathname = usePathname();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNavAction = () => {
    if (cartOpen) closeCart();
    if (locationOpen) setLocationOpen(false);
    closeMobileMenu();
  };

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  const handleAccount = () => {
    if (cartOpen) closeCart();
    if (locationOpen) setLocationOpen(false);
    closeMobileMenu();
    if (customer) {
      router.push("/account?tab=profile");
    } else {
      openLogin();
    }
  };

  const openLocationPanel = () => {
    if (cartOpen) closeCart();
    setLocationOpen(true);
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const mobilePanelClass =
    hero && (homePage || accountPage)
      ? "border-black/10 bg-white text-black shadow-black/10"
      : menuMode
        ? "border-black/10 bg-svs-cream text-black"
        : "border-black/10 bg-white text-black shadow-black/10";

  return (
    <>
      {mobileMenuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[1390] bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={closeMobileMenu}
        />
      ) : null}

    <nav
      data-navbar-variant={hero ? "hero" : "default"}
      data-menu-mode={menuMode ? "true" : "false"}
      data-account-page={accountPage ? "true" : "false"}
      style={{ backgroundColor: menuMode ? "#fff4ee" : "transparent" }}
      className={`fixed left-0 right-0 z-[1400] ${menuMode
        ? "flex flex-col md:flex-row md:items-center"
        : homePage
          ? "flex flex-nowrap items-end h-12 sm:h-14 md:h-16 lg:h-[72px]"
          : "flex flex-nowrap items-center min-h-12 sm:min-h-14"
        } pl-3 sm:pl-4 md:pl-6 lg:pl-8 pr-2 sm:pr-3 md:pr-3 lg:pr-4 transition-[background-color,border-color,color,box-shadow,top] duration-300 border-b ${menuMode ? "border-black/10" : "border-transparent"} shadow-none ${homePage
          ? "top-3 sm:top-4 lg:top-5 pb-1 sm:pb-1.5 lg:pb-2.5"
          : "top-0 pt-2.5 sm:pt-3 md:pt-4 pb-2 sm:pb-3"
        } ${menuMode ? "bg-svs-cream menu-nav-shell" : "bg-transparent"} ${hero ? "text-white" : "text-gray-400"}`}
      id="main-navbar"
    >
      {menuMode ? (
        <div className="menu-nav-inner flex w-full flex-col md:contents min-w-0 bg-svs-cream">
          <div className="menu-nav-top-row flex w-full max-w-[1100px] mx-auto items-center h-12 sm:h-14 md:h-20 lg:h-[72px] min-w-0 relative">
            <div className="flex min-w-0 flex-1 items-center md:max-w-[42%] lg:max-w-[38%] xl:max-w-[36%]">
              <Link
                href="/"
                className="menu-nav-brand hidden md:flex items-center justify-center no-underline shrink-0 z-[1] pr-3 lg:pr-4 mr-3 lg:mr-4 border-r-[1.5px] border-[#f16a34]/30"
                id="navbar-brand"
                aria-label="SVS Food home"
              >
                <BrandLogo
                  variant={hero ? "on-ink" : "on-mark"}
                  height={42}
                  priority
                  className="menu-nav-brand-logo"
                />
              </Link>
              <MenuCenterBar
                anchorRef={locationAnchorRef}
                open={locationOpen}
                onOpenLocation={openLocationPanel}
              />
            </div>

            <div className="hidden lg:block absolute left-1/2 top-1/2 z-[3] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="pointer-events-auto">
                <MenuNavSearch />
              </div>
            </div>

            <div className="ml-auto flex flex-nowrap items-center shrink-0 relative z-[2] gap-0.5 min-[400px]:gap-1 sm:gap-1.5 lg:gap-2.5 pl-1">
              <OrangeCartButton />
              <div
                className="hidden lg:flex flex-nowrap items-center gap-0 sm:gap-0.5"
                id="navbar-icons"
              >
                <NavIcons
                  hero={hero}
                  menuMode={menuMode}
                  homePage={homePage}
                  accountPage={accountPage}
                  onNavigate={handleNavAction}
                  onOpenStories={() => setStoriesOpen(true)}
                  onAccount={handleAccount}
                />
              </div>
              <MobileMenuButton
                open={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
                hero={hero}
              />
            </div>
          </div>

        </div>
      ) : !menuMode && !homePage ? (
        <Link
          href="/"
          className="flex items-center justify-center no-underline shrink-0 z-[1] pr-2"
          id="navbar-brand"
          aria-label="SVS Food home"
        >
          <BrandLogo
            variant={hero ? "on-ink" : "on-mark"}
            height={52}
            priority
          />
        </Link>
      ) : null}

      {!menuMode ? <div className="min-w-2 flex-1" aria-hidden /> : null}

      {!menuMode ? (
        <div className="flex flex-nowrap items-center shrink-0 relative z-[2] gap-1 sm:gap-1.5 lg:gap-2.5 ml-auto">
          {/* Home keeps icons visible on all screens; account/other use hamburger below lg */}
          <div
            className={`${
              homePage ? "flex" : "hidden lg:flex"
            } flex-nowrap items-center gap-0.5 sm:gap-1.5 lg:gap-2`}
            id="navbar-icons"
          >
            <NavIcons
              hero={hero}
              menuMode={menuMode}
              homePage={homePage}
              accountPage={accountPage}
              cartPage={cartPage}
              onNavigate={handleNavAction}
              onOpenStories={() => setStoriesOpen(true)}
              onAccount={handleAccount}
            />
          </div>
          {!homePage ? (
            <MobileMenuButton
              open={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              hero={hero}
            />
          ) : null}
        </div>
      ) : null}

      {mobileMenuOpen && !homePage ? (
        <div
          id="mobile-nav-panel"
          className="lg:hidden absolute left-0 right-0 top-full z-[20] mt-1 px-3 sm:px-4 md:px-6"
        >
          <div
            className={`flex w-full flex-col gap-0.5 rounded-2xl border p-2 shadow-xl ${mobilePanelClass}`}
          >
            {menuMode ? <OrangeCartButton stacked /> : null}
            <NavIcons
              stacked
              hero={hero}
              menuMode={menuMode}
              homePage={homePage}
              accountPage={accountPage}
              cartPage={cartPage}
              onNavigate={handleNavAction}
              onOpenStories={() => {
                setStoriesOpen(true);
                closeMobileMenu();
              }}
              onAccount={handleAccount}
            />
          </div>
        </div>
      ) : null}

      <StoryViewer open={storiesOpen} onClose={() => setStoriesOpen(false)} />
      {menuMode ? (
        <ChangeLocationPanel
          open={locationOpen}
          anchorRef={locationAnchorRef}
          onClose={() => setLocationOpen(false)}
        />
      ) : null}
    </nav>
    </>
  );
}
