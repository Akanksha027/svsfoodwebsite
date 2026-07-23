"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { resolveStoreLocation } from "@/data/locations";
import { abandonCheckoutPayment, getPaymentStatus } from "@/lib/orders-api";
import { formatInr } from "@/lib/menu-api";
import { useCart } from "@/context/CartContext";

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
  const { clearCart } = useCart();
  const orderIdParam = searchParams.get("order") || "";
  const storeSlug = searchParams.get("store") || "";

  const [pending, setPending] = useState<PendingPayment | null>(null);
  const [status, setStatus] = useState<"waiting" | "paid" | "failed">("waiting");
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

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
          clearCart();
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
  }, [pending, status, storeSlug, router, clearCart]);

  const onCancelPayment = async () => {
    if (!pending || cancelling) return;
    setCancelling(true);
    try {
      await abandonCheckoutPayment({
        storeId: pending.storeId,
        orderId: pending.orderId,
        transactionId: pending.transactionId,
      });
    } catch {
      /* still leave pay screen */
    }
    sessionStorage.removeItem("svs_pending_payment");
    router.replace("/menu");
  };

  const qrSrc = useMemo(() => {
    if (!pending?.qrPayload) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(pending.qrPayload)}`;
  }, [pending]);

  return (
    <>
      <main className="min-h-[70svh] pt-[84px] md:pt-[104px] lg:pt-[88px] px-4 sm:px-6 lg:px-8 pb-16 bg-svs-cream">
        <div className="max-w-[440px] mx-auto py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-svs-ink mb-2">
            Pay with UPI
          </h1>
          <p className="text-sm text-svs-ink/50 mb-6">
            Scan the QR or open your UPI app. We&apos;ll confirm automatically.
          </p>

          {error && !pending ? (
            <div className="rounded-2xl bg-svs-white border border-svs-orange/20 p-6">
              <p className="text-svs-orange-dark font-semibold mb-4">{error}</p>
              <Link href="/checkout" className="text-svs-orange font-bold">
                Back to checkout
              </Link>
            </div>
          ) : pending ? (
            <div className="rounded-2xl border border-svs-cream bg-svs-white p-6 space-y-4">
              <p className="text-lg font-extrabold text-svs-ink">
                {formatInr(pending.amount)}
              </p>
              <p className="text-xs text-svs-ink/50">
                Order #{pending.orderNumber}
              </p>

              {qrSrc ? (
                <div className="mx-auto w-[240px] h-[240px] relative bg-svs-white">
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
                className="inline-flex w-full items-center justify-center h-12 rounded-full bg-svs-orange text-white font-bold no-underline"
              >
                Open UPI app
              </a>

              <p className="text-sm font-semibold text-svs-orange animate-pulse">
                {status === "waiting"
                  ? "Waiting for payment..."
                  : status === "failed"
                    ? "Payment failed"
                    : "Payment received"}
              </p>

              {error ? (
                <p className="text-sm text-svs-orange-dark font-semibold">{error}</p>
              ) : null}

              {pending.isMock ? (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  Mock payment mode: backend will auto-confirm in UAT/mock.
                </p>
              ) : null}

              <button
                type="button"
                disabled={cancelling || status === "paid"}
                onClick={() => void onCancelPayment()}
                className="w-full h-11 rounded-full border border-svs-ink/15 bg-transparent text-sm font-bold text-svs-ink/70 cursor-pointer disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel payment"}
              </button>
              <p className="text-xs text-svs-ink/45">
                Cancels this order. Your cart stays so you can try again.
              </p>
            </div>
          ) : (
            <p className="text-svs-ink/50">Loading payment...</p>
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
        <main className="min-h-[50svh] pt-[120px] text-center text-svs-ink/50">
          Loading...
        </main>
      }
    >
      <PayInner />
    </Suspense>
  );
}
