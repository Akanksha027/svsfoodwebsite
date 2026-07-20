"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { resolveStoreLocation } from "@/data/locations";
import { getPaymentStatus } from "@/lib/orders-api";
import { formatInr } from "@/lib/menu-api";
import type { PendingPayment } from "@/hooks/useWebCheckout";

type Props = {
  pending: PendingPayment;
  onPaid: (orderId: string, storeSlug: string) => void;
  onFailed: (message: string) => void;
};

export default function CartDrawerPayStep({
  pending,
  onPaid,
  onFailed,
}: Props) {
  const [status, setStatus] = useState<"waiting" | "paid" | "failed">("waiting");
  const [error, setError] = useState<string | null>(null);

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
          const msg = "Payment failed. Try again.";
          setError(msg);
          onFailed(msg);
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
  }, [pending, status, onPaid, onFailed]);

  const qrSrc = useMemo(() => {
    if (!pending.qrPayload) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pending.qrPayload)}`;
  }, [pending.qrPayload]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 text-center">
      <p className="text-sm text-gray-500 mb-3">
        Scan QR or open UPI. We&apos;ll confirm automatically.
      </p>
      <p className="text-xl font-extrabold text-gray-900 tabular-nums">
        {formatInr(pending.amount)}
      </p>
      <p className="text-xs text-gray-500 mt-1 mb-4">
        Order #{pending.orderNumber}
      </p>

      {qrSrc ? (
        <div className="mx-auto w-[200px] h-[200px] relative bg-white border border-gray-100 rounded-xl overflow-hidden">
          <Image
            src={qrSrc}
            alt="UPI QR code"
            width={200}
            height={200}
            unoptimized
          />
        </div>
      ) : null}

      <a
        href={pending.qrPayload}
        className="mt-4 flex w-full h-11 items-center justify-center rounded-lg bg-[#f16a34] text-white font-bold text-sm no-underline"
      >
        Open UPI app
      </a>

      <p className="mt-4 text-sm font-semibold text-[#f16a34] animate-pulse">
        {status === "waiting"
          ? "Waiting for payment…"
          : status === "failed"
            ? "Payment failed"
            : "Payment received"}
      </p>

      {error ? (
        <p className="mt-2 text-xs font-semibold text-[#c2410c]">{error}</p>
      ) : null}

      {pending.isMock ? (
        <p className="mt-3 text-[11px] text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
          Mock mode: payment may auto-confirm in UAT.
        </p>
      ) : null}
    </div>
  );
}
