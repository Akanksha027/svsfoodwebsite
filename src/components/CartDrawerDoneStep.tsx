"use client";

import Link from "next/link";

const SVS_ORANGE = "#f16a34";

type Props = {
  orderId: string;
  orderNumber: string | number;
  storeSlug: string;
  onClose: () => void;
};

export default function CartDrawerDoneStep({
  orderId,
  orderNumber,
  storeSlug,
  onClose,
}: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl mb-4">
        ✓
      </div>
      <h2 className="text-lg font-bold text-gray-900">Order confirmed</h2>
      <p className="text-sm text-gray-500 mt-2">
        Order #{orderNumber}
      </p>
      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        We&apos;ve sent your order to the kitchen. Track status anytime.
      </p>
      <Link
        href={`/order/${encodeURIComponent(orderId)}?store=${encodeURIComponent(storeSlug)}`}
        className="mt-6 flex w-full h-11 items-center justify-center rounded-lg text-white font-bold text-sm no-underline"
        style={{ backgroundColor: SVS_ORANGE }}
        onClick={onClose}
      >
        View order status
      </Link>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 text-sm font-bold border-0 bg-transparent cursor-pointer"
        style={{ color: SVS_ORANGE }}
      >
        Continue browsing menu
      </button>
    </div>
  );
}
