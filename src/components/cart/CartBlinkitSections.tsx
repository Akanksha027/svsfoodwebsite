"use client";

import Image from "next/image";
import { RollingCounter } from "@/components/RollingCounter";
import { lineUnitTotal, type CartLine } from "@/context/CartContext";
import {
  formatScheduledEta,
  type ScheduleSelection,
} from "@/lib/schedule-slots";
import { formatInr } from "@/lib/menu-api";
import type { WebOrderType } from "@/lib/orders-api";

const SVS_ORANGE = "#f16a34";

function CartQtyStepper({
  quantity,
  onDec,
  onInc,
}: {
  quantity: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div
      className="inline-flex h-[30px] items-center overflow-hidden rounded-lg text-xs font-bold text-white shadow-sm"
      style={{ backgroundColor: SVS_ORANGE }}
    >
      <button
        type="button"
        onClick={onDec}
        className="flex h-full w-8 items-center justify-center border-0 bg-transparent cursor-pointer hover:bg-black/10 text-[15px]"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-[22px] flex items-center justify-center">
        <RollingCounter value={quantity} fontSize={13} color="#ffffff" />
      </span>
      <button
        type="button"
        onClick={onInc}
        className="flex h-full w-8 items-center justify-center border-0 bg-transparent cursor-pointer hover:bg-black/10 text-[15px]"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg
      className="h-4 w-4 text-gray-300 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function cardClass() {
  return "rounded-2xl border border-gray-100 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.04)] overflow-hidden";
}

export function CartCouponsSection() {
  const rows = [
    {
      title: "View coupons",
      icon: (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f7ee] text-[#24963f] text-lg font-bold">
          %
        </span>
      ),
    },
    {
      title: "View payment offers",
      icon: (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#3b6fd9]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </span>
      ),
    },
  ];

  return (
    <section className={cardClass()}>
      <div className="px-4 pt-3.5 pb-1">
        <h2 className="text-[15px] font-bold text-gray-900">Coupons &amp; offers</h2>
      </div>
      {rows.map((row, index) => (
        <button
          key={row.title}
          type="button"
          className={`flex w-full items-center gap-3 px-4 py-3.5 text-left border-0 bg-white cursor-pointer hover:bg-gray-50/80 ${
            index < rows.length - 1 ? "border-b border-gray-100" : ""
          }`}
        >
          {row.icon}
          <span className="flex-1 text-[14px] font-semibold text-gray-900">
            {row.title}
          </span>
          <ChevronRight />
        </button>
      ))}
    </section>
  );
}

export function CartShipmentSection({
  lines,
  itemCount,
  orderType,
  setQuantity,
  onAddMoreItems,
  schedule,
  onScheduleClick,
}: {
  lines: CartLine[];
  itemCount: number;
  orderType: WebOrderType;
  setQuantity: (key: string, quantity: number) => void;
  onAddMoreItems?: () => void;
  schedule?: ScheduleSelection;
  onScheduleClick?: () => void;
}) {
  const eta =
    schedule?.mode === "scheduled" && schedule.slot
      ? formatScheduledEta(schedule.slot)
      : orderType === "delivery"
        ? "Delivering in 25–35 mins"
        : orderType === "takeaway"
          ? "Ready for pickup in 12–18 mins"
          : "Ready at table in 12–18 mins";

  const showSchedule = orderType === "delivery" && onScheduleClick;

  return (
    <section className={cardClass()}>
      <div className="flex items-start gap-2.5 px-4 py-3.5 border-b border-gray-100">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff4ee] text-[#f16a34]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </span>
        <div className="flex flex-1 items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-gray-900 leading-tight">
              {eta}
            </p>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </p>
          </div>
          {showSchedule ? (
            <button
              type="button"
              onClick={onScheduleClick}
              className="inline-flex shrink-0 items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-[12px] font-bold text-[#f16a34] cursor-pointer hover:bg-[#fff8f4]"
            >
              <svg
                className="h-3.5 w-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              Schedule
            </button>
          ) : null}
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {lines.map((line) => (
          <li key={line.key} className="flex gap-3 px-4 py-3.5">
            <div className="relative h-[72px] w-[72px] shrink-0 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
              {line.imageUrl ? (
                <Image
                  src={line.imageUrl}
                  alt=""
                  fill
                  className="object-contain p-1"
                  sizes="72px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] font-bold text-gray-400">
                  SVS
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-gray-900 leading-snug line-clamp-2">
                {line.name}
              </p>
              <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">
                {line.addons?.length
                  ? line.addons.map((a) => a.name).join(", ")
                  : `${line.quantity} unit${line.quantity === 1 ? "" : "s"}`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <CartQtyStepper
                quantity={line.quantity}
                onDec={() => setQuantity(line.key, line.quantity - 1)}
                onInc={() => setQuantity(line.key, line.quantity + 1)}
              />
              <p className="text-[14px] font-bold text-gray-900 tabular-nums">
                {formatInr(lineUnitTotal(line) * line.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-4 py-3 border-t border-gray-100 text-center">
        <button
          type="button"
          onClick={onAddMoreItems}
          className="text-[13px] font-semibold text-gray-600 border-0 bg-transparent cursor-pointer p-0"
        >
          Forgot something?{" "}
          <span className="font-bold text-[#f16a34]">
            Add More Items
          </span>
        </button>
      </div>
    </section>
  );
}

function FreeFeeRow({
  label,
  struckAmount,
}: {
  label: string;
  struckAmount: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-[13px]">
      <span className="text-gray-700">{label}</span>
      <span className="flex items-center gap-2 tabular-nums">
        <span className="text-gray-400 line-through">{formatInr(struckAmount)}</span>
        <span className="font-bold text-[#24963f]">FREE</span>
      </span>
    </div>
  );
}

export function CartBillSummarySection({
  subtotal,
  orderType,
  deliveryFee,
  deliveryCharges,
  handlingFee,
  gstAmount,
  riderTip,
  grandTotal,
}: {
  subtotal: number;
  orderType: WebOrderType;
  deliveryFee: number;
  deliveryCharges: number;
  handlingFee: number;
  gstAmount: number;
  riderTip: number;
  grandTotal: number;
}) {
  const preDiscountTotal =
    subtotal +
    (orderType === "delivery" ? deliveryFee : 0) +
    handlingFee +
    gstAmount +
    riderTip;
  const showDeliveryFree =
    orderType === "delivery" && deliveryCharges === 0 && deliveryFee > 0;

  return (
    <section className={cardClass()}>
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100">
        <svg className="h-5 w-5 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 2v20l4-2 4 2 4-2 4 2V2l-4 2-4-2-4 2z" />
          <path d="M8 10h8M8 14h5" />
        </svg>
        <h2 className="text-[15px] font-bold text-gray-900">Bill Summary</h2>
      </div>
      <div className="px-4 py-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2 text-[13px]">
          <span className="text-gray-700">Item total</span>
          <span className="font-semibold text-gray-900 tabular-nums">
            {formatInr(subtotal)}
          </span>
        </div>
        {orderType === "delivery" ? (
          showDeliveryFree ? (
            <FreeFeeRow label="Delivery fee" struckAmount={deliveryFee} />
          ) : deliveryCharges > 0 ? (
            <div className="flex items-center justify-between gap-2 text-[13px]">
              <span className="text-gray-700">Delivery fee</span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {formatInr(deliveryCharges)}
              </span>
            </div>
          ) : null
        ) : null}
        <FreeFeeRow label="Handling fee" struckAmount={Math.max(10, handlingFee)} />
        {gstAmount > 0 ? (
          <div className="flex items-center justify-between gap-2 text-[13px]">
            <span className="text-gray-700">GST (5%)</span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {formatInr(gstAmount)}
            </span>
          </div>
        ) : null}
        {riderTip > 0 ? (
          <div className="flex items-center justify-between gap-2 text-[13px]">
            <span className="text-gray-700">Rider tip</span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {formatInr(riderTip)}
            </span>
          </div>
        ) : null}
        <div className="border-t border-dashed border-gray-200 pt-3 flex items-center justify-between gap-2">
          <span className="text-[14px] font-bold text-gray-900">To pay</span>
          <span className="flex items-center gap-2 tabular-nums">
            {preDiscountTotal > grandTotal ? (
              <span className="text-[13px] text-gray-400 line-through">
                {formatInr(preDiscountTotal)}
              </span>
            ) : null}
            <span className="text-[16px] font-bold text-gray-900">
              {formatInr(grandTotal)}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
