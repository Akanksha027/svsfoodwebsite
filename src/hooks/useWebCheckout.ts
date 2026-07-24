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
  cacheDeliveryAddressHint,
  type DeliveryAddressHint,
} from "@/lib/reverse-geocode";
import {
  clearLocationDenied,
  readSavedUserLocation,
  requestUserLocationDetailed,
} from "@/lib/user-location";
import {
  createPaymentSession,
  createPgPaymentSession,
  createWebOrder,
  confirmCodPlace,
  abandonCheckoutPayment,
  type WebOrderType,
} from "@/lib/orders-api";
import { SITE_URL } from "@/lib/config";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/indian-phone";
import type { WebsiteCustomerAddress } from "@/lib/website-customer-api";
import {
  assertCheckoutAllowed,
  defaultStorePolicy,
  getPolicyForStore,
  type WebsiteStorePolicy,
} from "@/lib/store-policies";
import {
  isScheduleSelectionValid,
  slotStartToIso,
  type ScheduleSelection,
} from "@/lib/schedule-slots";

export type PayMethod = "upi" | "card" | "cod";

export type PendingUpiPayment = {
  channel: "upi";
  orderId: string;
  orderNumber: string | number;
  storeSlug: string;
  storeId: string;
  transactionId: string;
  qrPayload: string;
  amount: string;
  isMock?: boolean;
};

export type PendingPgPayment = {
  channel: "pg";
  orderId: string;
  orderNumber: string | number;
  storeSlug: string;
  storeId: string;
  pgOrderId: string;
  redirectUrl: string;
  amount: string;
  isMock?: boolean;
};

export type PendingPayment = PendingUpiPayment | PendingPgPayment;

export type CheckoutPlaced =
  | {
      kind: "cod";
      orderId: string;
      orderNumber: string | number;
      storeSlug: string;
    }
  | { kind: "online"; pending: PendingUpiPayment }
  | { kind: "online_pg"; pending: PendingPgPayment };

export class PlaceOrderAbortedError extends Error {
  constructor() {
    super("Place order cancelled");
    this.name = "PlaceOrderAbortedError";
  }
}

type PlaceOrderOptions = {
  /** When true, stop before confirming COD / returning payment session. */
  isCancelled?: () => boolean;
  /** Instant vs scheduled delivery slot (website cart). */
  schedule?: ScheduleSelection;
  /** Override contact mobile (avoids stale React state after prefill). */
  contactMobile?: string;
};

type Options = {
  /** When false, skip GPS bootstrap (drawer closed). */
  active?: boolean;
};

export function useWebCheckout(options: Options = {}) {
  const active = options.active !== false;
  const { lines, store, subtotal, clearCart, orderType: cartOrderType, setOrderType: setCartOrderType } = useCart();

  const [orderType, setOrderTypeState] = useState<WebOrderType>(() => cartOrderType ?? "delivery");
  const setOrderType = useCallback(
    (next: WebOrderType) => {
      setOrderTypeState(next);
      setCartOrderType(next);
    },
    [setCartOrderType],
  );

  useEffect(() => {
    if (cartOrderType) setOrderTypeState(cartOrderType);
  }, [cartOrderType]);

  const [payMethod, setPayMethod] = useState<PayMethod>("upi");
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
  const [policy, setPolicy] = useState<WebsiteStorePolicy>(() =>
    defaultStorePolicy(store.backendStoreId),
  );

  useEffect(() => {
    let cancelled = false;
    void getPolicyForStore(store.backendStoreId).then((p) => {
      if (!cancelled) setPolicy(p);
    });
    return () => {
      cancelled = true;
    };
  }, [store.backendStoreId]);

  const totals = useMemo(
    () =>
      computeTotals({
        subtotal,
        orderType,
        deliveryFee: policy.delivery_fee,
      }),
    [subtotal, orderType, policy.delivery_fee],
  );

  const codAllowed =
    (orderType === "delivery" || orderType === "takeaway") &&
    policy.web_cod_enabled;
  const effectivePay: PayMethod = useMemo(() => {
    if (orderType === "dine_in" || !codAllowed) {
      return payMethod === "cod" ? "upi" : payMethod;
    }
    return payMethod;
  }, [orderType, codAllowed, payMethod]);

  useEffect(() => {
    if (!codAllowed && payMethod === "cod") {
      setPayMethod("upi");
    }
  }, [codAllowed, payMethod]);

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
      // Device GPS is only for optional area text — never the delivery pin.
      // Delivery radius uses the address map pin / saved address coords only.
      if (!readSavedUserLocation()) {
        await applyLocation(false);
      }
      if (cancelled) return;

      setAddressHint((prev) => {
        if (resolveDeliveryCoords(prev)) return prev;
        // Keep null; saved address / map picker will set the real pin.
        return prev;
      });

      setAddressLoading(false);
      setBooted(true);
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [active, booted, applyLocation]);

  const placeOrder = useCallback(async (
    options: PlaceOrderOptions = {},
  ): Promise<CheckoutPlaced> => {
    setError(null);
    const throwIfCancelled = () => {
      if (options.isCancelled?.()) {
        throw new PlaceOrderAbortedError();
      }
    };
    const mobile = normalizeIndianMobile(
      (options.contactMobile ?? phone).trim(),
    );
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
        throw new Error(
          "Set your delivery location on the map so we can check if we deliver there.",
        );
      }

      assertCheckoutAllowed({
        policy,
        orderType,
        subtotal,
        payMethod: effectivePay,
        deliveryLat: deliveryCoords?.lat,
        deliveryLng: deliveryCoords?.lng,
      });

      const schedule = options.schedule;
      if (
        schedule?.mode === "scheduled" &&
        (!schedule.slot || !isScheduleSelectionValid(schedule))
      ) {
        throw new Error(
          "That delivery slot is no longer available. Pick another time.",
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
        fulfillmentMode:
          schedule?.mode === "scheduled" && schedule.slot
            ? "scheduled"
            : "instant",
        scheduledForAt:
          schedule?.mode === "scheduled" && schedule.slot
            ? slotStartToIso(schedule.slot)
            : undefined,
        scheduleDate:
          schedule?.mode === "scheduled" && schedule.slot
            ? schedule.slot.dateKey
            : undefined,
        scheduleHour:
          schedule?.mode === "scheduled" && schedule.slot
            ? schedule.slot.startHour
            : undefined,
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

      if (effectivePay === "card") {
        const redirectUrl = `${SITE_URL}/pay/return?order=${encodeURIComponent(order.order_id)}&store=${encodeURIComponent(store.id)}`;
        const pgSession = await createPgPaymentSession({
          storeId: store.backendStoreId,
          orderId: order.order_id,
          amount: totals.grandTotal,
          redirectUrl,
        });

        throwIfCancelled();

        const pending: PendingPgPayment = {
          channel: "pg",
          orderId: order.order_id,
          orderNumber: order.order_number,
          storeSlug: store.id,
          storeId: store.backendStoreId,
          pgOrderId: pgSession.pg_order_id,
          redirectUrl: pgSession.redirect_url,
          amount: pgSession.amount || String(totals.grandTotal),
          isMock: pgSession.mode === "mock",
        };

        return { kind: "online_pg", pending };
      }

      const session = await createPaymentSession({
        storeId: store.backendStoreId,
        orderId: order.order_id,
        amount: totals.grandTotal,
        customerPhone: mobile,
      });

      throwIfCancelled();

      const pending: PendingUpiPayment = {
        channel: "upi",
        orderId: order.order_id,
        orderNumber: order.order_number,
        storeSlug: store.id,
        storeId: store.backendStoreId,
        transactionId: session.transaction_id,
        qrPayload: session.qr_payload,
        amount: session.amount,
        isMock: session.is_mock === true,
      };

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
      const code =
        err instanceof Error
          ? (err as Error & { code?: string }).code
          : undefined;
      setError(
        code === "PHONEPE_PG_NOT_CONFIGURED"
          ? "Card payments are being enabled on our server. Please use UPI for now, or try again later."
          : /client not found/i.test(message)
            ? "Card payments aren’t ready yet (PhonePe client credentials). Please pay with UPI QR for now."
            : message,
      );
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
    policy,
  ]);

  const resetErrors = useCallback(() => setError(null), []);

  const applySavedAddress = useCallback((addr: WebsiteCustomerAddress) => {
    setFlat(addr.flat);
    setStreet(addr.street);
    setArea(addr.area);
    setLandmark(addr.landmark || "");
    setPincode(addr.pincode || "");
    setAddressLabel(addr.label || "Home");
    if (
      addr.latitude != null &&
      addr.longitude != null &&
      Number.isFinite(addr.latitude) &&
      Number.isFinite(addr.longitude)
    ) {
      setPinReady(true);
      setPinMessage(null);
      const hint = {
        formatted:
          addr.formatted_address?.trim() ||
          [addr.flat, addr.street, addr.area].filter(Boolean).join(", ") ||
          addr.area,
        lat: addr.latitude,
        lng: addr.longitude,
        postcode: addr.pincode || undefined,
        savedAt: new Date().toISOString(),
      };
      setAddressHint(hint);
      cacheDeliveryAddressHint(hint);
    } else {
      // Text fields without a map pin — clear any stale device-GPS pin.
      setPinReady(false);
      setAddressHint(null);
      setPinMessage(
        "Open Edit on the delivery address and confirm the map pin.",
      );
    }
  }, []);

  const validateOrderStep = useCallback((): string | null => {
    try {
      if (!policy.web_ordering_enabled) {
        return "Online ordering is paused for this outlet.";
      }
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
          return "Confirm your delivery pin on the map (Edit address).";
        }
        const coords = resolveDeliveryCoords(addressHint);
        assertCheckoutAllowed({
          policy,
          orderType,
          subtotal,
          payMethod: effectivePay,
          deliveryLat: coords?.lat,
          deliveryLng: coords?.lng,
        });
      } else if (orderType === "takeaway") {
        assertCheckoutAllowed({
          policy,
          orderType,
          subtotal,
          payMethod: effectivePay,
        });
      }
    } catch (err) {
      return err instanceof Error ? err.message : "Checkout not available.";
    }
    return null;
  }, [
    orderType,
    flat,
    street,
    area,
    fullAddress,
    pinReady,
    addressHint,
    policy,
    subtotal,
  ]);

  const applyAddressHint = useCallback((hint: DeliveryAddressHint) => {
    setAddressHint(hint);
    setPinReady(true);
    setPinMessage(null);
    cacheDeliveryAddressHint(hint);
  }, []);

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
    policy,
    applyLocation,
    clearLocationDenied,
    validateOrderStep,
    applySavedAddress,
    applyAddressHint,
    placeOrder,
  };
}
