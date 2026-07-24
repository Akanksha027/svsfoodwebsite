"use client";

import { useState } from "react";
import { formatInr } from "@/lib/menu-api";

const PRESETS = [10, 35, 50] as const;

type Props = {
  value: number;
  onChange: (amount: number) => void;
};

export default function RiderTipSection({ value, onChange }: Props) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState("");

  const pickPreset = (amount: number) => {
    setCustomOpen(false);
    onChange(value === amount ? 0 : amount);
  };

  const applyCustom = () => {
    const n = Math.max(0, Math.min(500, Number(customDraft) || 0));
    onChange(n);
    setCustomOpen(false);
    setCustomDraft(n > 0 ? String(n) : "");
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.04)] px-4 py-3.5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900">
            Tip your delivery rider
          </h2>
          <p className="text-[12px] text-gray-500 mt-0.5">
            100% of the tip goes to the rider
          </p>
        </div>
        {value > 0 ? (
          <span className="text-[13px] font-bold text-[#24963f] tabular-nums shrink-0">
            {formatInr(value)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((amount) => {
          const active = value === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => pickPreset(amount)}
              className={`h-10 min-w-[56px] px-4 rounded-xl border text-[13px] font-bold cursor-pointer transition-colors ${
                active
                  ? "border-[#f16a34] bg-orange-50 text-[#f16a34]"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
              }`}
            >
              {formatInr(amount)}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setCustomOpen((v) => !v);
            if (!customOpen && value > 0 && !PRESETS.includes(value as (typeof PRESETS)[number])) {
              setCustomDraft(String(value));
            }
          }}
          className={`h-10 px-4 rounded-xl border text-[13px] font-bold cursor-pointer transition-colors ${
            customOpen || (value > 0 && !PRESETS.includes(value as (typeof PRESETS)[number]))
              ? "border-[#f16a34] bg-orange-50 text-[#f16a34]"
              : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
          }`}
        >
          Custom
        </button>
      </div>
      {customOpen ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            value={customDraft}
            onChange={(e) =>
              setCustomDraft(e.target.value.replace(/[^\d]/g, "").slice(0, 3))
            }
            inputMode="numeric"
            placeholder="Enter amount"
            className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-[13px] outline-none focus:border-[#f16a34]"
          />
          <button
            type="button"
            onClick={applyCustom}
            className="h-10 px-4 rounded-xl bg-[#f16a34] text-white text-[13px] font-bold border-0 cursor-pointer"
          >
            Apply
          </button>
        </div>
      ) : null}
    </section>
  );
}
