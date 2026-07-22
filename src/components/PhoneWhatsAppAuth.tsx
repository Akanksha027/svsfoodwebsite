"use client";

import { useEffect, useRef, useState } from "react";
import OtpSixBoxes from "@/components/OtpSixBoxes";
import {
  formatIndianMobileInput,
  isValidIndianMobile,
} from "@/lib/indian-phone";
import type { useInlinePhoneOtp } from "@/hooks/useInlinePhoneOtp";

type Otp = ReturnType<typeof useInlinePhoneOtp>;

const fieldClass =
  "h-11 flex-1 min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-[15px] font-semibold tabular-nums text-gray-900 outline-none focus:border-[#f16a34] focus:ring-2 focus:ring-[#f16a34]/15";

type Props = {
  phone: string;
  onPhoneChange: (v: string) => void;
  otp: Otp;
  signedInPhone?: string | null;
  /** Confirm contact mobile for this order when signed-in user taps Done. */
  onContactSave?: (mobile: string) => void | Promise<void>;
};

export default function PhoneWhatsAppAuth({
  phone,
  onPhoneChange,
  otp,
  signedInPhone,
  onContactSave,
}: Props) {
  const verifyLock = useRef(false);
  const [editingContact, setEditingContact] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draft, setDraft] = useState(phone);

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

  useEffect(() => {
    if (!editingContact) setDraft(phone);
  }, [phone, editingContact]);

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
    const displayPhone = phone || signedInPhone;
    const draftValid = isValidIndianMobile(draft);

    const finishEdit = async () => {
      const next = formatIndianMobileInput(draft);
      if (!isValidIndianMobile(next)) {
        setSaveError("Enter a valid 10-digit mobile number");
        return;
      }
      setSaveError(null);
      setSaveBusy(true);
      try {
        onPhoneChange(next);
        await onContactSave?.(next);
        setEditingContact(false);
      } catch (e) {
        setSaveError(
          e instanceof Error ? e.message : "Could not save contact number",
        );
      } finally {
        setSaveBusy(false);
      }
    };

    return (
      <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-gray-500">
            Contact mobile
          </p>
          {!editingContact ? (
            <button
              type="button"
              onClick={() => {
                setDraft(displayPhone);
                setSaveError(null);
                setEditingContact(true);
              }}
              className="text-[12px] font-bold text-[#f16a34] border-0 bg-transparent p-0 cursor-pointer"
            >
              Edit
            </button>
          ) : null}
        </div>

        {editingContact ? (
          <>
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
                value={draft}
                autoFocus
                onChange={(e) => {
                  setSaveError(null);
                  setDraft(formatIndianMobileInput(e.target.value));
                }}
              />
            </div>
            {draft.length === 10 && !draftValid ? (
              <p className="text-[11px] font-medium text-[#c2410c]">
                Enter a valid 10-digit mobile number
              </p>
            ) : null}
            {saveError ? (
              <p className="text-[11px] font-medium text-[#c2410c]">{saveError}</p>
            ) : null}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={!draftValid || saveBusy}
                onClick={() => void finishEdit()}
                className="h-9 rounded-lg bg-[#f16a34] text-white text-[12px] font-extrabold px-3.5 border-0 cursor-pointer disabled:opacity-50"
              >
                {saveBusy ? "Saving…" : "Done"}
              </button>
              <button
                type="button"
                disabled={saveBusy}
                onClick={() => {
                  setDraft(signedInPhone);
                  setSaveError(null);
                }}
                className="h-9 rounded-lg bg-transparent text-gray-500 text-[12px] font-bold px-2 border-0 cursor-pointer disabled:opacity-50"
              >
                Use login number
              </button>
              <button
                type="button"
                disabled={saveBusy}
                onClick={() => {
                  setDraft(phone || signedInPhone);
                  setSaveError(null);
                  setEditingContact(false);
                }}
                className="h-9 rounded-lg bg-transparent text-gray-400 text-[12px] font-bold px-2 border-0 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              Saved to your profile as order contact. Login number stays +91{" "}
              {signedInPhone}.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500">+91</span>
              <span className="text-[15px] font-semibold tabular-nums text-gray-900">
                {displayPhone}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">
              {displayPhone === signedInPhone
                ? "Using login number · tap Edit to change"
                : "Order contact saved · tap Edit to change"}
            </p>
          </>
        )}
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
                  <>Sending code on WhatsApp for </>
                ) : (
                  <>Enter 6-digit code for </>
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
