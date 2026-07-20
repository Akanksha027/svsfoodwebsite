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
  type CustomerOrderSummary,
  type WebsiteCustomerAddress,
} from "@/lib/website-customer-api";
import { formatInr } from "@/lib/menu-api";
import { fetchOrder } from "@/lib/orders-api";
import { resolveStoreLocation, storeDisplayName } from "@/data/locations";

type AccountSection = "orders" | "addresses";
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

function IconMotorbike({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="5" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="19" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M14 17H10M5 14.5l3-5h5l3 2.5h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9.5V7l2-1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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
        {/* Rider card */}
        {showRider && (
          <div className="flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3">
            <div className="h-11 w-11 shrink-0 flex items-center justify-center rounded-full bg-[#f16a34] text-white font-extrabold text-lg">
              {(order.rider_name || "R").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Your rider</p>
              <p className="font-extrabold text-white truncate">{order.rider_name || "Assigned"}</p>
              {order.rider_status && (
                <p className="text-xs text-white/50 capitalize flex items-center gap-1 mt-0.5">
                  <IconMotorbike className="w-3.5 h-3.5" />
                  {order.rider_status.replace(/_/g, " ")}
                </p>
              )}
            </div>
            {order.rider_phone && (
              <a
                href={`tel:${order.rider_phone}`}
                className="shrink-0 h-10 px-4 rounded-full bg-[#f16a34] text-white text-sm font-extrabold no-underline flex items-center justify-center"
              >
                Call
              </a>
            )}
          </div>
        )}

        {/* Status rail */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Order status</p>
          <ol className="space-y-0">
            {steps.map((step, i) => {
              const done = !cancelled && railIndex > i;
              const current = !cancelled && railIndex === i;
              const muted = cancelled || railIndex < i;
              return (
                <li key={step.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={[
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold border-2 transition-all duration-500",
                        done
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : current
                            ? "bg-[#f16a34] border-[#f16a34] text-white animate-pulse"
                            : "bg-white border-gray-200 text-gray-300",
                      ].join(" ")}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    {i < steps.length - 1 && (
                      <span
                        className={[
                          "w-0.5 flex-1 min-h-[22px] my-1 rounded-full transition-colors duration-500",
                          done ? "bg-emerald-400/60" : "bg-gray-100",
                        ].join(" ")}
                      />
                    )}
                  </div>
                  <div className={`pb-3.5 ${muted ? "opacity-35" : ""}`}>
                    <p className={["text-sm font-extrabold leading-tight", current ? "text-[#f16a34]" : "text-gray-900"].join(" ")}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.subtitle}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Delivery address */}
        {order.order_type === "delivery" && order.customer_address && (
          <div className="flex gap-2.5 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <IconPin className="w-4 h-4 shrink-0 text-[#f16a34] mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Delivering to</p>
              <p className="text-sm font-semibold text-gray-800 leading-snug">{order.customer_address}</p>
            </div>
          </div>
        )}

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
      className={`block rounded-xl border bg-white px-4 py-3.5 no-underline shadow-sm hover:border-gray-300 hover:shadow transition-all ${
        highlighted ? "border-[#f16a34]/50 ring-2 ring-[#f16a34]/20" : "border-gray-200/90"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-full ${
            past ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-[#f16a34]"
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
          <p className="text-[15px] font-bold text-gray-900 leading-snug">
            {orderStatusHeadline(order.status)}
          </p>
          <p className="text-[13px] text-gray-500 mt-0.5 tabular-nums">
            {order.total_amount != null ? formatInr(order.total_amount) : "-"}
            <span className="mx-1.5 text-gray-300">•</span>
            {formatOrderWhen(order.created_at)}
            {order.cod_unpaid ? (
              <span className="ml-2 text-[10px] font-bold text-[#c2410c]">COD · unpaid</span>
            ) : null}
          </p>
        </div>
        <IconChevron className="w-5 h-5 shrink-0 text-gray-400" />
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
    <div className="rounded-xl border border-gray-200/90 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex gap-3">
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          <IconPin className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-gray-900">
            {addr.label}
            {addr.is_default ? (
              <span className="ml-2 text-[11px] font-bold text-[#f16a34]">Default</span>
            ) : null}
          </p>
          <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">{addr.formatted_address}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {!addr.is_default ? (
              <button
                type="button"
                disabled={busy}
                onClick={onDefault}
                className="text-[12px] font-bold text-[#f16a34] bg-orange-50 px-3 py-1.5 rounded-lg cursor-pointer border-0 disabled:opacity-50"
              >
                Set default
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="text-[12px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg cursor-pointer border-0 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */

const navBtn =
  "w-full flex items-center gap-3 px-4 py-3 text-left text-[15px] font-medium border-0 cursor-pointer transition-colors";

function AccountInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customer, loading, logout, refreshCustomer, openLogin } = useWebsiteAuth();
  const [section, setSection] = useState<AccountSection>("orders");
  const [ordersTab, setOrdersTab] = useState<"active" | "past">("past");
  const [orders, setOrders] = useState<{
    active: CustomerOrderSummary[];
    past: CustomerOrderSummary[];
  } | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addrBusy, setAddrBusy] = useState(false);

  // Live panel state (set when redirected from COD checkout)
  const [liveOrderId, setLiveOrderId] = useState<string | null>(null);
  const [liveStoreSlug, setLiveStoreSlug] = useState<string | null>(null);

  // On mount: read URL params to set up the correct state
  useEffect(() => {
    const tab = searchParams.get("tab");
    const orderId = searchParams.get("order");
    const storeSlug = searchParams.get("store");

    setSection(tab === "addresses" ? "addresses" : "orders");

    if (orderId && storeSlug) {
      // Came from COD checkout → show active tab + live panel
      setOrdersTab("active");
      setLiveOrderId(orderId);
      setLiveStoreSlug(storeSlug);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goSection = useCallback(
    (s: AccountSection) => {
      setSection(s);
      const path = s === "addresses" ? "/account?tab=addresses" : "/account";
      router.replace(path, { scroll: false });
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
    "min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-72px)] pt-14 sm:pt-16 lg:pt-[72px] bg-[#f4f5f7]";

  if (loading) {
    return (
      <div className={shell}>
        <p className="p-6 text-sm text-gray-500">Loading account…</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className={`${shell} flex items-center justify-center px-4`}>
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-extrabold text-gray-900 mb-2">My account</h1>
          <p className="text-sm text-gray-600 mb-6">
            Log in with your mobile to see orders and saved addresses.
          </p>
          <button
            type="button"
            onClick={openLogin}
            className="h-11 px-6 rounded-xl bg-gray-900 text-white text-sm font-extrabold cursor-pointer border-0"
          >
            Continue with mobile
          </button>
        </div>
      </div>
    );
  }

  const list = ordersTab === "active" ? orders?.active ?? [] : orders?.past ?? [];

  const navItem = (s: AccountSection, label: string, icon: ReactNode) => (
    <button
      type="button"
      onClick={() => goSection(s)}
      className={`${navBtn} ${
        section === s
          ? "bg-gray-100 text-gray-900 font-semibold"
          : "bg-transparent text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span className="text-gray-500">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className={shell}>
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row lg:items-stretch">
        {/* Sidebar */}
        <aside className="lg:w-[272px] shrink-0 lg:sticky lg:top-[72px] lg:max-h-[calc(100dvh-72px)] lg:overflow-y-auto bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
          <div className="px-4 py-4 lg:py-5 border-b border-gray-100">
            <p className="text-[15px] font-bold text-gray-900 tabular-nums">+91 {customer.phone}</p>
            {customer.name ? (
              <p className="text-[13px] text-gray-500 mt-0.5 truncate">{customer.name}</p>
            ) : null}
          </div>

          <nav className="py-2 flex-1">
            {navItem("addresses", "My Addresses", <IconPin />)}
            {navItem("orders", "My Orders", <IconOrders />)}
            <Link
              href="/privacy-policy"
              className={`${navBtn} text-gray-700 hover:bg-gray-50 no-underline`}
            >
              <span className="text-gray-500"><IconLock /></span>
              Account privacy
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className={`${navBtn} text-gray-700 hover:bg-gray-50 mt-1`}
            >
              <span className="text-gray-500"><IconLogout /></span>
              Logout
            </button>
          </nav>

          <div className="hidden lg:block border-t border-gray-100 p-4">
            <AppDownloadPromo compact />
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-10">
          {section === "orders" ? (
            <>
              <h1 className="text-[22px] font-extrabold text-gray-900 mb-4 lg:mb-5">My Orders</h1>

              {/* Live tracking panel — shown right at the top when redirected from COD checkout */}
              {liveOrderId && liveStoreSlug && (
                <LiveOrderPanel
                  orderId={liveOrderId}
                  storeSlug={liveStoreSlug}
                  onDismiss={() => {
                    setLiveOrderId(null);
                    setLiveStoreSlug(null);
                    // Clean URL params
                    router.replace("/account", { scroll: false });
                  }}
                />
              )}

              {/* Active / Past tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setOrdersTab("active")}
                  className={`px-4 py-2 rounded-full text-[13px] font-bold cursor-pointer border transition-colors ${
                    ordersTab === "active"
                      ? "bg-white border-gray-900 text-gray-900 shadow-sm"
                      : "bg-transparent border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersTab("past")}
                  className={`px-4 py-2 rounded-full text-[13px] font-bold cursor-pointer border transition-colors ${
                    ordersTab === "past"
                      ? "bg-white border-gray-900 text-gray-900 shadow-sm"
                      : "bg-transparent border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Past
                </button>
              </div>

              <div className="space-y-3 max-w-2xl">
                {ordersLoading ? (
                  <p className="text-sm text-gray-500 py-8">Loading orders…</p>
                ) : list.length === 0 ? (
                  <div className="rounded-xl bg-white border border-gray-200 px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      No {ordersTab} orders yet.
                    </p>
                    <Link
                      href="/menu"
                      className="inline-block mt-4 text-sm font-bold text-[#f16a34] no-underline"
                    >
                      Order from menu →
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
              <h1 className="text-[22px] font-extrabold text-gray-900 mb-4 lg:mb-5">My Addresses</h1>
              <div className="space-y-3 max-w-2xl">
                {customer.addresses.length === 0 ? (
                  <div className="rounded-xl bg-white border border-gray-200 px-6 py-12 text-center">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      No saved addresses yet. Add one when you checkout delivery while logged in.
                    </p>
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

          <div className="lg:hidden mt-8 max-w-2xl">
            <AppDownloadPromo />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#f4f5f7] flex items-center justify-center"><p className="text-sm text-gray-500">Loading…</p></div>}>
      <AccountInner />
    </Suspense>
  );
}
