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
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-gray-700">Saved addresses</p>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {addresses.map((addr) => {
          const active = selectedId === addr.id;
          return (
            <button
              key={addr.id}
              type="button"
              onClick={() => onSelect(addr.id)}
              className={`shrink-0 max-w-[9.5rem] text-left rounded-lg border bg-white px-2.5 py-1.5 cursor-pointer transition-colors ${
                active
                  ? "border-[#f16a34]"
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
              <span className="block text-[10px] text-gray-500 leading-snug line-clamp-1">
                {addr.formatted_address}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onSelect("new")}
          className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors bg-white whitespace-nowrap ${
            selectedId === "new"
              ? "border-[#f16a34] text-[#f16a34]"
              : "border-dashed border-gray-300 text-gray-600 hover:border-[#f16a34] hover:text-[#f16a34]"
          }`}
        >
          + New
        </button>
      </div>
    </div>
  );
}
