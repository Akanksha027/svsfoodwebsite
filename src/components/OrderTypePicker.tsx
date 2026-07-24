"use client";

import Image from "next/image";
import type { WebOrderType } from "@/lib/orders-api";

export const ORDER_TYPE_ART: Record<
  WebOrderType,
  { src: string; alt: string; label: string }
> = {
  dine_in: {
    src: "/dine-in.png",
    alt: "Dine-in burger plate",
    label: "Dine-in",
  },
  takeaway: {
    src: "/takeaway.png",
    alt: "Open SVS takeaway bag with burger and fries",
    label: "Takeaway",
  },
  delivery: {
    src: "/images/order-types/delivery.png",
    alt: "Delivery scooter",
    label: "Delivery",
  },
};

const ART_SIZE = {
  sm: "h-7 w-7",
  md: "h-[3.5rem] w-[3.5rem] sm:h-[3.75rem] sm:w-[3.75rem]",
  lg: "h-full w-full",
} as const;

export function OrderTypeArt({
  type,
  size = "md",
  className = "",
}: {
  type: WebOrderType;
  size?: keyof typeof ART_SIZE;
  className?: string;
}) {
  const art = ORDER_TYPE_ART[type];
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${ART_SIZE[size]} ${className}`}
    >
      <Image
        src={art.src}
        alt={art.alt}
        fill
        unoptimized
        className="object-contain object-center"
        sizes="80px"
      />
    </span>
  );
}

type Props = {
  value?: WebOrderType | null;
  onSelect: (type: WebOrderType) => void;
  /** Highlight active choice; set false when used as a one-time picker. */
  showActive?: boolean;
  className?: string;
};

export default function OrderTypePicker({
  value,
  onSelect,
  showActive = true,
  className = "",
}: Props) {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">
        How would you like it?
      </p>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-[min(100%,28rem)] mx-auto w-full">
        {(Object.keys(ORDER_TYPE_ART) as WebOrderType[]).map((type) => {
          const active = showActive && value === type;
          const { label, src, alt } = ORDER_TYPE_ART[type];
          return (
            <div key={type} className="flex flex-col items-center gap-2.5">
              <button
                type="button"
                onClick={() => onSelect(type)}
                className={[
                  "w-full aspect-square flex items-stretch rounded-2xl border-[3px] cursor-pointer transition-all overflow-hidden p-0",
                  active
                    ? "bg-orange-50 border-[#f16a34] shadow-[0_2px_10px_rgba(241,106,52,0.18)]"
                    : "bg-white border-gray-200 hover:border-[#f16a34]/40",
                ].join(" ")}
              >
                <div className="relative flex-1 w-full">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    unoptimized
                    className="object-contain object-center"
                    sizes="120px"
                  />
                </div>
              </button>
              <span
                className={[
                  "text-[13px] sm:text-sm font-bold leading-none",
                  active ? "text-[#f16a34]" : "text-gray-500",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
