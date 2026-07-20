"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  resolveStoreLocation,
  storeDisplayName,
  type StoreLocation,
} from "@/data/locations";
import { fetchOrder } from "@/lib/orders-api";
import { formatInr } from "@/lib/menu-api";
import CodOnlinePayPanel from "@/components/CodOnlinePayPanel";
import OrderStatusRail from "@/components/OrderStatusRail";
import OrderContactPhone from "@/components/OrderContactPhone";

type OrderData = Awaited<ReturnType<typeof fetchOrder>>;

type TrackStep = {
  id: string;
  title: string;
  subtitle: string;
};

function isCancelled(order: OrderData) {
  return (
    order.status === "cancelled" || order.petpooja_status === "cancelled"
  );
}

function isDelivered(order: OrderData) {
  return (
    order.rider_status === "delivered" ||
    order.petpooja_status === "delivered" ||
    order.status === "completed"
  );
}

/** 0 = placed … 4 = delivered */
function progressIndex(order: OrderData, isCod: boolean): number {
  if (isCancelled(order)) return -1;
  if (isDelivered(order)) return 4;

  const rs = order.rider_status;
  // Only true OFD from SVS Rider — do not advance on accept / assign / pickup.
  if (rs === "out_for_delivery" || rs === "arrived_at_customer") return 3;

  if (
    rs === "picked_up" ||
    rs === "arrived_at_store" ||
    order.petpooja_status === "food_ready"
  ) {
    return 2;
  }

  if (order.petpooja_status === "accepted") return 1;

  // Rider claimed but still at store / kitchen stage
  if (rs === "accepted" || rs === "assigned") {
    return order.petpooja_status === "food_ready" ? 2 : 1;
  }

  // POS "dispatched" alone is not customer "on the way" until rider taps OFD
  if (order.petpooja_status === "dispatched") return 2;

  if (order.status === "paid" || order.status === "cod_pending" || (isCod && order.status === "pending_payment")) {
    return 0;
  }
  return 0;
}

function headline(order: OrderData, isCod: boolean): { title: string; sub: string } {
  if (isCancelled(order)) {
    return { title: "Order cancelled", sub: "This order is no longer active." };
  }
  if (isDelivered(order)) {
    return { title: "Order delivered", sub: "Hope you enjoy your meal!" };
  }
  const rs = order.rider_status;
  if (rs === "arrived_at_customer") {
    return {
      title: "Rider has arrived",
      sub: "Your rider is at your location.",
    };
  }
  if (rs === "out_for_delivery") {
    return {
      title: "Out for delivery",
      sub: "Your rider is on the way to you.",
    };
  }
  if (rs === "picked_up") {
    return {
      title: "Rider picked up your order",
      sub: "Leaving for your address shortly.",
    };
  }
  if (rs === "arrived_at_store") {
    return {
      title: "Rider at the restaurant",
      sub: order.rider_name
        ? `${order.rider_name} is at the store collecting your order.`
        : "Your rider is at the store collecting your order.",
    };
  }
  if (rs === "accepted" || rs === "assigned") {
    return {
      title: "Rider assigned",
      sub: order.rider_name
        ? `${order.rider_name} will deliver your order.`
        : "A rider will deliver your order soon.",
    };
  }
  if (order.petpooja_status === "food_ready") {
    return {
      title: "Order is ready",
      sub:
        order.order_type === "delivery"
          ? "Waiting for a rider to pick it up."
          : "You can collect it from the counter.",
    };
  }
  if (order.petpooja_status === "dispatched") {
    return {
      title: "Order is ready",
      sub: "Your rider will start the trip next.",
    };
  }
  if (order.petpooja_status === "accepted") {
    return {
      title: "Preparing your order",
      sub: "The kitchen has started cooking.",
    };
  }
  if (isCod) {
    return {
      title: "Order placed",
      sub: "Pay cash on delivery. We’ll keep you updated here.",
    };
  }
  return {
    title: "Order confirmed",
    sub: "We’ve sent it to the kitchen.",
  };
}

function stepsFor(order: OrderData): TrackStep[] {
  if (order.order_type === "delivery") {
    return [
      { id: "placed", title: "Order placed", subtitle: "We got your order" },
      { id: "preparing", title: "Preparing", subtitle: "Kitchen is on it" },
      { id: "ready", title: "Ready", subtitle: "Packed & waiting" },
      { id: "onway", title: "On the way", subtitle: "Rider en route" },
      { id: "done", title: "Delivered", subtitle: "Enjoy!" },
    ];
  }
  return [
    { id: "placed", title: "Order placed", subtitle: "We got your order" },
    { id: "preparing", title: "Preparing", subtitle: "Kitchen is on it" },
    { id: "ready", title: "Ready", subtitle: "Ready for pickup" },
    { id: "done", title: "Completed", subtitle: "Collected" },
  ];
}

function mapEmbedUrl(
  store: StoreLocation,
  order: OrderData,
): string | null {
  const destLat = order.customer_latitude;
  const destLng = order.customer_longitude;
  const hasDest =
    typeof destLat === "number" &&
    typeof destLng === "number" &&
    Number.isFinite(destLat) &&
    Number.isFinite(destLng) &&
    !(destLat === 0 && destLng === 0);

  if (hasDest && order.order_type === "delivery") {
    return `https://maps.google.com/maps?saddr=${store.lat},${store.lng}&daddr=${destLat},${destLng}&hl=en&z=14&output=embed`;
  }
  if (hasDest) {
    return `https://maps.google.com/maps?q=${destLat},${destLng}&z=15&hl=en&output=embed`;
  }
  return `https://maps.google.com/maps?q=${store.lat},${store.lng}&z=15&hl=en&output=embed`;
}

function OrderInner() {
  const params = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const storeSlug = searchParams.get("store") || "satna";
  const orderId = params.orderId;
  const store = useMemo(() => resolveStoreLocation(storeSlug), [storeSlug]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
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

    void load();
    const id = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [orderId, store.backendStoreId]);

  if (loading && !order) {
    return (
      <main className="min-h-[100svh] bg-svs-cream flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-svs-orange border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-svs-ink/50">
            Loading your order…
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-[100svh] bg-svs-cream flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-svs-orange-dark font-bold mb-4">
            {error || "Order not found"}
          </p>
          <Link href="/menu" className="text-svs-orange font-extrabold">
            Back to menu
          </Link>
        </div>
      </main>
    );
  }

  const cancelled = isCancelled(order);
  const isCod =
    order.cod_unpaid ||
    order.is_cod ||
    searchParams.get("cod") === "1";
  const active = progressIndex(order, isCod);
  const { title, sub } = headline(order, isCod);
  const steps =
    order.order_type === "delivery"
      ? stepsFor(order)
      : stepsFor(order).filter((s) => s.id !== "onway");
  // For non-delivery, map progress: 0,1,2,4 → 0,1,2,3
  const railIndex =
    order.order_type === "delivery"
      ? active
      : active >= 4
        ? 3
        : active >= 2
          ? 2
          : active;
  const mapUrl = mapEmbedUrl(store, order);
  const showRider =
    order.order_type === "delivery" &&
    !cancelled &&
    !!(order.rider_name || order.rider_phone || order.rider_status);

  return (
    <main className="relative min-h-[100svh] bg-[#eef1f4] overflow-hidden">
      {/* Map plane */}
      <div className="absolute inset-x-0 top-0 h-[48svh] sm:h-[52svh]">
        {mapUrl ? (
          <iframe
            title="Delivery map"
            src={mapUrl}
            className="h-full w-full border-0 grayscale-[0.15] contrast-[1.05]"
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-svs-cream to-[#e8ddd0]" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#eef1f4] to-transparent" />

        <Link
          href="/menu"
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 z-10 inline-flex h-10 items-center rounded-full bg-white/95 px-4 text-sm font-extrabold text-svs-ink shadow-md backdrop-blur no-underline"
        >
          ← Menu
        </Link>

        <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-10 rounded-full bg-white/95 px-3 py-2 text-[11px] font-bold text-svs-ink/60 shadow-md backdrop-blur">
          Live · updates every few sec
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="relative z-10 mt-[42svh] sm:mt-[46svh] px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-[480px] rounded-t-[1.75rem] rounded-b-[1.5rem] bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.12)] overflow-hidden">
          <div className="flex justify-center pt-3 pb-1">
            <span className="h-1 w-10 rounded-full bg-svs-ink/15" />
          </div>

          <div className="px-5 pt-2 pb-5 space-y-5">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-svs-orange mb-1">
                #{order.order_number} · {storeDisplayName(store)}
              </p>
              <h1 className="font-bagoss text-[1.65rem] sm:text-[1.85rem] font-extrabold text-svs-ink leading-[1.15] tracking-tight">
                {title}
              </h1>
              <p className="mt-1.5 text-sm text-svs-ink/55 leading-relaxed">
                {sub}
              </p>
            </div>

            {isCod && !isDelivered(order) && !cancelled ? (
              <CodOnlinePayPanel
                orderId={order.order_id}
                amount={order.grand_total}
                orderLabel={`#${order.order_number}`}
                onPaid={() => {
                  void fetchOrder({
                    storeId: store.backendStoreId,
                    orderId: order.order_id,
                  }).then(setOrder);
                }}
              />
            ) : null}

            {(order.customer_mobile ||
              (order.order_type === "delivery" && order.customer_address)) ? (
              <div className="rounded-2xl border border-svs-cream px-4 py-3 space-y-3">
                <OrderContactPhone
                  phone={order.customer_mobile}
                  canChange={
                    !cancelled &&
                    order.can_change_customer_mobile !== false &&
                    !order.customer_mobile_changed
                  }
                  storeId={store.backendStoreId}
                  orderId={order.order_id}
                  tone="light"
                  onChanged={(mobile) =>
                    setOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            customer_mobile: mobile,
                            customer_mobile_changed: true,
                            can_change_customer_mobile: false,
                          }
                        : prev,
                    )
                  }
                />
                {order.order_type === "delivery" && order.customer_address ? (
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-svs-ink/35 mb-1">
                      Delivering to
                    </p>
                    <p className="text-sm font-semibold text-svs-ink leading-snug">
                      {order.customer_address}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-svs-ink/35 mb-3">
                Order status
              </p>
              <OrderStatusRail
                steps={steps}
                activeIndex={cancelled ? -1 : railIndex}
                cancelled={cancelled}
                rider={
                  showRider
                    ? {
                        name: order.rider_name,
                        phone: order.rider_phone,
                        status: order.rider_status,
                      }
                    : null
                }
              />
            </div>

            <div className="rounded-2xl border border-svs-cream overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                onClick={() => setDetailsOpen((v) => !v)}
              >
                <span className="text-sm font-extrabold text-svs-ink">
                  Order details · {formatInr(order.grand_total)}
                </span>
                <span className="text-svs-ink/40 font-bold text-lg leading-none">
                  {detailsOpen ? "−" : "+"}
                </span>
              </button>
              {detailsOpen ? (
                <div className="border-t border-svs-cream px-4 py-3 space-y-2 text-sm text-svs-ink/70">
                  <Row label="Type" value={order.order_type.replace(/_/g, " ")} />
                  {isCod ? <Row label="Payment" value="Cash on delivery" /> : null}
                  {order.delivery_charges ? (
                    <Row
                      label="Delivery"
                      value={formatInr(order.delivery_charges)}
                    />
                  ) : null}
                  <Row label="Total" value={formatInr(order.grand_total)} bold />
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    <ul className="mt-2 space-y-1.5 border-t border-svs-cream pt-2">
                      {(order.items as { name?: string; quantity?: number }[]).map(
                        (line, i) => (
                          <li
                            key={`${line.name}-${i}`}
                            className="flex justify-between gap-3"
                          >
                            <span className="min-w-0 truncate">
                              {line.name || "Item"}
                            </span>
                            <span className="shrink-0 font-semibold">
                              ×{line.quantity || 1}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>

            <Link
              href="/menu"
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-svs-orange text-white font-extrabold no-underline active:scale-[0.99] transition-transform"
            >
              Order more
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-svs-ink/45">{label}</span>
      <span
        className={`capitalize text-right ${bold ? "font-extrabold text-svs-ink" : "font-semibold"}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[100svh] bg-svs-cream flex items-center justify-center text-svs-ink/50 text-sm font-semibold">
          Loading…
        </main>
      }
    >
      <OrderInner />
    </Suspense>
  );
}
