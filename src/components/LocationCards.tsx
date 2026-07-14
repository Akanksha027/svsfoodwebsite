"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  getStoreStatusLabel,
  storeLocations,
  type StoreLocation,
} from "@/data/locations";

function DirectionArrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="-0.75 -0.75 16 16"
      stroke="currentColor"
      className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.71875 11.78125 9.0625 -9.0625m0 0H4.984375m6.796875 0v6.796875"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function StoreCard({
  store,
  status,
}: {
  store: StoreLocation;
  status: "Open now" | "Closing soon" | "Closed";
}) {
  const statusColor =
    status === "Open now"
      ? "text-[#12a107]"
      : status === "Closing soon"
        ? "text-[#a10707]"
        : "text-gray-500";

  return (
    <article className="store-card w-full min-w-0 rounded-[20px_20px_12px_14px] sm:rounded-[24px_24px_12px_14px] md:rounded-[27px_27px_14px_16px] bg-[#f3f3f3] p-2 sm:p-3 md:p-3.5 pb-0 shadow-[0_10px_28px_rgba(0,0,0,0.07)] sm:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      <div className="relative w-full overflow-hidden rounded-[12px] sm:rounded-[15px] md:rounded-[18px] aspect-[1826/1028] cursor-pointer group">
        <Image
          src={store.image}
          alt={`SVS FOOD — ${store.city}${store.label ? ` · ${store.label}` : ""}`}
          fill
          sizes="(max-width: 640px) 94vw, (max-width: 1024px) 46vw, 47vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          priority
        />
        <span
          className={`absolute top-2 left-2 sm:top-3 sm:left-3 md:top-3.5 md:left-3.5 z-10 bg-white text-[10px] sm:text-xs md:text-sm px-2 py-1 sm:px-2.5 sm:py-1.5 md:px-3 rounded-md leading-none font-medium ${statusColor}`}
        >
          {status}
        </span>
      </div>

      {/* Phone (1 col): side-by-side. Tablet (2 col): stacked. Desktop: side-by-side */}
      <div className="flex flex-row sm:flex-col lg:flex-row items-start justify-between gap-3 sm:gap-3 md:gap-4 lg:gap-6 px-1.5 sm:px-2 pt-3 sm:pt-4 pb-3 sm:pb-4 md:pb-5">
        <div className="flex flex-col items-start gap-1 sm:gap-1.5 md:gap-2 shrink-0 max-w-[42%] sm:max-w-none lg:max-w-[36%]">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 leading-tight tracking-tight">
            {store.city}
          </h2>
          {store.label ? (
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 leading-tight">
              {store.label}
            </p>
          ) : null}
          <a
            href={store.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 sm:gap-1.5 min-h-[36px] text-xs sm:text-sm md:text-base text-gray-800 underline underline-offset-2 decoration-gray-400 hover:decoration-gray-800"
          >
            Get Direction
            <DirectionArrow />
          </a>
        </div>

        <div className="flex flex-col justify-between gap-1.5 sm:gap-2 md:gap-2.5 min-w-0 flex-1 text-right sm:text-left">
          <p className="text-[10px] sm:text-xs md:text-sm lg:text-[15px] text-gray-800 leading-snug break-words">
            {store.address}
          </p>
          <a
            href={`tel:+91${store.phone}`}
            className="text-[10px] sm:text-xs md:text-sm text-gray-800/50 hover:text-gray-800 transition-colors min-h-[32px] inline-flex items-center justify-end sm:justify-start"
          >
            +91{store.phone}
          </a>
        </div>
      </div>
    </article>
  );
}

export default function LocationCards() {
  const [status, setStatus] = useState<"Open now" | "Closing soon" | "Closed">(
    "Open now"
  );

  useEffect(() => {
    setStatus(getStoreStatusLabel());
  }, []);

  return (
    <div className="relative z-30 w-[94%] sm:w-[95%] -mt-10 sm:-mt-14 md:-mt-[70px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {storeLocations.map((store) => (
          <StoreCard key={store.id} store={store} status={status} />
        ))}
      </div>
    </div>
  );
}
