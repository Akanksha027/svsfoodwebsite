"use client";

import { Suspense } from "react";
import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import AppDownloadPromo from "@/components/AppDownloadPromo";
import {
  deleteCustomerAddress,
  fetchCustomerOrders,
  setDefaultCustomerAddress,
  createCustomerAddress,
  type CustomerOrderSummary,
  type WebsiteCustomerAddress,
} from "@/lib/website-customer-api";
import { formatInr } from "@/lib/menu-api";
import { fetchOrder } from "@/lib/orders-api";
import { resolveStoreLocation, storeDisplayName } from "@/data/locations";
import OrderStatusRail from "@/components/OrderStatusRail";
import OrderContactPhone from "@/components/OrderContactPhone";
import AccountProfileForm from "@/components/AccountProfileForm";
import AccountNotificationsForm from "@/components/AccountNotificationsForm";
import AccountHelpCenter from "@/components/AccountHelpCenter";
import AddressLabelPicker, {
  normalizeAddressLabel,
} from "@/components/AddressLabelPicker";

type AccountSection =
  | "profile"
  | "notifications"
  | "orders"
  | "addresses"
  | "gift_cards"
  | "rewards"
  | "help";

const ACCOUNT_TAB_PATH: Record<AccountSection, string> = {
  orders: "/account",
  profile: "/account?tab=profile",
  notifications: "/account?tab=notifications",
  addresses: "/account?tab=addresses",
  gift_cards: "/account?tab=gift-cards",
  rewards: "/account?tab=rewards",
  help: "/account?tab=help",
};
type LiveOrderData = Awaited<ReturnType<typeof fetchOrder>>;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function formatOrderWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function orderStatusHeadline(status: string | undefined) {
  const s = (status || "").toLowerCase();
  if (s.includes("deliver") && s.includes("ed")) return "Order arrived";
  if (s.includes("cancel")) return "Order cancelled";
  if (s.includes("prepar") || s.includes("accepted") || s.includes("confirmed")) {
    return "Preparing your order";
  }
  if (s.includes("out") || s.includes("dispatch")) return "On the way";
  return "Order in progress";
}

function isPastStatus(status: string | undefined) {
  const s = (status || "").toLowerCase();
  return (
    s.includes("deliver") ||
    s.includes("cancel") ||
    s.includes("complete") ||
    s.includes("closed")
  );
}

/* ─── Live order tracking helpers (mirrors order/[orderId] page) ──────────── */

function liveIsCancelled(o: LiveOrderData) {
  return o.status === "cancelled" || o.petpooja_status === "cancelled";
}
function liveIsDelivered(o: LiveOrderData) {
  return (
    o.rider_status === "delivered" ||
    o.petpooja_status === "delivered" ||
    o.status === "completed"
  );
}

function liveProgressIndex(o: LiveOrderData, isCod: boolean): number {
  if (liveIsCancelled(o)) return -1;
  if (liveIsDelivered(o)) return 4;
  const rs = o.rider_status;
  if (rs === "out_for_delivery" || rs === "arrived_at_customer") return 3;
  if (rs === "picked_up" || rs === "arrived_at_store" || o.petpooja_status === "food_ready") return 2;
  if (o.petpooja_status === "accepted") return 1;
  if (rs === "accepted" || rs === "assigned") {
    return o.petpooja_status === "food_ready" ? 2 : 1;
  }
  if (o.petpooja_status === "dispatched") return 2;
  if (o.status === "paid" || o.status === "cod_pending" || (isCod && o.status === "pending_payment")) return 0;
  return 0;
}

function liveHeadline(o: LiveOrderData, isCod: boolean): { title: string; sub: string } {
  if (liveIsCancelled(o)) return { title: "Order cancelled", sub: "This order is no longer active." };
  if (liveIsDelivered(o)) return { title: "Order delivered 🎉", sub: "Hope you enjoy your meal!" };
  const rs = o.rider_status;
  if (rs === "arrived_at_customer") return { title: "Rider has arrived!", sub: "Your rider is at your location." };
  if (rs === "out_for_delivery") return { title: "Out for delivery 🛵", sub: "Your rider is on the way to you." };
  if (rs === "picked_up") return { title: "Rider picked up your order", sub: "Leaving for your address." };
  if (rs === "arrived_at_store") return { title: "Rider at the restaurant", sub: o.rider_name ? `${o.rider_name} is collecting your order.` : "Your rider is at the store." };
  if (rs === "accepted" || rs === "assigned") return { title: "Rider assigned", sub: o.rider_name ? `${o.rider_name} will deliver your order.` : "A rider will deliver your order soon." };
  if (o.petpooja_status === "food_ready") return { title: "Your order is ready! 🍔", sub: o.order_type === "delivery" ? "Waiting for a rider to pick it up." : "You can collect it from the counter." };
  if (o.petpooja_status === "dispatched") return { title: "Order is ready", sub: "Your rider will start the trip next." };
  if (o.petpooja_status === "accepted") return { title: "Preparing your order 👨‍🍳", sub: "The kitchen has started cooking." };
  if (isCod) return { title: "Order placed ✅", sub: "Pay cash on delivery. Tracking live here." };
  return { title: "Order confirmed ✅", sub: "We've sent it to the kitchen." };
}

type TrackStep = { id: string; title: string; subtitle: string };

function liveSteps(o: LiveOrderData): TrackStep[] {
  if (o.order_type === "delivery") {
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

/* ─── Icons ───────────────────────────────────────────────────────────────── */

function IconHelp({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M9.1 9a3 3 0 015.8 1c0 2-3 2.5-3 4.5M12 17.5h.01"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGift({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 12v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8M12 22V7M2 7h20v5H2V7zM12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRewards({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l2.4 7.2H22l-6 4.8 2.3 7L12 16.8 5.7 21l2.3-7-6-4.8h7.6L12 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ComingSoonPanel({
  title,
  blurb,
}: {
  title: string;
  blurb: string;
}) {
  return (
    <div>
      <h1 className="text-[20px] sm:text-[22px] font-extrabold text-gray-900 tracking-tight mb-3">
        {title}
      </h1>
      <div className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-12 sm:py-14 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ee] text-[#f16a34]">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="inline-flex items-center rounded-full bg-[#fff4ee] px-3 py-1 text-[11px] font-extrabold tracking-wide text-[#f16a34]">
          Coming soon
        </p>
        <p className="mt-3 text-[15px] font-extrabold text-gray-900">{title}</p>
        <p className="mt-2 text-[13px] text-gray-500 leading-relaxed max-w-sm mx-auto">
          {blurb}
        </p>
      </div>
    </div>
  );
}

function IconBell({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconProfile({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 19.5c1.8-3.2 4.2-4.5 7-4.5s5.2 1.3 7 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconOrders({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPin({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconLock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconLogout({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevron({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Live Order Tracking Panel ───────────────────────────────────────────── */

function LiveOrderPanel({
  orderId,
  storeSlug,
  onDismiss,
}: {
  orderId: string;
  storeSlug: string;
  onDismiss: () => void;
}) {
  const store = useMemo(() => resolveStoreLocation(storeSlug), [storeSlug]);
  const [order, setOrder] = useState<LiveOrderData | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { refreshCustomer } = useWebsiteAuth();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchOrder({ storeId: store.backendStoreId, orderId });
        if (!cancelled) { setOrder(data); setLoadErr(null); }
      } catch (e) {
        if (!cancelled) setLoadErr(e instanceof Error ? e.message : "Could not load order");
      }
    };
    void load();
    const id = window.setInterval(load, 5000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [orderId, store.backendStoreId]);

  // Scroll panel into view on mount
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (loadErr) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600 flex items-center justify-between gap-3">
        <span>Could not load order details</span>
        <button type="button" onClick={onDismiss} className="text-red-400 hover:text-red-600 text-lg leading-none border-0 bg-transparent cursor-pointer">×</button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-orange-50/60 px-5 py-6 flex items-center gap-3">
        <div className="h-5 w-5 rounded-full border-2 border-[#f16a34] border-t-transparent animate-spin shrink-0" />
        <p className="text-sm font-semibold text-gray-600">Loading your order…</p>
      </div>
    );
  }

  const isCod = order.cod_unpaid || order.is_cod;
  const cancelled = liveIsCancelled(order);
  const active = liveProgressIndex(order, !!isCod);
  const { title, sub } = liveHeadline(order, !!isCod);
  const steps = order.order_type === "delivery" ? liveSteps(order) : liveSteps(order).filter(s => s.id !== "onway");
  const railIndex = order.order_type === "delivery" ? active : active >= 4 ? 3 : active >= 2 ? 2 : active;
  const showRider = order.order_type === "delivery" && !cancelled && !!(order.rider_name || order.rider_phone || order.rider_status);
  const isFinished = liveIsDelivered(order) || cancelled;

  return (
    <div
      ref={panelRef}
      className="rounded-2xl border border-orange-200 bg-gradient-to-br from-[#fff8f4] to-white shadow-[0_4px_32px_rgba(241,106,52,0.12)] overflow-hidden mb-4"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-orange-100">
        <div className="flex items-center gap-2.5 min-w-0">
          {!isFinished && (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f16a34] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#f16a34]" />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#f16a34]">
              #{order.order_number} · {storeDisplayName(store)}
            </p>
            <h2 className="text-[17px] font-extrabold text-gray-900 leading-snug mt-0.5 truncate">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{sub}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 border-0 bg-transparent cursor-pointer text-xl leading-none transition-colors"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Customer phone + address */}
        {(order.customer_mobile ||
          (order.order_type === "delivery" && order.customer_address)) ? (
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 space-y-3">
            <div className="flex gap-2.5">
              <svg className="w-4 h-4 shrink-0 text-[#f16a34] mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <div className="min-w-0 flex-1">
                <OrderContactPhone
                  phone={order.customer_mobile}
                  canChange={
                    !cancelled &&
                    order.can_change_customer_mobile !== false &&
                    !order.customer_mobile_changed
                  }
                  storeId={store.backendStoreId}
                  orderId={order.order_id}
                  tone="account"
                  onChanged={(mobile) => {
                    setOrder((prev) =>
                      prev
                        ? {
                            ...prev,
                            customer_mobile: mobile,
                            customer_mobile_changed: true,
                            can_change_customer_mobile: false,
                          }
                        : prev,
                    );
                    void refreshCustomer();
                  }}
                />
              </div>
            </div>
            {order.order_type === "delivery" && order.customer_address ? (
              <div className="flex gap-2.5">
                <IconPin className="w-4 h-4 shrink-0 text-[#f16a34] mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Delivering to</p>
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{order.customer_address}</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Status boxes */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Order status</p>
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

        {/* COD note */}
        {isCod && !liveIsDelivered(order) && (
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <span className="text-lg">💵</span>
            <div>
              <p className="text-sm font-bold text-amber-800">Pay on delivery</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Keep {formatInr(order.grand_total)} ready when your rider arrives.
              </p>
            </div>
          </div>
        )}

        {/* CTA — full tracking page */}
        <Link
          href={`/order/${encodeURIComponent(orderId)}?store=${encodeURIComponent(storeSlug)}`}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#f16a34] text-white font-extrabold text-sm no-underline active:scale-[0.99] transition-transform"
        >
          <span>View full tracking page</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

/* ─── Order Card (summary list) ──────────────────────────────────────────── */

function OrderCard({ order, highlighted }: { order: CustomerOrderSummary; highlighted?: boolean }) {
  const past = isPastStatus(order.status);
  return (
    <Link
      href={`/order/${encodeURIComponent(order.id)}?store=${encodeURIComponent(order.store_id)}`}
      className={`group block rounded-2xl bg-white px-4 py-3.5 no-underline border transition-all ${
        highlighted
          ? "border-[#f16a34]/40 shadow-[0_0_0_3px_rgba(241,106,52,0.12)]"
          : "border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-xl ${
            past ? "bg-emerald-50 text-emerald-600" : "bg-[#fff4ee] text-[#f16a34]"
          }`}
        >
          {past ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
              <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] sm:text-[15px] font-extrabold text-gray-900 leading-snug">
            {orderStatusHeadline(order.status)}
          </p>
          <p className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5 tabular-nums">
            {order.total_amount != null ? formatInr(order.total_amount) : "-"}
            <span className="mx-1.5 text-gray-300">·</span>
            {formatOrderWhen(order.created_at)}
            {order.cod_unpaid ? (
              <span className="ml-2 text-[10px] font-bold text-[#c2410c]">COD · unpaid</span>
            ) : null}
          </p>
        </div>
        <IconChevron className="w-4 h-4 shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </Link>
  );
}

/* ─── Address Card ───────────────────────────────────────────────────────── */

function AddressCard({
  addr, onDefault, onDelete, busy,
}: {
  addr: WebsiteCustomerAddress;
  onDefault: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-4 py-4">
      <div className="flex gap-3.5">
        <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff4ee] text-[#f16a34]">
          <IconPin className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-gray-100/90 px-2 py-0.5 text-[11px] font-extrabold text-gray-700">
              {addr.label || "Home"}
            </span>
            {addr.is_default ? (
              <span className="text-[11px] font-extrabold text-[#0c831f]">Default</span>
            ) : null}
          </div>
          <p className="text-[13px] text-gray-600 mt-1.5 leading-relaxed">{addr.formatted_address}</p>
          <div className="flex flex-wrap gap-2 mt-3.5">
            {!addr.is_default ? (
              <button
                type="button"
                disabled={busy}
                onClick={onDefault}
                className="text-[12px] font-extrabold text-[#f16a34] bg-[#fff4ee] px-3 py-1.5 rounded-lg cursor-pointer border-0 disabled:opacity-50"
              >
                Set default
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="text-[12px] font-extrabold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer border-0 disabled:opacity-50 hover:text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Address Form ────────────────────────────────────────────────────────── */

const inputClass = "mt-1 w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-[14px] text-gray-900 outline-none focus:border-[#f16a34] focus:ring-2 focus:ring-[#f16a34]/15";
const textareaClass = "mt-1 w-full min-h-[72px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[14px] text-gray-900 outline-none focus:border-[#f16a34] focus:ring-2 focus:ring-[#f16a34]/15 resize-y";

function NewAddressForm({ customer, onCancel, onSaved }: { customer: any, onCancel: () => void, onSaved: () => void }) {
  const [flat, setFlat] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [label, setLabel] = useState("Home");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!flat || !street || !area) {
      setError("Please fill all required fields (*).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createCustomerAddress({
        label: normalizeAddressLabel(label),
        flat: flat.trim(),
        street: street.trim(),
        area: area.trim(),
        landmark: landmark.trim(),
        pincode: pincode.trim(),
        latitude: null,
        longitude: null,
        is_default: customer.addresses.length === 0,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save address.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 space-y-4 mb-1">
      <h3 className="text-[13px] font-extrabold text-gray-900">Add new address</h3>
      {error && <p className="text-xs font-semibold text-[#c2410c] bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">{error}</p>}

      <AddressLabelPicker label={label} onChange={setLabel} />
      
      <label className="block text-xs">
        <span className="font-semibold text-gray-700">Flat / House *</span>
        <input value={flat} onChange={e => setFlat(e.target.value)} className={inputClass} placeholder="402, Tower B" />
      </label>
      <label className="block text-xs">
        <span className="font-semibold text-gray-700">Street / Building *</span>
        <input value={street} onChange={e => setStreet(e.target.value)} className={inputClass} placeholder="Society name, road" />
      </label>
      <label className="block text-xs">
        <span className="font-semibold text-gray-700">Area / Locality *</span>
        <textarea value={area} onChange={e => setArea(e.target.value)} className={textareaClass} rows={2} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs">
          <span className="font-semibold text-gray-700">Landmark</span>
          <input value={landmark} onChange={e => setLandmark(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-xs">
          <span className="font-semibold text-gray-700">PIN</span>
          <input value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" className={inputClass} />
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 h-10 rounded-lg bg-gray-100 text-gray-700 text-xs font-extrabold cursor-pointer hover:bg-gray-200 border-0">Cancel</button>
        <button type="button" disabled={busy} onClick={() => void handleSave()} className="px-6 h-10 rounded-lg bg-[#f16a34] text-white text-xs font-extrabold cursor-pointer disabled:opacity-60 shadow-md border-0">{busy ? "Saving…" : "Save Address"}</button>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */

const navBtn =
  "w-full flex items-center gap-3 px-3 py-2.5 text-left text-[14px] font-semibold border-0 cursor-pointer transition-colors rounded-xl";

function IconBackArrow({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      <h1 className="text-[20px] sm:text-[22px] font-extrabold text-gray-900 tracking-tight">
        {children}
      </h1>
      {action}
    </div>
  );
}

function AccountInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customer, loading, logout, refreshCustomer, openLogin, setCustomer } =
    useWebsiteAuth();
  const [section, setSection] = useState<AccountSection>("orders");
  const [ordersTab, setOrdersTab] = useState<"active" | "past">("past");
  const [orders, setOrders] = useState<{
    active: CustomerOrderSummary[];
    past: CustomerOrderSummary[];
  } | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addrBusy, setAddrBusy] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);

  // Live panel state (set when redirected from COD checkout)
  const [liveOrderId, setLiveOrderId] = useState<string | null>(null);
  const [liveStoreSlug, setLiveStoreSlug] = useState<string | null>(null);

  // Sync section from URL (navbar “Update address”, deep links, etc.)
  useEffect(() => {
    const tab = searchParams.get("tab");
    const orderId = searchParams.get("order");
    const storeSlug = searchParams.get("store");

    if (tab === "addresses") setSection("addresses");
    else if (tab === "profile") setSection("profile");
    else if (tab === "notifications") setSection("notifications");
    else if (tab === "gift-cards" || tab === "gift_cards") setSection("gift_cards");
    else if (tab === "rewards") setSection("rewards");
    else if (tab === "help") setSection("help");
    else setSection("orders");

    if (orderId && storeSlug) {
      // Came from COD checkout → show active tab + live panel
      setOrdersTab("active");
      setLiveOrderId(orderId);
      setLiveStoreSlug(storeSlug);
    }
  }, [searchParams]);

  const goSection = useCallback(
    (s: AccountSection) => {
      setSection(s);
      router.replace(ACCOUNT_TAB_PATH[s], { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    if (!loading && !customer) openLogin();
  }, [loading, customer, openLogin]);

  useEffect(() => {
    if (!customer) return;
    let cancelled = false;
    setOrdersLoading(true);
    fetchCustomerOrders()
      .then((data) => { if (!cancelled) setOrders(data); })
      .catch(() => { if (!cancelled) setOrders({ active: [], past: [] }); })
      .finally(() => { if (!cancelled) setOrdersLoading(false); });
    return () => { cancelled = true; };
  }, [customer]);

  const handleLogout = async () => {
    await logout();
    router.push("/menu");
  };

  const onSetDefault = async (id: string) => {
    setAddrBusy(true);
    try {
      await setDefaultCustomerAddress(id);
      await refreshCustomer();
    } finally {
      setAddrBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    setAddrBusy(true);
    try {
      await deleteCustomerAddress(id);
      await refreshCustomer();
    } finally {
      setAddrBusy(false);
    }
  };

  const shell =
    "min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-72px)] pt-[calc(3.5rem+0.75rem)] sm:pt-[calc(4rem+1rem)] lg:pt-[calc(72px+1.25rem)] bg-white";

  if (loading) {
    return (
      <div className={shell}>
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-24 rounded-2xl bg-white/70 animate-pulse" />
          <div className="mt-4 h-48 rounded-2xl bg-white/70 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className={`${shell} flex items-center justify-center px-4`}>
        <div className="text-center max-w-sm rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ee] text-[#f16a34]">
            <IconProfile className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mb-2">My account</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Log in with your mobile to manage orders, addresses, and more.
          </p>
          <button
            type="button"
            onClick={openLogin}
            className="h-11 w-full rounded-xl bg-[#f16a34] text-white text-sm font-extrabold cursor-pointer border-0"
          >
            Continue with mobile
          </button>
        </div>
      </div>
    );
  }

  const list = ordersTab === "active" ? orders?.active ?? [] : orders?.past ?? [];

  const navItem = (s: AccountSection, label: string, icon: ReactNode) => {
    const active = section === s;
    return (
      <button
        type="button"
        onClick={() => goSection(s)}
        className={`${navBtn} ${
          active
            ? "bg-[#fff4ee] text-[#f16a34]"
            : "bg-transparent text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            active ? "bg-white text-[#f16a34] shadow-sm" : "bg-gray-100 text-gray-500"
          }`}
        >
          {icon}
        </span>
        <span className="flex-1 min-w-0 truncate">{label}</span>
        <IconChevron
          className={`w-4 h-4 shrink-0 ${active ? "text-[#f16a34]/70" : "text-gray-300"}`}
        />
      </button>
    );
  };

  const navLink = (href: string, label: string, icon: ReactNode) => (
    <Link
      href={href}
      className={`${navBtn} text-gray-700 hover:bg-gray-50 no-underline`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
        {icon}
      </span>
      <span className="flex-1 min-w-0 truncate">{label}</span>
      <IconChevron className="w-4 h-4 shrink-0 text-gray-300" />
    </Link>
  );

  return (
    <div className={shell}>
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-[13px] font-semibold text-gray-600 bg-white border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-pointer hover:bg-gray-50 hover:text-gray-900 transition-colors"
          id="btn-back"
          aria-label="Go back"
        >
          <IconBackArrow className="w-4 h-4" />
          <span>Back</span>
        </button>

      <div className="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8">
        <aside className="lg:w-[280px] xl:w-[300px] shrink-0 lg:sticky lg:top-[108px] space-y-3">
          <div className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-4 flex items-center gap-3.5 bg-gradient-to-br from-[#fff8f4] to-white border-b border-black/[0.03]">
              <div className="relative h-14 w-14 shrink-0 rounded-2xl overflow-hidden bg-[#fff4ee] ring-2 ring-white shadow-sm">
                {customer.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={customer.photo_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-[#f16a34]">
                    {(customer.name || customer.phone || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-extrabold text-gray-900 truncate leading-tight">
                  {customer.name || "Your account"}
                </p>
                <p className="text-[13px] text-gray-500 tabular-nums mt-1">
                  +91 {customer.phone}
                </p>
                {customer.email ? (
                  <p className="text-[12px] text-gray-400 truncate mt-0.5">{customer.email}</p>
                ) : null}
              </div>
            </div>

            <nav className="p-2 space-y-0.5">
              <p className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Account
              </p>
              {navItem("profile", "Profile", <IconProfile className="w-[18px] h-[18px]" />)}
              {navItem("orders", "Orders", <IconOrders className="w-[18px] h-[18px]" />)}
              {navItem("addresses", "Addresses", <IconPin className="w-[18px] h-[18px]" />)}
              {navItem("notifications", "Notifications", <IconBell className="w-[18px] h-[18px]" />)}

              <p className="px-3 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Benefits
              </p>
              {navItem("gift_cards", "Gift cards", <IconGift className="w-[18px] h-[18px]" />)}
              {navItem("rewards", "Rewards", <IconRewards className="w-[18px] h-[18px]" />)}

              <p className="px-3 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Support
              </p>
              {navItem("help", "Help Center", <IconHelp className="w-[18px] h-[18px]" />)}
              {navLink("/privacy-policy", "Privacy", <IconLock className="w-[18px] h-[18px]" />)}

              <div className="pt-1 mt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className={`${navBtn} text-gray-600 hover:bg-red-50 hover:text-red-600`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    <IconLogout className="w-[18px] h-[18px]" />
                  </span>
                  <span className="flex-1 text-left">Log out</span>
                </button>
              </div>
            </nav>
          </div>

          <div className="hidden lg:block rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3">
            <AppDownloadPromo compact />
          </div>
        </aside>

        <main className="flex-1 min-w-0 pb-20 lg:pb-6 max-w-none">
          {section === "profile" ? (
            <AccountProfileForm
              key={customer.id}
              customer={customer}
              onSaved={(c) => setCustomer(c)}
            />
          ) : section === "notifications" ? (
            <>
              <PageTitle>Notifications</PageTitle>
              <AccountNotificationsForm
                key={`${customer.id}-notif`}
                customer={customer}
                onSaved={(c) => setCustomer(c)}
              />
            </>
          ) : section === "gift_cards" ? (
            <ComingSoonPanel
              title="Gift cards"
              blurb="Buy and redeem SVS Food gift cards soon — perfect for sharing a meal with someone special."
            />
          ) : section === "rewards" ? (
            <ComingSoonPanel
              title="Rewards"
              blurb="Earn points on every order and unlock member perks. Loyalty rewards are on the way."
            />
          ) : section === "help" ? (
            <>
              <PageTitle>Help Center</PageTitle>
              <AccountHelpCenter />
            </>
          ) : section === "orders" ? (
            <>
              <PageTitle>Orders</PageTitle>

              {liveOrderId && liveStoreSlug && (
                <div className="mb-4">
                  <LiveOrderPanel
                    orderId={liveOrderId}
                    storeSlug={liveStoreSlug}
                    onDismiss={() => {
                      setLiveOrderId(null);
                      setLiveStoreSlug(null);
                      router.replace("/account", { scroll: false });
                    }}
                  />
                </div>
              )}

              <div className="inline-flex p-1 rounded-xl bg-white border border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.03)] mb-4">
                <button
                  type="button"
                  onClick={() => setOrdersTab("active")}
                  className={`px-4 py-2 rounded-lg text-[13px] font-extrabold cursor-pointer border-0 transition-colors ${
                    ordersTab === "active"
                      ? "bg-[#0c831f] text-white shadow-sm"
                      : "bg-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersTab("past")}
                  className={`px-4 py-2 rounded-lg text-[13px] font-extrabold cursor-pointer border-0 transition-colors ${
                    ordersTab === "past"
                      ? "bg-[#0c831f] text-white shadow-sm"
                      : "bg-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Past
                </button>
              </div>

              <div className="space-y-2.5">
                {ordersLoading ? (
                  <div className="rounded-2xl bg-white border border-black/[0.04] px-5 py-10 text-center text-sm text-gray-500">
                    Loading orders…
                  </div>
                ) : list.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                      <IconOrders className="w-6 h-6" />
                    </div>
                    <p className="text-[14px] font-bold text-gray-800">
                      No {ordersTab} orders yet
                    </p>
                    <p className="text-[13px] text-gray-500 mt-1">
                      When you order, it will show up here.
                    </p>
                    <Link
                      href="/menu"
                      className="inline-flex mt-5 h-10 items-center px-5 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold no-underline"
                    >
                      Browse menu
                    </Link>
                  </div>
                ) : (
                  list.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      highlighted={o.id === liveOrderId}
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <PageTitle
                action={
                  !addingAddress ? (
                    <button
                      type="button"
                      onClick={() => setAddingAddress(true)}
                      className="h-9 px-3.5 rounded-xl text-[13px] font-extrabold bg-[#fff4ee] text-[#f16a34] cursor-pointer hover:bg-orange-100 transition-colors border-0"
                    >
                      + Add new
                    </button>
                  ) : null
                }
              >
                Addresses
              </PageTitle>
              <div className="space-y-2.5">
                {addingAddress && (
                  <NewAddressForm
                    customer={customer}
                    onCancel={() => setAddingAddress(false)}
                    onSaved={async () => {
                      setAddingAddress(false);
                      await refreshCustomer();
                    }}
                  />
                )}

                {customer.addresses.length === 0 && !addingAddress ? (
                  <div className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4ee] text-[#f16a34]">
                      <IconPin className="w-6 h-6" />
                    </div>
                    <p className="text-[14px] font-bold text-gray-800">No saved addresses</p>
                    <p className="text-[13px] text-gray-500 mt-1 leading-relaxed max-w-xs mx-auto">
                      Add one for faster delivery checkout next time.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAddingAddress(true)}
                      className="inline-flex mt-5 h-10 items-center px-5 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold border-0 cursor-pointer"
                    >
                      Add address
                    </button>
                  </div>
                ) : (
                  customer.addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      addr={addr}
                      busy={addrBusy}
                      onDefault={() => void onSetDefault(addr.id)}
                      onDelete={() => void onDelete(addr.id)}
                    />
                  ))
                )}
              </div>
            </>
          )}

          <div className="lg:hidden mt-6 rounded-2xl bg-white border border-black/[0.04] p-3">
            <AppDownloadPromo />
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-white flex items-center justify-center"><p className="text-sm text-gray-500">Loading…</p></div>}>
      <AccountInner />
    </Suspense>
  );
}
