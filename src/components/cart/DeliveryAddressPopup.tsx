"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AddressLabelPicker from "@/components/AddressLabelPicker";
import type { Checkout } from "@/components/cart/cart-ui-utils";
import {
  hintFromCoords,
  prefillAddressFromPlaceLabel,
} from "@/components/cart/cart-ui-utils";
import { outletCoords, isWithinDeliveryRadius } from "@/lib/store-policies";
import { searchDeliveryLocations, resolvePlaceLocation, type LocationSearchResult } from "@/lib/location-search";
import { requestUserLocationDetailed } from "@/lib/user-location";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import { persistCheckoutDeliveryAddress } from "@/lib/website-customer-api";

const fieldLabelClass = "text-[11px] font-semibold text-gray-600";
const inputClass =
  "mt-1 w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-[13px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#f16a34] focus:ring-2 focus:ring-[#f16a34]/10";

type Step = "map" | "details";

type Props = {
  open: boolean;
  checkout: Checkout;
  onClose: () => void;
  onSaved: () => void;
};

function mapEmbedUrl(lat: number, lng: number) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=17&hl=en&output=embed`;
}

/** Centered page modal for delivery location + address details. */
export default function DeliveryAddressPopup({
  open,
  checkout,
  onClose,
  onSaved,
}: Props) {
  const { customer, refreshCustomer, openLogin } = useWebsiteAuth();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("map");
  const [query, setQuery] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [locBusy, setLocBusy] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [attemptedDetails, setAttemptedDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchSeq = useRef(0);
  const wasOpenRef = useRef(false);

  const policy = checkout.policy;
  const storePin = outletCoords(policy);

  const [pin, setPin] = useState(() => {
    const hint = checkout.addressHint;
    if (hint?.lat != null && hint.lng != null) {
      return { lat: hint.lat, lng: hint.lng, label: hint.formatted };
    }
    return { lat: storePin.lat, lng: storePin.lng, label: "Store area" };
  });

  useBodyScrollLock(open);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;
    if (!justOpened) return;

    setStep("map");
    setMapError(null);
    setAttemptedDetails(false);
    setQuery("");
    setSearchResults([]);
    setShowResults(false);
    const hint = checkout.addressHint;
    if (hint?.lat != null && hint.lng != null) {
      setPin({ lat: hint.lat, lng: hint.lng, label: hint.formatted });
    } else {
      setPin({ lat: storePin.lat, lng: storePin.lng, label: "Store area" });
    }
  }, [open, checkout.addressHint, storePin.lat, storePin.lng]);

  const runSearch = useCallback(async (text: string) => {
    const q = text.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const seq = ++searchSeq.current;
    setSearchBusy(true);
    try {
      const rows = await searchDeliveryLocations(q, {
        lat: pin.lat,
        lng: pin.lng,
      });
      if (seq !== searchSeq.current) return;
      setSearchResults(rows);
      setShowResults(true);
    } finally {
      if (seq === searchSeq.current) setSearchBusy(false);
    }
  }, [pin.lat, pin.lng]);

  useEffect(() => {
    if (!open || step !== "map") return;
    const q = query.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const id = window.setTimeout(() => void runSearch(q), 320);
    return () => window.clearTimeout(id);
  }, [query, open, step, runSearch]);

  const applyPin = (lat: number, lng: number, label: string) => {
    setPin({ lat, lng, label });
    setMapError(
      isWithinDeliveryRadius(policy, lat, lng)
        ? null
        : "We do not serve at this location. Please pick a spot within our delivery area.",
    );
    setShowResults(false);
  };

  const advanceToDetailsWithPin = useCallback(
    (lat: number, lng: number, label: string) => {
      if (!isWithinDeliveryRadius(policy, lat, lng)) {
        setMapError(
          "We do not serve at this location. Please pick a spot within our delivery area.",
        );
        return;
      }
      setPin({ lat, lng, label });
      const hint = hintFromCoords(lat, lng, label);
      checkout.applyAddressHint(hint);
      prefillAddressFromPlaceLabel(label, checkout);
      setMapError(null);
      setAttemptedDetails(false);
      setStep("details");
    },
    [checkout, policy],
  );

  const advanceToDetails = useCallback(() => {
    advanceToDetailsWithPin(pin.lat, pin.lng, pin.label);
  }, [advanceToDetailsWithPin, pin.lat, pin.lng, pin.label]);

  const useCurrentLocation = async () => {
    setLocBusy(true);
    setMapError(null);
    const result = await requestUserLocationDetailed({
      force: true,
      highAccuracy: true,
      timeoutMs: 22000,
    });
    setLocBusy(false);
    if (!result.ok) {
      setMapError(result.message || "Could not get your location.");
      return;
    }
    applyPin(result.location.lat, result.location.lng, "Current location");
    setQuery("");
  };

  const selectSearchResult = async (row: LocationSearchResult) => {
    setMapError(null);
    let lat = row.lat;
    let lng = row.lng;
    let label = row.label;

    if (lat == null || lng == null) {
      if (!row.placeId) return;
      setSearchBusy(true);
      try {
        const resolved = await resolvePlaceLocation(row.placeId);
        if (!resolved?.lat || !resolved.lng) {
          setMapError("Could not load that place. Try another result.");
          return;
        }
        lat = resolved.lat;
        lng = resolved.lng;
        label = resolved.label;
      } finally {
        setSearchBusy(false);
      }
    }

    applyPin(lat, lng, label);
    setQuery(label);

    advanceToDetailsWithPin(lat, lng, label);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const first = searchResults[0];
    if (first) void selectSearchResult(first);
    else void runSearch(query);
  };

  const confirmMap = () => {
    if (searchBusy || locBusy) return;
    advanceToDetails();
  };

  const detailsError = attemptedDetails ? checkout.validateOrderStep() : null;

  const saveDetails = async () => {
    setAttemptedDetails(true);
    const msg = checkout.validateOrderStep();
    if (msg) return;

    if (!customer) {
      openLogin({
        onSuccess: () => void saveDetails(),
      });
      return;
    }

    setSaving(true);
    try {
      await persistCheckoutDeliveryAddress({
        customer,
        flat: checkout.flat,
        street: checkout.street,
        area: checkout.area,
        landmark: checkout.landmark,
        pincode: checkout.pincode,
        label: checkout.addressLabel,
        latitude: pin.lat,
        longitude: pin.lng,
      });
      await refreshCustomer();
      onSaved();
      onClose();
    } catch (e) {
      setMapError(
        e instanceof Error ? e.message : "Could not save address. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close location picker"
        onClick={onClose}
        className="fixed inset-0 z-[1700] border-0 cursor-pointer bg-black/45"
      />
      <div className="fixed inset-0 z-[1710] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none font-bagoss">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            step === "map" ? "Select delivery location" : "Address details"
          }
          className="pointer-events-auto flex w-full sm:max-w-[440px] max-h-[min(90dvh,680px)] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
        >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 shrink-0 bg-white">
        <button
          type="button"
          onClick={() => {
            if (step === "details") setStep("map");
            else onClose();
          }}
          className="inline-flex items-center gap-2 border-0 bg-transparent p-0 cursor-pointer text-[15px] font-bold text-gray-900"
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
          {step === "details" ? "Change location" : "Back"}
        </button>
        <p className="text-[15px] font-bold text-gray-900">
          {step === "map" ? "Select location" : "Address details"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer p-1 text-lg leading-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {step === "map" ? (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="px-4 py-3 bg-white border-b border-gray-100 space-y-2">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  onFocus={() => searchResults.length && setShowResults(true)}
                  placeholder="Search area, street, landmark…"
                  className="w-full h-11 rounded-xl border border-gray-200 pl-10 pr-3 text-[14px] outline-none focus:border-[#f16a34]"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" />
                </svg>
                {searchBusy ? (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-[#f16a34] border-t-transparent animate-spin" />
                ) : null}
              </div>
              {showResults && searchResults.length > 0 ? (
                <ul className="max-h-32 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg divide-y divide-gray-100">
                  {searchResults.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => void selectSearchResult(row)}
                        className="w-full px-3 py-2.5 text-left text-[13px] text-gray-800 border-0 bg-white cursor-pointer hover:bg-gray-50"
                      >
                        {row.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                disabled={locBusy}
                onClick={() => void useCurrentLocation()}
                className="w-full h-11 rounded-xl border border-[#f16a34]/30 bg-[#fff8f4] text-[#f16a34] text-[13px] font-bold cursor-pointer disabled:opacity-60"
              >
                {locBusy ? "Getting location…" : "Select current location"}
              </button>
            </div>

            <div className="relative h-[200px] bg-gray-100 shrink-0">
              <iframe
                title="Delivery map"
                src={mapEmbedUrl(pin.lat, pin.lng)}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pb-8">
                <svg
                  className="h-10 w-10 text-[#e23744] drop-shadow"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 space-y-2 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]">
            <p className="text-[12px] text-gray-600 line-clamp-2 leading-snug">
              {pin.label}
            </p>
            {mapError ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold leading-snug text-red-700"
              >
                {mapError}
              </div>
            ) : null}
            <button
              type="button"
              onClick={confirmMap}
              disabled={searchBusy || locBusy}
              className="w-full h-12 rounded-xl bg-[#f16a34] text-white font-bold text-[14px] border-0 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed shrink-0"
            >
              {searchBusy || locBusy ? "Loading location…" : "Confirm location"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-3">
            <div className="rounded-xl border border-gray-200 bg-[#fff8f4] px-3 py-2.5 text-[12px] text-gray-700">
              {pin.label}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className={fieldLabelClass}>
                  Flat / House <span className="text-[#f16a34]">*</span>
                </span>
                <input
                  value={checkout.flat}
                  onChange={(e) => checkout.setFlat(e.target.value)}
                  className={inputClass}
                  placeholder="402, Tower B"
                />
              </label>
              <label className="block">
                <span className={fieldLabelClass}>
                  Street <span className="text-[#f16a34]">*</span>
                </span>
                <input
                  value={checkout.street}
                  onChange={(e) => checkout.setStreet(e.target.value)}
                  className={inputClass}
                  placeholder="Society, road"
                />
              </label>
            </div>
            <label className="block">
              <span className={fieldLabelClass}>
                Area / Locality <span className="text-[#f16a34]">*</span>
              </span>
              <input
                value={checkout.area}
                onChange={(e) => checkout.setArea(e.target.value)}
                className={inputClass}
                placeholder="Neighbourhood, city"
              />
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className={fieldLabelClass}>Landmark</span>
                <input
                  value={checkout.landmark}
                  onChange={(e) => checkout.setLandmark(e.target.value)}
                  className={inputClass}
                  placeholder="Optional"
                />
              </label>
              <label className="block">
                <span className={fieldLabelClass}>PIN code</span>
                <input
                  value={checkout.pincode}
                  onChange={(e) =>
                    checkout.setPincode(
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="6 digits"
                />
              </label>
            </div>
            {customer ? (
              <AddressLabelPicker
                label={checkout.addressLabel}
                onChange={checkout.setAddressLabel}
              />
            ) : null}
            {detailsError ? (
              <p className="text-[12px] font-semibold text-[#f16a34]">
                {detailsError}
              </p>
            ) : null}
            {mapError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] font-semibold text-red-700">
                {mapError}
              </div>
            ) : null}
          </div>
          <div className="shrink-0 border-t border-gray-100 px-4 py-3 bg-white">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveDetails()}
              className="w-full h-12 rounded-xl bg-[#f16a34] text-white font-bold text-[14px] border-0 cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save & continue"}
            </button>
          </div>
        </>
      )}
        </div>
      </div>
    </>,
    document.body,
  );
}
