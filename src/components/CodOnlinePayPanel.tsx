"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatInr } from "@/lib/menu-api";
import {
  createCustomerCodPaySession,
  getCustomerCodPayStatus,
} from "@/lib/website-customer-api";

type Props = {
  orderId: string;
  amount: number;
  orderLabel?: string;
  onPaid?: () => void;
  compact?: boolean;
};

export default function CodOnlinePayPanel({
  orderId,
  amount,
  orderLabel,
  onPaid,
  compact = false,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<{
    transactionId: string;
    qrPayload: string;
    amount: string;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "waiting" | "paid" | "failed">(
    "idle",
  );

  const startPay = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await createCustomerCodPaySession(orderId);
      setSession({
        transactionId: data.transaction_id,
        qrPayload: data.qr_payload,
        amount: data.amount,
      });
      setStatus("waiting");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start payment");
    } finally {
      setBusy(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (status !== "waiting" || !session) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const result = await getCustomerCodPayStatus(
          orderId,
          session.transactionId,
        );
        if (cancelled) return;
        if (result.internal_status === "paid") {
          setStatus("paid");
          onPaid?.();
        } else if (result.internal_status === "failed") {
          setStatus("failed");
          setError("Payment failed. Try again.");
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
  }, [status, session, orderId, onPaid]);

  const qrSrc = useMemo(() => {
    if (!session?.qrPayload) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(session.qrPayload)}`;
  }, [session?.qrPayload]);

  if (status === "paid") {
    return (
      <p className="text-sm font-bold text-emerald-600 text-center py-2">
        Payment received — thank you!
      </p>
    );
  }

  if (!session) {
    return (
      <div className={compact ? "" : "rounded-xl border border-orange-100 bg-orange-50/80 p-4"}>
        <p className={`text-gray-700 ${compact ? "text-xs mb-2" : "text-sm mb-3"}`}>
          Pay {formatInr(amount)} online with PhonePe / UPI
          {orderLabel ? ` · ${orderLabel}` : ""}
        </p>
        {error ? (
          <p className="text-xs text-[#c2410c] font-medium mb-2">{error}</p>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => void startPay()}
          className="w-full h-10 rounded-lg bg-[#f16a34] text-white text-sm font-extrabold cursor-pointer disabled:opacity-60 border-0"
        >
          {busy ? "Generating QR…" : "Pay with PhonePe QR"}
        </button>
      </div>
    );
  }

  return (
    <div className={`text-center ${compact ? "" : "rounded-xl border border-gray-200 bg-white p-4"}`}>
      <p className="text-lg font-extrabold tabular-nums text-gray-900">
        {formatInr(session.amount)}
      </p>
      <p className="text-xs text-gray-500 mt-1 mb-3">Scan to pay · PhonePe / UPI</p>
      {qrSrc ? (
        <div className="mx-auto w-[180px] h-[180px] relative bg-white border border-gray-100 rounded-xl overflow-hidden">
          <Image src={qrSrc} alt="Payment QR" width={180} height={180} unoptimized />
        </div>
      ) : null}
      <a
        href={session.qrPayload}
        className="mt-3 flex w-full h-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm no-underline"
      >
        Open UPI app
      </a>
      <p className="mt-3 text-sm font-semibold text-[#f16a34] animate-pulse">
        Waiting for payment…
      </p>
      {error ? (
        <p className="text-xs text-[#c2410c] mt-2">{error}</p>
      ) : null}
    </div>
  );
}
