"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import AppDownloadPromo from "@/components/AppDownloadPromo";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";
import { useHeroBackdropSnapshot } from "@/hooks/useHeroBackdropSnapshot";
import {
  accountMenuPanelClass,
  accountOverlayBackdropClass,
  accountOverlayShellClass,
} from "@/lib/nav-layout";

const linkClass =
  "flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-gray-700 hover:bg-[#fff4ee] hover:text-[#f16a34] cursor-pointer no-underline border-0 bg-transparent transition-colors rounded-xl";

function Row({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={linkClass} onClick={onClick}>
      <span className="flex-1">{label}</span>
      <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export default function AccountMenuDropdown() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const router = useRouter();
  const { customer, accountMenuOpen, closeAccountMenu, logout } =
    useWebsiteAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(accountMenuOpen, isHome);
  const heroBackdrop = useHeroBackdropSnapshot(accountMenuOpen, isHome);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAccountMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [accountMenuOpen, closeAccountMenu]);

  if (!mounted || !accountMenuOpen || !customer) return null;

  const go = (href: string) => {
    closeAccountMenu();
    router.push(href);
  };

  const onLogout = async () => {
    closeAccountMenu();
    await logout();
    router.push("/menu");
  };

  return createPortal(
    <div
      className={accountOverlayShellClass(isHome)}
      role="dialog"
      aria-label="My account menu"
    >
      {heroBackdrop ? (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackdrop})` }}
          aria-hidden
        />
      ) : null}

      <button
        type="button"
        className={accountOverlayBackdropClass(isHome, "menu")}
        aria-label="Close menu"
        onClick={closeAccountMenu}
      />

      <div
        className={accountMenuPanelClass(isHome)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-[#fff8f4] to-white border-b border-black/[0.04]">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#f16a34]">
            My account
          </p>
          <h2 className="text-[16px] font-extrabold text-gray-900 leading-tight mt-1 truncate">
            {customer.name || `+91 ${customer.phone}`}
          </h2>
          {customer.name ? (
            <p className="text-[12px] text-gray-500 tabular-nums mt-0.5">
              +91 {customer.phone}
            </p>
          ) : null}
        </div>

        <nav className="p-2 space-y-0.5">
          <Row label="Profile" onClick={() => go("/account?tab=profile")} />
          <Row label="Orders" onClick={() => go("/account")} />
          <Row label="Addresses" onClick={() => go("/account?tab=addresses")} />
          <Row
            label="Notifications"
            onClick={() => go("/account?tab=notifications")}
          />
          <Row
            label="Gift cards"
            onClick={() => go("/account?tab=gift-cards")}
          />
          <Row label="Rewards" onClick={() => go("/account?tab=rewards")} />
          <Row label="SVS Cash" onClick={() => go("/account?tab=svs-cash")} />
          <Row label="Help Center" onClick={() => go("/account?tab=help")} />
          <Link
            href="/privacy-policy"
            className={linkClass}
            onClick={closeAccountMenu}
          >
            <span className="flex-1">Privacy</span>
          </Link>
          <div className="pt-1 mt-1 border-t border-gray-100">
            <button
              type="button"
              className={`${linkClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
              onClick={() => void onLogout()}
            >
              <span className="flex-1">Log out</span>
            </button>
          </div>
        </nav>

        <div className="border-t border-black/[0.04] px-3 py-2.5 bg-gray-50/70">
          <AppDownloadPromo compact />
        </div>
      </div>
    </div>,
    document.body,
  );
}
