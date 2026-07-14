"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart, computeTotals } from "@/context/CartContext";
import { formatInr } from "@/lib/menu-api";
import { storeDisplayName } from "@/data/locations";

export default function CartPage() {
  const { lines, store, setQuantity, removeLine, subtotal, itemCount } =
    useCart();
  const preview = computeTotals({ subtotal, orderType: "takeaway" });

  return (
    <>
      <Navbar />
      <main className="min-h-[70svh] pt-[72px] md:pt-[88px] lg:pt-[100px] px-4 sm:px-6 lg:px-8 pb-16 bg-[#fff8f3]">
        <div className="max-w-[720px] mx-auto py-8 sm:py-10">
          <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight mb-1">
            Your cart
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {storeDisplayName(store)}
          </p>

          {itemCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
              <p className="text-gray-500 mb-4">Your cart is empty.</p>
              <Link
                href="/menu"
                className="inline-flex rounded-full bg-[#f16a35] text-white font-bold px-5 py-2.5 no-underline"
              >
                Browse menu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li
                    key={line.key}
                    className="flex gap-3 rounded-2xl border border-[#efe4da] bg-white p-3"
                  >
                    <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-[#fff1e8]">
                      {line.imageUrl ? (
                        <Image
                          src={line.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a1a1a] truncate">
                        {line.name}
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {formatInr(line.unitPrice)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full border border-[#f0c9b0] bg-white font-bold cursor-pointer"
                          onClick={() =>
                            setQuantity(line.key, line.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-bold">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full border border-[#f0c9b0] bg-white font-bold cursor-pointer"
                          onClick={() =>
                            setQuantity(line.key, line.quantity + 1)
                          }
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-xs font-semibold text-red-600 cursor-pointer bg-transparent border-0"
                          onClick={() => removeLine(line.key)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="font-extrabold text-[#1a1a1a] shrink-0">
                      {formatInr(line.unitPrice * line.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border border-[#efe4da] bg-white p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item total</span>
                  <span className="font-semibold">{formatInr(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (5%)</span>
                  <span className="font-semibold">
                    {formatInr(preview.gstAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold pt-2 border-t border-[#f3e0d4]">
                  <span>To pay (before delivery)</span>
                  <span>{formatInr(preview.grandTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center w-full h-12 rounded-full bg-[#f16a35] hover:bg-[#d45a2b] text-white font-bold no-underline"
              >
                Proceed to checkout
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
