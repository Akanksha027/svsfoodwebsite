"use client";

import { useEffect, useRef, useState } from "react";
import type { WebOrderType } from "@/lib/orders-api";
import { formatInr } from "@/lib/menu-api";
import type { useWebCheckout } from "@/hooks/useWebCheckout";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import SavedAddressPicker from "@/components/SavedAddressPicker";
import AddressLabelPicker from "@/components/AddressLabelPicker";
import PhoneWhatsAppAuth from "@/components/PhoneWhatsAppAuth";
import { useInlinePhoneOtp } from "@/hooks/useInlinePhoneOtp";
import type { WebsiteCustomerAddress } from "@/lib/website-customer-api";
import {
  normalizeIndianMobile,
} from "@/lib/indian-phone";

const inputClass =
  "mt-0.5 w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 outline-none transition-[border-color,box-shadow] focus:border-[#f16a34] focus:ring-1 focus:ring-[#f16a34]/15 placeholder:text-gray-400";

type Checkout = ReturnType<typeof useWebCheckout>;

type Props = {
  checkout: Checkout;
  page: 1 | 2;
  onContinue?: () => void;
  onBack?: () => void;
  onPlaceOrder: () => void | Promise<void>;
  onAddressSelectionChange?: (id: string | "new") => void;
};

function TypeOption({
  active,
  label,
  sub,
  onClick,
}: {
  active: boolean;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-3 py-2.5 text-left cursor-pointer border transition-all ${
        active
          ? "bg-orange-50 border-[#f16a34] ring-1 ring-[#f16a34]/25"
          : "bg-white border-gray-200 hover:border-[#f16a34]/30"
      }`}
    >
      <span
        className={`block text-[13px] font-extrabold ${
          active ? "text-[#f16a34]" : "text-gray-900"
        }`}
      >
        {label}
      </span>
      <span className="block text-[11px] text-gray-500 mt-0.5">{sub}</span>
    </button>
  );
}

function CheckoutProgress({ page }: { page: 1 | 2 }) {
  return (
    <div className="px-4 pt-2.5 pb-2 flex justify-center shrink-0 bg-white border-b border-gray-100">
      <div className="flex items-center">
        <div className="flex items-center gap-1.5">
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
              page > 1
                ? "bg-[#f16a34] text-white"
                : "bg-white border-2 border-[#f16a34] text-[#f16a34]"
            }`}
          >
            {page > 1 ? (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
            ) : (
              "1"
            )}
          </div>
          <span className="text-[11px] font-bold text-gray-900">Address</span>
        </div>

        <div
          className={`w-8 h-px mx-2.5 ${page > 1 ? "bg-[#f16a34]" : "bg-gray-200"}`}
        />

        <div className="flex items-center gap-1.5">
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
              page >= 2
                ? "bg-white border-2 border-[#f16a34] text-[#f16a34]"
                : "bg-white border-2 border-gray-200 text-gray-400"
            }`}
          >
            2
          </div>
          <span
            className={`text-[11px] font-bold ${
              page >= 2 ? "text-gray-900" : "text-gray-400"
            }`}
          >
            Payment
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CartCheckoutForm({
  checkout,
  page,
  onContinue,
  onBack,
  onPlaceOrder,
  onAddressSelectionChange,
}: Props) {
  const [stepError, setStepError] = useState<string | null>(null);
  const [savedAddressId, setSavedAddressId] = useState<string | "new">("new");
  const { customer } = useWebsiteAuth();
  const prefillDone = useRef(false);

  const {
    orderType,
    setOrderType,
    payMethod,
    setPayMethod,
    name,
    setName,
    phone,
    setPhone,
    flat,
    setFlat,
    street,
    setStreet,
    area,
    setArea,
    landmark,
    setLandmark,
    pincode,
    setPincode,
    addressLabel,
    setAddressLabel,
    addressLoading,
    pinReady,
    pinBusy,
    pinMessage,
    notes,
    setNotes,
    busy,
    error,
    totals,
    codAllowed,
    effectivePay,
    applyLocation,
    clearLocationDenied,
    validateOrderStep,
    resetErrors,
    applySavedAddress,
  } = checkout;

  const phoneOtp = useInlinePhoneOtp({
    active: page === 2,
    phone,
    name,
    skipOtpWhenLoggedIn: true,
  });

  const pickSavedAddress = (id: string | "new", addr?: WebsiteCustomerAddress) => {
    setSavedAddressId(id);
    onAddressSelectionChange?.(id);
    if (id !== "new" && addr) {
      applySavedAddress(addr);
    } else if (id === "new") {
      setFlat("");
      setStreet("");
      setArea("");
      setLandmark("");
      setPincode("");
      setAddressLabel("Home");
    }
  };

  useEffect(() => {
    if (!customer || prefillDone.current) return;
    setPhone(customer.phone);
    if (customer.name) setName(customer.name);
    const def =
      customer.addresses.find((a) => a.is_default) || customer.addresses[0];
    if (def) {
      pickSavedAddress(def.id, def);
    } else {
      setSavedAddressId("new");
      onAddressSelectionChange?.("new");
    }
    prefillDone.current = true;
  }, [
    customer,
    setPhone,
    setName,
    applySavedAddress,
    onAddressSelectionChange,
  ]);

  const markNewIfEdited = () => {
    if (savedAddressId !== "new") {
      setSavedAddressId("new");
      onAddressSelectionChange?.("new");
    }
  };

  const pickType = (type: WebOrderType) => {
    setOrderType(type);
    if (type === "dine_in") setPayMethod("online");
    setStepError(null);
  };

  const handleContinue = () => {
    resetErrors();
    const msg = validateOrderStep();
    if (msg) {
      setStepError(msg);
      return;
    }
    setStepError(null);
    onContinue?.();
  };

  const handlePlaceOrderClick = async () => {
    resetErrors();
    setStepError(null);
    phoneOtp.setOtpError(null);
    if (!customer) {
      const verified = await phoneOtp.ensureVerified();
      if (!verified) {
        setStepError(
          phoneOtp.otpError ||
            "Enter the WhatsApp code to confirm your number.",
        );
        return;
      }
    } else if (normalizeIndianMobile(phone) !== customer.phone) {
      setStepError("Use your account mobile or log out from Account.");
      return;
    }
    await onPlaceOrder();
  };

  if (page === 1) {
    return (
      <div className="flex flex-col min-h-0 flex-1 bg-white overflow-hidden">
        <CheckoutProgress page={1} />
        <div className="flex-1 min-h-0 overflow-hidden px-4 pb-2 pt-2.5 bg-white">
          {orderType === "delivery" ? (
            <section className="space-y-2.5 h-full">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold text-gray-900 tracking-tight leading-tight">
                    Delivery address
                  </h3>
                  {addressLoading || pinBusy ? (
                    <p className="text-[11px] text-gray-500 truncate">
                      Getting your location&hellip;
                    </p>
                  ) : pinReady ? (
                    <p className="text-[11px] text-gray-500 truncate">
                      Location pinned — add flat &amp; street
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500 truncate">
                      Share location for the rider pin
                    </p>
                  )}
                </div>
                {pinReady ? (
                  <button
                    type="button"
                    disabled={pinBusy}
                    onClick={() => void applyLocation(true)}
                    className="text-[11px] font-semibold text-[#f16a34] border border-[#f16a34] rounded-lg px-2.5 py-1 hover:bg-[#f16a34]/5 cursor-pointer disabled:opacity-50 shrink-0 bg-white"
                  >
                    Update pin
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pinBusy}
                    onClick={() => {
                      clearLocationDenied();
                      void applyLocation(true);
                    }}
                    className="h-7 rounded-lg bg-[#f16a34] px-2.5 text-[11px] font-semibold text-white cursor-pointer disabled:opacity-60 shrink-0 hover:bg-[#e05a28]"
                  >
                    {pinBusy ? "Asking…" : "Share location"}
                  </button>
                )}
              </div>

              {pinMessage ? (
                <p className="text-[11px] text-gray-700 font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white line-clamp-2">
                  {pinMessage}
                </p>
              ) : null}

              {customer && customer.addresses.length > 0 ? (
                <SavedAddressPicker
                  addresses={customer.addresses}
                  selectedId={savedAddressId}
                  onSelect={(id) => {
                    if (id === "new") pickSavedAddress("new");
                    else {
                      const addr = customer.addresses.find((a) => a.id === id);
                      if (addr) pickSavedAddress(id, addr);
                    }
                  }}
                />
              ) : null}

              {/* Address fields */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[11px] font-semibold text-gray-700">
                      Flat / House <span className="text-[#f16a34]">*</span>
                    </span>
                    <input
                      value={flat}
                      onChange={(e) => {
                        markNewIfEdited();
                        setFlat(e.target.value);
                      }}
                      className={inputClass}
                      placeholder="402, Tower B"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold text-gray-700">
                      Street <span className="text-[#f16a34]">*</span>
                    </span>
                    <input
                      value={street}
                      onChange={(e) => {
                        markNewIfEdited();
                        setStreet(e.target.value);
                      }}
                      className={inputClass}
                      placeholder="Society, road"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] font-semibold text-gray-700">
                    Area / Locality <span className="text-[#f16a34]">*</span>
                  </span>
                  <input
                    value={area}
                    onChange={(e) => {
                      markNewIfEdited();
                      setArea(e.target.value);
                    }}
                    className={inputClass}
                    placeholder="Neighbourhood, city"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[11px] font-semibold text-gray-700">
                      Landmark
                    </span>
                    <input
                      value={landmark}
                      onChange={(e) => {
                        markNewIfEdited();
                        setLandmark(e.target.value);
                      }}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold text-gray-700">
                      PIN
                    </span>
                    <input
                      value={pincode}
                      onChange={(e) => {
                        markNewIfEdited();
                        setPincode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        );
                      }}
                      inputMode="numeric"
                      className={inputClass}
                      placeholder="6 digits"
                    />
                  </label>
                </div>
              </div>

              {customer ? (
                <AddressLabelPicker
                  label={addressLabel}
                  onChange={(v) => {
                    markNewIfEdited();
                    setAddressLabel(v);
                  }}
                />
              ) : null}
            </section>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-[13px] text-gray-600 leading-snug">
                {orderType === "dine_in"
                  ? "You'll eat at the outlet — no delivery address needed."
                  : "Pick up your order at the store counter when it's ready."}
              </p>
            </div>
          )}

          {stepError ? (
            <p className="mt-2 text-[11px] font-medium text-gray-800 border border-gray-200 rounded-lg px-2.5 py-2 bg-white">
              {stepError}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-gray-100 px-4 py-2.5 bg-white">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-10 rounded-xl bg-[#f16a34] text-white font-bold text-[13.5px] cursor-pointer hover:bg-[#e05a28] transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-0 flex-1">
      <CheckoutProgress page={2} />
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 space-y-6 pt-4">
        {codAllowed ? (
          <section>
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-3">
              Payment
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setPayMethod("online")}
                className={`rounded-xl px-4 py-3.5 text-left text-[13px] font-bold border cursor-pointer ${
                  effectivePay === "online"
                    ? "bg-[#f16a34] text-white border-[#f16a34]"
                    : "bg-white text-gray-900 border-gray-200"
                }`}
              >
                Pay online · UPI QR
              </button>
              <button
                type="button"
                onClick={() => setPayMethod("cod")}
                className={`rounded-xl px-4 py-3.5 text-left text-[13px] font-bold border cursor-pointer ${
                  effectivePay === "cod"
                    ? "bg-[#f16a34] text-white border-[#f16a34]"
                    : "bg-white text-gray-900 border-gray-200"
                }`}
              >
                {orderType === "delivery"
                  ? "Cash on delivery"
                  : "Pay at counter (cash)"}
              </button>
            </div>
          </section>
        ) : (
          <p className="text-xs text-gray-500 rounded-lg bg-gray-50 px-3 py-2">
            Dine-in orders are paid online via UPI.
          </p>
        )}

        <section className="space-y-3.5">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Your details
          </h3>
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              autoComplete="name"
            />
          </label>
          <PhoneWhatsAppAuth
            phone={phone}
            onPhoneChange={(v) => {
              phoneOtp.setOtpError(null);
              setPhone(v);
            }}
            otp={phoneOtp}
            signedInPhone={customer?.phone ?? null}
          />
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">Notes for kitchen</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 250))}
              className={inputClass}
              placeholder="Less spicy…"
            />
          </label>
        </section>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">To pay</span>
            <span className="font-extrabold text-[#f16a34] tabular-nums">
              {formatInr(totals.grandTotal)}
            </span>
          </div>
          {totals.deliveryCharges > 0 ? (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Includes delivery</span>
              <span>{formatInr(totals.deliveryCharges)}</span>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="text-xs font-semibold text-[#c2410c] bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}

        {stepError ? (
          <p className="text-xs font-semibold text-[#c2410c] bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            {stepError}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-gray-100 px-5 py-4 bg-white">
        <button
          type="button"
          disabled={busy || (!customer && phoneOtp.verifyBusy)}
          onClick={() => void handlePlaceOrderClick()}
          className="w-full h-14 rounded-xl bg-[#f16a34] text-white font-extrabold text-sm cursor-pointer disabled:opacity-50 shadow-md"
        >
          {busy || (!customer && phoneOtp.verifyBusy)
            ? "Placing order…"
            : effectivePay === "cod"
              ? `Confirm order · ${formatInr(totals.grandTotal)}`
              : `Pay ${formatInr(totals.grandTotal)}`}
        </button>
      </div>
    </div>
  );
}

/** Standalone /checkout page — same two pages with local state. */
export function CartCheckoutFormPaged(props: {
  checkout: Checkout;
  onPlaceOrder: () => void | Promise<void>;
  onAddressSelectionChange?: (id: string | "new") => void;
}) {
  const [page, setPage] = useState<1 | 2>(1);
  return (
    <CartCheckoutForm
      {...props}
      page={page}
      onContinue={() => setPage(2)}
      onBack={page === 2 ? () => setPage(1) : undefined}
    />
  );
}
