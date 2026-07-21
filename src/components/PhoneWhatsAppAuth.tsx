"use client";

import { useEffect, useRef } from "react";
import OtpSixBoxes from "@/components/OtpSixBoxes";
import { formatIndianMobileInput } from "@/lib/indian-phone";
import type { useInlinePhoneOtp } from "@/hooks/useInlinePhoneOtp";

type Otp = ReturnType<typeof useInlinePhoneOtp>;

const fieldClass =
  "h-11 flex-1 min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-[15px] font-semibold tabular-nums text-gray-900 outline-none focus:border-[#f16a34] focus:ring-2 focus:ring-[#f16a34]/15";

type Props = {
  phone: string;
  onPhoneChange: (v: string) => void;
  otp: Otp;
  signedInPhone?: string | null;
};

export default function PhoneWhatsAppAuth({
  phone,
  onPhoneChange,
  otp,
  signedInPhone,
}: Props) {
  const verifyLock = useRef(false);

  const {
    isVerified,
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
    showAuthUi,
  } = otp;

  useEffect(() => {
    if (!codeSentForCurrent) verifyLock.current = false;
  }, [codeSentForCurrent]);

  const onSixDone = async (six: string) => {
    if (verifyBusy || verifyLock.current) return;
    verifyLock.current = true;
    setOtp(six);
    const ok = await verify(six);
    if (!ok) {
      verifyLock.current = false;
      setOtp("");
    }
  };

  if (signedInPhone) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
        <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Mobile</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-500">+91</span>
          <span className="text-[15px] font-semibold tabular-nums text-gray-900">
            {signedInPhone}
          </span>
        </div>
        <p className="text-[11px] text-emerald-700 font-semibold mt-2">
          Signed in with this number
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-3 pt-3 pb-3">
        <p className="text-[11px] font-semibold text-gray-600 mb-1.5">
          Mobile number <span className="text-[#c2410c]">*</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="flex h-11 shrink-0 items-center rounded-lg bg-gray-100 px-3 text-sm font-bold text-gray-600">
            +91
          </span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit number"
            className={fieldClass}
            value={phone}
            readOnly={codeSentForCurrent && !isVerified}
            onChange={(e) => {
              setOtpError(null);
              onPhoneChange(formatIndianMobileInput(e.target.value));
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              const next = formatIndianMobileInput(el.value);
              if (el.value !== next) {
                el.value = next;
                onPhoneChange(next);
              }
            }}
          />
        </div>
      </div>

      {isVerified ? (
        <div className="flex items-center gap-2 border-t border-emerald-100 bg-emerald-50 px-3 py-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
            ✓
          </span>
          <span className="text-[12px] font-semibold text-emerald-800">
            Verified · +91 {mobile}
          </span>
        </div>
      ) : null}

      {showAuthUi && phoneValid && !isVerified ? (
        <div className="border-t border-gray-100 bg-gray-50/80 px-3 py-3">
          {!codeSentForCurrent ? (
            <div className="space-y-2">
              <button
                type="button"
                disabled={sendBusy}
                onClick={() => void sendOtp()}
                className="w-full h-11 rounded-lg bg-[#f16a34] text-white text-[14px] font-extrabold cursor-pointer disabled:opacity-55 shadow-sm"
              >
                {sendBusy ? "Sending…" : "Send WhatsApp code"}
              </button>
              {otpError ? (
                <p className="text-[11px] text-center font-medium text-[#c2410c]">
                  {otpError}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3 otp-step-in">
              <p className="text-[12px] text-center text-gray-600">
                {sendBusy ? (
                  <>Sending code on WhatsApp for{" "}</>
                ) : (
                  <>Enter 6-digit code for{" "}</>
                )}
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
                autoFocus={codeSentForCurrent && !verifyBusy}
              />
              {sendBusy ? (
                <p className="text-[11px] text-center text-gray-500">
                  Sending code…
                </p>
              ) : null}
              {verifyBusy ? (
                <p className="text-[11px] text-center text-gray-500">
                  Verifying…
                </p>
              ) : null}
              {otpError && !verifyBusy ? (
                <p className="text-[11px] text-center font-medium text-[#c2410c]">
                  {otpError}
                </p>
              ) : null}
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <button
                  type="button"
                  disabled={sendBusy || resendIn > 0}
                  onClick={() => void sendOtp()}
                  className="text-[11px] font-bold text-[#f16a34] disabled:text-gray-400 cursor-pointer bg-transparent border-0"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => clearOtpStep()}
                  className="text-[11px] font-bold text-gray-600 cursor-pointer bg-transparent border-0 hover:underline"
                >
                  Edit number
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
