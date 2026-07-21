"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  computeTotals,
  useCart,
  type CartLine,
} from "@/context/CartContext";
import {
  composeDeliveryAddress,
  fetchDeliveryAddressHint,
  resolveDeliveryCoords,
  type DeliveryAddressHint,
} from "@/lib/reverse-geocode";
import {
  clearLocationDenied,
  readSavedUserLocation,
  requestUserLocationDetailed,
} from "@/lib/user-location";
import {
  createPaymentSession,
  createWebOrder,
  confirmCodPlace,
  abandonCheckoutPayment,
  type WebOrderType,
} from "@/lib/orders-api";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/indian-phone";
import type { WebsiteCustomerAddress } from "@/lib/website-customer-api";

export type PayMethod = "online" | "cod";

export type PendingPayment = {
  orderId: string;
  orderNumber: string | number;
  storeSlug: string;
  storeId: string;
  transactionId: string;
  qrPayload: string;
  amount: string;
  isMock?: boolean;
};

export type CheckoutPlaced =
  | {
      kind: "cod";
      orderId: string;
      orderNumber: string | number;
      storeSlug: string;
    }
  | { kind: "online"; pending: PendingPayment };

export class PlaceOrderAbortedError extends Error {
  constructor() {
    super("Place order cancelled");
    this.name = "PlaceOrderAbortedError";
  }
}

type PlaceOrderOptions = {
  /** When true, stop before confirming COD / returning payment session. */
  isCancelled?: () => boolean;
};

type Options = {
  /** When false, skip GPS bootstrap (drawer closed). */
  active?: boolean;
};

export function useWebCheckout(options: Options = {}) {
  const active = options.active !== false;
  const { lines, store, subtotal, clearCart } = useCart();

  const [orderType, setOrderType] = useState<WebOrderType>("delivery");
  const [payMethod, setPayMethod] = useState<PayMethod>("online");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [flat, setFlat] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressHint, setAddressHint] = useState<DeliveryAddressHint | null>(
    null,
  );
  const [addressLoading, setAddressLoading] = useState(false);
  const [pinReady, setPinReady] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);

  const totals = useMemo(
    () => computeTotals({ subtotal, orderType }),
    [subtotal, orderType],
  );

  const codAllowed = orderType === "delivery" || orderType === "takeaway";
  const effectivePay: PayMethod =
    orderType === "dine_in" ? "online" : payMethod;

  const fullAddress = useMemo(
    () =>
      composeDeliveryAddress({
        flat,
        street,
        area,
        landmark,
        pincode,
      }),
    [flat, street, area, landmark, pincode],
  );

  const applyLocation = useCallback(async (force: boolean) => {
    setPinBusy(true);
    setPinMessage(null);
    const result = await requestUserLocationDetailed({
      force,
      highAccuracy: true,
      timeoutMs: 22000,
      maximumAgeMs: 60_000,
    });
    if (result.ok) {
      const { location } = result;
      setPinReady(true);
      setPinMessage(null);
      setAddressHint((prev) =>
        prev
          ? { ...prev, lat: location.lat, lng: location.lng }
          : {
              formatted: area.trim() || "Your location",
              lat: location.lat,
              lng: location.lng,
              savedAt: location.savedAt,
            },
      );
      void fetchDeliveryAddressHint().then((hint) => {
        if (!hint) return;
        setAddressHint(hint);
        setArea((prev) => prev || hint.formatted);
        if (hint.postcode) {
          setPincode((prev) => prev || hint.postcode || "");
        }
      });
      setPinBusy(false);
      return true;
    }
    setPinReady(false);
    setPinMessage(result.message);
    setPinBusy(false);
    return false;
  }, [area]);

  useEffect(() => {
    if (!active || booted) return;
    let cancelled = false;
    setAddressLoading(true);

    const boot = async () => {
      const saved = readSavedUserLocation();
      if (!saved) {
        await applyLocation(true);
      } else {
        setPinReady(true);
      }
      if (cancelled) return;
      const hint = await fetchDeliveryAddressHint();
      if (cancelled) return;
      setAddressHint(hint);
      if (hint) {
        setPinReady(true);
        setArea((prev) => prev || hint.formatted);
        if (hint.postcode) {
          setPincode((prev) => prev || hint.postcode || "");
        }
      }
      setAddressLoading(false);
      setBooted(true);
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [active, booted, applyLocation]);

  useEffect(() => {
    if (!active || orderType !== "delivery") return;
    if (pinReady || resolveDeliveryCoords(addressHint)) return;
    void applyLocation(true);
  }, [active, orderType, pinReady, addressHint, applyLocation]);

  const placeOrder = useCallback(async (
    options: PlaceOrderOptions = {},
  ): Promise<CheckoutPlaced> => {
    setError(null);
    const throwIfCancelled = () => {
      if (options.isCancelled?.()) {
        throw new PlaceOrderAbortedError();
      }
    };
    const mobile = normalizeIndianMobile(phone.trim());
    if (!isValidIndianMobile(mobile)) {
      throw new Error("Enter a valid 10-digit mobile number.");
    }
    if (orderType === "delivery") {
      if (flat.trim().length < 2) {
        throw new Error("Enter flat / house / floor number.");
      }
      if (street.trim().length < 3) {
        throw new Error("Enter street, building, or society name.");
      }
      if (area.trim().length < 6) {
        throw new Error("Enter area / locality (edit GPS text if needed).");
      }
      if (fullAddress.length < 20) {
        throw new Error("Please complete your full delivery address.");
      }
    }

    setBusy(true);
    let createdOrderId: string | null = null;
    try {
      let deliveryCoords =
        orderType === "delivery" ? resolveDeliveryCoords(addressHint) : null;

      if (orderType === "delivery" && !deliveryCoords) {
        const result = await requestUserLocationDetailed({
          force: true,
          highAccuracy: true,
          timeoutMs: 22000,
          maximumAgeMs: 0,
        });
        if (result.ok) {
          deliveryCoords = {
            lat: result.location.lat,
            lng: result.location.lng,
          };
          setPinReady(true);
          setPinMessage(null);
          setAddressHint((prev) =>
            prev
              ? {
                  ...prev,
                  lat: result.location.lat,
                  lng: result.location.lng,
                }
              : {
                  formatted: area.trim() || "Your location",
                  lat: result.location.lat,
                  lng: result.location.lng,
                  savedAt: result.location.savedAt,
                },
          );
        } else {
          setPinReady(false);
          setPinMessage(result.message);
          throw new Error(result.message);
        }
      }

      if (orderType === "delivery" && !deliveryCoords) {
        throw new Error(
          "We need your location pin for the rider. Tap “Share location” and allow access.",
        );
      }

      const order = await createWebOrder({
        storeId: store.backendStoreId,
        orderType,
        items: lines.map((line: CartLine) => ({
          item_id: line.itemId,
          unit_price: line.unitPrice,
          price: line.unitPrice,
          petpooja_item_id: line.petpoojaItemId,
          name: line.name,
          quantity: line.quantity,
          variation_name: line.variantName || undefined,
          variation_group_name: line.variantGroupName || undefined,
          addons: (line.addons || []).map((a) => ({
            id: a.petpooja_addon_item_id ?? a.id,
            group_id: a.petpooja_addon_group_id ?? a.group_id,
            group_name: a.group_name,
            name: a.name,
            price: a.price,
            quantity: a.quantity,
          })),
        })),
        subtotal,
        gstAmount: totals.gstAmount,
        grandTotal: totals.grandTotal,
        deliveryCharges: totals.deliveryCharges,
        customerMobile: mobile,
        customerName: name.trim() || undefined,
        customerAddress:
          orderType === "delivery" ? fullAddress : undefined,
        customerLatitude: deliveryCoords?.lat,
        customerLongitude: deliveryCoords?.lng,
        customerNotes: notes.trim() || undefined,
      });
      createdOrderId = order.order_id;

      throwIfCancelled();

      if (effectivePay === "cod") {
        await confirmCodPlace({
          storeId: store.backendStoreId,
          orderId: order.order_id,
        });
        throwIfCancelled();
        clearCart();
        return {
          kind: "cod",
          orderId: order.order_id,
          orderNumber: order.order_number,
          storeSlug: store.id,
        };
      }

      const session = await createPaymentSession({
        storeId: store.backendStoreId,
        orderId: order.order_id,
        amount: totals.grandTotal,
        customerPhone: mobile,
      });

      throwIfCancelled();

      const pending: PendingPayment = {
        orderId: order.order_id,
        orderNumber: order.order_number,
        storeSlug: store.id,
        storeId: store.backendStoreId,
        transactionId: session.transaction_id,
        qrPayload: session.qr_payload,
        amount: session.amount,
        isMock: session.is_mock === true,
      };

      // Keep cart until payment succeeds — cancel restores checkout UX.
      return { kind: "online", pending };
    } catch (err) {
      if (err instanceof PlaceOrderAbortedError) {
        if (createdOrderId) {
          void abandonCheckoutPayment({
            storeId: store.backendStoreId,
            orderId: createdOrderId,
          }).catch(() => undefined);
        }
        throw err;
      }
      const message =
        err instanceof Error ? err.message : "Checkout failed";
      setError(message);
      throw err;
    } finally {
      setBusy(false);
    }
  }, [
    phone,
    orderType,
    flat,
    street,
    area,
    fullAddress,
    addressHint,
    store,
    lines,
    subtotal,
    totals,
    name,
    notes,
    effectivePay,
    clearCart,
  ]);

  const resetErrors = useCallback(() => setError(null), []);

  const applySavedAddress = useCallback((addr: WebsiteCustomerAddress) => {
    setFlat(addr.flat);
    setStreet(addr.street);
    setArea(addr.area);
    setLandmark(addr.landmark || "");
    setPincode(addr.pincode || "");
    setAddressLabel(addr.label || "Home");
    if (addr.latitude != null && addr.longitude != null) {
      setPinReady(true);
      setPinMessage(null);
      setAddressHint({
        formatted: addr.area,
        lat: addr.latitude,
        lng: addr.longitude,
        savedAt: new Date().toISOString(),
      });
    }
  }, []);

  const validateOrderStep = useCallback((): string | null => {
    if (orderType === "delivery") {
      if (flat.trim().length < 2) {
        return "Enter flat / house / floor number.";
      }
      if (street.trim().length < 3) {
        return "Enter street, building, or society name.";
      }
      if (area.trim().length < 6) {
        return "Enter area / locality.";
      }
      if (fullAddress.length < 20) {
        return "Please complete your delivery address.";
      }
      if (!pinReady && !resolveDeliveryCoords(addressHint)) {
        return "Share your location for the rider pin.";
      }
    }
    return null;
  }, [orderType, flat, street, area, fullAddress, pinReady, addressHint]);

  return {
    store,
    lines,
    subtotal,
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
    addressHint,
    addressLoading,
    pinReady,
    pinBusy,
    pinMessage,
    notes,
    setNotes,
    busy,
    error,
    resetErrors,
    totals,
    codAllowed,
    effectivePay,
    applyLocation,
    clearLocationDenied,
    validateOrderStep,
    applySavedAddress,
    placeOrder,
  };
}
