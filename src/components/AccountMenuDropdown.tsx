"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import AppDownloadPromo from "@/components/AppDownloadPromo";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";

const NAV_H = "top-14 sm:top-16 lg:top-[72px]";

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
  const router = useRouter();
  const { customer, accountMenuOpen, closeAccountMenu, logout } =
    useWebsiteAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(accountMenuOpen);

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
      className="fixed inset-0 z-[1250] pointer-events-none"
      role="dialog"
      aria-label="My account menu"
    >
      <button
        type="button"
        className={`pointer-events-auto absolute inset-x-0 bottom-0 ${NAV_H} bg-black/25 cursor-default touch-none border-0`}
        aria-label="Close menu"
        onClick={closeAccountMenu}
      />

      <div
        className={`pointer-events-auto absolute ${NAV_H} mt-2 right-3 sm:right-4 md:right-6 lg:right-8 w-[min(calc(100vw-1.5rem),300px)] rounded-2xl bg-white border border-black/[0.04] shadow-[0_12px_40px_rgba(0,0,0,0.14)] overflow-hidden otp-step-in`}
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
