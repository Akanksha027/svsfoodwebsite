"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";

// ─── Icons ────────────────────────────────────────────────────────────────────

const ic = "w-3.5 h-3.5 shrink-0";

function IcBanknote() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}
function IcCheckCircle() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-5" />
    </svg>
  );
}
function IcFlame() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8.5 14.5A2.5 2.5 0 0011 17c1.38 0 2.5-1.12 2.5-2.5 0-1.38-.5-2.5-2-3.5 0 .5-.5 1-1 1-.5 0-1-.5-1-1C7.5 12.5 8.5 14.5 8.5 14.5z" />
      <path d="M12 22c4.418 0 8-2.686 8-6 0-5-4-8-6-10-1 2-2 3-4 3-2.5 0-4-2-4-4C4 9 3 12 3 14c0 4.418 4.03 8 9 8z" />
    </svg>
  );
}
function IcStar() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IcPerson() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
    </svg>
  );
}
function IcStore() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IcMotorbike() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="5" cy="17" r="2.5" />
      <circle cx="19" cy="17" r="2.5" />
      <path d="M14 17H10M5 14.5l3-5h5l3 2.5h3" />
      <path d="M12 9.5V7l2-1.5" />
    </svg>
  );
}
function IcMapPin() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function IcGift() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  );
}
function IcXCircle() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}
function IcBag() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type MockOrder = {
  order_id: string;
  order_number: string | number;
  order_type: string;
  status: string;
  grand_total: number;
  subtotal: number;
  gst_amount: number;
  delivery_charges?: number;
  customer_mobile?: string | null;
  customer_name?: string | null;
  customer_address?: string | null;
  customer_latitude?: number | null;
  customer_longitude?: number | null;
  petpooja_status?: string | null;
  rider_name?: string | null;
  rider_phone?: string | null;
  rider_status?: string | null;
  is_cod?: boolean;
  cod_unpaid?: boolean;
  items: { name: string; quantity: number }[];
};

type MockState = {
  id: string;
  label: string;
  icon: ReactNode;
  order: MockOrder;
};

// ─── Store & base order ────────────────────────────────────────────────────────

const STORE_LAT = 24.5754;
const STORE_LNG = 80.8322;
const STORE_NAME = "SVS Food · Satna";

const BASE_DELIVERY: MockOrder = {
  order_id: "mock_001",
  order_number: 4217,
  order_type: "delivery",
  status: "paid",
  grand_total: 387,
  subtotal: 360,
  gst_amount: 25,
  delivery_charges: 30,
  customer_mobile: "9876543210",
  customer_name: "Rahul Sharma",
  customer_address: "42, Green Park Colony, Behind City Mall, Satna 485001",
  customer_latitude: 24.582,
  customer_longitude: 80.838,
  rider_name: null,
  rider_phone: null,
  rider_status: null,
  petpooja_status: null,
  items: [
    { name: "SVS Special Burger", quantity: 2 },
    { name: "Crispy Fries (Large)", quantity: 1 },
    { name: "Mango Shake", quantity: 2 },
  ],
};

const MOCK_STATES: MockState[] = [
  {
    id: "placed_cod",
    label: "COD Placed",
    icon: <IcBanknote />,
    order: { ...BASE_DELIVERY, status: "cod_pending", is_cod: true, cod_unpaid: false, rider_status: null, petpooja_status: null },
  },
  {
    id: "placed_paid",
    label: "Paid & Placed",
    icon: <IcCheckCircle />,
    order: { ...BASE_DELIVERY, status: "paid", rider_status: null, petpooja_status: null },
  },
  {
    id: "preparing",
    label: "Preparing",
    icon: <IcFlame />,
    order: { ...BASE_DELIVERY, petpooja_status: "accepted", rider_status: null },
  },
  {
    id: "ready",
    label: "Food Ready",
    icon: <IcStar />,
    order: { ...BASE_DELIVERY, petpooja_status: "food_ready", rider_status: null },
  },
  {
    id: "rider_assigned",
    label: "Rider Assigned",
    icon: <IcPerson />,
    order: { ...BASE_DELIVERY, petpooja_status: "food_ready", rider_name: "Vikram Singh", rider_phone: "9812345678", rider_status: "assigned" },
  },
  {
    id: "rider_at_store",
    label: "Rider at Store",
    icon: <IcStore />,
    order: { ...BASE_DELIVERY, petpooja_status: "food_ready", rider_name: "Vikram Singh", rider_phone: "9812345678", rider_status: "arrived_at_store" },
  },
  {
    id: "out_for_delivery",
    label: "Out for Delivery",
    icon: <IcMotorbike />,
    order: { ...BASE_DELIVERY, petpooja_status: "dispatched", rider_name: "Vikram Singh", rider_phone: "9812345678", rider_status: "out_for_delivery" },
  },
  {
    id: "arrived",
    label: "Rider Arrived",
    icon: <IcMapPin />,
    order: { ...BASE_DELIVERY, petpooja_status: "dispatched", rider_name: "Vikram Singh", rider_phone: "9812345678", rider_status: "arrived_at_customer" },
  },
  {
    id: "delivered",
    label: "Delivered",
    icon: <IcGift />,
    order: { ...BASE_DELIVERY, status: "completed", petpooja_status: "delivered", rider_name: "Vikram Singh", rider_phone: "9812345678", rider_status: "delivered" },
  },
  {
    id: "cancelled",
    label: "Cancelled",
    icon: <IcXCircle />,
    order: { ...BASE_DELIVERY, status: "cancelled", rider_status: null, petpooja_status: "cancelled" },
  },
  {
    id: "takeaway",
    label: "Takeaway - Ready",
    icon: <IcBag />,
    order: { ...BASE_DELIVERY, order_type: "takeaway", delivery_charges: 0, customer_address: null, petpooja_status: "food_ready", rider_name: null, rider_phone: null, rider_status: null },
  },
];

// ─── Logic ─────────────────────────────────────────────────────────────────────

function isCancelled(o: MockOrder) {
  return o.status === "cancelled" || o.petpooja_status === "cancelled";
}
function isDelivered(o: MockOrder) {
  return o.rider_status === "delivered" || o.petpooja_status === "delivered" || o.status === "completed";
}
function progressIndex(o: MockOrder, isCod: boolean): number {
  if (isCancelled(o)) return -1;
  if (isDelivered(o)) return 4;
  const rs = o.rider_status;
  if (rs === "out_for_delivery" || rs === "arrived_at_customer") return 3;
  if (rs === "picked_up" || rs === "arrived_at_store" || o.petpooja_status === "food_ready") return 2;
  if (o.petpooja_status === "accepted") return 1;
  if (rs === "accepted" || rs === "assigned") return o.petpooja_status === "food_ready" ? 2 : 1;
  if (o.petpooja_status === "dispatched") return 2;
  if (o.status === "paid" || o.status === "cod_pending" || (isCod && o.status === "pending_payment")) return 0;
  return 0;
}
function headline(o: MockOrder, isCod: boolean): { title: string; sub: string } {
  if (isCancelled(o)) return { title: "Order cancelled", sub: "This order is no longer active." };
  if (isDelivered(o)) return { title: "Order delivered", sub: "Hope you enjoy your meal!" };
  const rs = o.rider_status;
  if (rs === "arrived_at_customer") return { title: "Rider has arrived", sub: "Your rider is at your location." };
  if (rs === "out_for_delivery") return { title: "Out for delivery", sub: "Your rider is on the way to you." };
  if (rs === "picked_up") return { title: "Rider picked up your order", sub: "Leaving for your address shortly." };
  if (rs === "arrived_at_store") return { title: "Rider at the restaurant", sub: o.rider_name ? `${o.rider_name} is at the store collecting your order.` : "Your rider is at the store." };
  if (rs === "accepted" || rs === "assigned") return { title: "Rider assigned", sub: o.rider_name ? `${o.rider_name} will deliver your order.` : "A rider will deliver your order soon." };
  if (o.petpooja_status === "food_ready") return { title: "Order is ready", sub: o.order_type === "delivery" ? "Waiting for a rider to pick it up." : "You can collect it from the counter." };
  if (o.petpooja_status === "dispatched") return { title: "Order is ready", sub: "Your rider will start the trip next." };
  if (o.petpooja_status === "accepted") return { title: "Preparing your order", sub: "The kitchen has started cooking." };
  if (isCod) return { title: "Order placed", sub: "Pay cash on delivery. We'll keep you updated here." };
  return { title: "Order confirmed", sub: "We've sent it to the kitchen." };
}

type TrackStep = { id: string; title: string; subtitle: string };

function stepsFor(o: MockOrder): TrackStep[] {
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

function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

// ─── Mock COD Pay Panel (static — mirrors CodOnlinePayPanel idle state, no API) ───────

function MockCodPayPanel({ amount, orderLabel }: { amount: number; orderLabel?: string }) {
  const [showQr, setShowQr] = useState(false);

  if (showQr) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#f16a34]">Scan &amp; Pay</p>
            <p className="text-xl font-extrabold text-gray-900 tabular-nums mt-0.5">{formatInr(amount)}</p>
          </div>
          {orderLabel && <p className="text-xs font-semibold text-gray-400">{orderLabel}</p>}
        </div>
        <div className="px-4 py-5 flex flex-col items-center gap-4">
          {/* Static placeholder QR */}
          <div className="w-[192px] h-[192px] rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <path d="M14 14h.01M14 18h.01M18 14h.01M18 18h.01" />
            </svg>
          </div>
          <p className="text-xs text-gray-400 text-center">PhonePe · Google Pay · Paytm · any UPI app</p>
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-gray-900 text-white font-bold text-sm border-0 cursor-pointer"
          >
            Open UPI app
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#f16a34] animate-pulse" />
            <p className="text-sm font-semibold text-[#f16a34]">Waiting for payment…</p>
          </div>
          <button
            type="button"
            onClick={() => setShowQr(false)}
            className="text-xs text-gray-400 border-0 bg-transparent cursor-pointer underline"
          >
            ← back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-[#fff4ee] flex items-center justify-center text-[#f16a34]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-extrabold text-gray-900">Pay now, ride smooth</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
            Skip the cash hand-off. PhonePe, GPay, or any UPI - done in seconds.
          </p>
        </div>
      </div>
      <div className="mx-4 border-t border-gray-100" />
      <div className="px-4 py-3 space-y-2">
        <button
          type="button"
          onClick={() => setShowQr(true)}
          className="w-full h-[48px] rounded-xl bg-[#f16a34] text-white font-extrabold text-[15px] border-0 cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            <path d="M14 14h.01M14 18h.01M18 14h.01M18 18h.01" />
          </svg>
          Pay {formatInr(amount)} now
        </button>
        <p className="text-[11px] text-gray-400 text-center">PhonePe · Google Pay · Paytm · any UPI</p>
      </div>
    </div>
  );
}

// ─── Step Rail ─────────────────────────────────────────────────────────────────

function StepRail({ steps, activeIndex, cancelled }: { steps: TrackStep[]; activeIndex: number; cancelled: boolean }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => {
        const done = !cancelled && activeIndex > i;
        const current = !cancelled && activeIndex === i;
        const muted = cancelled || activeIndex < i;
        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={[
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold border-2 transition-colors",
                  done
                    ? "bg-[#2d9e75] border-[#2d9e75] text-white"
                    : current
                      ? "bg-[#f16a34] border-[#f16a34] text-white animate-pulse"
                      : "bg-white border-gray-200 text-gray-300",
                ].join(" ")}
              >
                {done ? "✓" : i + 1}
              </span>
              {i < steps.length - 1 ? (
                <span className={["w-0.5 flex-1 min-h-[22px] my-1 rounded-full", done ? "bg-[#2d9e75]/50" : "bg-gray-100"].join(" ")} />
              ) : null}
            </div>
            <div className={`pb-4 ${muted ? "opacity-40" : ""}`}>
              <p className={["text-sm font-extrabold leading-tight", current ? "text-[#f16a34]" : "text-[#1a1a1a]"].join(" ")}>
                {step.title}
              </p>
              <p className="text-xs text-[#1a1a1a]/45 mt-0.5">{step.subtitle}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Mock Order View (mirrors real /order/[id] page exactly) ──────────────────

function MockOrderView({ order }: { order: MockOrder }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isCod = !!(order.is_cod || order.cod_unpaid);
  const cancelled = isCancelled(order);
  const active = progressIndex(order, isCod);
  const { title, sub } = headline(order, isCod);
  const steps = order.order_type === "delivery"
    ? stepsFor(order)
    : stepsFor(order).filter(s => s.id !== "onway");
  const railIndex = order.order_type === "delivery"
    ? active
    : active >= 4 ? 3 : active >= 2 ? 2 : active;
  const showRider =
    order.order_type === "delivery" &&
    !cancelled &&
    !!(order.rider_name || order.rider_phone || order.rider_status);

  const mapUrl =
    order.customer_latitude && order.customer_longitude && order.order_type === "delivery"
      ? `https://maps.google.com/maps?saddr=${STORE_LAT},${STORE_LNG}&daddr=${order.customer_latitude},${order.customer_longitude}&hl=en&z=14&output=embed`
      : `https://maps.google.com/maps?q=${STORE_LAT},${STORE_LNG}&z=15&hl=en&output=embed`;

  return (
    <main className="relative min-h-[100svh] bg-[#eef1f4] overflow-hidden">
      {/* Map */}
      <div className="absolute inset-x-0 top-0 h-[48svh] sm:h-[52svh]">
        <iframe
          title="Delivery map"
          src={mapUrl}
          className="h-full w-full border-0 grayscale-[0.15] contrast-[1.05]"
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#eef1f4] to-transparent" />

        <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 z-10 inline-flex h-10 items-center gap-1.5 rounded-full bg-amber-400 px-4 text-sm font-extrabold text-amber-900 shadow-md">
          🧪 MOCK
        </div>

        <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-10 rounded-full bg-white/95 px-3 py-2 text-[11px] font-bold text-[#1a1a1a]/60 shadow-md backdrop-blur">
          Live · updates every few sec
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="relative z-10 mt-[42svh] sm:mt-[46svh] px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-[480px] rounded-t-[1.75rem] rounded-b-[1.5rem] bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.12)] overflow-hidden">
          <div className="flex justify-center pt-3 pb-1">
            <span className="h-1 w-10 rounded-full bg-[#1a1a1a]/15" />
          </div>

          <div className="px-5 pt-2 pb-5 space-y-5">
            {/* Headline */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#f16a34] mb-1">
                #{order.order_number} · {STORE_NAME}
              </p>
              <h1 className="text-[1.65rem] sm:text-[1.85rem] font-extrabold text-[#1a1a1a] leading-[1.15] tracking-tight">
                {title}
              </h1>
              <p className="mt-1.5 text-sm text-[#1a1a1a]/55 leading-relaxed">{sub}</p>
            </div>

            {/* COD Pay Panel — static mock (no API calls in test) */}
            {isCod && !isDelivered(order) && !cancelled && (
              <MockCodPayPanel
                amount={order.grand_total}
                orderLabel={`#${order.order_number}`}
              />
            )}

            {/* Rider card */}
            {showRider && (
              <div className="flex items-center gap-3 rounded-2xl border border-[#fff4ee] bg-[#fff4ee]/60 px-3.5 py-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f16a34] text-white text-lg font-extrabold">
                  {(order.rider_name || "R").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#1a1a1a]/40">Your rider</p>
                  <p className="truncate font-extrabold text-[#1a1a1a]">{order.rider_name || "Assigned"}</p>
                  {order.rider_status ? (
                    <p className="text-xs font-semibold text-[#1a1a1a]/45 capitalize">
                      {order.rider_status.replace(/_/g, " ")}
                    </p>
                  ) : null}
                </div>
                {order.rider_phone ? (
                  <div className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] px-4 text-sm font-extrabold text-white">
                    Call
                  </div>
                ) : null}
              </div>
            )}

            {/* Status rail */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#1a1a1a]/35 mb-3">
                Order status
              </p>
              <StepRail
                steps={steps}
                activeIndex={cancelled ? -1 : railIndex}
                cancelled={cancelled}
              />
            </div>

            {/* Delivery address */}
            {order.order_type === "delivery" && order.customer_address ? (
              <div className="rounded-2xl border border-[#fff4ee] px-4 py-3">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#1a1a1a]/35 mb-1">
                  Delivering to
                </p>
                <p className="text-sm font-semibold text-[#1a1a1a] leading-snug">
                  {order.customer_address}
                </p>
              </div>
            ) : null}

            {/* Order details accordion */}
            <div className="rounded-2xl border border-[#fff4ee] overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                onClick={() => setDetailsOpen(v => !v)}
              >
                <span className="text-sm font-extrabold text-[#1a1a1a]">
                  Order details · {formatInr(order.grand_total)}
                </span>
                <span className="text-[#1a1a1a]/40 font-bold text-lg leading-none">
                  {detailsOpen ? "−" : "+"}
                </span>
              </button>
              {detailsOpen ? (
                <div className="border-t border-[#fff4ee] px-4 py-3 space-y-2 text-sm text-[#1a1a1a]/70">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#1a1a1a]/45">Type</span>
                    <span className="font-semibold capitalize">{order.order_type.replace(/_/g, " ")}</span>
                  </div>
                  {isCod ? (
                    <div className="flex justify-between gap-3">
                      <span className="text-[#1a1a1a]/45">Payment</span>
                      <span className="font-semibold">Cash on delivery</span>
                    </div>
                  ) : null}
                  {order.customer_mobile ? (
                    <div className="flex justify-between gap-3">
                      <span className="text-[#1a1a1a]/45">Phone</span>
                      <span className="font-semibold">{order.customer_mobile}</span>
                    </div>
                  ) : null}
                  {order.delivery_charges ? (
                    <div className="flex justify-between gap-3">
                      <span className="text-[#1a1a1a]/45">Delivery</span>
                      <span className="font-semibold">{formatInr(order.delivery_charges)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3">
                    <span className="text-[#1a1a1a]/45">Total</span>
                    <span className="font-extrabold text-[#1a1a1a]">{formatInr(order.grand_total)}</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 border-t border-[#fff4ee] pt-2">
                    {order.items.map((line, i) => (
                      <li key={i} className="flex justify-between gap-3">
                        <span className="min-w-0 truncate">{line.name}</span>
                        <span className="shrink-0 font-semibold">×{line.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <Link
              href="/menu"
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#f16a34] text-white font-extrabold no-underline active:scale-[0.99] transition-transform"
            >
              Order more
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Test Page Shell ──────────────────────────────────────────────────────────

export default function TestPage() {
  const [activeId, setActiveId] = useState(MOCK_STATES[0]!.id);
  const activeState = MOCK_STATES.find(s => s.id === activeId)!;

  return (
    <div className="relative">
      {/* The actual tracking UI */}
      <div className="pb-28">
        <MockOrderView key={activeId} order={activeState.order} />
      </div>

      {/* Fixed bottom state switcher */}
      <div
        className="fixed bottom-0 inset-x-0 z-[9999] bg-gray-950/97 backdrop-blur-md border-t border-white/10 px-4 pt-3"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">
          Mock states - tap to switch
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {MOCK_STATES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={[
                "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border-0 cursor-pointer transition-all whitespace-nowrap",
                activeId === s.id
                  ? "bg-[#f16a34] text-white shadow-[0_0_16px_rgba(241,106,52,0.4)]"
                  : "bg-white/10 text-white/70 hover:bg-white/20",
              ].join(" ")}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
