"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import CartCheckoutForm from "@/components/CartCheckoutForm";
import CartDrawerDoneStep from "@/components/CartDrawerDoneStep";
import CartDrawerPayStep from "@/components/CartDrawerPayStep";
import { computeTotals, useCart } from "@/context/CartContext";
import { useMenuCart } from "@/context/MenuCartContext";
import {
  useWebCheckout,
  type PendingPayment,
} from "@/hooks/useWebCheckout";
import { formatInr } from "@/lib/menu-api";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import { persistCheckoutDeliveryAddress } from "@/lib/website-customer-api";
import { resolveDeliveryCoords } from "@/lib/reverse-geocode";

const SVS_ORANGE = "#f16a34";
const HANDLING_FEE = 2;

type DrawerStep = "cart" | "checkout1" | "checkout2" | "pay" | "done";

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
      <span className="min-w-[26px] text-center tabular-nums">{quantity}</span>
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
  const { lines, itemCount, subtotal, store, setQuantity } = useCart();
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

  const checkoutActive = isOpen && itemCount > 0;
  const checkout = useWebCheckout({ active: checkoutActive });
  const { customer, refreshCustomer } = useWebsiteAuth();
  const deliveryAddressModeRef = useRef<string | "new">("new");

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
      setStep("cart");
      setPendingPay(null);
      setDoneOrder(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (itemCount === 0 && step === "cart") {
      setStep("cart");
    }
  }, [itemCount, step]);

  const totals = useMemo(
    () =>
      computeTotals({
        subtotal,
        orderType: "takeaway",
      }),
    [subtotal],
  );

  const grandWithHandling = totals.grandTotal + HANDLING_FEE;

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (step === "checkout2") setStep("checkout1");
        else if (step === "checkout1") setStep("cart");
        else closeCart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart, step]);

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
    if (step === "checkout2") setStep("checkout1");
    else if (step === "checkout1") setStep("cart");
    else if (step === "pay") {
      /* stay on pay */
    } else closeCart();
  };

  const handlePlaceOrder = useCallback(async () => {
    try {
      const result = await checkout.placeOrder();
      await saveDeliveryAddressIfNeeded();
      if (result.kind === "cod") {
        // Close cart and take user directly to their live order tracking page
        closeCart();
        setStep("cart");
        router.push(`/order/${encodeURIComponent(result.orderId)}?store=${encodeURIComponent(result.storeSlug)}`);
        return;
      }
      setPendingPay(result.pending);
      setStep("pay");
    } catch {
      /* error on checkout hook */
    }
  }, [checkout, saveDeliveryAddressIfNeeded, closeCart, router]);

  const handlePaid = useCallback(
    (orderId: string, storeSlug: string) => {
      // Payment confirmed — close cart and go straight to live tracking
      setPendingPay(null);
      closeCart();
      setStep("cart");
      router.push(`/order/${encodeURIComponent(orderId)}?store=${encodeURIComponent(storeSlug)}`);
    },
    [closeCart, router],
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
          if (step === "checkout2") setStep("checkout1");
          else if (step === "checkout1") setStep("cart");
          else closeCart();
        }}
        className={`fixed inset-0 z-[1100] border-0 cursor-pointer transition-opacity duration-300 ease-out ${
          isOpen
            ? "opacity-100 pointer-events-auto bg-black/40"
            : "opacity-0 pointer-events-none bg-black/40"
        }`}
      />

      <aside
        id="menu-cart-drawer"
        aria-label="My cart"
        aria-hidden={!isOpen}
        className={`flex flex-col fixed right-0 top-0 bottom-0 w-full sm:w-[400px] xl:w-[420px] bg-white border-l border-gray-200 z-[1110] shadow-[-8px_0_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 min-w-0 border-0 bg-transparent p-0 cursor-pointer text-lg font-bold text-gray-900 hover:text-gray-700"
          >
            {(step === "checkout1" ||
              step === "checkout2" ||
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
          {step === "cart" ? (
            <button
              type="button"
              onClick={closeCart}
              className="text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer p-1"
              aria-label="Close"
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
        ) : step === "pay" && pendingPay ? (
          <CartDrawerPayStep
            pending={pendingPay}
            onPaid={handlePaid}
            onFailed={() => checkout.resetErrors()}
          />
        ) : step === "checkout1" && itemCount > 0 ? (
          <CartCheckoutForm
            checkout={checkout}
            page={1}
            onContinue={() => setStep("checkout2")}
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
            <div className="flex-1 overflow-y-auto overscroll-contain">
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
                      <p className="text-xs text-gray-500 mt-0.5">1 unit</p>
                      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                        <p className="text-sm font-bold text-gray-900 tabular-nums">
                          {formatInr(line.unitPrice)}
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
            </div>

            {/* Order type picker */}
            <div className="mx-4 mb-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">How would you like it?</p>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { type: "dine_in", label: "Dine-in", icon: "🍽" },
                  { type: "takeaway", label: "Takeaway", icon: "🥡" },
                  { type: "delivery", label: "Delivery", icon: "🛵" },
                ] as const).map(({ type, label, icon }) => {
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
                        "flex flex-col items-center justify-center gap-0.5 rounded-xl py-2.5 text-[11px] font-extrabold border cursor-pointer transition-all",
                        active
                          ? "bg-orange-50 border-[#f16a34] text-[#f16a34] ring-1 ring-[#f16a34]/20"
                          : "bg-white border-gray-200 text-gray-500 hover:border-[#f16a34]/30",
                      ].join(" ")}
                    >
                      <span className="text-base leading-none">{icon}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  checkout.resetErrors();
                  // If delivery selected, go to checkout1 for address; otherwise skip straight to checkout2
                  if (checkout.orderType === "delivery") {
                    setStep("checkout1");
                  } else {
                    setStep("checkout2");
                  }
                }}
                className="flex items-center justify-between w-full h-[52px] rounded-lg px-4 text-white border-0 cursor-pointer shadow-md"
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
