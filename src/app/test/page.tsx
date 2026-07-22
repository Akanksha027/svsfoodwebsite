"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import OrderStatusRail from "@/components/OrderStatusRail";
import OrderContactPhone from "@/components/OrderContactPhone";
import OrderStageScene, {
  STAGE_LABELS,
  stageFromOrder,
} from "@/components/OrderStageScene";

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
  customer_mobile_changed?: boolean;
  can_change_customer_mobile?: boolean;
  customer_name?: string | null;
  customer_address?: string | null;
  address_label?: string | null;
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

const STORE_NAME = "SVS Food · Satna";
const STORE_LAT = 24.5754;
const STORE_LNG = 80.8322;

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
  customer_mobile_changed: false,
  can_change_customer_mobile: true,
  customer_name: "Rahul Sharma",
  customer_address: "42, Green Park Colony, Behind City Mall, Satna 485001",
  address_label: "Home",
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
    order: {
      ...BASE_DELIVERY,
      status: "cod_pending",
      is_cod: true,
      cod_unpaid: false,
      rider_status: null,
      petpooja_status: null,
    },
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
    order: {
      ...BASE_DELIVERY,
      petpooja_status: "food_ready",
      rider_name: "Vikram Singh",
      rider_phone: "9812345678",
      rider_status: "assigned",
    },
  },
  {
    id: "rider_at_store",
    label: "Rider at Store",
    icon: <IcStore />,
    order: {
      ...BASE_DELIVERY,
      petpooja_status: "food_ready",
      rider_name: "Vikram Singh",
      rider_phone: "9812345678",
      rider_status: "arrived_at_store",
    },
  },
  {
    id: "out_for_delivery",
    label: "Out for Delivery",
    icon: <IcMotorbike />,
    order: {
      ...BASE_DELIVERY,
      petpooja_status: "dispatched",
      rider_name: "Vikram Singh",
      rider_phone: "9812345678",
      rider_status: "out_for_delivery",
    },
  },
  {
    id: "arrived",
    label: "Rider Arrived",
    icon: <IcMapPin />,
    order: {
      ...BASE_DELIVERY,
      petpooja_status: "dispatched",
      rider_name: "Vikram Singh",
      rider_phone: "9812345678",
      rider_status: "arrived_at_customer",
    },
  },
  {
    id: "delivered",
    label: "Delivered",
    icon: <IcGift />,
    order: {
      ...BASE_DELIVERY,
      status: "completed",
      petpooja_status: "delivered",
      rider_name: "Vikram Singh",
      rider_phone: "9812345678",
      rider_status: "delivered",
    },
  },
  {
    id: "cancelled",
    label: "Cancelled",
    icon: <IcXCircle />,
    order: {
      ...BASE_DELIVERY,
      status: "cancelled",
      rider_status: null,
      petpooja_status: "cancelled",
    },
  },
  {
    id: "takeaway",
    label: "Takeaway - Ready",
    icon: <IcBag />,
    order: {
      ...BASE_DELIVERY,
      order_type: "takeaway",
      delivery_charges: 0,
      customer_address: null,
      petpooja_status: "food_ready",
      rider_name: null,
      rider_phone: null,
      rider_status: null,
    },
  },
];

function isCancelled(o: MockOrder) {
  return o.status === "cancelled" || o.petpooja_status === "cancelled";
}
function isDelivered(o: MockOrder) {
  return (
    o.rider_status === "delivered" ||
    o.petpooja_status === "delivered" ||
    o.status === "completed"
  );
}
function progressIndex(o: MockOrder, isCod: boolean): number {
  if (isCancelled(o)) return -1;
  if (isDelivered(o)) return 4;
  const rs = o.rider_status;
  if (rs === "out_for_delivery" || rs === "arrived_at_customer") return 3;
  if (rs === "picked_up" || rs === "arrived_at_store" || o.petpooja_status === "food_ready")
    return 2;
  if (o.petpooja_status === "accepted") return 1;
  if (rs === "accepted" || rs === "assigned")
    return o.petpooja_status === "food_ready" ? 2 : 1;
  if (o.petpooja_status === "dispatched") return 2;
  if (
    o.status === "paid" ||
    o.status === "cod_pending" ||
    (isCod && o.status === "pending_payment")
  )
    return 0;
  return 0;
}
function headline(o: MockOrder, isCod: boolean): { title: string; sub: string } {
  if (isCancelled(o)) return { title: "Order cancelled", sub: "This order is no longer active." };
  if (isDelivered(o)) return { title: "Order delivered", sub: "Hope you enjoy your meal!" };
  const rs = o.rider_status;
  if (rs === "arrived_at_customer")
    return { title: "Rider has arrived", sub: "Your rider is at your location." };
  if (rs === "out_for_delivery")
    return { title: "Out for delivery", sub: "Your rider is on the way to you." };
  if (rs === "picked_up")
    return { title: "Rider picked up your order", sub: "Leaving for your address shortly." };
  if (rs === "arrived_at_store")
    return {
      title: "Rider at the restaurant",
      sub: o.rider_name
        ? `${o.rider_name} is at the store collecting your order.`
        : "Your rider is at the store.",
    };
  if (rs === "accepted" || rs === "assigned")
    return {
      title: "Rider assigned",
      sub: o.rider_name
        ? `${o.rider_name} will deliver your order.`
        : "A rider will deliver your order soon.",
    };
  if (o.petpooja_status === "food_ready")
    return {
      title: "Order is ready",
      sub:
        o.order_type === "delivery"
          ? "Waiting for a rider to pick it up."
          : "You can collect it from the counter.",
    };
  if (o.petpooja_status === "dispatched")
    return { title: "Order is ready", sub: "Your rider will start the trip next." };
  if (o.petpooja_status === "accepted")
    return { title: "Preparing your order", sub: "The kitchen has started cooking." };
  if (isCod)
    return {
      title: "Order placed",
      sub: "Pay cash on delivery. We'll keep you updated here.",
    };
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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function MockCodPayPanel({ amount, orderLabel }: { amount: number; orderLabel?: string }) {
  const [showQr, setShowQr] = useState(false);

  if (showQr) {
    return (
      <div className="overflow-hidden rounded-2xl border border-svs-cream bg-white">
        <div className="flex items-center justify-between border-b border-svs-cream px-4 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-svs-orange">
              Scan &amp; Pay
            </p>
            <p className="mt-0.5 text-xl font-extrabold tabular-nums text-svs-ink">
              {formatInr(amount)}
            </p>
          </div>
          {orderLabel ? (
            <p className="text-xs font-semibold text-svs-ink/40">{orderLabel}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-center gap-4 px-4 py-5">
          <div className="flex h-[192px] w-[192px] items-center justify-center rounded-xl border border-svs-cream bg-svs-cream/40">
            <svg
              className="h-16 w-16 text-svs-ink/20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <path d="M14 14h.01M14 18h.01M18 14h.01M18 18h.01" />
            </svg>
          </div>
          <p className="text-center text-xs text-svs-ink/40">
            PhonePe · Google Pay · Paytm · any UPI app
          </p>
          <button
            type="button"
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-svs-ink text-sm font-bold text-white"
          >
            Open UPI app
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-svs-orange" />
            <p className="text-sm font-semibold text-svs-orange">Waiting for payment…</p>
          </div>
          <button
            type="button"
            onClick={() => setShowQr(false)}
            className="cursor-pointer border-0 bg-transparent text-xs text-svs-ink/40 underline"
          >
            ← back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-svs-cream bg-white">
      <div className="flex items-start gap-3 px-4 pb-3 pt-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-svs-cream text-svs-orange">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-extrabold text-svs-ink">Pay now, ride smooth</p>
          <p className="mt-0.5 text-xs leading-relaxed text-svs-ink/45">
            Skip the cash hand-off. PhonePe, GPay, or any UPI — done in seconds.
          </p>
        </div>
      </div>
      <div className="mx-4 border-t border-svs-cream" />
      <div className="space-y-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setShowQr(true)}
          className="flex h-[48px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border-0 bg-svs-orange text-[15px] font-extrabold text-white transition-transform active:scale-[0.98]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <path d="M14 14h.01M14 18h.01M18 14h.01M18 18h.01" />
          </svg>
          Pay {formatInr(amount)} now
        </button>
        <p className="text-center text-[11px] text-svs-ink/40">
          PhonePe · Google Pay · Paytm · any UPI
        </p>
      </div>
    </div>
  );
}

function StageSidebar({
  activeId,
  activeLabel,
  onSelect,
}: {
  activeId: string;
  activeLabel: string;
  onSelect: (id: string) => void;
}) {
  const activeIdx = MOCK_STATES.findIndex((s) => s.id === activeId);
  const progress =
    MOCK_STATES.length <= 1
      ? 100
      : Math.round((Math.max(activeIdx, 0) / (MOCK_STATES.length - 1)) * 100);

  return (
    <aside className="flex w-full flex-col border-b border-black/[0.06] bg-white lg:w-[22rem] lg:shrink-0 lg:self-stretch lg:border-b-0 lg:border-r lg:border-black/[0.06] xl:w-[24rem]">
      <div className="shrink-0 px-6 pb-3 pt-5 lg:px-7 lg:pt-6">
        <Link
          href="/"
          className="mb-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-svs-cream px-3.5 text-[12px] font-bold text-svs-ink no-underline transition-colors hover:bg-[#ffe8dc]"
        >
          <svg
            className="h-3.5 w-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </Link>

        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-svs-ink/35">
          Order stage preview
        </p>
        <p className="mt-1.5 text-[1.05rem] font-extrabold tracking-tight text-svs-ink">
          {activeLabel}
        </p>

        {/* Progressive track */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-svs-ink/35">
            <span>
              Stage {Math.max(activeIdx, 0) + 1} / {MOCK_STATES.length}
            </span>
            <span className="text-svs-orange">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-svs-cream">
            <div
              className="h-full rounded-full bg-svs-orange transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1.5 overflow-x-auto px-4 py-3 lg:overflow-visible lg:px-5 lg:pb-8 lg:pt-2"
        style={{ scrollbarWidth: "none" }}
        aria-label="Order stage preview"
      >
        {MOCK_STATES.map((s, i) => {
          const on = activeId === s.id;
          const done = i < activeIdx;
          return (
            <button
              key={s.id}
              type="button"
              title={s.label}
              aria-label={s.label}
              aria-current={on ? "true" : undefined}
              onClick={() => onSelect(s.id)}
              className={[
                "flex w-full shrink-0 cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition-colors duration-300",
                on
                  ? "border-svs-orange/25 bg-svs-cream text-svs-ink"
                  : done
                    ? "border-transparent bg-white text-svs-ink/70 hover:bg-svs-cream/60"
                    : "border-transparent bg-white text-svs-ink/40 hover:bg-svs-cream/50 hover:text-svs-ink",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  on
                    ? "bg-svs-orange/20 text-svs-orange"
                    : done
                      ? "bg-svs-orange/10 text-svs-orange/80"
                      : "bg-svs-cream text-svs-ink/35",
                ].join(" ")}
              >
                {done && !on ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.icon
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold leading-snug">
                  {s.label}
                </span>
                <span
                  className={[
                    "mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.1em]",
                    on ? "text-svs-orange" : done ? "text-svs-orange/60" : "text-svs-ink/25",
                  ].join(" ")}
                >
                  {on ? "Current" : done ? "Done" : `Stage ${i + 1}`}
                </span>
              </span>
              {on ? (
                <span className="ml-auto hidden h-2 w-2 shrink-0 rounded-full bg-svs-orange lg:block" />
              ) : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function MockOrderView({
  order: initial,
  activeId,
  activeLabel,
  onSelectStage,
}: {
  order: MockOrder;
  activeId: string;
  activeLabel: string;
  onSelectStage: (id: string) => void;
}) {
  const [order, setOrder] = useState(initial);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isCod = !!(order.is_cod || order.cod_unpaid);
  const cancelled = isCancelled(order);
  const active = progressIndex(order, isCod);
  const { title, sub } = headline(order, isCod);
  const steps =
    order.order_type === "delivery"
      ? stepsFor(order)
      : stepsFor(order).filter((s) => s.id !== "onway");
  const railIndex =
    order.order_type === "delivery" ? active : active >= 4 ? 3 : active >= 2 ? 2 : active;
  const showRider =
    order.order_type === "delivery" &&
    !cancelled &&
    !!(order.rider_name || order.rider_phone || order.rider_status);
  const stage = stageFromOrder(order);

  const mapUrl =
    order.customer_latitude &&
      order.customer_longitude &&
      order.order_type === "delivery"
      ? `https://maps.google.com/maps?saddr=${STORE_LAT},${STORE_LNG}&daddr=${order.customer_latitude},${order.customer_longitude}&hl=en&z=14&output=embed`
      : `https://maps.google.com/maps?q=${STORE_LAT},${STORE_LNG}&z=15&hl=en&output=embed`;

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-white">
      {/* Map only on top — full width */}
      <div className="absolute inset-x-0 top-0 h-[38svh] sm:h-[42svh] lg:h-[44svh]">
        <iframe
          title="Delivery map"
          src={mapUrl}
          className="h-full w-full border-0 grayscale-[0.1] contrast-[1.04]"
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/75 to-transparent" />

        <div className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-10 inline-flex h-9 items-center gap-2 rounded-full bg-amber-400/95 px-3.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-amber-950 backdrop-blur-sm">
          Preview
        </div>
      </div>

      {/* White panel below map: sidebar + order */}
      <div className="relative z-10 mt-[32svh] sm:mt-[36svh] lg:mt-[38svh]">
        <div className="flex w-full min-h-[calc(100svh-32svh)] flex-col overflow-hidden rounded-t-[2rem] bg-white sm:min-h-[calc(100svh-36svh)] lg:min-h-[calc(100svh-38svh)] lg:flex-row lg:items-stretch lg:rounded-t-[2.5rem]">
          <StageSidebar
            activeId={activeId}
            activeLabel={activeLabel}
            onSelect={onSelectStage}
          />

          <div className="min-w-0 flex-1 bg-white">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 pb-8 pt-6 sm:px-8 sm:pb-10 lg:flex-row lg:items-start lg:gap-10 lg:px-10 lg:pb-12 lg:pt-9 xl:px-12">
              {/* Main order content */}
              <div className="min-w-0 flex-1 space-y-6">
                <header>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-svs-cream px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-svs-orange">
                      #{order.order_number}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-svs-ink/35">
                      {STORE_NAME}
                    </span>
                  </div>
                  <h1 className="text-[1.75rem] font-extrabold leading-[1.12] tracking-tight text-svs-ink sm:text-[2rem]">
                    {title}
                  </h1>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-svs-ink/55">
                    {sub}
                  </p>
                </header>

                {/* Mobile: compact progress card */}
                <div className="lg:hidden">
                  <div className="overflow-hidden rounded-2xl bg-[#fff8f3] shadow-[0_8px_28px_rgba(15,23,42,0.08)] ring-1 ring-svs-cream">
                    <div className="relative aspect-[16/11] w-full px-2 pt-2">
                      <OrderStageScene stage={stage} className="h-full" />
                    </div>
                    <div className="border-t border-svs-cream/80 px-4 py-3">
                      <p className="text-sm font-extrabold text-svs-ink">
                        {STAGE_LABELS[stage].title}
                      </p>
                      <p className="mt-0.5 text-xs text-svs-ink/50">
                        {STAGE_LABELS[stage].hint}
                      </p>
                    </div>
                  </div>
                </div>

                {isCod && !isDelivered(order) && !cancelled ? (
                  <MockCodPayPanel
                    amount={order.grand_total}
                    orderLabel={`#${order.order_number}`}
                  />
                ) : null}

              {order.customer_mobile ||
                (order.order_type === "delivery" && order.customer_address) ? (
                <div className="space-y-3.5 rounded-2xl bg-[#faf7f4] px-4 py-4 ring-1 ring-svs-cream sm:px-5">
                  <OrderContactPhone
                    phone={order.customer_mobile}
                    canChange={
                      !cancelled &&
                      order.can_change_customer_mobile !== false &&
                      !order.customer_mobile_changed
                    }
                    tone="test"
                    onChanged={(mobile) =>
                      setOrder((prev) => ({
                        ...prev,
                        customer_mobile: mobile,
                        customer_mobile_changed: true,
                        can_change_customer_mobile: false,
                      }))
                    }
                  />
                  {order.order_type === "delivery" && order.customer_address ? (
                    <div className="border-t border-svs-cream/80 pt-3.5">
                      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-svs-ink/35">
                        Delivering to
                      </p>
                      <p className="text-sm font-semibold leading-snug text-svs-ink">
                        {order.customer_address}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <section>
                <p className="mb-3.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-svs-ink/35">
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
              </section>

              <div className="overflow-hidden rounded-2xl ring-1 ring-svs-cream">
                <button
                  type="button"
                  className="flex w-full items-center justify-between bg-white px-4 py-4 text-left transition-colors hover:bg-[#faf7f4]"
                  onClick={() => setDetailsOpen((v) => !v)}
                >
                  <span className="text-sm font-extrabold text-svs-ink">
                    Order details · {formatInr(order.grand_total)}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-svs-cream text-sm font-bold text-svs-ink/50">
                    {detailsOpen ? "−" : "+"}
                  </span>
                </button>
                {detailsOpen ? (
                  <div className="space-y-2.5 border-t border-svs-cream bg-[#faf7f4]/60 px-4 py-4 text-sm text-svs-ink/70">
                    <div className="flex justify-between gap-3">
                      <span className="text-svs-ink/45">Type</span>
                      <span className="font-semibold capitalize">
                        {order.order_type.replace(/_/g, " ")}
                      </span>
                    </div>
                    {isCod ? (
                      <div className="flex justify-between gap-3">
                        <span className="text-svs-ink/45">Payment</span>
                        <span className="font-semibold">Cash on delivery</span>
                      </div>
                    ) : null}
                    {order.delivery_charges ? (
                      <div className="flex justify-between gap-3">
                        <span className="text-svs-ink/45">Delivery</span>
                        <span className="font-semibold">
                          {formatInr(order.delivery_charges)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-3">
                      <span className="text-svs-ink/45">Total</span>
                      <span className="font-extrabold text-svs-ink">
                        {formatInr(order.grand_total)}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-2 border-t border-svs-cream pt-3">
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
                className="flex h-12 w-full max-w-md items-center justify-center rounded-2xl bg-svs-orange text-[15px] font-extrabold text-white no-underline shadow-[0_8px_24px_rgba(241,106,52,0.28)] transition-transform active:scale-[0.99]"
              >
                Order more
              </Link>
            </div>

            {/* Desktop: compact progress animation card on the right */}
            <aside className="hidden w-[280px] shrink-0 lg:block xl:w-[300px]">
              <div className="sticky top-6">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-svs-ink/40">
                  Live progress
                </p>
                <div className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-svs-ink/8">
                  <div className="relative aspect-[4/3] w-full px-1 pt-1">
                    <OrderStageScene stage={stage} className="h-full" />
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-sm font-semibold text-svs-ink">
                      {STAGE_LABELS[stage].title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-svs-ink/45">
                      {STAGE_LABELS[stage].hint}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TestPage() {
  const [activeId, setActiveId] = useState("preparing");
  const activeState = MOCK_STATES.find((s) => s.id === activeId)!;

  return (
    <MockOrderView
      key={activeId}
      order={activeState.order}
      activeId={activeId}
      activeLabel={activeState.label}
      onSelectStage={setActiveId}
    />
  );
}
