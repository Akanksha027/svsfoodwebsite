"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sendLoginOtp } from "@/lib/website-customer-api";
import { INDIAN_MOBILE_RE, normalizeIndianMobile } from "@/lib/indian-phone";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";

const PHONE_RE = INDIAN_MOBILE_RE;

function normalizePhone(raw: string) {
  return normalizeIndianMobile(raw);
}

type Options = {
  active: boolean;
  phone: string;
  name: string;
  skipOtpWhenLoggedIn?: boolean;
};

export function useInlinePhoneOtp({
  active,
  phone,
  name,
  skipOtpWhenLoggedIn = true,
}: Options) {
  const { customer, completeLogin } = useWebsiteAuth();
  const [otp, setOtp] = useState("");
  const [otpSentFor, setOtpSentFor] = useState<string | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [sendBusy, setSendBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const activeSendMobileRef = useRef<string | null>(null);

  const mobile = normalizePhone(phone);
  const phoneValid = PHONE_RE.test(mobile);
  const isLoggedIn = customer != null;
  const otpRequired = !(skipOtpWhenLoggedIn && isLoggedIn);
  const codeSentForCurrent = otpSentFor === mobile && phoneValid;

  const isVerified = (() => {
    if (!phoneValid) return false;
    if (skipOtpWhenLoggedIn && isLoggedIn) {
      return mobile === customer.phone;
    }
    return verifiedPhone === mobile;
  })();

  useEffect(() => {
    if (skipOtpWhenLoggedIn && customer?.phone === mobile && phoneValid) {
      setVerifiedPhone(mobile);
    }
  }, [customer, mobile, phoneValid, skipOtpWhenLoggedIn]);

  useEffect(() => {
    if (!otpRequired) {
      activeSendMobileRef.current = null;
      setOtp("");
      setOtpSentFor(null);
      setOtpError(null);
      return;
    }
    if (!phoneValid) {
      activeSendMobileRef.current = null;
      setOtpSentFor(null);
      setOtp("");
      if (verifiedPhone && verifiedPhone !== mobile) setVerifiedPhone(null);
      return;
    }
    if (verifiedPhone && verifiedPhone !== mobile) {
      activeSendMobileRef.current = null;
      setVerifiedPhone(null);
      setOtp("");
      setOtpSentFor(null);
    }
    if (otpSentFor && otpSentFor !== mobile) {
      activeSendMobileRef.current = null;
      setOtpSentFor(null);
      setOtp("");
    }
  }, [mobile, phoneValid, verifiedPhone, otpSentFor, otpRequired]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const tick = setInterval(() => {
      setResendIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [resendIn]);

  const sendOtp = useCallback(async () => {
    if (!otpRequired) return true;
    if (!phoneValid) {
      setOtpError("Enter a valid 10-digit mobile number first.");
      return false;
    }
    if (isVerified) return true;
    if (resendIn > 0 && codeSentForCurrent) return false;

    const targetMobile = mobile;
    setOtpError(null);
    setOtp("");
    // Show OTP step immediately — don’t wait on WhatsApp/network.
    activeSendMobileRef.current = targetMobile;
    setOtpSentFor(targetMobile);
    setSendBusy(true);
    try {
      const res = await sendLoginOtp(targetMobile);
      if (activeSendMobileRef.current === targetMobile) {
        setResendIn(res.resend_after_seconds ?? 30);
      }
      return true;
    } catch (e) {
      const err = e as Error & { retryAfterSeconds?: number };
      if (
        activeSendMobileRef.current === targetMobile &&
        err.retryAfterSeconds != null
      ) {
        setResendIn(err.retryAfterSeconds);
      }
      setOtpError(err.message || "Could not send code");
      return false;
    } finally {
      setSendBusy(false);
    }
  }, [
    otpRequired,
    phoneValid,
    isVerified,
    resendIn,
    codeSentForCurrent,
    mobile,
  ]);

  const verify = useCallback(async (overrideCode?: string) => {
    if (skipOtpWhenLoggedIn && isLoggedIn) {
      if (mobile === customer.phone) return true;
      setOtpError("This number doesn’t match your account. Log out to use another.");
      return false;
    }
    if (!phoneValid) {
      setOtpError("Enter a valid 10-digit mobile number.");
      return false;
    }
    if (isVerified) return true;
    if (!codeSentForCurrent) {
      setOtpError("Tap Send OTP on WhatsApp first.");
      return false;
    }

    const code = (overrideCode ?? otp).replace(/\D/g, "");
    if (code.length < 6) {
      setOtpError("Enter the 6-digit code from WhatsApp.");
      return false;
    }

    setOtpError(null);
    setVerifyBusy(true);
    try {
      await completeLogin({
        phone: mobile,
        otp: code,
        name: name.trim() || undefined,
      });
      setVerifiedPhone(mobile);
      return true;
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Incorrect code");
      return false;
    } finally {
      setVerifyBusy(false);
    }
  }, [
    skipOtpWhenLoggedIn,
    isLoggedIn,
    customer,
    phoneValid,
    isVerified,
    codeSentForCurrent,
    otp,
    mobile,
    name,
    completeLogin,
  ]);

  const ensureVerified = useCallback(async () => {
    if (skipOtpWhenLoggedIn && isLoggedIn) {
      if (!phoneValid) {
        setOtpError("Enter your mobile number.");
        return false;
      }
      if (mobile !== customer.phone) {
        setOtpError("Use your account number or log out from Account.");
        return false;
      }
      return true;
    }
    if (isVerified) return true;
    if (!phoneValid) {
      setOtpError("Enter your mobile number.");
      return false;
    }
    if (!codeSentForCurrent) {
      setOtpError("Tap Send OTP on WhatsApp first.");
      return false;
    }
    return verify();
  }, [
    skipOtpWhenLoggedIn,
    isLoggedIn,
    customer,
    isVerified,
    phoneValid,
    codeSentForCurrent,
    mobile,
    verify,
  ]);

  const clearOtpStep = useCallback(() => {
    activeSendMobileRef.current = null;
    setOtp("");
    setOtpSentFor(null);
    setOtpError(null);
  }, []);

  const showAuthUi = otpRequired && active && phoneValid && !isVerified;

  return {
    otp,
    setOtp,
    showAuthUi,
    phoneValid,
    codeSentForCurrent,
    isVerified,
    isLoggedIn,
    otpRequired,
    sendBusy,
    verifyBusy,
    otpError,
    setOtpError,
    resendIn,
    sendOtp,
    verify,
    ensureVerified,
    otpSentFor,
    mobile,
    clearOtpStep,
  };
}
