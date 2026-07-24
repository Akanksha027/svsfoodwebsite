"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveStoreLocation } from "@/data/locations";
import {
  abandonCheckoutPayment,
  getPgPaymentStatus,
} from "@/lib/orders-api";
import { formatInr } from "@/lib/menu-api";
import { useCart } from "@/context/CartContext";
import type { PendingPgPayment } from "@/hooks/useWebCheckout";

const PG_PENDING_KEY = "svs_pending_pg_payment";

function PayReturnInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const orderId = searchParams.get("order") || "";
  const storeSlug = searchParams.get("store") || "";

  const [pending, setPending] = useState<PendingPgPayment | null>(null);
  const [status, setStatus] = useState<"waiting" | "paid" | "failed">("waiting");
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PG_PENDING_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PendingPgPayment;
        if (!orderId || parsed.orderId === orderId) {
          setPending(parsed);
          return;
        }
      }
      if (orderId && storeSlug) {
        const store = resolveStoreLocation(storeSlug);
        setPending({
          channel: "pg",
          orderId,
          orderNumber: orderId.slice(0, 8),
          storeSlug: store.id,
          storeId: store.backendStoreId,
          pgOrderId: "",
          redirectUrl: "",
          amount: "0",
        });
      } else {
        setError("Payment session not found. Please checkout again.");
      }
    } catch {
      setError("Could not restore payment session.");
    }
  }, [orderId, storeSlug]);

  useEffect(() => {
    if (!pending || status !== "waiting" || !orderId) return;

    let cancelled = false;
    const tick = async () => {
      try {
        const result = await getPgPaymentStatus({
          storeId: pending.storeId,
          orderId: pending.orderId,
        });
        if (cancelled) return;
        if (result.internal_status === "paid") {
          setStatus("paid");
          sessionStorage.removeItem(PG_PENDING_KEY);
          clearCart();
          router.replace(
            `/order/${encodeURIComponent(pending.orderId)}?store=${encodeURIComponent(pending.storeSlug)}`,
          );
        } else if (result.internal_status === "failed") {
          setStatus("failed");
          setError("Payment failed or was cancelled. Your cart is still saved.");
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
  }, [pending, status, orderId, router, clearCart]);

  const onCancel = async () => {
    if (!pending || cancelling) return;
    setCancelling(true);
    try {
      await abandonCheckoutPayment({
        storeId: pending.storeId,
        orderId: pending.orderId,
      });
    } catch {
      /* still leave */
    }
    sessionStorage.removeItem(PG_PENDING_KEY);
    router.replace("/menu");
  };

  const displayAmount =
    pending && pending.amount !== "0"
      ? formatInr(Number(pending.amount))
      : null;

  return (
    <main className="min-h-[70svh] pt-[84px] md:pt-[104px] lg:pt-[88px] px-4 sm:px-6 lg:px-8 pb-16 bg-svs-cream">
      <div className="max-w-[440px] mx-auto py-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-svs-ink mb-2">
          {status === "paid"
            ? "Payment received"
            : status === "failed"
              ? "Payment not completed"
              : "Confirming payment…"}
        </h1>
        <p className="text-sm text-svs-ink/50 mb-6">
          {status === "waiting"
            ? "Hang tight. We’re verifying your card payment with PhonePe."
            : status === "failed"
              ? "You can try again from your cart."
              : "Redirecting to your order…"}
        </p>

        {error && !pending ? (
          <div className="rounded-2xl bg-svs-white border border-svs-orange/20 p-6">
            <p className="text-svs-orange-dark font-semibold mb-4">{error}</p>
            <Link href="/menu" className="text-svs-orange font-bold">
              Back to menu
            </Link>
          </div>
        ) : pending ? (
          <div className="rounded-2xl border border-svs-cream bg-svs-white p-6 space-y-4">
            {displayAmount ? (
              <p className="text-lg font-bold text-svs-ink">{displayAmount}</p>
            ) : null}
            <p className="text-xs text-svs-ink/50">
              Order #{pending.orderNumber}
            </p>

            {status === "waiting" ? (
              <>
                <div className="mx-auto h-10 w-10 rounded-full border-2 border-svs-orange border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-svs-orange">
                  Waiting for confirmation…
                </p>
              </>
            ) : null}

            {error ? (
              <p className="text-sm text-svs-orange-dark font-semibold">{error}</p>
            ) : null}

            {status !== "paid" ? (
              <>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => void onCancel()}
                  className="w-full h-11 rounded-full border border-svs-ink/15 bg-transparent text-sm font-bold text-svs-ink/70 cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? "Cancelling…" : "Cancel & return to menu"}
                </button>
                <p className="text-xs text-svs-ink/45">
                  Cancels this order if payment didn&apos;t go through.
                </p>
              </>
            ) : null}
          </div>
        ) : (
          <p className="text-svs-ink/50">Loading…</p>
        )}
      </div>
    </main>
  );
}

export default function PayReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[50svh] pt-[120px] text-center text-svs-ink/50">
          Loading…
        </main>
      }
    >
      <PayReturnInner />
    </Suspense>
  );
}
