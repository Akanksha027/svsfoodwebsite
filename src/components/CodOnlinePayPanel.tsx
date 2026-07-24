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
  const [status, setStatus] = useState<"idle" | "waiting" | "paid" | "failed">("idle");

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
      setError(e instanceof Error ? e.message : "Could not start payment. Try again.");
    } finally {
      setBusy(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (status !== "waiting" || !session) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const result = await getCustomerCodPayStatus(orderId, session.transactionId);
        if (cancelled) return;
        if (result.internal_status === "paid") {
          setStatus("paid");
          onPaid?.();
        } else if (result.internal_status === "failed") {
          setStatus("failed");
          setError("Payment failed. Please try again.");
          setSession(null);
        }
      } catch { /* keep polling */ }
    };
    tick();
    const id = window.setInterval(tick, 2500);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [status, session, orderId, onPaid]);

  const qrSrc = useMemo(() => {
    if (!session?.qrPayload) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(session.qrPayload)}&margin=10&color=1a1a1a&bgcolor=ffffff`;
  }, [session?.qrPayload]);

  // ── Paid ────────────────────────────────────────────────────────────────────
  if (status === "paid") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3.5">
        <div className="h-9 w-9 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-white">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-extrabold text-emerald-800">Payment confirmed!</p>
          <p className="text-xs text-emerald-600 mt-0.5">Your order is fully paid. Enjoy your meal.</p>
        </div>
      </div>
    );
  }

  // ── QR active ───────────────────────────────────────────────────────────────
  if (session && status === "waiting") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#f16a34]">Scan & Pay</p>
            <p className="text-xl font-extrabold text-gray-900 tabular-nums mt-0.5">
              {formatInr(Number(session.amount))}
            </p>
          </div>
          {orderLabel && (
            <p className="text-xs font-semibold text-gray-400">{orderLabel}</p>
          )}
        </div>

        <div className="px-4 py-5 flex flex-col items-center gap-4">
          {qrSrc ? (
            <div className="w-[192px] h-[192px] rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white">
              <Image src={qrSrc} alt="UPI Payment QR" width={192} height={192} unoptimized priority />
            </div>
          ) : (
            <div className="w-[192px] h-[192px] rounded-xl bg-gray-50 flex items-center justify-center">
              <span className="h-6 w-6 rounded-full border-2 border-[#f16a34] border-t-transparent animate-spin" />
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            PhonePe · Google Pay · Paytm · any UPI app
          </p>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#f16a34] animate-pulse" />
            <p className="text-sm font-semibold text-[#f16a34]">Waiting for payment…</p>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 w-full text-center">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // ── Idle CTA ────────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div>
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        <button
          type="button"
          disabled={busy}
          onClick={() => void startPay()}
          className="w-full h-10 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy
            ? <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Generating…</>
            : `Pay ${formatInr(amount)} now`
          }
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Top row */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-[#fff4ee] flex items-center justify-center text-[#f16a34]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-extrabold text-gray-900">Pay now, ride smooth</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
            Skip the cash hand-off. PhonePe, GPay, or any UPI app - done in seconds.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-100" />

      {/* CTA */}
      <div className="px-4 py-3 space-y-2">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void startPay()}
          className="w-full h-[48px] rounded-xl bg-[#f16a34] text-white font-extrabold text-[15px] border-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Generating QR…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                <path d="M14 14h.01M14 18h.01M18 14h.01M18 18h.01" />
              </svg>
              Pay {formatInr(amount)} now
            </>
          )}
        </button>
        <p className="text-[11px] text-gray-400 text-center">
          PhonePe · Google Pay · Paytm · any UPI
        </p>
      </div>
    </div>
  );
}
