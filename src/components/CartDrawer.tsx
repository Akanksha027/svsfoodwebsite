"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { computeTotals, useCart } from "@/context/CartContext";
import { useMenuCart } from "@/context/MenuCartContext";
import { formatInr } from "@/lib/menu-api";
import { storeDisplayName } from "@/data/locations";

const SVS_ORANGE = "#f16a34";
const HANDLING_FEE = 2;

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  return (
    <aside
      id="menu-cart-drawer"
      aria-label="My cart"
      aria-hidden={!isOpen}
      className={`hidden lg:flex flex-col fixed right-0 top-[72px] bottom-0 w-[360px] xl:w-[380px] bg-white border-l border-gray-200 z-[90] shadow-[-8px_0_32px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
        <button
          type="button"
          onClick={closeCart}
          className="inline-flex items-center gap-2 min-w-0 border-0 bg-transparent p-0 cursor-pointer text-lg font-bold text-gray-900 hover:text-gray-700"
        >
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
          <span className="truncate">My Cart</span>
        </button>

      </div>

      {itemCount === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-4xl">
            🛒
          </div>
          <p className="text-base font-bold text-gray-800 mb-1">Your cart is empty</p>
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
                    Delivery charge
                    <InfoIcon />
                  </span>
                  <span className="font-semibold text-gray-900">
                    <span className="text-gray-400 line-through text-xs mr-1">
                      {formatInr(40)}
                    </span>
                    <span style={{ color: SVS_ORANGE }}>FREE</span>
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
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    GST (5%)
                    <InfoIcon />
                  </span>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {formatInr(totals.gstAmount)}
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

            <div className="mx-4 mb-4 flex gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3">
              <span className="text-lg shrink-0" aria-hidden>
                ↩
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Orders cannot be cancelled once packed for quality. We ensure
                on-time preparation at {storeDisplayName(store)}.
              </p>
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 space-y-3">
            <div className="flex items-start gap-2.5">
              <svg
                className="h-5 w-5 shrink-0 mt-0.5 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  Pickup from {storeDisplayName(store)}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                  {store.city || "Store"} · Takeaway order
                </p>
              </div>
              <Link
                href="/locations"
                className="text-xs font-bold shrink-0 no-underline"
                style={{ color: SVS_ORANGE }}
              >
                Change
              </Link>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-between w-full h-[52px] rounded-lg px-4 text-white no-underline shadow-md"
              style={{ backgroundColor: SVS_ORANGE }}
            >
              <span className="text-sm font-bold uppercase tracking-wide opacity-95">
                {formatInr(grandWithHandling)} total
              </span>
              <span className="flex items-center gap-1 text-sm font-bold">
                Proceed To Pay
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
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}
