"use client";

import type { WebsiteCustomerAddress } from "@/lib/website-customer-api";

type Props = {
  addresses: WebsiteCustomerAddress[];
  selectedId: string | "new";
  onSelect: (id: string | "new") => void;
};

function chipLabel(addr: WebsiteCustomerAddress) {
  const name = addr.label || "Home";
  return addr.is_default ? `${name} · Default` : name;
}

export default function SavedAddressPicker({
  addresses,
  selectedId,
  onSelect,
}: Props) {
  if (addresses.length === 0) return null;

  return (
    <div className="w-full min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">
        Saved addresses
      </p>
      <div className="flex flex-wrap gap-2">
        {addresses.map((addr) => {
          const active = selectedId === addr.id;
          return (
            <button
              key={addr.id}
              type="button"
              title={addr.area || addr.formatted_address}
              onClick={() => onSelect(addr.id)}
              className={`h-8 px-3 rounded-full text-[11px] font-bold border cursor-pointer transition-colors whitespace-nowrap ${
                active
                  ? "border-[#f16a34] text-[#f16a34] bg-orange-50/50"
                  : "border-gray-200 text-gray-700 bg-white hover:border-gray-300"
              }`}
            >
              {chipLabel(addr)}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onSelect("new")}
          className={`h-8 px-3 rounded-full text-[11px] font-bold border cursor-pointer transition-colors whitespace-nowrap ${
            selectedId === "new"
              ? "border-[#f16a34] text-[#f16a34] bg-orange-50/50"
              : "border-dashed border-gray-300 text-gray-600 bg-white hover:border-[#f16a34] hover:text-[#f16a34]"
          }`}
        >
          + New
        </button>
      </div>
    </div>
  );
}
