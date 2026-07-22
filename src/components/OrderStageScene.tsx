"use client";

import type { ReactNode } from "react";
import "./order-stage-scene.css";

export type OrderStageId =
  | "placed"
  | "cod_placed"
  | "preparing"
  | "ready"
  | "pickup"
  | "at_store"
  | "onway"
  | "arrived"
  | "delivered"
  | "cancelled";

export const STAGE_LABELS: Record<OrderStageId, { title: string; hint: string }> = {
  placed: {
    title: "Order received",
    hint: "Bill printing in the SVS kitchen",
  },
  cod_placed: {
    title: "COD order placed",
    hint: "Pay cash when your order arrives",
  },
  preparing: {
    title: "Cooking now",
    hint: "Making your order",
  },
  ready: {
    title: "Packing up",
    hint: "Sealing your SVS bag",
  },
  pickup: {
    title: "Ready for pickup",
    hint: "Bag packed — waiting for rider",
  },
  at_store: {
    title: "Rider at store",
    hint: "Picking up your SVS order",
  },
  onway: {
    title: "On the road",
    hint: "Rider heading to your door",
  },
  arrived: {
    title: "Rider arrived",
    hint: "Waiting outside your door",
  },
  delivered: {
    title: "Delivered",
    hint: "Enjoy your meal!",
  },
  cancelled: {
    title: "Cancelled",
    hint: "This order is no longer active",
  },
};

/** SVS kitchen — small orange laptop + bill printing onto the table */
function ScenePlaced() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      {/* Kitchen back wall */}
      <rect x="24" y="28" width="232" height="100" rx="10" fill="#fff4ee" />
      <rect x="24" y="28" width="232" height="22" rx="10" fill="#f16a34" />
      <rect x="24" y="42" width="232" height="8" fill="#f16a34" />
      <text
        x="140"
        y="44"
        textAnchor="middle"
        fill="#fff"
        fontSize="11"
        fontWeight="900"
        letterSpacing="1.6"
      >
        SVS KITCHEN
      </text>

      {/* Shelf / tiles hint */}
      <line x1="40" y1="68" x2="240" y2="68" stroke="#f2d4c4" strokeWidth="2" />
      <rect x="44" y="76" width="28" height="18" rx="3" fill="#ffd166" opacity="0.55" />
      <rect x="80" y="76" width="28" height="18" rx="3" fill="#fff" stroke="#f2d4c4" strokeWidth="1.5" />
      <rect x="172" y="76" width="28" height="18" rx="3" fill="#fff" stroke="#f2d4c4" strokeWidth="1.5" />
      <rect x="208" y="76" width="28" height="18" rx="3" fill="#2d9e75" opacity="0.35" />

      {/* Soft floor */}
      <ellipse cx="140" cy="178" rx="90" ry="8" fill="#f16a34" opacity="0.08" />

      {/* Table / counter top */}
      <rect x="40" y="138" width="200" height="28" rx="8" fill="#fff8f3" stroke="#f2d4c4" strokeWidth="2" />
      <rect x="40" y="156" width="200" height="12" fill="#f16a34" opacity="0.85" />

      {/* Small orangish laptop */}
      <g>
        {/* screen */}
        <rect x="78" y="78" width="78" height="52" rx="5" fill="#f16a34" />
        <rect x="84" y="84" width="66" height="40" rx="3" fill="#fff8f3" />
        {/* screen content */}
        <rect x="90" y="90" width="54" height="7" rx="2" fill="#f16a34" />
        <text x="117" y="96" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="800">
          SVS ORDER
        </text>
        <rect x="90" y="102" width="34" height="4" rx="1" fill="#f2d4c4" />
        <rect x="90" y="110" width="48" height="4" rx="1" fill="#f2d4c4" />
        <rect x="102" y="118" width="30" height="8" rx="2" fill="#2d9e75" />
        <text x="117" y="124" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="800">
          PAID
        </text>
        {/* base / keyboard */}
        <path d="M70 130h94l-8 10H78z" fill="#e05520" />
        <rect x="82" y="132" width="70" height="5" rx="1" fill="#d95a2a" />
      </g>

      {/* Bill coming out onto the table (right of laptop) */}
      <g className="oss-bill-print">
        <rect x="172" y="98" width="42" height="52" rx="2" fill="#fff" stroke="#f16a34" strokeWidth="1.5" />
        <rect x="172" y="98" width="42" height="10" fill="#f16a34" rx="2" />
        <text x="193" y="106" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="800">
          SVS
        </text>
        <line x1="180" y1="116" x2="206" y2="116" stroke="#f2d4c4" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="180" y1="124" x2="202" y2="124" stroke="#f2d4c4" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="180" y1="132" x2="204" y2="132" stroke="#f2d4c4" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="180" y1="140" x2="198" y2="140" stroke="#f2d4c4" strokeWidth="1.8" strokeLinecap="round" />
        <text x="193" y="152" textAnchor="middle" fill="#2d9e75" fontSize="6" fontWeight="800">
          PAID
        </text>
      </g>

      {/* Tiny printer slot hint behind bill */}
      <rect x="178" y="128" width="30" height="6" rx="1" fill="#e05520" opacity="0.5" />
    </svg>
  );
}

/** COD placed — cash ready at the door, pay on delivery */
function SceneCodPlaced() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      <ellipse cx="140" cy="176" rx="88" ry="9" fill="#f16a34" opacity="0.08" />

      {/* Small house / door */}
      <g>
        <polygon points="168,70 220,40 272,70" fill="#f16a34" />
        <rect x="176" y="70" width="88" height="72" fill="#fff8f3" stroke="#f2d4c4" strokeWidth="2" />
        <rect x="206" y="96" width="22" height="46" rx="2" fill="#5c3a28" />
        <circle cx="222" cy="120" r="2" fill="#ffd166" />
        <rect x="186" y="84" width="14" height="14" rx="2" fill="#7ec8e3" opacity="0.55" />
        <rect x="240" y="84" width="14" height="14" rx="2" fill="#7ec8e3" opacity="0.55" />
      </g>

      {/* Phone with COD order confirmation */}
      <g className="oss-cod-phone">
        <rect x="42" y="48" width="72" height="112" rx="12" fill="#1a1a1a" />
        <rect x="48" y="56" width="60" height="88" rx="4" fill="#fff8f3" />
        <rect x="48" y="56" width="60" height="16" rx="4" fill="#f16a34" />
        <text x="78" y="67" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="800">
          SVS
        </text>
        <text x="78" y="86" textAnchor="middle" fill="#1a1a1a" fontSize="6" fontWeight="700">
          Order #4217
        </text>
        <rect x="56" y="94" width="44" height="18" rx="4" fill="#ffd166" />
        <text x="78" y="106" textAnchor="middle" fill="#1a1a1a" fontSize="7" fontWeight="900">
          COD
        </text>
        <text x="78" y="124" textAnchor="middle" fill="#1a1a1a" fontSize="5" fontWeight="600" opacity="0.55">
          Pay on delivery
        </text>
        <rect x="62" y="132" width="32" height="6" rx="3" fill="#f2d4c4" />
      </g>

      {/* Cash notes floating */}
      <g className="oss-cod-cash" style={{ animationDelay: "0s" }}>
        <rect x="128" y="88" width="48" height="26" rx="3" fill="#2d9e75" transform="rotate(-12 152 101)" />
        <rect x="132" y="92" width="40" height="18" rx="2" fill="#3cb88a" transform="rotate(-12 152 101)" />
        <text x="152" y="104" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="900" transform="rotate(-12 152 101)">
          ₹
        </text>
      </g>
      <g className="oss-cod-cash" style={{ animationDelay: "0.35s" }}>
        <rect x="138" y="108" width="48" height="26" rx="3" fill="#2d9e75" transform="rotate(8 162 121)" />
        <rect x="142" y="112" width="40" height="18" rx="2" fill="#3cb88a" transform="rotate(8 162 121)" />
        <text x="162" y="124" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="900" transform="rotate(8 162 121)">
          ₹
        </text>
      </g>

      {/* COD stamp */}
      <g className="oss-float">
        <rect x="118" y="148" width="72" height="22" rx="11" fill="#f16a34" />
        <text x="154" y="163" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="900" letterSpacing="0.5">
          CASH READY
        </text>
      </g>
    </svg>
  );
}

/** Chef assembling a burger */
function ScenePreparing() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      <ellipse cx="140" cy="176" rx="72" ry="9" fill="#f16a34" opacity="0.08" />

      {/* work counter */}
      <rect x="56" y="148" width="168" height="18" rx="6" fill="#fff4ee" />
      <rect x="56" y="158" width="168" height="10" fill="#f2d4c4" />

      {/* chef */}
      <g className="oss-chef">
        {/* body / coat */}
        <rect x="108" y="78" width="48" height="58" rx="14" fill="#fff" stroke="#f16a34" strokeWidth="2" />
        {/* head */}
        <circle cx="132" cy="58" r="18" fill="#f0c9a0" />
        {/* hat */}
        <ellipse cx="132" cy="40" rx="22" ry="9" fill="#fff" />
        <rect x="116" y="28" width="32" height="16" rx="8" fill="#fff" />
        {/* face */}
        <circle cx="126" cy="56" r="2" fill="#3a281c" />
        <circle cx="138" cy="56" r="2" fill="#3a281c" />
        <path
          d="M126 66c3 3 9 3 12 0"
          stroke="#c48a60"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        {/* arms reaching toward burger */}
        <path
          d="M112 98c-16 8-22 22-18 34"
          stroke="#f0c9a0"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M152 98c16 8 22 22 18 34"
          stroke="#f0c9a0"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* burger being assembled — layers bounce in */}
      <g className="oss-burger-build" style={{ transformOrigin: "132px 130px" }}>
        {/* bottom bun */}
        <ellipse className="oss-layer" cx="132" cy="142" rx="28" ry="9" fill="#e8a060" style={{ animationDelay: "0s" }} />
        {/* patty */}
        <ellipse className="oss-layer" cx="132" cy="134" rx="26" ry="7" fill="#6b3a1f" style={{ animationDelay: "0.25s" }} />
        {/* cheese */}
        <path
          className="oss-layer"
          d="M106 126h52l-4 8H110z"
          fill="#ffd166"
          style={{ animationDelay: "0.5s" }}
        />
        {/* lettuce */}
        <ellipse className="oss-layer" cx="132" cy="122" rx="27" ry="5" fill="#2d9e75" style={{ animationDelay: "0.75s" }} />
        {/* tomato */}
        <ellipse className="oss-layer" cx="132" cy="116" rx="22" ry="4" fill="#e85d4c" style={{ animationDelay: "1s" }} />
        {/* top bun */}
        <ellipse className="oss-layer" cx="132" cy="108" rx="28" ry="11" fill="#e8a060" style={{ animationDelay: "1.25s" }} />
        <ellipse className="oss-layer" cx="132" cy="104" rx="22" ry="6" fill="#f0b070" style={{ animationDelay: "1.25s" }} />
        {/* sesame seeds */}
        <circle className="oss-layer" cx="122" cy="102" r="1.4" fill="#fff8e8" style={{ animationDelay: "1.35s" }} />
        <circle className="oss-layer" cx="132" cy="100" r="1.4" fill="#fff8e8" style={{ animationDelay: "1.4s" }} />
        <circle className="oss-layer" cx="142" cy="103" r="1.4" fill="#fff8e8" style={{ animationDelay: "1.45s" }} />
      </g>

      {/* soft steam */}
      <ellipse className="oss-steam" cx="132" cy="88" rx="6" ry="10" fill="#f16a34" opacity="0.18" />
      <ellipse className="oss-steam-2" cx="146" cy="84" rx="4" ry="8" fill="#f16a34" opacity="0.14" />
    </svg>
  );
}

/** Packing into SVS bag — only used for food-ready stage */
function SceneReady() {
  return (
    <div className="oss-pack relative flex h-full w-full items-end justify-center pb-4 pt-3" aria-hidden>
      <div className="pointer-events-none absolute bottom-4 left-1/2 h-2.5 w-[55%] -translate-x-1/2 rounded-[100%] bg-svs-ink/[0.05]" />

      <div className="relative z-[1] flex w-full max-w-[280px] items-end justify-center gap-3">
        {/* Staff — taller than the bag */}
        <div className="oss-packer relative mb-0 flex w-[72px] shrink-0 flex-col items-center">
          <div className="relative z-[2]">
            <div className="mx-auto h-4 w-9 rounded-t-full bg-svs-ink" />
            <div className="mx-auto -mt-0.5 h-8 w-8 rounded-full bg-[#f0c9a0]" />
          </div>
          <div className="relative z-[1] -mt-0.5 flex h-[4.5rem] w-[3.25rem] items-start justify-center rounded-t-[1.25rem] bg-svs-ink">
            <span className="mt-2.5 text-[8px] font-black tracking-wider text-white">SVS</span>
          </div>
          <div className="oss-packer-arm absolute right-[-10px] top-[44px] z-[3] h-2.5 w-12 origin-left rounded-full bg-[#f0c9a0]" />
          {/* legs */}
          <div className="mt-0.5 flex gap-1.5">
            <div className="h-5 w-2.5 rounded-b-md bg-svs-ink/80" />
            <div className="h-5 w-2.5 rounded-b-md bg-svs-ink/80" />
          </div>
        </div>

        {/* Burger going into bag */}
        <div className="oss-pack-burger absolute left-[38%] top-[6%] z-[4] w-[40px]">
          <div className="relative">
            <div className="absolute inset-x-0.5 -bottom-0.5 top-2 -z-[1] rounded-md bg-[#c4a078]/90" />
            <img
              src="/images/bag/burger.png"
              alt=""
              className="relative z-[1] h-auto w-full"
              draggable={false}
            />
            <span className="absolute -right-0.5 -top-0.5 z-[2] rounded bg-svs-orange px-1 py-px text-[6px] font-black text-white">
              SVS
            </span>
          </div>
        </div>

        {/* Static kraft SVS bag — smaller than person, no spin */}
        <div className="oss-pack-bag relative mb-1 flex h-[72px] w-[56px] shrink-0 items-end justify-center sm:h-[78px] sm:w-[60px]">
          <div className="oss-pack-bag-face relative h-full w-full overflow-hidden bg-[#c4a078]"
            style={{
              clipPath:
                "polygon(0% 7%, 4% 0%, 8% 7%, 12% 0%, 16% 7%, 20% 0%, 24% 7%, 28% 0%, 32% 7%, 36% 0%, 40% 7%, 44% 0%, 48% 7%, 52% 0%, 56% 7%, 60% 0%, 64% 7%, 68% 0%, 72% 7%, 76% 0%, 80% 7%, 84% 0%, 88% 7%, 92% 0%, 96% 7%, 100% 0%, 100% 100%, 0% 100%)",
            }}
          >
            <div className="absolute inset-x-0 bottom-0 top-[18%] flex flex-col items-center justify-center text-white">
              <span className="relative text-[15px] font-black leading-none tracking-wide">
                SVS
                <span className="absolute -right-2.5 -top-0.5 text-[7px]">★</span>
              </span>
              <span className="mt-0.5 text-[9px] font-bold tracking-[0.12em]">FOOD</span>
            </div>
            {/* side fold hint */}
            <div className="absolute bottom-0 right-0 top-[7%] w-[18%] bg-[#b89268]/90" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Food packed — waiting for rider (no packing motion) */
function ScenePickup() {
  return (
    <div className="relative flex h-full w-full items-end justify-center pb-4 pt-3" aria-hidden>
      <div className="pointer-events-none absolute bottom-4 left-1/2 h-2.5 w-[50%] -translate-x-1/2 rounded-[100%] bg-svs-ink/[0.05]" />
      <div className="relative flex items-end gap-4">
        <div className="flex flex-col items-center">
          <div className="mx-auto h-3.5 w-8 rounded-t-full bg-svs-ink" />
          <div className="mx-auto -mt-0.5 h-7 w-7 rounded-full bg-[#f0c9a0]" />
          <div className="-mt-0.5 flex h-14 w-11 items-start justify-center rounded-t-[1.1rem] bg-svs-orange">
            <span className="mt-2 text-[7px] font-black text-white">SVS</span>
          </div>
          <div className="mt-0.5 flex gap-1">
            <div className="h-4 w-2 rounded-b-md bg-svs-ink/75" />
            <div className="h-4 w-2 rounded-b-md bg-svs-ink/75" />
          </div>
        </div>
        <div
          className="relative mb-1 h-[68px] w-[52px] bg-[#c4a078]"
          style={{
            clipPath:
              "polygon(0% 7%, 4% 0%, 8% 7%, 12% 0%, 16% 7%, 20% 0%, 24% 7%, 28% 0%, 32% 7%, 36% 0%, 40% 7%, 44% 0%, 48% 7%, 52% 0%, 56% 7%, 60% 0%, 64% 7%, 68% 0%, 72% 7%, 76% 0%, 80% 7%, 84% 0%, 88% 7%, 92% 0%, 96% 7%, 100% 0%, 100% 100%, 0% 100%)",
          }}
        >
          <div className="absolute inset-x-0 bottom-0 top-[18%] flex flex-col items-center justify-center text-white">
            <span className="relative text-[14px] font-black leading-none">
              SVS
              <span className="absolute -right-2 -top-0.5 text-[6px]">★</span>
            </span>
            <span className="mt-0.5 text-[8px] font-bold tracking-[0.12em]">FOOD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Rider parked outside SVS store */
function SceneAtStore() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      <ellipse cx="150" cy="172" rx="96" ry="10" fill="#1a1a1a" opacity="0.05" />

      {/* Small SVS storefront */}
      <g>
        {/* building body */}
        <rect x="28" y="78" width="100" height="82" rx="6" fill="#fff8f3" stroke="#e8d4c4" strokeWidth="2" />
        {/* orange fascia */}
        <rect x="28" y="78" width="100" height="28" rx="6" fill="#f16a34" />
        <rect x="28" y="96" width="100" height="10" fill="#f16a34" />
        <text x="78" y="97" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" letterSpacing="1">
          SVS
        </text>
        <text x="78" y="110" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="700" letterSpacing="2" opacity="0.9">
          FOOD
        </text>
        {/* windows */}
        <rect x="40" y="118" width="28" height="22" rx="3" fill="#7ec8e3" opacity="0.55" />
        <rect x="76" y="118" width="28" height="22" rx="3" fill="#7ec8e3" opacity="0.55" />
        {/* door */}
        <rect x="112" y="122" width="16" height="38" rx="2" fill="#5c3a28" />
        <circle cx="124" cy="142" r="1.5" fill="#ffd166" />
        {/* awning stripes */}
        <path d="M26 106h104" stroke="#d95a2a" strokeWidth="3" strokeLinecap="round" />
        {/* store sign board edge */}
        <rect x="48" y="68" width="60" height="12" rx="3" fill="#1a1a1a" />
        <text x="78" y="77" textAnchor="middle" fill="#ffd166" fontSize="7" fontWeight="800">
          OPEN
        </text>
      </g>

      {/* Rider + SVS bike outside */}
      <g className="oss-at-store-bike">
        <path d="M168 148c5-12 16-20 28-18l5 2c4 2 7 5 7 10v4H174c-4 0-7-2-6-4z" fill="#f16a34" />
        <rect x="198" y="118" width="26" height="22" rx="3" fill="#5c3a28" />
        <rect x="198" y="118" width="26" height="7" fill="#f16a34" />
        <text x="211" y="136" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="800">
          SVS
        </text>
        <ellipse cx="184" cy="136" rx="7" ry="3.5" fill="#2a2a2a" />
        <circle cx="208" cy="130" r="3.5" fill="#ffd166" />
        <path d="M166 138h-8" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="172" cy="152" r="11" fill="#1a1a1a" stroke="#888" strokeWidth="2.5" />
        <circle cx="172" cy="152" r="3.5" fill="#ddd" />
        <circle cx="218" cy="152" r="11" fill="#1a1a1a" stroke="#888" strokeWidth="2.5" />
        <circle cx="218" cy="152" r="3.5" fill="#ddd" />
        <g className="oss-at-store-rider">
          <circle cx="148" cy="118" r="9" fill="#f0c9a0" />
          <path d="M139 112c0-8 5-11 9-11s9 3 9 11" fill="#1a1a1a" />
          <rect x="138" y="128" width="20" height="28" rx="6" fill="#1a1a1a" />
          <path
            d="M158 136c8-2 14-4 18-2"
            fill="none"
            stroke="#f0c9a0"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="140" y="154" width="6" height="14" rx="2" fill="#2a2a2a" />
          <rect x="150" y="154" width="6" height="14" rx="2" fill="#2a2a2a" />
        </g>
        <g className="oss-float">
          <path d="M156 140h14l2 16c0 2-1 3-3 3h-12c-2 0-3-1-3-3l2-16z" fill="#c4a078" />
          <text x="163" y="152" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="800">
            SVS
          </text>
        </g>
      </g>
    </svg>
  );
}

/** Rider on bike store → home */
function SceneOnWay() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      {/* ground */}
      <ellipse cx="140" cy="168" rx="100" ry="12" fill="#f16a34" opacity="0.07" />
      <line
        className="oss-road-dash"
        x1="24"
        y1="156"
        x2="256"
        y2="156"
        stroke="#e8d4c4"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* store pin */}
      <g>
        <rect x="22" y="108" width="36" height="28" rx="5" fill="#fff4ee" stroke="#f16a34" strokeWidth="2" />
        <rect x="22" y="100" width="36" height="10" fill="#f16a34" rx="3" />
        <text x="40" y="108" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="800">
          SVS
        </text>
        <rect x="30" y="118" width="8" height="12" fill="#5c3a28" />
      </g>

      {/* home pin */}
      <g>
        <polygon points="230,112 250,96 270,112" fill="#f16a34" />
        <rect x="234" y="112" width="32" height="24" fill="#fff4ee" stroke="#e8d4c4" strokeWidth="1.5" />
        <rect x="244" y="122" width="10" height="14" fill="#5c3a28" />
      </g>

      {/* bike + rider — faces home (right), travels store → home */}
      <g className="oss-bike-loop">
        {/* dust behind rear of bike */}
        <ellipse className="oss-dust" cx="52" cy="150" rx="8" ry="3" fill="#f16a34" opacity="0.2" />
        {/* rear delivery box (behind rider) */}
        <rect x="58" y="118" width="26" height="22" rx="3" fill="#5c3a28" />
        <rect x="58" y="118" width="26" height="7" fill="#f16a34" />
        <text x="71" y="136" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="800">
          SVS
        </text>
        {/* scooter body pointing right */}
        <path
          d="M88 148c4-12 14-20 28-18l8 2c6 2 10 6 10 12v4H96c-5 0-9-2-8-5z"
          fill="#f16a34"
        />
        <ellipse cx="108" cy="136" rx="8" ry="4" fill="#2a2a2a" />
        {/* headlight at front (right) */}
        <circle cx="132" cy="132" r="4" fill="#ffd166" />
        <path d="M128 128h10" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        {/* rider facing right */}
        <circle cx="104" cy="116" r="8" fill="#f0c9a0" />
        <path d="M96 110c0-7 5-10 8-10s8 3 8 10" fill="#1a1a1a" />
        <rect x="96" y="124" width="16" height="16" rx="5" fill="#1a1a1a" />
        {/* arm toward handlebars */}
        <path
          d="M112 130c6-2 12-2 16 0"
          fill="none"
          stroke="#f0c9a0"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* rear wheel (left) */}
        <g className="oss-wheel">
          <circle cx="72" cy="150" r="10" fill="#1a1a1a" stroke="#888" strokeWidth="2.5" />
          <circle cx="72" cy="150" r="3" fill="#ddd" />
        </g>
        {/* front wheel (right, toward home) */}
        <g className="oss-wheel">
          <circle cx="128" cy="150" r="10" fill="#1a1a1a" stroke="#888" strokeWidth="2.5" />
          <circle cx="128" cy="150" r="3" fill="#ddd" />
        </g>
      </g>
    </svg>
  );
}

/** Rider standing outside customer's house */
function SceneArrived() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      <ellipse cx="150" cy="172" rx="90" ry="10" fill="#1a1a1a" opacity="0.05" />

      {/* House */}
      <g>
        <polygon points="148,78 210,42 272,78" fill="#f16a34" />
        <rect x="158" y="78" width="104" height="70" fill="#fff8f3" stroke="#e8d4c4" strokeWidth="2" />
        <rect x="196" y="108" width="22" height="40" rx="2" fill="#5c3a28" />
        <circle cx="212" cy="128" r="2" fill="#ffd166" />
        <rect x="170" y="92" width="18" height="16" rx="2" fill="#7ec8e3" opacity="0.6" />
        <rect x="232" y="92" width="18" height="16" rx="2" fill="#7ec8e3" opacity="0.6" />
        {/* chimney */}
        <rect x="236" y="48" width="12" height="22" fill="#d95a2a" />
      </g>

      {/* Parked SVS bike (left of rider) */}
      <g>
        <path d="M48 148c4-10 12-16 24-14l6 2c5 2 8 5 8 10v3H56c-4 0-7-2-8-4z" fill="#f16a34" />
        <rect x="36" y="122" width="22" height="18" rx="3" fill="#5c3a28" />
        <rect x="36" y="122" width="22" height="6" fill="#f16a34" />
        <text x="47" y="137" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="800">
          SVS
        </text>
        <ellipse cx="66" cy="138" rx="5" ry="2.5" fill="#2a2a2a" />
        <circle cx="82" cy="134" r="3" fill="#ffd166" />
        <circle cx="52" cy="154" r="9" fill="#1a1a1a" stroke="#888" strokeWidth="2" />
        <circle cx="52" cy="154" r="2.5" fill="#ddd" />
        <circle cx="86" cy="154" r="9" fill="#1a1a1a" stroke="#888" strokeWidth="2" />
        <circle cx="86" cy="154" r="2.5" fill="#ddd" />
      </g>

      {/* Rider standing outside with bag */}
      <g className="oss-arrived-rider">
        <circle cx="128" cy="112" r="10" fill="#f0c9a0" />
        <path d="M118 105c0-8 5-12 10-12s10 4 10 12" fill="#1a1a1a" />
        <rect x="116" y="124" width="24" height="32" rx="7" fill="#1a1a1a" />
        {/* legs */}
        <rect x="118" y="154" width="7" height="14" rx="2" fill="#2a2a2a" />
        <rect x="131" y="154" width="7" height="14" rx="2" fill="#2a2a2a" />
        {/* arm holding bag toward door */}
        <path
          d="M140 136c8 0 14 2 18 6"
          fill="none"
          stroke="#f0c9a0"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* kraft bag */}
        <g className="oss-float">
          <path d="M152 132h18l2.5 22c0 2.5-1.5 4-4 4h-15c-2.5 0-4-1.5-4-4l2.5-22z" fill="#c4a078" />
          <text x="161" y="148" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="800">
            SVS
          </text>
        </g>
      </g>
    </svg>
  );
}

/** Handing bag to customer */
function SceneDelivered() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      <ellipse cx="140" cy="172" rx="80" ry="10" fill="#2d9e75" opacity="0.1" />

      {/* house */}
      <polygon points="168,88 210,58 252,88" fill="#f16a34" />
      <rect x="176" y="88" width="68" height="52" fill="#fff4ee" stroke="#e8d4c4" strokeWidth="1.5" />
      <rect x="198" y="108" width="18" height="32" fill="#5c3a28" />
      <rect x="182" y="98" width="12" height="12" fill="#7ec8e3" opacity="0.7" />
      <rect x="226" y="98" width="12" height="12" fill="#7ec8e3" opacity="0.7" />

      {/* customer */}
      <g>
        <circle cx="186" cy="128" r="10" fill="#f0c9a0" />
        <rect x="176" y="138" width="20" height="24" rx="6" fill="#2d9e75" />
      </g>

      {/* rider + bag handoff */}
      <g className="oss-handoff">
        <circle cx="138" cy="126" r="10" fill="#f0c9a0" />
        <path d="M130 120c0-8 5-12 8-12s8 4 8 12" fill="#f16a34" />
        <rect x="128" y="136" width="20" height="26" rx="6" fill="#1a1a1a" />
        <rect x="150" y="140" width="22" height="26" rx="4" fill="#5c3a28" />
        <rect x="150" y="140" width="22" height="7" fill="#f16a34" />
        <text x="161" y="158" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="800">
          SVS
        </text>
      </g>

      {/* success check */}
      <g className="oss-float">
        <circle cx="70" cy="70" r="22" fill="#2d9e75" />
        <path
          d="M58 70l8 8 16-16"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <circle className="oss-pulse-ring" cx="70" cy="70" r="22" fill="none" stroke="#2d9e75" strokeWidth="2" opacity="0.4" />

      {/* confetti bits */}
      <rect className="oss-confetti" x="100" y="40" width="5" height="8" rx="1" fill="#f16a34" />
      <rect className="oss-confetti" style={{ animationDelay: "0.3s" }} x="48" y="48" width="4" height="7" rx="1" fill="#ffd166" />
      <rect className="oss-confetti" style={{ animationDelay: "0.55s" }} x="88" y="36" width="5" height="7" rx="1" fill="#2d9e75" />
    </svg>
  );
}

function SceneCancelled() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      <ellipse cx="140" cy="168" rx="60" ry="9" fill="#1a1a1a" opacity="0.06" />
      <circle cx="140" cy="100" r="40" fill="#fff4ee" stroke="#e8d4c4" strokeWidth="3" />
      <path
        d="M124 84l32 32M156 84l-32 32"
        stroke="#f16a34"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const SCENES: Record<OrderStageId, () => ReactNode> = {
  placed: ScenePlaced,
  cod_placed: SceneCodPlaced,
  preparing: ScenePreparing,
  ready: SceneReady,
  pickup: ScenePickup,
  at_store: SceneAtStore,
  onway: SceneOnWay,
  arrived: SceneArrived,
  delivered: SceneDelivered,
  cancelled: SceneCancelled,
};

export function stageFromOrder(input: {
  status?: string | null;
  petpooja_status?: string | null;
  rider_status?: string | null;
  is_cod?: boolean | null;
  cod_unpaid?: boolean | null;
}): OrderStageId {
  const status = input.status || "";
  const pp = input.petpooja_status || "";
  const rs = input.rider_status || "";
  const isCod = !!(input.is_cod || input.cod_unpaid || status === "cod_pending");

  if (status === "cancelled" || pp === "cancelled") return "cancelled";
  if (rs === "delivered" || pp === "delivered" || status === "completed") {
    return "delivered";
  }
  if (rs === "arrived_at_customer") return "arrived";
  if (rs === "out_for_delivery" || rs === "picked_up") return "onway";
  if (rs === "arrived_at_store") return "at_store";
  if (rs === "assigned" || rs === "accepted") return "pickup";
  if (pp === "food_ready") return "ready";
  if (pp === "dispatched") return "pickup";
  if (pp === "accepted") return "preparing";
  // Early COD order — before kitchen / rider progress
  if (isCod && !pp && !rs) return "cod_placed";
  if (status === "cod_pending") return "cod_placed";
  return "placed";
}

type OrderStageSceneProps = {
  stage: OrderStageId;
  className?: string;
};

export default function OrderStageScene({
  stage,
  className = "",
}: OrderStageSceneProps) {
  const Scene = SCENES[stage];

  return (
    <div
      key={stage}
      className={`oss-root relative flex h-full w-full items-center justify-center bg-transparent ${className}`}
      role="img"
      aria-label={STAGE_LABELS[stage].title}
    >
      <div className="oss-scene relative z-[1] h-full w-full">
        <Scene />
      </div>
    </div>
  );
}
