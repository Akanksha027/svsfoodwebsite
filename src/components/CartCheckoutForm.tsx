"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
  isValidIndianMobile,
} from "@/lib/indian-phone";
import {
  resolveOrderContactMobile,
  setPreferredOrderContact,
} from "@/lib/order-contact-mobile";
import { fetchPgPaymentsAvailable } from "@/lib/orders-api";

const SVS_ORANGE = "#f16a34";

const fieldLabelClass = "text-[11px] font-semibold text-gray-600";
const sectionEyebrowClass =
  "text-[10px] font-bold uppercase tracking-wide text-gray-400";
const inputClass =
  "mt-1 w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-[13px] text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-[#f16a34] focus:ring-2 focus:ring-[#f16a34]/10";
const fieldErrorClass = "mt-1 text-[11px] font-medium text-[#f16a34] leading-snug";

type Checkout = ReturnType<typeof useWebCheckout>;

type Props = {
  checkout: Checkout;
  page: 1 | 2;
  onContinue?: () => void;
  onBack?: () => void;
  onPlaceOrder: () => void | Promise<void>;
  onAddressSelectionChange?: (id: string | "new") => void;
};

function CheckoutProgress({ page }: { page: 1 | 2 }) {
  return (
    <div className="px-4 pt-2.5 pb-2.5 flex justify-center shrink-0 bg-white border-b border-gray-100">
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

function PaymentOption({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left cursor-pointer transition-colors ${
        active
          ? "border-[#f16a34] bg-orange-50/45"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <span
        className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
          active ? "border-[#f16a34]" : "border-gray-300"
        }`}
        aria-hidden
      >
        {active ? (
          <span className="h-1.5 w-1.5 rounded-full bg-[#f16a34]" />
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-gray-900">{title}</span>
        <span className="block text-[11px] font-medium text-gray-500 mt-0.5 leading-snug">
          {subtitle}
        </span>
      </span>
    </button>
  );
}

function PayMethodRow({
  active,
  title,
  subtitle,
  badge,
  icon,
  onClick,
  accentTitle,
}: {
  active: boolean;
  title: string;
  subtitle?: string;
  badge?: string;
  icon: ReactNode;
  onClick: () => void;
  accentTitle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3.5 py-3.5 text-left border-0 cursor-pointer transition-colors ${
        active ? "bg-[#fff8f4]" : "bg-white hover:bg-gray-50"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
          active
            ? "border-[#f16a34]/35 bg-[#fff4ee] text-[#f16a34]"
            : "border-gray-200 bg-gray-50 text-gray-700"
        }`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[14px] font-semibold leading-tight ${
              accentTitle ? "text-[#e11d48]" : "text-gray-900"
            }`}
          >
            {title}
          </span>
          {badge ? (
            <span className="inline-flex items-center rounded-md bg-[#e8f8ee] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#0f8a3c]">
              {badge}
            </span>
          ) : null}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-[12px] font-medium text-gray-500 leading-snug">
            {subtitle}
          </span>
        ) : null}
      </span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          active ? "border-[#f16a34]" : "border-gray-300"
        }`}
        aria-hidden
      >
        {active ? <span className="h-2 w-2 rounded-full bg-[#f16a34]" /> : null}
      </span>
    </button>
  );
}

function PaySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="px-0.5 text-[14px] font-bold text-gray-900">{title}</h3>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.04)] divide-y divide-gray-100">
        {children}
      </div>
    </section>
  );
}

function IconQr({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6z" />
      <path d="M14 14h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-2-2h2v2h-2v-2z" />
    </svg>
  );
}

function IconCard({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </svg>
  );
}

function IconCash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function ToPayBar({ amount }: { amount: number }) {
  return (
    <div className="flex items-center bg-[#f3f4f6] px-4 py-2.5 border-b border-gray-200/80">
      <p className="text-[13px] font-semibold text-gray-700">
        To Pay:{" "}
        <span className="font-bold text-[#0f8a3c] tabular-nums">
          {formatInr(amount)}
        </span>
      </p>
    </div>
  );
}

function OrderSummaryCard({
  grandTotal,
  deliveryCharges,
}: {
  grandTotal: number;
  deliveryCharges: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-[#fff8f4] px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={sectionEyebrowClass}>Order total</p>
          <p className="mt-0.5 text-[11px] font-medium text-gray-500">
            {deliveryCharges > 0 ? "Includes delivery fee" : "Before payment"}
          </p>
        </div>
        <p className="text-base font-bold text-[#f16a34] tabular-nums">
          {formatInr(grandTotal)}
        </p>
      </div>
      {deliveryCharges > 0 ? (
        <div className="mt-1.5 pt-1.5 border-t border-[#f16a34]/10 flex justify-between text-[11px] text-gray-600">
          <span>Delivery</span>
          <span className="font-medium tabular-nums">
            {formatInr(deliveryCharges)}
          </span>
        </div>
      ) : null}
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
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [savedAddressId, setSavedAddressId] = useState<string | "new">("new");
  const { customer, refreshCustomer, setCustomer, openLogin } = useWebsiteAuth();
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
    const contact = resolveOrderContactMobile({
      customerId: customer.id,
      loginPhone: customer.phone,
      alternatePhone: customer.alternate_phone,
    });
    setPhone(contact);
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
    if (type === "dine_in") setPayMethod("upi");
    setStepError(null);
  };

  const handleContinue = () => {
    resetErrors();
    setAttemptedSubmit(true);
    const msg = validateOrderStep();
    if (msg) {
      setStepError(msg);
      return;
    }
    setStepError(null);
    onContinue?.();
  };

  const persistContactMobile = async (contact: string) => {
    if (!customer) return;
    const login = normalizeIndianMobile(customer.phone);
    const next = normalizeIndianMobile(contact);
    if (!isValidIndianMobile(next)) {
      throw new Error("Enter a valid 10-digit contact mobile number");
    }
    // Profile PATCH does not accept alternate_phone — keep for this device + order.
    const nextAlt = next === login ? "" : next;
    setPreferredOrderContact(customer.id, nextAlt || null);
    setCustomer({
      ...customer,
      alternate_phone: nextAlt || null,
    });
    setPhone(next);
  };

  const handlePlaceOrderClick = async () => {
    resetErrors();
    setStepError(null);
    phoneOtp.setOtpError(null);

    if (!customer) {
      setStepError("Please log in to place your order.");
      openLogin();
      return;
    }

    const contact = normalizeIndianMobile(phone);
    if (!isValidIndianMobile(contact)) {
      setStepError("Enter a valid 10-digit contact mobile number.");
      return;
    }

    try {
      await persistContactMobile(contact);
    } catch (e) {
      setStepError(
        e instanceof Error
          ? e.message
          : "Could not save contact mobile. Try again.",
      );
      void refreshCustomer();
      return;
    }
    await onPlaceOrder();
  };

  if (page === 1) {
    return (
      <div className="flex flex-col min-h-0 flex-1 bg-white overflow-hidden">
        <CheckoutProgress page={1} />
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-3 pt-3 bg-white">
          {orderType === "delivery" ? (
            <section className="space-y-3 min-w-0">
              {/* Location status */}
              <div className="rounded-xl border border-gray-200 bg-[#fff8f4] p-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${SVS_ORANGE}18` }}
                  >
                    <svg
                      className="h-4 w-4"
                      style={{ color: SVS_ORANGE }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-semibold text-gray-900 leading-tight">
                      Delivery address
                    </h3>
                    <p className="mt-0.5 text-[11px] font-medium text-gray-500 leading-snug">
                      {addressLoading || pinBusy
                        ? "Getting your location…"
                        : pinReady
                          ? "Location pinned. Add flat & street below"
                          : "Share location so the rider can find you"}
                    </p>
                  </div>
                  {pinReady ? (
                    <button
                      type="button"
                      disabled={pinBusy}
                      onClick={() => void applyLocation(true)}
                      className="shrink-0 h-8 rounded-lg border border-[#f16a34]/30 bg-white px-2.5 text-[11px] font-bold text-[#f16a34] cursor-pointer hover:bg-[#f16a34]/5 disabled:opacity-50 transition-colors"
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
                      className="shrink-0 h-8 rounded-lg bg-[#f16a34] px-2.5 text-[11px] font-bold text-white cursor-pointer disabled:opacity-60 hover:bg-[#e05a28] transition-colors"
                    >
                      {pinBusy ? "Asking…" : "Share location"}
                    </button>
                  )}
                </div>
                {pinMessage ? (
                  <p className="mt-2 text-[11px] font-medium text-gray-600 leading-snug border-t border-[#f16a34]/10 pt-2">
                    {pinMessage}
                  </p>
                ) : null}
              </div>

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
              <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-2.5">
                <p className={sectionEyebrowClass}>Address details</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="block">
                    <span className={fieldLabelClass}>
                      Flat / House <span className="text-[#f16a34]">*</span>
                    </span>
                    <input
                      value={flat}
                      onChange={(e) => {
                        markNewIfEdited();
                        setFlat(e.target.value);
                      }}
                      className={`${inputClass} ${attemptedSubmit && flat.trim().length < 2 ? "border-[#f16a34] focus:border-[#f16a34] focus:ring-[#f16a34]/10" : ""}`}
                      placeholder="402, Tower B"
                    />
                    {attemptedSubmit && flat.trim().length < 2 ? (
                      <p className={fieldErrorClass}>Enter flat / house</p>
                    ) : null}
                  </label>
                  <label className="block">
                    <span className={fieldLabelClass}>
                      Street <span className="text-[#f16a34]">*</span>
                    </span>
                    <input
                      value={street}
                      onChange={(e) => {
                        markNewIfEdited();
                        setStreet(e.target.value);
                      }}
                      className={`${inputClass} ${attemptedSubmit && street.trim().length < 3 ? "border-[#f16a34] focus:border-[#f16a34] focus:ring-[#f16a34]/10" : ""}`}
                      placeholder="Society, road"
                    />
                    {attemptedSubmit && street.trim().length < 3 ? (
                      <p className={fieldErrorClass}>Enter street name</p>
                    ) : null}
                  </label>
                </div>
                <label className="block">
                  <span className={fieldLabelClass}>
                    Area / Locality <span className="text-[#f16a34]">*</span>
                  </span>
                  <input
                    value={area}
                    onChange={(e) => {
                      markNewIfEdited();
                      setArea(e.target.value);
                    }}
                    className={`${inputClass} ${attemptedSubmit && area.trim().length < 6 ? "border-[#f16a34] focus:border-[#f16a34] focus:ring-[#f16a34]/10" : ""}`}
                    placeholder="Neighbourhood, city"
                  />
                  {attemptedSubmit && area.trim().length < 6 ? (
                    <p className={fieldErrorClass}>Enter area / locality</p>
                  ) : null}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="block">
                    <span className={fieldLabelClass}>Landmark</span>
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
                    <span className={fieldLabelClass}>PIN code</span>
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
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <p className="text-[13px] font-medium text-gray-600 leading-snug">
                {orderType === "dine_in"
                  ? "You'll eat at the outlet. No delivery address needed."
                  : "Pick up your order at the store counter when it's ready."}
              </p>
            </div>
          )}

        </div>

        <div className="shrink-0 border-t border-gray-100 px-4 py-2 bg-white flex flex-col gap-2">
          {stepError && !stepError.startsWith("Enter") && !stepError.startsWith("Please complete") ? (
            <div className="flex items-start gap-1.5 px-3 py-2 bg-[#f16a34]/5 border border-[#f16a34]/20 rounded-lg">
              <svg className="w-4 h-4 text-[#f16a34] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              <p className="text-[12px] font-medium text-[#f16a34] leading-snug">
                {stepError}
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-11 rounded-xl bg-[#f16a34] text-white font-bold text-[13px] cursor-pointer hover:bg-[#e05a28] transition-colors shadow-sm"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }


  if (page === 2 && !customer) {
    return (
      <div className="flex flex-col min-h-0 flex-1 bg-white overflow-hidden">
        <CheckoutProgress page={2} />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          <p className="text-[13px] font-bold text-gray-900 mb-1.5">
            Log in to continue
          </p>
          <p className="text-[11px] text-gray-500 mb-5 max-w-[280px] leading-relaxed">
            Sign in with your mobile number to review payment options and place
            your order.
          </p>
          <button
            type="button"
            onClick={() => openLogin()}
            className="h-9 px-5 rounded-lg bg-[#f16a34] text-white font-bold text-[13px] cursor-pointer hover:bg-[#e05a28]"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 flex-1 bg-white overflow-hidden">
      <CheckoutProgress page={2} />
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-3 pt-3 space-y-3">
        <OrderSummaryCard
          grandTotal={totals.grandTotal}
          deliveryCharges={totals.deliveryCharges}
        />

        <section className="rounded-xl border border-gray-200 bg-white p-3 space-y-2.5">
          <p className={sectionEyebrowClass}>Contact</p>
          <label className="block">
            <span className={fieldLabelClass}>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              autoComplete="name"
              placeholder="Your name"
            />
          </label>
          <PhoneWhatsAppAuth
            embedded
            phone={phone}
            onPhoneChange={(v) => {
              phoneOtp.setOtpError(null);
              setPhone(v);
            }}
            otp={phoneOtp}
            signedInPhone={customer?.phone ?? null}
            onContactSave={
              customer
                ? async (mobile) => {
                    await persistContactMobile(mobile);
                  }
                : undefined
            }
          />
          <label className="block">
            <span className={fieldLabelClass}>
              Notes for kitchen{" "}
              <span className="font-medium text-gray-400">(optional)</span>
            </span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 250))}
              className={inputClass}
              placeholder="Less spicy, no onions…"
            />
          </label>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
          <p className={sectionEyebrowClass}>Payment method</p>
          <div className="space-y-1.5">
            <PaymentOption
              active={effectivePay === "upi"}
              title="UPI QR"
              subtitle="Scan with GPay, PhonePe, Paytm, or any UPI app"
              onClick={() => setPayMethod("upi")}
            />
            <PaymentOption
              active={effectivePay === "card"}
              title="Card or netbanking"
              subtitle="Pay on PhonePe secure checkout"
              onClick={() => setPayMethod("card")}
            />
            {codAllowed ? (
              <PaymentOption
                active={effectivePay === "cod"}
                title={
                  orderType === "delivery"
                    ? "Cash on delivery"
                    : "Pay at counter"
                }
                subtitle={
                  orderType === "delivery"
                    ? "Pay the rider when your order arrives"
                    : "Pay with cash when you collect"
                }
                onClick={() => setPayMethod("cod")}
              />
            ) : null}
          </div>
        </section>

        {error ? (
          <p className="text-[11px] font-semibold text-[#c2410c] bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-2">
            {error}
          </p>
        ) : null}

        {stepError ? (
          <p className="text-[11px] font-semibold text-[#c2410c] bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-2">
            {stepError}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-gray-100 px-4 py-2.5 bg-white">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handlePlaceOrderClick()}
          className="w-full h-11 rounded-xl bg-[#f16a34] text-white font-bold text-[13px] cursor-pointer disabled:opacity-50 shadow-sm"
        >
          {busy
            ? effectivePay === "card"
              ? "Redirecting to payment…"
              : "Placing order…"
            : effectivePay === "cod"
              ? `Confirm order · ${formatInr(totals.grandTotal)}`
              : effectivePay === "card"
                ? `Continue to pay · ${formatInr(totals.grandTotal)}`
                : `Pay ${formatInr(totals.grandTotal)} · UPI`}
        </button>
      </div>
    </div>
  );
}

/** Payment step for inline cart checkout (no address step). */
export function CartInlinePayment(props: {
  checkout: Checkout;
  onPlaceOrder: (opts?: {
    contactMobile?: string;
  }) => void | Promise<void>;
  onBack: () => void;
  riderTip?: number;
}) {
  const { checkout, onPlaceOrder, onBack, riderTip = 0 } = props;
  const [stepError, setStepError] = useState<string | null>(null);
  const [pgAvailable, setPgAvailable] = useState(true);
  const prefillDone = useRef(false);
  const { customer, refreshCustomer, setCustomer, openLogin } = useWebsiteAuth();
  const phoneOtp = useInlinePhoneOtp({
    active: true,
    phone: checkout.phone,
    name: checkout.name,
    skipOtpWhenLoggedIn: true,
  });

  const {
    store,
    orderType,
    setPayMethod,
    name,
    setName,
    phone,
    setPhone,
    notes,
    setNotes,
    busy,
    error,
    totals,
    codAllowed,
    effectivePay,
    resetErrors,
  } = checkout;

  const grandTotal = totals.grandTotal + riderTip;

  useEffect(() => {
    if (!customer || prefillDone.current) return;
    const contact = resolveOrderContactMobile({
      customerId: customer.id,
      loginPhone: customer.phone,
      alternatePhone: customer.alternate_phone,
    });
    if (contact) setPhone(contact);
    if (customer.name) setName(customer.name);
    prefillDone.current = true;
  }, [customer, setPhone, setName]);

  useEffect(() => {
    let cancelled = false;
    void fetchPgPaymentsAvailable({ storeId: store.backendStoreId })
      .then((res) => {
        if (!cancelled) setPgAvailable(Boolean(res.available));
      })
      .catch(() => {
        if (!cancelled) setPgAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [store.backendStoreId]);

  useEffect(() => {
    if (!pgAvailable && effectivePay === "card") {
      setPayMethod("upi");
    }
  }, [pgAvailable, effectivePay, setPayMethod]);

  const persistContactMobile = async (contact: string) => {
    if (!customer) return;
    const login = normalizeIndianMobile(customer.phone);
    const next = normalizeIndianMobile(contact);
    if (!isValidIndianMobile(next)) {
      throw new Error("Enter a valid 10-digit contact mobile number");
    }
    const nextAlt = next === login ? "" : next;
    setPreferredOrderContact(customer.id, nextAlt || null);
    setCustomer({
      ...customer,
      alternate_phone: nextAlt || null,
    });
    setPhone(next);
  };

  const handlePlaceOrderClick = async () => {
    resetErrors();
    setStepError(null);
    phoneOtp.setOtpError(null);

    if (!customer) {
      setStepError("Please log in to place your order.");
      openLogin();
      return;
    }

    let contact = normalizeIndianMobile(phone);
    if (!isValidIndianMobile(contact)) {
      contact = resolveOrderContactMobile({
        customerId: customer.id,
        loginPhone: customer.phone,
        alternatePhone: customer.alternate_phone,
      });
      if (isValidIndianMobile(contact)) {
        setPhone(contact);
      }
    }
    if (!isValidIndianMobile(contact)) {
      setStepError("Enter a valid 10-digit contact mobile number.");
      return;
    }

    try {
      await persistContactMobile(contact);
    } catch (e) {
      setStepError(
        e instanceof Error
          ? e.message
          : "Could not save contact mobile. Try again.",
      );
      void refreshCustomer();
      return;
    }
    await onPlaceOrder({ contactMobile: contact });
  };

  if (!customer) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.04)] px-4 py-8 text-center">
        <p className="text-[14px] font-bold text-gray-900 mb-1.5">
          Log in to continue
        </p>
        <p className="text-[12px] text-gray-500 mb-5 max-w-[280px] mx-auto leading-relaxed">
          Sign in with your mobile number to review payment options and place your order.
        </p>
        <button
          type="button"
          onClick={() => openLogin()}
          className="h-10 px-5 rounded-xl bg-[#f16a34] text-white font-bold text-[13px] cursor-pointer"
        >
          Log in
        </button>
      </section>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#f6f6f6]">
      <div className="shrink-0 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 px-3 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-gray-800 cursor-pointer hover:bg-gray-100"
            aria-label="Back to cart"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="min-w-0">
            <h2 className="text-[16px] font-bold text-gray-900 leading-tight">
              Payment Options
            </h2>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 truncate">
              {orderType === "delivery"
                ? "Delivery order"
                : orderType === "takeaway"
                  ? "Takeaway order"
                  : "Dine-in order"}
            </p>
          </div>
        </div>
        <ToPayBar amount={grandTotal} />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-4">
        <section className="rounded-2xl border border-gray-100 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.04)] px-3.5 py-3 space-y-2.5">
          <p className={sectionEyebrowClass}>Contact</p>
          <label className="block">
            <span className={fieldLabelClass}>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              autoComplete="name"
              placeholder="Your name"
            />
          </label>
          <PhoneWhatsAppAuth
            embedded
            phone={phone}
            onPhoneChange={(v) => {
              phoneOtp.setOtpError(null);
              setPhone(v);
            }}
            otp={phoneOtp}
            signedInPhone={customer?.phone ?? null}
            onContactSave={
              customer
                ? async (mobile) => {
                    await persistContactMobile(mobile);
                  }
                : undefined
            }
          />
          <label className="block">
            <span className={fieldLabelClass}>
              Notes for kitchen{" "}
              <span className="font-medium text-gray-400">(optional)</span>
            </span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 250))}
              className={inputClass}
              placeholder="Less spicy, no onions…"
            />
          </label>
        </section>

        <PaySection title="Pay by UPI">
          <PayMethodRow
            active={effectivePay === "upi"}
            title="Pay via QR Code"
            subtitle="Scan with GPay, PhonePe, Paytm, or any UPI app"
            badge="New"
            icon={<IconQr className="h-5 w-5" />}
            onClick={() => setPayMethod("upi")}
          />
        </PaySection>

        {pgAvailable ? (
          <PaySection title="Credit & Debit Cards">
            <PayMethodRow
              active={effectivePay === "card"}
              title="Pay with card / netbanking"
              subtitle="Visa, Mastercard, RuPay & more"
              accentTitle
              icon={<IconCard className="h-5 w-5" />}
              onClick={() => setPayMethod("card")}
            />
          </PaySection>
        ) : null}

        {codAllowed ? (
          <PaySection
            title={
              orderType === "delivery" ? "Cash on Delivery" : "Pay at counter"
            }
          >
            <PayMethodRow
              active={effectivePay === "cod"}
              title={
                orderType === "delivery"
                  ? "Cash on delivery"
                  : "Pay at counter"
              }
              subtitle={
                orderType === "delivery"
                  ? "Pay the rider when your order arrives"
                  : "Pay with cash when you collect"
              }
              icon={<IconCash className="h-5 w-5" />}
              onClick={() => setPayMethod("cod")}
            />
          </PaySection>
        ) : null}

        {error ? (
          <p className="text-[11px] font-semibold text-[#c2410c] bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            {error}
          </p>
        ) : null}
        {stepError ? (
          <p className="text-[11px] font-semibold text-[#c2410c] bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            {stepError}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handlePlaceOrderClick()}
          className="w-full h-12 rounded-xl bg-[#f16a34] text-white font-bold text-[14px] cursor-pointer disabled:opacity-50 shadow-sm"
        >
          {busy
            ? effectivePay === "card"
              ? "Redirecting to payment…"
              : "Placing order…"
            : effectivePay === "cod"
              ? `Confirm order · ${formatInr(grandTotal)}`
              : effectivePay === "card"
                ? `Continue to pay · ${formatInr(grandTotal)}`
                : `Pay ${formatInr(grandTotal)} · UPI`}
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
  const { customer, openLogin } = useWebsiteAuth();

  const goToPayment = () => {
    if (customer) {
      setPage(2);
      return;
    }
    openLogin({ onSuccess: () => setPage(2) });
  };

  return (
    <CartCheckoutForm
      {...props}
      page={page}
      onContinue={goToPayment}
      onBack={page === 2 ? () => setPage(1) : undefined}
    />
  );
}
