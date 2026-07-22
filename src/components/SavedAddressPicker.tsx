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
    <div className="w-full min-w-0 space-y-1.5">
      <p className="text-[11px] font-semibold text-gray-700">Saved addresses</p>
      <div
        className="flex w-full min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-1.5 snap-x snap-mandatory [scrollbar-width:thin] [scrollbar-color:rgba(241,106,52,0.45)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#f16a34]/40"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {addresses.map((addr) => {
          const active = selectedId === addr.id;
          return (
            <button
              key={addr.id}
              type="button"
              onClick={() => onSelect(addr.id)}
              className={`shrink-0 snap-start w-[10.5rem] sm:w-[11.5rem] text-left rounded-xl border bg-white px-3 py-2 cursor-pointer transition-colors ${
                active
                  ? "border-[#f16a34] bg-orange-50/40"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span
                className={`block text-[11px] font-bold truncate ${
                  active ? "text-[#f16a34]" : "text-gray-900"
                }`}
              >
                {addr.label || "Home"}
                {addr.is_default ? " · Default" : ""}
              </span>
              <span className="block text-[10px] text-gray-500 leading-snug line-clamp-2 mt-0.5">
                {addr.formatted_address}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onSelect("new")}
          className={`shrink-0 snap-start rounded-xl border px-3 py-2 text-[11px] font-semibold cursor-pointer transition-colors bg-white whitespace-nowrap self-stretch ${
            selectedId === "new"
              ? "border-[#f16a34] text-[#f16a34] bg-orange-50/40"
              : "border-dashed border-gray-300 text-gray-600 hover:border-[#f16a34] hover:text-[#f16a34]"
          }`}
        >
          + New
        </button>
      </div>
    </div>
  );
}
