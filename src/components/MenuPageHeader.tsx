"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { StoreLocation } from "@/data/locations";
import { storeDisplayName } from "@/data/locations";
import { computeTotals, useCart } from "@/context/CartContext";
import { useMenuCart } from "@/context/MenuCartContext";
import { formatInr } from "@/lib/menu-api";

const SVS_ORANGE = "#f16a34";
const HANDLING_FEE = 2;

function truncateText(text: string, max = 28) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

type MenuPageHeaderProps = {
  store: StoreLocation;
};

export default function MenuPageHeader({ store }: MenuPageHeaderProps) {
  const { itemCount, subtotal } = useCart();
  const { openCart, isOpen } = useMenuCart();

  const grandTotal = useMemo(() => {
    const totals = computeTotals({ subtotal, orderType: "takeaway" });
    return totals.grandTotal + HANDLING_FEE;
  }, [subtotal]);

  const locationLine = truncateText(
    `${storeDisplayName(store)} · ${store.address}`,
  );

  return (
    <header
      className={`hidden lg:flex fixed top-[96px] z-[70] max-w-[1100px] items-center justify-between gap-4 border border-gray-200 rounded-2xl bg-white px-6 xl:px-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out -translate-x-1/2 ${
        isOpen
          ? "h-16 w-[calc(90vw-324px)] xl:w-[calc(80vw-304px)] left-[calc(50%-180px)] xl:left-[calc(50%-190px)]"
          : "h-20 w-[90%] xl:w-[80%] left-1/2"
      }`}
      id="menu-page-header"
    >
      <Link
        href="/locations"
        className="min-w-0 flex flex-col justify-center no-underline group"
      >
        <span className="text-[15px] font-bold leading-tight text-gray-900">
          Delivering in few minutes
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[13px] text-gray-500 group-hover:text-gray-700">
          <span className="truncate">{locationLine}</span>
          <svg
            className="h-3.5 w-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </Link>

      <button
        type="button"
        onClick={openCart}
        className="inline-flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2 text-white shadow-sm cursor-pointer border-0 transition-opacity hover:opacity-95"
        style={{ backgroundColor: SVS_ORANGE }}
        aria-label={`Open cart, ${itemCount} items, ${formatInr(grandTotal)}`}
      >
        <svg
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-sm font-bold">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
          <span className="text-[13px] font-semibold opacity-95 tabular-nums">
            {formatInr(grandTotal)}
          </span>
        </span>
      </button>
    </header>
  );
}
