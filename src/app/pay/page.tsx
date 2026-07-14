"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { resolveStoreLocation } from "@/data/locations";
import { getPaymentStatus } from "@/lib/orders-api";
import { formatInr } from "@/lib/menu-api";
import { Suspense } from "react";

type PendingPayment = {
  orderId: string;
  orderNumber: string | number;
  storeSlug: string;
  storeId: string;
  transactionId: string;
  qrPayload: string;
  amount: string;
  isMock?: boolean;
};

function PayInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("order") || "";
  const storeSlug = searchParams.get("store") || "";

  const [pending, setPending] = useState<PendingPayment | null>(null);
  const [status, setStatus] = useState<"waiting" | "paid" | "failed">("waiting");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("svs_pending_payment");
      if (!raw) {
        setError("Payment session not found. Please checkout again.");
        return;
      }
      const parsed = JSON.parse(raw) as PendingPayment;
      if (orderIdParam && parsed.orderId !== orderIdParam) {
        setError("Payment session mismatch.");
        return;
      }
      setPending(parsed);
    } catch {
      setError("Could not restore payment session.");
    }
  }, [orderIdParam]);

  useEffect(() => {
    if (!pending || status !== "waiting") return;

    let cancelled = false;
    const tick = async () => {
      try {
        const store = resolveStoreLocation(pending.storeSlug || storeSlug);
        const result = await getPaymentStatus({
          storeId: store.backendStoreId,
          transactionId: pending.transactionId,
          orderId: pending.orderId,
        });
        if (cancelled) return;
        if (result.internal_status === "paid") {
          setStatus("paid");
          sessionStorage.removeItem("svs_pending_payment");
          router.replace(
            `/order/${encodeURIComponent(pending.orderId)}?store=${encodeURIComponent(store.id)}`,
          );
        } else if (result.internal_status === "failed") {
          setStatus("failed");
          setError("Payment failed. Please try again from checkout.");
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
  }, [pending, status, storeSlug, router]);

  const qrSrc = useMemo(() => {
    if (!pending?.qrPayload) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(pending.qrPayload)}`;
  }, [pending]);

  return (
    <>
      <Navbar />
      <main className="min-h-[70svh] pt-[72px] md:pt-[88px] lg:pt-[100px] px-4 sm:px-6 lg:px-8 pb-16 bg-[#fff8f3]">
        <div className="max-w-[440px] mx-auto py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] mb-2">
            Pay with UPI
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Scan the QR or open your UPI app. We&apos;ll confirm automatically.
          </p>

          {error && !pending ? (
            <div className="rounded-2xl bg-white border border-red-100 p-6">
              <p className="text-red-600 font-semibold mb-4">{error}</p>
              <Link href="/checkout" className="text-[#f16a35] font-bold">
                Back to checkout
              </Link>
            </div>
          ) : pending ? (
            <div className="rounded-2xl border border-[#efe4da] bg-white p-6 space-y-4">
              <p className="text-lg font-extrabold text-[#1a1a1a]">
                {formatInr(pending.amount)}
              </p>
              <p className="text-xs text-gray-500">
                Order #{pending.orderNumber}
              </p>

              {qrSrc ? (
                <div className="mx-auto w-[240px] h-[240px] relative bg-white">
                  <Image
                    src={qrSrc}
                    alt="UPI QR code"
                    width={240}
                    height={240}
                    unoptimized
                  />
                </div>
              ) : null}

              <a
                href={pending.qrPayload}
                className="inline-flex w-full items-center justify-center h-12 rounded-full bg-[#f16a35] text-white font-bold no-underline"
              >
                Open UPI app
              </a>

              <p className="text-sm font-semibold text-[#f16a35] animate-pulse">
                {status === "waiting"
                  ? "Waiting for payment..."
                  : status === "failed"
                    ? "Payment failed"
                    : "Payment received"}
              </p>

              {error ? (
                <p className="text-sm text-red-600 font-semibold">{error}</p>
              ) : null}

              {pending.isMock ? (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  Mock payment mode — backend will auto-confirm in UAT/mock.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-gray-500">Loading payment...</p>
          )}
        </div>
      </main>
    </>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[50svh] pt-[120px] text-center text-gray-500">
          Loading...
        </main>
      }
    >
      <PayInner />
    </Suspense>
  );
}
