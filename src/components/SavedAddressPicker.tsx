"use client";

import type { WebsiteCustomerAddress } from "@/lib/website-customer-api";

type Props = {
  addresses: WebsiteCustomerAddress[];
  selectedId: string | "new";
  onSelect: (id: string | "new") => void;
};

export default function SavedAddressPicker({
  addresses,
  selectedId,
  onSelect,
}: Props) {
  if (addresses.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
        Saved addresses
      </p>
      <div className="space-y-2 max-h-44 overflow-y-auto pr-0.5">
        {addresses.map((addr) => {
          const active = selectedId === addr.id;
          return (
            <button
              key={addr.id}
              type="button"
              onClick={() => onSelect(addr.id)}
              className={`w-full text-left rounded-xl border px-3.5 py-3 cursor-pointer transition-all ${
                active
                  ? "border-[#f16a34] bg-[#fff8f5] ring-1 ring-[#f16a34]/20 shadow-sm"
                  : "border-gray-100 bg-white hover:border-[#f16a34]/40 hover:bg-orange-50/30 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              }`}
            >
              <span className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                  active ? "bg-[#f16a34]/10 text-[#f16a34]" : "bg-gray-100 text-gray-600"
                }`}>
                  {addr.label || "Home"}
                </span>
                {addr.is_default ? (
                  <span className="text-[10px] font-bold text-[#f16a34] bg-[#f16a34]/8 rounded-full px-1.5 py-0.5">
                    Default
                  </span>
                ) : null}
              </span>
              <span className="block text-[12px] text-gray-500 leading-snug line-clamp-2">
                {addr.formatted_address}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onSelect("new")}
          className={`w-full text-left rounded-xl border px-3.5 py-3 text-[12px] font-bold cursor-pointer transition-all ${
            selectedId === "new"
              ? "border-[#f16a34] bg-[#fff8f5] text-[#f16a34] ring-1 ring-[#f16a34]/20"
              : "border-dashed border-gray-200 text-gray-500 hover:border-[#f16a34]/60 hover:text-[#f16a34]"
          }`}
        >
          + Add new delivery address
        </button>
      </div>
    </div>
  );
}
