"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BrandLogo from "@/components/BrandLogo";
import OtpSixBoxes from "@/components/OtpSixBoxes";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import { useInlinePhoneOtp } from "@/hooks/useInlinePhoneOtp";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";
import { formatIndianMobileInput } from "@/lib/indian-phone";

export default function AccountLoginPopup() {
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

  const goBack = () => {
    if (codeSentForCurrent) {
      clearOtpStep();
      setOtp("");
      setOtpError(null);
      return;
    }
    closeLogin();
  };

  if (!mounted || !loginOpen || customer) return null;

  const onOtpStep = codeSentForCurrent;

  return createPortal(
    <div
      className="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
      role="dialog"
      aria-modal
      aria-labelledby="login-popup-title"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-svs-ink/45 backdrop-blur-md cursor-default touch-none border-0"
        aria-label="Close"
        onClick={closeLogin}
      />

      <div className="relative w-full sm:max-w-[380px] max-h-[min(92dvh,640px)] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-[otp-step-in_0.25s_ease-out]">
        <div className="px-6 pt-5 pb-2">
          <button
            type="button"
            onClick={goBack}
            className="flex h-10 w-10 items-center justify-center -ml-2 rounded-full hover:bg-gray-100 cursor-pointer border-0 bg-transparent text-gray-800"
            aria-label={onOtpStep ? "Back to mobile" : "Close"}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex w-[200%] transition-transform duration-300 ease-out"
            style={{
              transform: onOtpStep ? "translateX(-50%)" : "translateX(0)",
            }}
          >
            {/* Phone step */}
            <div className="w-1/2 shrink-0 px-6 pb-6">
              <div className="flex justify-center mb-5">
                <BrandLogo variant="on-mark" height={56} />
              </div>
              <h2
                id="login-popup-title"
                className="text-center text-[22px] font-extrabold text-gray-900 leading-tight tracking-tight"
              >
                Fresh food, delivered fast
              </h2>
              <p className="text-center text-[15px] text-gray-600 mt-1 mb-6">
                Log in or Sign up
              </p>

              <div className="flex items-center h-12 rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:border-[#f16a34] focus-within:ring-2 focus-within:ring-[#f16a34]/15">
                <span className="pl-4 pr-2 text-[15px] font-semibold text-gray-800 border-r border-gray-200 h-full flex items-center">
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

              {otpError && !onOtpStep ? (
                <p className="text-[12px] text-[#c2410c] font-medium mt-2 text-center">
                  {otpError}
                </p>
              ) : null}

              <button
                type="button"
                disabled={!phoneValid || sendBusy}
                onClick={() => void onContinue()}
                className={`mt-4 w-full h-12 rounded-xl text-[15px] font-extrabold cursor-pointer transition-colors ${
                  phoneValid
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                } disabled:opacity-70`}
              >
                {sendBusy ? "Sending code…" : "Continue"}
              </button>
            </div>

            {/* OTP step */}
            <div className="w-1/2 shrink-0 px-6 pb-6">
              <div className="flex justify-center mb-5">
                <BrandLogo variant="on-mark" height={48} />
              </div>
              <h2 className="text-center text-[20px] font-extrabold text-gray-900 leading-tight">
                Enter verification code
              </h2>
              <p className="text-center text-[13px] text-gray-600 mt-2 mb-5">
                Sent on WhatsApp to{" "}
                <span className="font-bold tabular-nums text-gray-900">
                  +91 {mobile}
                </span>
              </p>

              <OtpSixBoxes
                value={code}
                onChange={(v) => {
                  setOtpError(null);
                  setOtp(v);
                }}
                onComplete={(six) => void onSixDone(six)}
                disabled={verifyBusy}
                error={Boolean(otpError)}
                autoFocus={onOtpStep && !verifyBusy}
                focusDelayMs={320}
              />

              {verifyBusy ? (
                <p className="text-[12px] text-center text-gray-500 mt-3">
                  Verifying…
                </p>
              ) : null}
              {otpError ? (
                <p className="text-[12px] text-center font-medium text-[#c2410c] mt-3">
                  {otpError}
                </p>
              ) : null}

              <div className="flex items-center justify-center gap-2 mt-5 text-[12px]">
                <button
                  type="button"
                  disabled={sendBusy || resendIn > 0}
                  onClick={() => void sendOtp()}
                  className="font-bold text-[#f16a34] disabled:text-gray-400 bg-transparent border-0 cursor-pointer"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/90 px-6 py-4">
          <p className="text-[11px] leading-relaxed text-center text-gray-500">
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
        </div>
      </div>
    </div>,
    document.body,
  );
}
