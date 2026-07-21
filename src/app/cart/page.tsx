"use client";

import Image from "next/image";
import Link from "next/link";
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
      <main className="min-h-[70svh] pt-[72px] md:pt-[88px] lg:pt-[72px] px-4 sm:px-6 lg:px-8 pb-16 bg-svs-cream">
        <div className="max-w-[720px] mx-auto py-8 sm:py-10">
          <div className="mb-4">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-svs-ink/60 hover:text-svs-orange transition-colors no-underline"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back to menu
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-svs-ink tracking-tight mb-1">
            Your cart
          </h1>
          <p className="text-sm text-svs-ink/50 mb-6">
            {storeDisplayName(store)}
          </p>

          {itemCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-svs-cream bg-svs-white px-6 py-16 text-center">
              <p className="text-svs-ink/50 mb-4">Your cart is empty.</p>
              <Link
                href="/menu"
                className="inline-flex rounded-full bg-svs-orange text-white font-bold px-5 py-2.5 no-underline"
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
                    className="flex gap-3 rounded-2xl border border-svs-cream bg-svs-white p-3"
                  >
                    <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-svs-cream">
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
                      <p className="font-bold text-svs-ink truncate">
                        {line.name}
                      </p>
                      <p className="text-sm font-semibold text-svs-ink/80">
                        {formatInr(line.unitPrice)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full border border-svs-orange/30 bg-svs-white font-bold cursor-pointer"
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
                          className="w-8 h-8 rounded-full border border-svs-orange/30 bg-svs-white font-bold cursor-pointer"
                          onClick={() =>
                            setQuantity(line.key, line.quantity + 1)
                          }
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-xs font-semibold text-svs-orange-dark cursor-pointer bg-transparent border-0"
                          onClick={() => removeLine(line.key)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="font-extrabold text-svs-ink shrink-0">
                      {formatInr(line.unitPrice * line.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border border-svs-cream bg-svs-white p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-svs-ink/60">Item total</span>
                  <span className="font-semibold">{formatInr(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-svs-ink/60">GST (5%)</span>
                  <span className="font-semibold">
                    {formatInr(preview.gstAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold pt-2 border-t border-svs-cream">
                  <span>To pay (before delivery)</span>
                  <span>{formatInr(preview.grandTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center w-full h-12 rounded-full bg-svs-orange hover:bg-svs-orange-dark text-white font-bold no-underline"
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
