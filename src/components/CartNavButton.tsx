"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartNavButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full no-underline text-svs-ink hover:bg-svs-cream hover:text-svs-orange transition-colors"
      aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
    >
      <svg
        className="w-5 h-5 lg:w-6 lg:h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 6h15l-1.5 9h-12z" />
        <path d="M6 6L5 3H2" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
      {itemCount > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-svs-orange text-white text-[10px] font-bold flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
