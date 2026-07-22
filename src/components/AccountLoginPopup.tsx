"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import BrandLogo from "@/components/BrandLogo";
import OtpSixBoxes from "@/components/OtpSixBoxes";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import { useInlinePhoneOtp } from "@/hooks/useInlinePhoneOtp";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";
import { formatIndianMobileInput } from "@/lib/indian-phone";
import {
  SVS_APP_STORE_URL,
  SVS_PLAY_STORE_URL,
} from "@/lib/app-store-links";
import {
  accountLoginPanelWrapClass,
  accountOverlayBackdropClass,
  accountOverlayShellClass,
} from "@/lib/nav-layout";

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function StoreBadge({
  href,
  kind,
}: {
  href: string;
  kind: "apple" | "google";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 rounded-lg bg-black px-3.5 py-2 text-white no-underline hover:bg-gray-900 transition-colors min-w-[138px]"
    >
      {kind === "apple" ? (
        <svg
          className="h-7 w-7 shrink-0"
          viewBox="0 0 24 24"
          fill="#ffffff"
          aria-hidden
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 15 2.94 10.53 4.7 7.55c.87-1.48 2.43-2.42 4.12-2.45 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.22-1.98 1.08-3.13-1.05.05-2.31.7-3.05 1.58-.66.77-1.24 2.01-1.08 3.19 1.14.09 2.32-.58 3.05-1.64" />
        </svg>
      ) : (
        <svg
          className="h-6 w-6 shrink-0"
          viewBox="0 0 256 283"
          aria-hidden
        >
          <path
            fill="#EA4335"
            d="M119.55 134.92 1.06 259.06c2.7 9.56 9.66 17.33 18.86 21.06 9.2 3.73 19.61 2.99 28.2-1.99l133.33-75.93-61.9-67.28Z"
          />
          <path
            fill="#FBBC04"
            d="m239.37 113.81-57.66-33.02-64.9 56.95 65.16 64.28 57.22-32.67c10.33-5.41 16.81-16.11 16.81-27.77 0-11.66-6.48-22.36-16.81-27.77l.18.01Z"
          />
          <path
            fill="#4285F4"
            d="M1.06 23.49C.34 26.13 0 28.87 0 31.61v219.33c.01 2.74.36 5.47 1.06 8.12L123.61 138.1 1.06 23.49Z"
          />
          <path
            fill="#34A853"
            d="m120.44 141.27 61.28-60.48L48.56 4.5C43.55 1.57 37.86.02 32.05 0 17.64-.03 4.98 9.53 1.06 23.4l119.38 117.87Z"
          />
        </svg>
      )}
      <span className="flex flex-col leading-none text-left">
        <span className="text-[9px] font-medium text-white/90">
          {kind === "apple" ? "Download on the" : "GET IT ON"}
        </span>
        <span className="text-[13px] font-bold tracking-tight mt-0.5 text-white">
          {kind === "apple" ? "App Store" : "Google Play"}
        </span>
      </span>
    </a>
  );
}

function LoginMarketingPanel() {
  return (
    <div className="relative hidden md:flex w-[46%] shrink-0 flex-col overflow-hidden bg-[#FEE9DA] pt-9">
      <div className="relative z-[1] px-8">
        <BrandLogo variant="on-mark" height={40} priority />
        <h2 className="mt-6 text-[32px] leading-[1.15] font-extrabold tracking-tight text-gray-900 max-w-[14ch]">
          Fresh food, delivered{" "}
          <span className="text-[#f16a34]">fast</span>
        </h2>
      </div>
      <div className="relative mt-auto flex-1 min-h-[260px] w-full">
        <Image
          src="/images/login-delivery.png"
          alt=""
          fill
          className="object-cover object-bottom pointer-events-none select-none"
          sizes="420px"
          priority
        />
      </div>
    </div>
  );
}

function AppPromoFooter() {
  return (
    <div className="mt-auto rounded-2xl bg-[#f4f4f5] px-4 py-4 text-center">
      <p className="text-[12px] sm:text-[13px] font-medium text-gray-600 mb-3">
        Order faster &amp; easier everytime with the SVS Food app
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <StoreBadge href={SVS_APP_STORE_URL} kind="apple" />
        <StoreBadge href={SVS_PLAY_STORE_URL} kind="google" />
      </div>
    </div>
  );
}

export default function AccountLoginPopup() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { loginOpen, closeLogin, customer } = useWebsiteAuth();
  const [phone, setPhone] = useState("");
  const [mounted, setMounted] = useState(false);
  const verifyLock = useRef(false);

  const otp = useInlinePhoneOtp({
    active: loginOpen,
    phone,
    name: "",
    skipOtpWhenLoggedIn: false,
  });

  const {
    phoneValid,
    codeSentForCurrent,
    sendBusy,
    verifyBusy,
    otpError,
    resendIn,
    sendOtp,
    verify,
    setOtpError,
    clearOtpStep,
    otp: code,
    setOtp,
    mobile,
  } = otp;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!loginOpen) {
      setPhone("");
      clearOtpStep();
      verifyLock.current = false;
    }
  }, [loginOpen, clearOtpStep]);

  useBodyScrollLock(loginOpen);

  useEffect(() => {
    if (!codeSentForCurrent) verifyLock.current = false;
  }, [codeSentForCurrent]);

  const onContinue = async () => {
    if (!phoneValid) return;
    await sendOtp();
  };

  const onSixDone = useCallback(
    async (six: string) => {
      if (verifyBusy || verifyLock.current) return;
      verifyLock.current = true;
      setOtp(six);
      const ok = await verify(six);
      if (!ok) {
        verifyLock.current = false;
        setOtp("");
      }
    },
    [verifyBusy, verify, setOtp],
  );

  const editPhone = () => {
    clearOtpStep();
    setOtp("");
    setOtpError(null);
  };

  if (!mounted || !loginOpen || customer) return null;

  const onOtpStep = codeSentForCurrent;

  return createPortal(
    <div
      className={accountOverlayShellClass(isHome)}
      role="dialog"
      aria-modal
      aria-labelledby="login-popup-title"
    >
      <button
        type="button"
        className={accountOverlayBackdropClass(isHome, "login")}
        aria-label="Close"
        onClick={closeLogin}
      />

      <div
        className={accountLoginPanelWrapClass(isHome)}
        style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="pointer-events-auto relative flex w-full max-w-[860px] max-h-[min(92dvh,640px)] overflow-hidden rounded-t-[1.75rem] sm:rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] animate-[otp-step-in_0.25s_ease-out]">
          <LoginMarketingPanel />

          <div className="relative flex flex-1 flex-col min-w-0 bg-white px-5 sm:px-8 pt-5 sm:pt-7 pb-5 sm:pb-6">
            <button
              type="button"
              onClick={closeLogin}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
              aria-label="Close"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="md:hidden mb-4 pr-10">
              <BrandLogo variant="on-mark" height={36} priority />
            </div>

            {!onOtpStep ? (
              <div className="flex flex-1 flex-col min-h-0">
                <h2
                  id="login-popup-title"
                  className="text-[26px] sm:text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight"
                >
                  Login / Sign up
                </h2>
                <p className="mt-2 text-[14px] text-gray-500 mb-6">
                  Enter your mobile number to continue
                </p>

                <div className="flex items-center h-12 rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:border-gray-900">
                  <span className="pl-4 pr-3 text-[15px] font-semibold text-gray-800 border-r border-gray-200 h-full flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="Enter mobile number"
                    className="flex-1 min-w-0 h-full px-3 text-[15px] font-medium tabular-nums outline-none bg-transparent placeholder:text-gray-400"
                    value={phone}
                    onChange={(e) => {
                      setOtpError(null);
                      setPhone(formatIndianMobileInput(e.target.value));
                    }}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      const next = formatIndianMobileInput(el.value);
                      if (el.value !== next) {
                        el.value = next;
                        setPhone(next);
                      }
                    }}
                  />
                </div>

                {otpError ? (
                  <p className="text-[12px] text-[#c2410c] font-medium mt-2">
                    {otpError}
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={!phoneValid || sendBusy}
                  onClick={() => void onContinue()}
                  className={`mt-5 w-full h-12 rounded-xl text-[15px] font-extrabold cursor-pointer transition-colors ${
                    phoneValid
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  } disabled:opacity-70`}
                >
                  {sendBusy ? "Sending OTP…" : "Continue"}
                </button>

                <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
                  By continuing, you agree to our{" "}
                  <Link
                    href="/terms-and-conditions"
                    className="underline text-gray-700"
                    onClick={closeLogin}
                  >
                    Terms of service
                  </Link>{" "}
                  &{" "}
                  <Link
                    href="/privacy-policy"
                    className="underline text-gray-700"
                    onClick={closeLogin}
                  >
                    Privacy policy
                  </Link>
                </p>

                <div className="mt-6">
                  <AppPromoFooter />
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col min-h-0">
                <h2
                  id="login-popup-title"
                  className="text-[26px] sm:text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight pr-8"
                >
                  OTP Verification
                </h2>
                <p className="mt-2.5 text-[14px] text-gray-600 mb-6 flex flex-wrap items-center gap-1.5">
                  <span>
                    OTP has been sent to{" "}
                    <span className="font-semibold tabular-nums text-gray-900">
                      +91 {mobile}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={editPhone}
                    className="inline-flex items-center justify-center text-gray-700 hover:text-[#f16a34] border-0 bg-transparent p-0.5 cursor-pointer"
                    aria-label="Edit mobile number"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>
                </p>

                <OtpSixBoxes
                  variant="login"
                  value={code}
                  onChange={(v) => {
                    setOtpError(null);
                    setOtp(v);
                  }}
                  onComplete={(six) => void onSixDone(six)}
                  disabled={verifyBusy}
                  error={Boolean(otpError)}
                  autoFocus={onOtpStep && !verifyBusy}
                  focusDelayMs={80}
                />

                {sendBusy ? (
                  <p className="text-[13px] text-gray-500 mt-4">Sending OTP…</p>
                ) : null}
                {verifyBusy ? (
                  <p className="text-[13px] text-gray-500 mt-4">Verifying…</p>
                ) : null}
                {otpError ? (
                  <p className="text-[13px] font-medium text-[#c2410c] mt-4">
                    {otpError}
                  </p>
                ) : null}

                <div className="mt-5 text-[14px] text-gray-600">
                  {resendIn > 0 ? (
                    <p>
                      Resend OTP in{" "}
                      <span className="font-bold text-gray-900">
                        {resendIn}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={sendBusy}
                      onClick={() => void sendOtp()}
                      className="font-bold text-[#f16a34] bg-transparent border-0 p-0 cursor-pointer disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="mt-8 sm:mt-auto pt-4">
                  <AppPromoFooter />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
