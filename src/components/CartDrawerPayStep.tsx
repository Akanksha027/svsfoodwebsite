"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { resolveStoreLocation } from "@/data/locations";
import { getPaymentStatus } from "@/lib/orders-api";
import { formatInr } from "@/lib/menu-api";
import type { PendingPayment } from "@/hooks/useWebCheckout";

/** How long we wait for UPI confirmation before expiring the session UI. */
const PAY_TIMEOUT_SEC = 5 * 60;

type Props = {
  pending: PendingPayment;
  onPaid: (orderId: string, storeSlug: string) => void;
  onCancel: () => void;
};

function formatCountdown(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CartDrawerPayStep({
  pending,
  onPaid,
  onCancel,
}: Props) {
  const [status, setStatus] = useState<"waiting" | "paid" | "failed" | "expired">(
    "waiting",
  );
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(PAY_TIMEOUT_SEC);

  useEffect(() => {
    if (status !== "waiting") return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== "waiting") return;

    let cancelled = false;
    const tick = async () => {
      try {
        const store = resolveStoreLocation(pending.storeSlug);
        const result = await getPaymentStatus({
          storeId: store.backendStoreId,
          transactionId: pending.transactionId,
          orderId: pending.orderId,
        });
        if (cancelled) return;
        if (result.internal_status === "paid") {
          setStatus("paid");
          onPaid(pending.orderId, store.id);
        } else if (result.internal_status === "failed") {
          setStatus("failed");
          setError("Payment failed. Your cart is still here — you can try again.");
        }
      } catch {
        /* keep polling */
      }
    };

    tick();
    const id = window.setInterval(tick, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pending, status, onPaid]);

  const qrSrc = useMemo(() => {
    if (!pending.qrPayload) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(pending.qrPayload)}`;
  }, [pending.qrPayload]);

  const progress = Math.max(0, Math.min(1, secondsLeft / PAY_TIMEOUT_SEC));
  const urgent = secondsLeft <= 60;

  if (status === "expired" || status === "failed") {
    return (
      <div className="flex-1 flex flex-col px-4 pb-5">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              status === "expired" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
            }`}
          >
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              {status === "expired" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              )}
            </svg>
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">
            {status === "expired" ? "Payment time expired" : "Payment failed"}
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-[280px]">
            {status === "expired"
              ? "We didn’t receive payment in time. Your cart is still saved — you can try again."
              : error || "Something went wrong with this payment. Your cart is still here."}
          </p>
          <p className="mt-3 text-xs font-semibold text-gray-400 tabular-nums">
            Order #{pending.orderNumber}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="h-12 w-full rounded-xl bg-[#f16a34] text-white text-sm font-extrabold border-0 cursor-pointer"
        >
          Back to cart
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 h-11 w-full rounded-xl bg-transparent text-gray-600 text-sm font-semibold border border-gray-200 cursor-pointer"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
        <div className="mt-2 rounded-2xl border border-gray-100 bg-gradient-to-b from-[#fff8f4] to-white p-4 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Amount to pay
          </p>
          <p className="mt-1 text-3xl font-extrabold text-gray-900 tabular-nums tracking-tight">
            {formatInr(pending.amount)}
          </p>
          <p className="mt-1 text-xs text-gray-500 tabular-nums">
            Order #{pending.orderNumber}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">Scan &amp; pay</p>
            <p className="text-xs text-gray-500">
              Any UPI app — GPay, PhonePe, Paytm…
            </p>
          </div>
          <div
            className={`shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-extrabold tabular-nums ${
              urgent
                ? "bg-red-50 text-red-600"
                : "bg-gray-100 text-gray-700"
            }`}
            aria-live="polite"
            aria-label={`${secondsLeft} seconds remaining`}
          >
            {formatCountdown(secondsLeft)}
          </div>
        </div>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 linear ${
              urgent ? "bg-red-500" : "bg-[#f16a34]"
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {qrSrc ? (
          <div className="mx-auto mt-5 w-[min(100%,240px)] aspect-square relative rounded-2xl border border-gray-100 bg-white p-3 shadow-[0_8px_28px_rgba(0,0,0,0.06)]">
            <Image
              src={qrSrc}
              alt="UPI QR code"
              width={240}
              height={240}
              className="h-full w-full object-contain"
              unoptimized
            />
          </div>
        ) : (
          <div className="mx-auto mt-5 w-[240px] h-[240px] rounded-2xl bg-gray-50 animate-pulse" />
        )}

        <a
          href={pending.qrPayload}
          className="mt-5 flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-[#f16a34] text-white font-extrabold text-sm no-underline shadow-sm"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M12 18h.01" strokeLinecap="round" />
          </svg>
          Open UPI app
        </a>

        <p className="mt-4 text-center text-sm font-semibold text-[#f16a34]">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f16a34]/50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f16a34]" />
            </span>
            Waiting for payment…
          </span>
        </p>
        <p className="mt-1.5 text-center text-xs text-gray-400">
          Confirms automatically after you pay
        </p>

        {pending.isMock ? (
          <p className="mt-3 text-[11px] text-amber-800 bg-amber-50 rounded-lg px-3 py-2 text-center">
            Mock mode: payment may auto-confirm in UAT.
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-gray-100 px-4 py-3 bg-white rounded-bl-[2rem]">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-50"
        >
          Cancel payment
        </button>
        <p className="mt-2 text-center text-[11px] text-gray-400">
          Cancels this order. Your cart stays so you can try again.
        </p>
      </div>
    </div>
  );
}
