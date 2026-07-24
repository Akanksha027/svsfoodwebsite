"use client";

import { useMemo } from "react";
import {
  buildTodayScheduleSlots,
  formatScheduleDayLabel,
  type ScheduleSelection,
} from "@/lib/schedule-slots";

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

type Props = {
  selection: ScheduleSelection;
  onChange: (next: ScheduleSelection) => void;
  onInstantSelect: () => void;
  onConfirm: () => void;
};

/** Full-panel schedule picker inside the cart drawer sidebar. */
export default function CartScheduleSection({
  selection,
  onChange,
  onInstantSelect,
  onConfirm,
}: Props) {
  const slots = useMemo(() => buildTodayScheduleSlots(), []);
  const dayLabel = useMemo(() => formatScheduleDayLabel(), []);
  const mode = selection.mode;
  const pickedSlotId = selection.slot?.id ?? null;

  const pickInstant = () => {
    onChange({ mode: "instant", slot: null });
    onInstantSelect();
  };

  const pickScheduled = () => {
    const first = slots[0];
    if (first) {
      onChange({ mode: "scheduled", slot: first });
    } else {
      onChange({ mode: "scheduled", slot: null });
    }
  };

  const pickSlot = (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    if (slot) onChange({ mode: "scheduled", slot });
  };

  const canConfirm =
    mode === "scheduled" && selection.slot !== null && slots.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#f6f6f6]">
      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
        <div className="px-4 pt-4 pb-3 bg-white">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={pickInstant}
              className={`rounded-xl border px-3 py-3 text-left cursor-pointer bg-white ${
                mode === "instant"
                  ? "border-[#f16a34] ring-1 ring-[#f16a34]/20"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-bold text-gray-900">Instant</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">25–35 min</p>
                </div>
                <span className="text-lg" aria-hidden>
                  ⚡
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={pickScheduled}
              className={`rounded-xl border px-3 py-3 text-left cursor-pointer ${
                mode === "scheduled"
                  ? "border-[#f16a34] bg-[#fff8f4] ring-1 ring-[#f16a34]/20"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-gray-900">Schedule</p>
                  <p className="text-[12px] text-gray-500 mt-0.5 truncate">
                    {selection.slot?.label ?? "Pick a slot"}
                  </p>
                </div>
                <span className="text-[#f16a34] shrink-0" aria-hidden>
                  <ClockIcon className="h-5 w-5" />
                </span>
              </div>
            </button>
          </div>
        </div>

        {mode === "scheduled" ? (
          <div className="px-4 py-3 space-y-3">
            <div>
              <div className="inline-flex flex-col border-b-2 border-[#e11d48] pb-2">
                <span className="text-[14px] font-bold text-gray-900">
                  {dayLabel}
                </span>
                <span className="text-[12px] font-semibold text-[#e11d48]">
                  {slots.length} slot{slots.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <ClockIcon className="h-4 w-4 text-gray-700" />
                <span className="text-[12px] font-extrabold tracking-wide text-gray-800 uppercase">
                  Earliest
                </span>
              </div>

              {slots.length === 0 ? (
                <p className="text-[13px] text-gray-500 py-3 text-center">
                  No slots left today. Switch to instant delivery.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const active = slot.id === pickedSlotId;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => pickSlot(slot.id)}
                        className={`h-10 rounded-xl border text-[11px] font-semibold cursor-pointer transition-colors ${
                          active
                            ? "border-[#f16a34] bg-[#fff8f4] text-gray-900"
                            : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-[#eef6ff] border border-[#dbeafe] px-3 py-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-white text-[11px] font-bold mt-0.5">
                i
              </span>
              <p className="text-[12px] leading-snug text-[#1e40af] font-medium">
                You can cancel up to 30 min prior to delivery time
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {mode === "scheduled" ? (
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="flex items-center justify-center w-full h-[52px] rounded-2xl px-4 text-white border-0 cursor-pointer shadow-md text-sm font-bold disabled:opacity-45 disabled:cursor-not-allowed"
            style={{ backgroundColor: canConfirm ? "#f16a34" : "#d1d5db" }}
          >
            {selection.slot
              ? `Confirm · ${selection.slot.label}`
              : "Pick a time slot"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
