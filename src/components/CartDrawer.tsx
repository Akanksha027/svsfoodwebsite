"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import CartCheckoutForm from "@/components/CartCheckoutForm";
import CartDrawerDoneStep from "@/components/CartDrawerDoneStep";
import CartDrawerPayStep from "@/components/CartDrawerPayStep";
import { RollingCounter } from "@/components/RollingCounter";
import { computeTotals, lineUnitTotal, useCart } from "@/context/CartContext";
import { useMenuCart } from "@/context/MenuCartContext";
import {
  PlaceOrderAbortedError,
  useWebCheckout,
  type PendingPayment,
} from "@/hooks/useWebCheckout";
import { formatInr } from "@/lib/menu-api";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import { persistCheckoutDeliveryAddress } from "@/lib/website-customer-api";
import { abandonCheckoutPayment } from "@/lib/orders-api";
import { resolveDeliveryCoords } from "@/lib/reverse-geocode";

const SVS_ORANGE = "#f16a34";
const HANDLING_FEE = 2;

type DrawerStep = "cart" | "checkout1" | "checkout2" | "pay" | "done";

const ORDER_TYPE_ART: Record<
  "dine_in" | "takeaway" | "delivery",
  { src: string; alt: string }
> = {
  dine_in: {
    src: "/images/order-types/dine-in.png",
    alt: "Dine-in burger plate",
  },
  takeaway: {
    src: "/images/order-types/takeaway-open.png",
    alt: "Open SVS takeaway bag with burger and fries",
  },
  delivery: {
    src: "/images/order-types/delivery.png",
    alt: "Delivery scooter",
  },
};

function OrderTypeArt({
  type,
}: {
  type: "dine_in" | "takeaway" | "delivery";
}) {
  const art = ORDER_TYPE_ART[type];
  return (
    <span className="relative flex h-[3.5rem] w-[3.5rem] sm:h-[3.75rem] sm:w-[3.75rem] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff4ee] ring-1 ring-black/[0.04]">
      <Image
        src={art.src}
        alt={art.alt}
        fill
        unoptimized
        className="object-contain object-center p-1"
        sizes="64px"
      />
    </span>
  );
}

function CancellationPolicy() {
  const points = [
    "Once an order is placed and confirmed, it cannot be cancelled.",
    "We start preparing your food right away so it reaches you fresh and on time.",
    "If SVS Food cancels due to unavailability or operational issues, a full refund will be issued.",
  ];

  return (
    <div className="mx-4 mb-4 rounded-xl border border-gray-100 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <svg
          className="h-3.5 w-3.5 text-[#f16a34] shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" />
        </svg>
        <span className="text-xs font-bold text-gray-700">
          Cancellation Policy
        </span>
      </div>
      <ul className="mt-2.5 space-y-2">
        {points.map((text) => (
          <li key={text} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#f16a34] shrink-0" />
            <p className="text-[11px] text-gray-600 leading-relaxed">{text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}


function QtyStepper({
  quantity,
  onDec,
  onInc,
}: {
  quantity: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div
      className="inline-flex h-8 items-center overflow-hidden rounded-lg text-sm font-bold text-white shadow-sm"
      style={{ backgroundColor: SVS_ORANGE }}
    >
      <button
        type="button"
        onClick={onDec}
        className="flex h-full w-8 items-center justify-center border-0 bg-transparent cursor-pointer hover:bg-black/10"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-[26px] flex items-center justify-center">
        <RollingCounter value={quantity} fontSize={14} color="#ffffff" />
      </span>
      <button
        type="button"
        onClick={onInc}
        className="flex h-full w-8 items-center justify-center border-0 bg-transparent cursor-pointer hover:bg-black/10"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default function CartDrawer() {
  const { lines, itemCount, subtotal, store, setQuantity, clearCart } = useCart();
  const { isOpen, closeCart } = useMenuCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<DrawerStep>("cart");
  const [pendingPay, setPendingPay] = useState<PendingPayment | null>(null);
  const [doneOrder, setDoneOrder] = useState<{
    orderId: string;
    orderNumber: string | number;
    storeSlug: string;
  } | null>(null);
  const [paymentCancelNotice, setPaymentCancelNotice] = useState<string | null>(
    null,
  );

  const checkoutActive = isOpen && itemCount > 0;
  const checkout = useWebCheckout({ active: checkoutActive });
  const { customer, refreshCustomer, openLogin } = useWebsiteAuth();
  const deliveryAddressModeRef = useRef<string | "new">("new");
  const placeOrderAttemptRef = useRef(0);
  const cancelledPlaceOrderAttemptRef = useRef<number | null>(null);

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
      setStep("cart");
      setPendingPay(null);
      setDoneOrder(null);
      setPaymentCancelNotice(null);
    }
  }, [isOpen, cancelActivePlaceOrder]);

  useEffect(() => {
    if (!paymentCancelNotice) return;
    const id = window.setTimeout(() => setPaymentCancelNotice(null), 6000);
    return () => window.clearTimeout(id);
  }, [paymentCancelNotice]);

  useEffect(() => {
    if (itemCount === 0 && step === "cart") {
      setStep("cart");
    }
  }, [itemCount, step]);

  useEffect(() => {
    if (step === "checkout2" && !customer) {
      setStep(checkout.orderType === "delivery" ? "checkout1" : "cart");
    }
  }, [step, customer, checkout.orderType]);

  const totals = useMemo(
    () =>
      computeTotals({
        subtotal,
        orderType: "takeaway",
      }),
    [subtotal],
  );

  const grandWithHandling = totals.grandTotal + HANDLING_FEE;

  const advanceCheckout = useCallback(
    (target: "checkout1" | "checkout2") => {
      checkout.resetErrors();
      const go = () => setStep(target);
      if (customer) {
        go();
        return;
      }
      openLogin({ onSuccess: go });
    },
    [checkout, customer, openLogin],
  );

  useBodyScrollLock(isOpen);

  const leavePayScreen = useCallback(() => {
    const pending = pendingPay;
    cancelActivePlaceOrder();
    setPendingPay(null);

    if (pending) {
      void abandonCheckoutPayment({
        storeId: pending.storeId,
        orderId: pending.orderId,
        transactionId: pending.transactionId,
      }).catch(() => undefined);
    }

    // Keep cart; never send to order/map page on cancel.
    setPaymentCancelNotice(
      "Payment cancelled. Your cart is still here — place the order again when you’re ready.",
    );
    setStep("cart");
  }, [pendingPay, cancelActivePlaceOrder]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (step === "pay") {
        leavePayScreen();
        return;
      }
      if (step === "checkout2") setStep("checkout1");
      else if (step === "checkout1") setStep("cart");
      else closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart, step, leavePayScreen]);

  const headerTitle =
    step === "cart"
      ? "My Cart"
      : step === "checkout1"
        ? "Delivery address"
        : step === "checkout2"
          ? "Payment & details"
          : step === "pay"
            ? "Pay with UPI"
            : "Order confirmed";

  const goBack = () => {
    if (
      (step === "checkout2" && checkout.busy) ||
      (step === "pay" && !pendingPay)
    ) {
      cancelActivePlaceOrder();
    }
    if (step === "checkout2") setStep("checkout1");
    else if (step === "checkout1") setStep("cart");
    else if (step === "pay") leavePayScreen();
    else closeCart();
  };

  const handlePlaceOrder = useCallback(async () => {
    const attempt = ++placeOrderAttemptRef.current;
    const payingOnline = checkout.effectivePay === "online";
    setPaymentCancelNotice(null);
    if (payingOnline) {
      // Switch to pay shell immediately so we never flash empty cart.
      setPendingPay(null);
      setStep("pay");
    }
    try {
      const result = await checkout.placeOrder({
        isCancelled: () => isPlaceOrderCancelled(attempt),
      });
      if (isPlaceOrderCancelled(attempt)) {
        if (result.kind === "online") {
          void abandonCheckoutPayment({
            storeId: result.pending.storeId,
            orderId: result.pending.orderId,
            transactionId: result.pending.transactionId,
          }).catch(() => undefined);
        }
        setPaymentCancelNotice(
          "Payment cancelled. Your cart is still here — place the order again when you’re ready.",
        );
        setStep("cart");
        setPendingPay(null);
        return;
      }
      await saveDeliveryAddressIfNeeded();
      if (result.kind === "cod") {
        clearCart();
        closeCart();
        setStep("cart");
        router.push(
          `/order/${encodeURIComponent(result.orderId)}?store=${encodeURIComponent(result.storeSlug)}`,
        );
        return;
      }
      setPendingPay(result.pending);
      setStep("pay");
      // Keep cart until UPI succeeds — cancel returns to cart with items.
    } catch (err) {
      if (
        err instanceof PlaceOrderAbortedError ||
        isPlaceOrderCancelled(attempt)
      ) {
        setPaymentCancelNotice(
          "Payment cancelled. Your cart is still here — place the order again when you’re ready.",
        );
        setStep("cart");
        setPendingPay(null);
        return;
      }
      if (payingOnline) {
        setStep("checkout2");
        setPendingPay(null);
      }
    }
  }, [
    checkout,
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
      setStep("cart");
      router.push(
        `/order/${encodeURIComponent(orderId)}?store=${encodeURIComponent(storeSlug)}`,
      );
    },
    [clearCart, closeCart, router],
  );

  const finishAndClose = () => {
    setStep("cart");
    setDoneOrder(null);
    setPendingPay(null);
    closeCart();
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close cart"
        onClick={() => {
          if (step === "pay") {
            leavePayScreen();
          } else if (step === "checkout2") {
            if (checkout.busy) cancelActivePlaceOrder();
            setStep("checkout1");
          } else if (step === "checkout1") {
            setStep("cart");
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
        className={`flex flex-col fixed right-0 top-0 bottom-0 w-full sm:w-[min(100%,450px)] xl:w-[480px] overflow-hidden bg-white rounded-tl-[2rem] rounded-bl-[2rem] border-l border-gray-200 z-[1510] shadow-[-8px_0_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 min-w-0 border-0 bg-transparent p-0 cursor-pointer text-lg font-bold text-gray-900 hover:text-gray-700"
          >
            {(step === "checkout1" ||
              step === "checkout2" ||
              step === "pay" ||
              (step === "cart" && itemCount > 0)) && (
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
          {step === "cart" || step === "pay" ? (
            <button
              type="button"
              onClick={step === "pay" ? leavePayScreen : closeCart}
              className="text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer p-1"
              aria-label={step === "pay" ? "Cancel payment" : "Close"}
            >
              ✕
            </button>
          ) : null}
        </div>

        {step === "done" && doneOrder ? (
          <CartDrawerDoneStep
            orderId={doneOrder.orderId}
            orderNumber={doneOrder.orderNumber}
            storeSlug={doneOrder.storeSlug}
            onClose={finishAndClose}
          />
        ) : step === "pay" ? (
          pendingPay ? (
            <CartDrawerPayStep
              pending={pendingPay}
              onPaid={handlePaid}
              onCancel={leavePayScreen}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
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
        ) : step === "checkout1" && itemCount > 0 ? (
          <CartCheckoutForm
            checkout={checkout}
            page={1}
            onContinue={() => advanceCheckout("checkout2")}
            onPlaceOrder={handlePlaceOrder}
            onAddressSelectionChange={(id) => {
              deliveryAddressModeRef.current = id;
            }}
          />
        ) : step === "checkout2" && itemCount > 0 ? (
          <CartCheckoutForm
            checkout={checkout}
            page={2}
            onBack={() => setStep("checkout1")}
            onPlaceOrder={handlePlaceOrder}
            onAddressSelectionChange={(id) => {
              deliveryAddressModeRef.current = id;
            }}
          />
        ) : itemCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
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
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain bg-white">
              {paymentCancelNotice ? (
                <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                  <p className="text-sm font-bold text-amber-900">
                    Order cancelled
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
              <div className="mx-4 mt-4 rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${SVS_ORANGE}18` }}
                  >
                    <svg
                      className="h-5 w-5"
                      style={{ color: SVS_ORANGE }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      Ready in few minutes
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Shipment of {itemCount} item{itemCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="px-4 py-3 space-y-4">
                {lines.map((line) => (
                  <li key={line.key} className="flex gap-3">
                    <div className="relative h-[72px] w-[72px] shrink-0 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
                      {line.imageUrl ? (
                        <Image
                          src={line.imageUrl}
                          alt=""
                          fill
                          className="object-contain p-1"
                          sizes="72px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] font-bold text-gray-400">
                          SVS
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
                        {line.name}
                      </p>
                      {line.addons?.length ? (
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                          {line.addons.map((a) => a.name).join(", ")}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-0.5">1 unit</p>
                      )}
                      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                        <p className="text-sm font-bold text-gray-900 tabular-nums">
                          {formatInr(lineUnitTotal(line))}
                        </p>
                        <QtyStepper
                          quantity={line.quantity}
                          onDec={() => setQuantity(line.key, line.quantity - 1)}
                          onInc={() => setQuantity(line.key, line.quantity + 1)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mx-4 mb-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">Bill details</h3>
                </div>
                <div className="px-4 py-3 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      Items total
                      <InfoIcon />
                    </span>
                    <span className="font-semibold text-gray-900 tabular-nums">
                      {formatInr(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      GST (5%)
                      <InfoIcon />
                    </span>
                    <span className="font-semibold text-gray-900 tabular-nums">
                      {formatInr(totals.gstAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      Handling charge
                      <InfoIcon />
                    </span>
                    <span className="font-semibold text-gray-900 tabular-nums">
                      {formatInr(HANDLING_FEE)}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-3 flex items-center justify-between gap-2">
                    <span className="font-bold text-gray-900">Grand total</span>
                    <span className="font-bold text-gray-900 tabular-nums">
                      {formatInr(grandWithHandling)}
                    </span>
                  </div>
                </div>
              </div>

              <CancellationPolicy />
            </div>

            {/* Order type picker */}
            <div className="mx-4 mb-3 mt-4 bg-white sm:mt-5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2.5">
                How would you like it?
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {([
                  { type: "dine_in" as const, label: "Dine-in" },
                  { type: "takeaway" as const, label: "Takeaway" },
                  { type: "delivery" as const, label: "Delivery" },
                ]).map(({ type, label }) => {
                  const active = checkout.orderType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        checkout.setOrderType(type);
                        if (type === "dine_in") checkout.setPayMethod("online");
                      }}
                      className={[
                        "min-h-[6rem] sm:min-h-[6.5rem] flex flex-col items-center justify-center gap-1.5 rounded-2xl text-[11px] sm:text-xs font-extrabold border-[3px] cursor-pointer transition-all px-1.5 py-2",
                        active
                          ? "bg-orange-50 border-[#f16a34] text-[#f16a34] shadow-[0_2px_10px_rgba(241,106,52,0.18)]"
                          : "bg-white border-gray-200 text-gray-500 hover:border-[#f16a34]/40",
                      ].join(" ")}
                    >
                      <OrderTypeArt type={type} />
                      <span className="leading-none">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 rounded-bl-[2rem]">
              <button
                type="button"
                onClick={() => {
                  checkout.resetErrors();
                  if (checkout.orderType === "delivery") {
                    setStep("checkout1");
                  } else {
                    advanceCheckout("checkout2");
                  }
                }}
                className="flex items-center justify-between w-full h-[52px] rounded-2xl px-4 text-white border-0 cursor-pointer shadow-md"
                style={{ backgroundColor: SVS_ORANGE }}
              >
                <span className="text-sm font-bold uppercase tracking-wide opacity-95">
                  {formatInr(grandWithHandling)} total
                </span>
                <span className="flex items-center gap-1 text-sm font-bold">
                  Proceed to checkout
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
        )}
      </aside>
    </>,
    document.body,
  );
}
