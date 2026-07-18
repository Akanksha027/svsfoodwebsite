"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import { resolveStoreLocation } from "@/data/locations";
import { fetchOrder } from "@/lib/orders-api";
import { formatInr } from "@/lib/menu-api";

function statusLabel(order: {
  status: string;
  petpooja_status?: string | null;
  rider_status?: string | null;
  cod?: boolean;
}) {
  if (order.cod && (order.status === "paid" || order.status === "pending_payment")) {
    return "Order placed · pay on delivery / counter";
  }
  const rs = order.rider_status;
  if (rs === "out_for_delivery") return "Out for delivery";
  if (rs === "picked_up") return "Rider picked up";
  if (rs === "accepted" || rs === "assigned") return "Rider assigned";
  if (rs === "delivered") return "Delivered";
  if (rs === "failed") return "Delivery issue";

  const pp = order.petpooja_status;
  if (pp === "food_ready") return "Ready";
  if (pp === "dispatched") return "Out for delivery";
  if (pp === "delivered" || order.status === "completed") return "Delivered";
  if (pp === "accepted") return "Preparing";
  if (pp === "cancelled" || order.status === "cancelled") return "Cancelled";
  if (order.status === "paid") return "Order confirmed";
  return order.status.replace(/_/g, " ");
}

function OrderInner() {
  const params = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const storeSlug = searchParams.get("store") || "satna";
  const isCod = searchParams.get("cod") === "1";
  const orderId = params.orderId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Awaited<
    ReturnType<typeof fetchOrder>
  > | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const store = resolveStoreLocation(storeSlug);
        const data = await fetchOrder({
          storeId: store.backendStoreId,
          orderId,
        });
        if (!cancelled) {
          setOrder(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Order not found");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const id = window.setInterval(load, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [orderId, storeSlug]);

  return (
    <>
      <main className="min-h-[70svh] pt-[72px] md:pt-[88px] lg:pt-[72px] px-4 sm:px-6 lg:px-8 pb-16 bg-svs-cream">
        <div className="max-w-[560px] mx-auto py-10">
          {loading && !order ? (
            <p className="text-center text-svs-ink/50">Loading order...</p>
          ) : error || !order ? (
            <div className="text-center">
              <p className="text-svs-orange-dark font-semibold mb-4">
                {error || "Order not found"}
              </p>
              <Link href="/menu" className="text-svs-orange font-bold">
                Back to menu
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-svs-cream bg-svs-white p-6 space-y-4 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-svs-orange">
                {statusLabel({ ...order, cod: isCod })}
              </p>
              <h1 className="text-3xl font-extrabold text-svs-ink">
                #{order.order_number}
              </h1>
              <p className="text-xs text-svs-ink/40">
                {String(order.order_number).startsWith("2018")
                  ? "Website order"
                  : "Kiosk order"}
              </p>
              <p className="text-lg font-bold text-svs-ink">
                {formatInr(order.grand_total)}
              </p>
              <p className="text-sm text-svs-ink/50 capitalize">
                {order.order_type.replace(/_/g, " ")}
                {order.customer_mobile
                  ? ` · ${order.customer_mobile}`
                  : ""}
              </p>
              {order.customer_address ? (
                <p className="text-sm text-svs-ink/60">{order.customer_address}</p>
              ) : null}

              {order.rider_name || order.rider_phone || order.rider_status ? (
                <div className="rounded-xl bg-svs-cream px-4 py-3 text-left">
                  <p className="text-xs font-bold uppercase tracking-wide text-svs-orange mb-1">
                    Rider
                  </p>
                  {order.rider_status ? (
                    <p className="text-xs font-semibold text-svs-ink/50 mb-1 capitalize">
                      {order.rider_status.replace(/_/g, " ")}
                    </p>
                  ) : null}
                  {order.rider_name ? (
                    <p className="font-semibold text-svs-ink">
                      {order.rider_name}
                    </p>
                  ) : null}
                  {order.rider_phone ? (
                    <a
                      href={`tel:${order.rider_phone}`}
                      className="text-sm text-svs-orange font-semibold"
                    >
                      {order.rider_phone}
                    </a>
                  ) : null}
                </div>
              ) : null}

              <p className="text-sm text-svs-ink/50">
                {isCod
                  ? "Pay the restaurant / rider in cash. Status updates on WhatsApp."
                  : "We'll update you on WhatsApp when the kitchen is ready."}
              </p>
              <Link
                href="/menu"
                className="inline-flex h-11 items-center justify-center rounded-full bg-svs-orange text-white font-bold px-6 no-underline"
              >
                Order more
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[50svh] pt-[120px] text-center text-svs-ink/50">
          Loading...
        </main>
      }
    >
      <OrderInner />
    </Suspense>
  );
}
