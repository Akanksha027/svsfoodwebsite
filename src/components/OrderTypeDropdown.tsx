"use client";

import { useEffect, useRef, useState } from "react";
import type { WebOrderType } from "@/lib/orders-api";
import { ORDER_TYPE_ART, OrderTypeArt } from "@/components/OrderTypePicker";

type Props = {
  value: WebOrderType;
  onChange: (type: WebOrderType) => void;
};

export default function OrderTypeDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (type: WebOrderType) => {
    onChange(type);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-xl border border-gray-200 bg-white text-[13px] font-bold text-gray-900 cursor-pointer hover:border-[#f16a34]/35 transition-colors"
      >
        <OrderTypeArt type={value} size="sm" />
        <span>{ORDER_TYPE_ART[value].label}</span>
        <svg
          className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Change order type"
          className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[11rem] rounded-xl border border-gray-200 bg-white py-1 shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
        >
          {(Object.keys(ORDER_TYPE_ART) as WebOrderType[]).map((type) => {
            const active = type === value;
            return (
              <button
                key={type}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => pick(type)}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-semibold border-0 cursor-pointer ${
                  active
                    ? "bg-orange-50 text-[#f16a34]"
                    : "bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                <OrderTypeArt type={type} size="sm" />
                {ORDER_TYPE_ART[type].label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
