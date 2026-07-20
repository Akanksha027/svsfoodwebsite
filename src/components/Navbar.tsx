"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { computeTotals, useCart } from "@/context/CartContext";
import { useMenuCart } from "@/context/MenuCartContext";
import { formatInr } from "@/lib/menu-api";
import StoryViewer from "@/components/StoryViewer";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";

const SVS_ORANGE = "#f16a34";
const HANDLING_FEE = 2;

const iconBtnBase =
  "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full border-none bg-transparent cursor-pointer transition-colors duration-200 no-underline shrink-0";

const iconBtnDefault = `${iconBtnBase} text-svs-ink/70 hover:bg-svs-cream hover:text-svs-orange`;
const iconBtnHero = `${iconBtnBase} text-white hover:bg-white/15 hover:text-white`;

const iconSvg = "w-[18px] h-[18px] sm:w-5 sm:h-5 lg:w-6 lg:h-6";

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
      <span className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11">
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

/** Center bar on menu/account: delivery ETA + user's saved address. */
function MenuCenterBar() {
  const router = useRouter();
  const { customer, openLogin } = useWebsiteAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const saved =
    customer?.addresses.find((a) => a.is_default) || customer?.addresses[0] || null;

  const addressLine = saved
    ? truncateText(
        `${saved.label || "Home"} · ${saved.formatted_address}`,
        64,
      )
    : customer
      ? "Add your delivery address"
      : "Sign in to set delivery address";

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const goUpdateAddress = () => {
    setMenuOpen(false);
    if (!customer) {
      openLogin();
      return;
    }
    router.push("/account?tab=addresses");
  };

  return (
    <div
      ref={wrapRef}
      className="hidden md:flex flex-1 min-w-0 mx-2 lg:mx-3 xl:mx-5 items-center justify-between gap-4 h-14 max-w-[900px] xl:max-w-[980px] px-1 lg:px-2 xl:px-3 relative"
      id="menu-nav-center-bar"
    >
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="min-w-0 flex flex-col justify-center text-left border-0 bg-transparent cursor-pointer p-0 rounded-lg hover:opacity-90"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <span className="text-[14px] lg:text-[15px] font-bold leading-tight text-gray-900">
          Delivering in few minutes
        </span>
        <span className="mt-0.5 text-[12px] lg:text-[13px] text-gray-500 truncate max-w-full inline-flex items-center gap-1">
          <span className="truncate">{addressLine}</span>
          <svg
            className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {menuOpen ? (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1.5 z-[1100] min-w-[220px] max-w-[min(100%,320px)] rounded-xl bg-white border border-gray-100 shadow-[0_8px_28px_rgba(0,0,0,0.12)] overflow-hidden py-1"
        >
          {saved ? (
            <p className="px-3.5 pt-2.5 pb-1.5 text-[11px] text-gray-500 leading-snug line-clamp-3">
              {saved.formatted_address}
            </p>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={goUpdateAddress}
            className="w-full text-left px-3.5 py-2.5 text-[13px] font-bold text-[#f16a34] hover:bg-orange-50 border-0 bg-transparent cursor-pointer"
          >
            {saved ? "Update address" : customer ? "Add address" : "Sign in to add address"}
          </button>
        </div>
      ) : null}
    </div>
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
  onAccount,
}: {
  onNavigate?: () => void;
  onOpenStories: () => void;
  hero?: boolean;
  menuMode?: boolean;
  homePage?: boolean;
  onAccount: () => void;
}) {
  const { itemCount } = useCart();
  const { customer } = useWebsiteAuth();
  const iconBtn = hero ? iconBtnHero : iconBtnDefault;
  const showCartAndLocation = !menuMode && !homePage;
  const photoUrl = customer?.photo_url?.trim() || null;

  return (
    <>
      {showCartAndLocation ? (
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

      {showCartAndLocation ? (
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
      ) : null}

      <button
        className={`${iconBtn} ${photoUrl ? "p-0 overflow-hidden" : ""}`}
        id="btn-account"
        aria-label="Account"
        type="button"
        onClick={onAccount}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        ) : (
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
        )}
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
      ) : null}
    </>
  );
}

function AccountMenuLink() {
  return (
    <Link
      href="/menu"
      className={iconBtnDefault}
      id="account-nav-menu"
      aria-label="Menu"
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
  );
}

export default function Navbar({
  variant = "default",
  menuMode = false,
  accountMode = false,
  homePage = false,
}: {
  variant?: "default" | "hero";
  /** Blinkit-style delivery + cart — menu / account */
  menuMode?: boolean;
  /** Account page — show Menu icon right of cart */
  accountMode?: boolean;
  /** Home `/` — hide cart + location icons in the bar */
  homePage?: boolean;
}) {
  const [storiesOpen, setStoriesOpen] = useState(false);
  const hero = variant === "hero";
  const { customer, openLogin, openAccountMenu } = useWebsiteAuth();

  const handleAccount = () => {
    if (customer) openAccountMenu();
    else openLogin();
  };

  return (
    <nav
      data-navbar-variant={hero ? "hero" : "default"}
      data-menu-mode={menuMode ? "true" : "false"}
      className={`fixed top-0 left-0 right-0 z-[1000] flex flex-nowrap items-center h-14 sm:h-16 md:h-20 lg:h-[72px] px-3 sm:px-4 md:px-6 lg:px-8 transition-[border-color,color,box-shadow] duration-300 ${
        hero
          ? "bg-transparent border-b border-transparent text-white"
          : "border-b border-transparent text-svs-ink"
      }`}
      style={
        hero
          ? undefined
          : {
              backgroundColor: "#fff4ee",
              // Keep scrolled menu cards from painting over the bar
              isolation: "isolate",
            }
      }
      id="main-navbar"
    >
      <Link
        href="/"
        className="flex items-center justify-center no-underline shrink-0 z-[1] py-1 pr-2"
        id="navbar-brand"
        aria-label="SVS Food home"
      >
        <BrandLogo
          variant={hero ? "on-ink" : "on-mark"}
          height={48}
          priority
        />
      </Link>

      {menuMode ? <MenuCenterBar /> : null}

      <div className="ml-auto flex flex-nowrap items-center shrink-0 relative z-[2] gap-0.5 sm:gap-1.5 lg:gap-2">
        {menuMode ? <OrangeCartButton /> : null}
        {accountMode ? <AccountMenuLink /> : null}
        <div
          className="flex flex-nowrap items-center gap-0.5 sm:gap-1.5 lg:gap-2"
          id="navbar-icons"
        >
          <NavIcons
            hero={hero}
            menuMode={menuMode}
            homePage={homePage}
            onOpenStories={() => setStoriesOpen(true)}
            onAccount={handleAccount}
          />
        </div>
      </div>

      <StoryViewer open={storiesOpen} onClose={() => setStoriesOpen(false)} />
    </nav>
  );
}
