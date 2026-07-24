"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CartInlinePayment } from "@/components/CartCheckoutForm";
import CartDrawerDoneStep from "@/components/CartDrawerDoneStep";
import CartDrawerPayStep from "@/components/CartDrawerPayStep";
import {
  CartBillSummarySection,
  CartCouponsSection,
  CartShipmentSection,
} from "@/components/cart/CartBlinkitSections";
import DeliveryAddressPopup from "@/components/cart/DeliveryAddressPopup";
import CartScheduleSection from "@/components/cart/CartScheduleSection";
import RiderTipSection from "@/components/cart/RiderTipSection";
import {
  formatDeliveryToLabel,
  hasCompleteDeliveryAddress,
  pickDefaultAddress,
} from "@/components/cart/cart-ui-utils";
import OrderTypeDropdown from "@/components/OrderTypeDropdown";
import OrderTypePicker from "@/components/OrderTypePicker";
import { computeTotals, useCart } from "@/context/CartContext";
import { useMenuCart } from "@/context/MenuCartContext";
import {
  PlaceOrderAbortedError,
  useWebCheckout,
  type PendingPayment,
} from "@/hooks/useWebCheckout";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import { persistCheckoutDeliveryAddress } from "@/lib/website-customer-api";
import { abandonCheckoutPayment } from "@/lib/orders-api";
import { resolveDeliveryCoords } from "@/lib/reverse-geocode";
import { formatInr } from "@/lib/menu-api";
import type { ScheduleSelection } from "@/lib/schedule-slots";
import { buildTodayScheduleSlots } from "@/lib/schedule-slots";
import type { WebOrderType } from "@/lib/orders-api";

const PG_PENDING_KEY = "svs_pending_pg_payment";
const SVS_ORANGE = "#f16a34";

type DrawerStep =
  | "pick"
  | "summary"
  | "payment"
  | "pay"
  | "done";

type SummarySubview = "cart" | "schedule";

export default function CartDrawer() {
  const {
    lines,
    itemCount,
    subtotal,
    setQuantity,
    clearCart,
    orderType,
    setOrderType,
  } = useCart();
  const { isOpen, closeCart } = useMenuCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<DrawerStep>("pick");
  const [pendingPay, setPendingPay] = useState<PendingPayment | null>(null);
  const [doneOrder, setDoneOrder] = useState<{
    orderId: string;
    orderNumber: string | number;
    storeSlug: string;
  } | null>(null);
  const [riderTip, setRiderTip] = useState(0);
  const [addressPopupOpen, setAddressPopupOpen] = useState(false);
  const [deliverySchedule, setDeliverySchedule] = useState<ScheduleSelection>({
    mode: "instant",
    slot: null,
  });
  const [summarySubview, setSummarySubview] = useState<SummarySubview>("cart");
  const [addressPopupAfterSave, setAddressPopupAfterSave] = useState<
    "summary" | "payment"
  >("summary");
  const [paymentCancelNotice, setPaymentCancelNotice] = useState<string | null>(
    null,
  );
  const placeOrderAttemptRef = useRef(0);
  const cancelledPlaceOrderAttemptRef = useRef<number | null>(null);

  const checkoutActive = isOpen && itemCount > 0;
  const checkout = useWebCheckout({ active: checkoutActive });
  const { customer, refreshCustomer, openLogin } = useWebsiteAuth();

  const cancelActivePlaceOrder = useCallback(() => {
    cancelledPlaceOrderAttemptRef.current = placeOrderAttemptRef.current;
  }, []);

  const isPlaceOrderCancelled = useCallback((attempt: number) => {
    return cancelledPlaceOrderAttemptRef.current === attempt;
  }, []);

  const saveDeliveryAddressIfNeeded = useCallback(async () => {
    if (!customer || checkout.orderType !== "delivery") return;
    const coords = resolveDeliveryCoords(checkout.addressHint);
    try {
      await persistCheckoutDeliveryAddress({
        customer,
        flat: checkout.flat,
        street: checkout.street,
        area: checkout.area,
        landmark: checkout.landmark,
        pincode: checkout.pincode,
        label: checkout.addressLabel,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      });
      await refreshCustomer();
    } catch {
      /* non-blocking */
    }
  }, [customer, checkout, refreshCustomer]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cancelActivePlaceOrder();
      setPendingPay(null);
      setDoneOrder(null);
      setAddressPopupOpen(false);
      setPaymentCancelNotice(null);
      setSummarySubview("cart");
      return;
    }
    if (itemCount === 0) {
      setStep("pick");
      return;
    }
    if (orderType) {
      setStep((s) => (s === "pay" || s === "done" || s === "payment" ? s : "summary"));
    } else {
      setStep("pick");
    }
  }, [isOpen, cancelActivePlaceOrder, itemCount, orderType]);

  useEffect(() => {
    if (!paymentCancelNotice) return;
    const id = window.setTimeout(() => setPaymentCancelNotice(null), 6000);
    return () => window.clearTimeout(id);
  }, [paymentCancelNotice]);

  useEffect(() => {
    if (!customer || orderType !== "delivery") return;
    const def = pickDefaultAddress(customer);
    if (def && !checkout.flat.trim()) {
      checkout.applySavedAddress(def);
    }
  }, [customer, orderType, checkout.flat, checkout.applySavedAddress]);

  useEffect(() => {
    if (step === "payment" && !customer) {
      openLogin({ onSuccess: () => setStep("payment") });
      setStep("summary");
    }
  }, [step, customer, openLogin]);

  const effectiveOrderType = orderType ?? checkout.orderType;
  const isDelivery = effectiveOrderType === "delivery";

  const totals = useMemo(
    () =>
      computeTotals({
        subtotal,
        orderType: effectiveOrderType,
        deliveryFee: checkout.policy.delivery_fee,
      }),
    [subtotal, effectiveOrderType, checkout.policy.delivery_fee],
  );

  const grandTotal = totals.grandTotal + (isDelivery ? riderTip : 0);
  const savedAddress = pickDefaultAddress(customer);
  const hasAddress = hasCompleteDeliveryAddress(checkout);
  const deliveryLabel = formatDeliveryToLabel({
    checkout,
    saved: savedAddress,
  });

  const handleOrderTypeSelect = useCallback(
    (type: WebOrderType) => {
      setOrderType(type);
      checkout.setOrderType(type);
      if (type === "dine_in") checkout.setPayMethod("upi");
      if (type !== "delivery") {
        setRiderTip(0);
        setSummarySubview("cart");
        setDeliverySchedule({ mode: "instant", slot: null });
      }
      setStep("summary");
    },
    [checkout, setOrderType],
  );

  useBodyScrollLock(isOpen);

  const leavePayScreen = useCallback(() => {
    const pending = pendingPay;
    cancelActivePlaceOrder();
    setPendingPay(null);

    if (pending && pending.channel === "upi") {
      void abandonCheckoutPayment({
        storeId: pending.storeId,
        orderId: pending.orderId,
        transactionId: pending.transactionId,
      }).catch(() => undefined);
    } else if (pending) {
      void abandonCheckoutPayment({
        storeId: pending.storeId,
        orderId: pending.orderId,
      }).catch(() => undefined);
    }

    setPaymentCancelNotice(
      "Payment cancelled. Your cart is still here. Place the order again when you’re ready.",
    );
    setStep("summary");
  }, [pendingPay, cancelActivePlaceOrder]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (addressPopupOpen) {
        setAddressPopupOpen(false);
        return;
      }
      if (step === "pay") {
        leavePayScreen();
        return;
      }
      if (step === "payment") setStep("summary");
      else if (step === "summary" && orderType) setStep("pick");
      else closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    isOpen,
    closeCart,
    step,
    leavePayScreen,
    addressPopupOpen,
    orderType,
  ]);

  const openScheduleView = useCallback(() => {
    setSummarySubview("schedule");
    setDeliverySchedule((prev) => {
      if (prev.mode === "scheduled" && prev.slot) return prev;
      const slots = buildTodayScheduleSlots();
      const first = slots[0];
      return first
        ? { mode: "scheduled", slot: first }
        : { mode: "scheduled", slot: null };
    });
  }, []);

  const handleInstantDeliverySelect = useCallback(() => {
    setDeliverySchedule({ mode: "instant", slot: null });
    setSummarySubview("cart");
  }, []);

  const headerTitle =
    step === "pick"
      ? "How would you like it?"
      : step === "summary"
        ? summarySubview === "schedule"
          ? "Schedule delivery"
          : "Your cart"
        : step === "payment"
          ? "Payment"
          : step === "pay"
            ? "Pay with UPI"
            : "Order confirmed";

  const goBack = () => {
    if (
      (step === "payment" && checkout.busy) ||
      (step === "pay" && !pendingPay)
    ) {
      cancelActivePlaceOrder();
    }
    if (step === "summary" && summarySubview === "schedule") {
      setSummarySubview("cart");
      return;
    }
    if (step === "payment") setStep("summary");
    else if (step === "summary") setStep("pick");
    else if (step === "pay") leavePayScreen();
    else closeCart();
  };

  const goToPayment = () => {
    if (isDelivery && !hasAddress) {
      setAddressPopupAfterSave("payment");
      setAddressPopupOpen(true);
      return;
    }
    if (!customer) {
      openLogin({ onSuccess: () => setStep("payment") });
      return;
    }
    setSummarySubview("cart");
    setStep("payment");
  };

  const handlePlaceOrder = useCallback(async (opts?: {
    contactMobile?: string;
  }) => {
    const attempt = ++placeOrderAttemptRef.current;
    const payingUpi = checkout.effectivePay === "upi";
    if (payingUpi) {
      setPendingPay(null);
      setStep("pay");
    }
    try {
      const result = await checkout.placeOrder({
        isCancelled: () => isPlaceOrderCancelled(attempt),
        schedule: deliverySchedule,
        contactMobile: opts?.contactMobile,
      });
      if (isPlaceOrderCancelled(attempt)) {
        if (result.kind === "online") {
          void abandonCheckoutPayment({
            storeId: result.pending.storeId,
            orderId: result.pending.orderId,
            transactionId: result.pending.transactionId,
          }).catch(() => undefined);
        } else if (result.kind === "online_pg") {
          void abandonCheckoutPayment({
            storeId: result.pending.storeId,
            orderId: result.pending.orderId,
          }).catch(() => undefined);
        }
        setPaymentCancelNotice(
          "Payment cancelled. Your cart is still here. Place the order again when you’re ready.",
        );
        setPendingPay(null);
        setStep("summary");
        return;
      }
      await saveDeliveryAddressIfNeeded();
      if (result.kind === "cod") {
        clearCart();
        closeCart();
        setStep("pick");
        router.push(
          `/order/${encodeURIComponent(result.orderId)}?store=${encodeURIComponent(result.storeSlug)}`,
        );
        return;
      }
      if (result.kind === "online_pg") {
        sessionStorage.setItem(PG_PENDING_KEY, JSON.stringify(result.pending));
        window.location.assign(result.pending.redirectUrl);
        return;
      }
      setPendingPay(result.pending);
      setStep("pay");
    } catch (err) {
      if (
        err instanceof PlaceOrderAbortedError ||
        isPlaceOrderCancelled(attempt)
      ) {
        setPaymentCancelNotice(
          "Payment cancelled. Your cart is still here. Place the order again when you’re ready.",
        );
        setPendingPay(null);
        setStep("summary");
        return;
      }
      if (payingUpi) {
        setStep("payment");
        setPendingPay(null);
      }
    }
  }, [
    checkout,
    deliverySchedule,
    isPlaceOrderCancelled,
    saveDeliveryAddressIfNeeded,
    closeCart,
    router,
    clearCart,
  ]);

  const handlePaid = useCallback(
    (orderId: string, storeSlug: string) => {
      clearCart();
      setPendingPay(null);
      setPaymentCancelNotice(null);
      closeCart();
      setStep("pick");
      router.push(
        `/order/${encodeURIComponent(orderId)}?store=${encodeURIComponent(storeSlug)}`,
      );
    },
    [clearCart, closeCart, router],
  );

  const finishAndClose = () => {
    setStep("pick");
    setDoneOrder(null);
    setPendingPay(null);
    closeCart();
  };

  const bottomLabel = isDelivery
    ? hasAddress
      ? "Go to payments"
      : "Add address to continue"
    : "Go to payments";

  if (!mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close cart"
        onClick={() => {
          if (step === "pay") leavePayScreen();
          else if (step === "payment") {
            if (checkout.busy) cancelActivePlaceOrder();
            setStep("summary");
          } else {
            closeCart();
          }
        }}
        className={`fixed inset-0 z-[1500] border-0 cursor-pointer touch-none transition-opacity duration-300 ease-out ${
          isOpen
            ? "opacity-100 pointer-events-auto bg-black/40"
            : "opacity-0 pointer-events-none bg-black/40"
        }`}
      />

      <aside
        id="menu-cart-drawer"
        role="dialog"
        aria-modal="true"
        data-scroll-lock-allow
        aria-label="My cart"
        aria-hidden={!isOpen}
        className={`font-bagoss flex flex-col fixed right-0 top-0 bottom-0 w-full sm:w-[min(100%,450px)] xl:w-[480px] overflow-hidden bg-[#f6f6f6] border-l border-gray-200 z-[1510] shadow-[-8px_0_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out rounded-tl-[1.25rem] rounded-bl-[1.25rem] sm:rounded-tl-[1.5rem] sm:rounded-bl-[1.5rem] isolation-auto ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 shrink-0 bg-white ${
            step === "payment" ? "hidden" : ""
          }`}
        >
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 min-w-0 border-0 bg-transparent p-0 cursor-pointer text-lg font-bold text-gray-900 hover:text-gray-700"
          >
            {(step === "summary" ||
              step === "payment" ||
              step === "pay" ||
              (step === "pick" && itemCount > 0 && orderType)) && (
              <svg
                className="h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            )}
            <span className="truncate">{headerTitle}</span>
          </button>
          {step === "summary" && orderType && summarySubview === "cart" ? (
            <OrderTypeDropdown
              value={effectiveOrderType}
              onChange={handleOrderTypeSelect}
            />
          ) : step === "pick" || step === "pay" ? (
            <button
              type="button"
              onClick={step === "pay" ? leavePayScreen : closeCart}
              className="text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer p-1"
              aria-label={step === "pay" ? "Cancel payment" : "Close"}
            >
              ✕
            </button>
          ) : (
            <button
              type="button"
              onClick={closeCart}
              className="text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer p-1"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {step === "done" && doneOrder ? (
          <CartDrawerDoneStep
            orderId={doneOrder.orderId}
            orderNumber={doneOrder.orderNumber}
            storeSlug={doneOrder.storeSlug}
            onClose={finishAndClose}
          />
        ) : step === "pay" ? (
          pendingPay && pendingPay.channel === "upi" ? (
            <CartDrawerPayStep
              pending={pendingPay}
              onPaid={handlePaid}
              onCancel={leavePayScreen}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-white">
              <div className="h-10 w-10 rounded-full border-2 border-[#f16a34] border-t-transparent animate-spin mb-4" />
              <p className="text-base font-bold text-gray-900">
                Preparing payment…
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Generating your UPI QR code
              </p>
              <button
                type="button"
                onClick={leavePayScreen}
                className="mt-6 h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )
        ) : itemCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-white">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-4xl">
              🛒
            </div>
            <p className="text-base font-bold text-gray-800 mb-1">
              Your cart is empty
            </p>
            <p className="text-sm text-gray-500">
              Add items from the menu to see them here
            </p>
          </div>
        ) : step === "pick" ? (
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto overscroll-contain bg-white px-4 py-6">
            <OrderTypePicker
              showActive={false}
              onSelect={handleOrderTypeSelect}
              className="w-full max-w-lg"
            />
          </div>
        ) : step === "payment" ? (
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden bg-[#f6f6f6]">
            <CartInlinePayment
              checkout={checkout}
              riderTip={isDelivery ? riderTip : 0}
              onBack={() => setStep("summary")}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        ) : (
          summarySubview === "schedule" && isDelivery ? (
            <CartScheduleSection
              selection={deliverySchedule}
              onChange={setDeliverySchedule}
              onInstantSelect={handleInstantDeliverySelect}
              onConfirm={() => setSummarySubview("cart")}
            />
          ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3">
              {paymentCancelNotice ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                  <p className="text-sm font-bold text-amber-900">
                    Payment cancelled
                  </p>
                  <p className="mt-0.5 text-xs text-amber-800/90 leading-snug">
                    {paymentCancelNotice}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPaymentCancelNotice(null)}
                    className="mt-2 text-[11px] font-bold text-amber-900/70 border-0 bg-transparent p-0 cursor-pointer underline"
                  >
                    Dismiss
                  </button>
                </div>
              ) : null}

              <CartCouponsSection />
              <CartShipmentSection
                lines={lines}
                itemCount={itemCount}
                orderType={effectiveOrderType}
                setQuantity={setQuantity}
                onAddMoreItems={closeCart}
                schedule={deliverySchedule}
                onScheduleClick={isDelivery ? openScheduleView : undefined}
              />
              <CartBillSummarySection
                subtotal={subtotal}
                orderType={effectiveOrderType}
                deliveryFee={checkout.policy.delivery_fee}
                deliveryCharges={totals.deliveryCharges}
                handlingFee={0}
                gstAmount={totals.gstAmount}
                riderTip={isDelivery ? riderTip : 0}
                grandTotal={grandTotal}
              />
              {isDelivery ? (
                <RiderTipSection value={riderTip} onChange={setRiderTip} />
              ) : null}
              {isDelivery ? (
                <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.04)] px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        Delivery to
                      </p>
                      <p className="text-[14px] font-semibold text-gray-900 mt-1 line-clamp-2">
                        {hasAddress
                          ? deliveryLabel
                          : "Add your delivery address"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAddressPopupAfterSave("summary");
                        setAddressPopupOpen(true);
                      }}
                      className="shrink-0 h-9 px-3 rounded-xl border border-gray-200 bg-white text-[12px] font-bold text-[#f16a34] cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={goToPayment}
                className="flex items-center justify-between w-full h-[52px] rounded-2xl px-4 text-white border-0 cursor-pointer shadow-md"
                style={{ backgroundColor: SVS_ORANGE }}
              >
                <span className="text-sm font-bold tracking-normal opacity-95 tabular-nums">
                  {formatInr(grandTotal)} total
                </span>
                <span className="flex items-center gap-1 text-sm font-bold">
                  {bottomLabel}
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </button>
            </div>
          </>
          )
        )}
      </aside>

      <DeliveryAddressPopup
        open={addressPopupOpen && isOpen}
        checkout={checkout}
        onClose={() => setAddressPopupOpen(false)}
        onSaved={() => {
          setStep(addressPopupAfterSave);
        }}
      />
    </>,
    document.body,
  );
}
