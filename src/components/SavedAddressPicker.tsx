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
    <div className="space-y-2">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
        Saved addresses
      </p>
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {addresses.map((addr) => {
          const active = selectedId === addr.id;
          return (
            <button
              key={addr.id}
              type="button"
              onClick={() => onSelect(addr.id)}
              className={`w-full text-left rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                active
                  ? "border-[#f16a34] bg-orange-50 ring-1 ring-[#f16a34]/20"
                  : "border-gray-200 bg-white hover:border-[#f16a34]/40"
              }`}
            >
              <span className="block text-[12px] font-extrabold text-gray-900">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-gray-700 mr-1.5">
                  {addr.label || "Home"}
                </span>
                {addr.is_default ? (
                  <span className="text-[10px] font-bold text-[#f16a34]">
                    Default
                  </span>
                ) : null}
              </span>
              <span className="block text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                {addr.formatted_address}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onSelect("new")}
          className={`w-full text-left rounded-lg border px-3 py-2 text-[12px] font-bold cursor-pointer ${
            selectedId === "new"
              ? "border-[#f16a34] bg-orange-50 text-[#f16a34]"
              : "border-dashed border-gray-300 text-gray-700 hover:border-[#f16a34]"
          }`}
        >
          + Add new delivery address
        </button>
      </div>
    </div>
  );
}
