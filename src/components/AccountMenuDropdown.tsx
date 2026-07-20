"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import AppDownloadPromo from "@/components/AppDownloadPromo";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";

const NAV_H =
  "top-14 sm:top-16 lg:top-[72px]";

const linkClass =
  "block w-full text-left px-4 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer no-underline border-0 bg-transparent transition-colors";

export default function AccountMenuDropdown() {
  const router = useRouter();
  const {
    customer,
    accountMenuOpen,
    closeAccountMenu,
    logout,
  } = useWebsiteAuth();
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
        className={`pointer-events-auto absolute inset-x-0 bottom-0 ${NAV_H} bg-black/20 cursor-default touch-none border-0`}
        aria-label="Close menu"
        onClick={closeAccountMenu}
      />

      <div
        className={`pointer-events-auto absolute ${NAV_H} mt-1.5 right-3 sm:right-4 md:right-6 lg:right-8 w-[min(calc(100vw-1.5rem),280px)] rounded-xl bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden otp-step-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-3.5 pb-3 border-b border-gray-100">
          <h2 className="text-[15px] font-extrabold text-gray-900 leading-tight">
            My Account
          </h2>
          <p className="text-[13px] text-gray-500 tabular-nums mt-0.5">
            +91 {customer.phone}
          </p>
        </div>

        <nav>
          <button type="button" className={linkClass} onClick={() => go("/account")}>
            My Orders
          </button>
          <button
            type="button"
            className={linkClass}
            onClick={() => go("/account?tab=addresses")}
          >
            Saved Addresses
          </button>
          <Link
            href="/privacy-policy"
            className={linkClass}
            onClick={closeAccountMenu}
          >
            Account Privacy
          </Link>
          <button
            type="button"
            className={`${linkClass} border-t border-gray-100 mt-0.5 pt-2.5`}
            onClick={() => void onLogout()}
          >
            Log Out
          </button>
        </nav>

        <div className="border-t border-gray-100 px-3 py-2.5 bg-gray-50/80">
          <AppDownloadPromo compact />
        </div>
      </div>
    </div>,
    document.body,
  );
}
