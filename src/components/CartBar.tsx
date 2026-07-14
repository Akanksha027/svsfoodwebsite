"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCart } from "@/context/CartContext";
import { formatInr } from "@/lib/menu-api";
import { preloadImage } from "@/lib/preload-image";

const CHIP_SIZE = 40;
const CHIP_OVERLAP = 22;
const MAX_VISIBLE_CHIPS = 5;
const PILL_INSET = 16;
/** Slow lift from card → pause at top */
const FLY_RISE_MS = 900;
/** Faster (but still gentle) arc into cart chip */
const FLY_DROP_MS = 700;

function chipMarginLeft(index: number) {
  if (index === 0) return 0;
  return -(CHIP_SIZE - CHIP_OVERLAP);
}

function visibleChipCount(total: number) {
  if (total <= MAX_VISIBLE_CHIPS) return total;
  return MAX_VISIBLE_CHIPS - 1;
}

function chipTargetRect(
  pillEl: HTMLElement,
  slotIndex: number,
): { left: number; top: number; size: number } {
  const pill = pillEl.getBoundingClientRect();
  const visibleIndex = Math.min(slotIndex, visibleChipCount(slotIndex + 1) - 1);
  const left =
    pill.left + PILL_INSET + visibleIndex * (CHIP_SIZE - CHIP_OVERLAP);
  const top = pill.top + (pill.height - CHIP_SIZE) / 2;
  return { left, top, size: CHIP_SIZE };
}

type FlyAnim = {
  key: number;
  imageUrl: string;
  slotIndex: number;
  from: { left: number; top: number; width: number; height: number };
  to: { left: number; top: number; size: number };
};

function ItemChip({
  imageUrl,
  name,
}: {
  imageUrl?: string | null;
  name: string;
}) {
  return (
    <div className="relative w-full h-full overflow-visible">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-contain pointer-events-none select-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
          sizes={`${CHIP_SIZE}px`}
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80">
          SVS
        </div>
      )}
    </div>
  );
}

type FlyTarget = { left: number; top: number; size: number };

function FlyingItem({
  anim,
  getTarget,
  onDone,
}: {
  anim: FlyAnim;
  getTarget: (slotIndex: number) => FlyTarget;
  onDone: () => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    void preloadImage(anim.imageUrl).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [anim.imageUrl, anim.key]);

  useLayoutEffect(() => {
    if (!ready) return;
    const el = elRef.current;
    if (!el) return;

    const fromCx = anim.from.left + anim.from.width / 2;
    const fromCy = anim.from.top + anim.from.height / 2;
    const popY = fromCy - 140;
    const rawStart =
      Math.max(anim.from.width, anim.from.height) / anim.to.size;
    const startScale = Math.min(rawStart, 2.4);
    const popScale = Math.min(startScale * 1.55, 3.4);

    const at = (x: number, y: number, scale: number) =>
      `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;

    const riseStart = at(fromCx, fromCy, startScale);
    const riseEnd = at(fromCx, popY, popScale);

    const rise = el.animate(
      [{ transform: riseStart, opacity: 1 }, { transform: riseEnd, opacity: 1 }],
      {
        duration: FLY_RISE_MS,
        easing: "cubic-bezier(0.12, 0.85, 0.22, 1)",
        fill: "forwards",
      },
    );

    let drop: Animation | null = null;

    const snapToTarget = () => {
      const target = getTarget(anim.slotIndex);
      const cx = target.left + target.size / 2;
      const cy = target.top + target.size / 2;
      el.style.transform = at(cx, cy, 1);
    };

    const onRiseEnd = () => {
      // Re-measure after layout so the drop lands on the real chip slot.
      requestAnimationFrame(() => {
        const target = getTarget(anim.slotIndex);
        const toCx = target.left + target.size / 2;
        const toCy = target.top + target.size / 2;
        const dropEnd = at(toCx, toCy, 1);
        const handoff =
          getComputedStyle(el).transform !== "none"
            ? getComputedStyle(el).transform
            : riseEnd;

        drop = el.animate(
          [{ transform: handoff, opacity: 1 }, { transform: dropEnd, opacity: 1 }],
          {
            duration: FLY_DROP_MS,
            easing: "cubic-bezier(0.45, 0, 0.55, 1)",
            fill: "forwards",
          },
        );
        drop.onfinish = () => {
          snapToTarget();
          onDone();
        };
      });
    };

    rise.onfinish = onRiseEnd;

    return () => {
      rise.cancel();
      drop?.cancel();
    };
  }, [anim, getTarget, onDone, ready]);

  return (
    <div
      ref={elRef}
      className="fixed z-[1200] pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: anim.to.size,
        height: anim.to.size,
        visibility: ready ? "visible" : "hidden",
        willChange: "transform",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={anim.imageUrl}
        alt=""
        loading="eager"
        decoding="sync"
        className="w-full h-full object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
        draggable={false}
      />
    </div>
  );
}

export default function CartBar() {
  const { lines, itemCount, subtotal, lastAddFly, acknowledgeAddFly } =
    useCart();

  const pillRef = useRef<HTMLAnchorElement>(null);
  const chipSlotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [flyAnim, setFlyAnim] = useState<FlyAnim | null>(null);
  const [cartBarReady, setCartBarReady] = useState(false);
  const completedFlyKeys = useRef<Set<number>>(new Set());
  const pendingFlyRef = useRef(lastAddFly);

  pendingFlyRef.current = lastAddFly;

  const slots = useMemo(() => {
    const out: Array<{
      itemId: string;
      imageUrl?: string | null;
      name: string;
    }> = [];
    for (const line of lines) {
      for (let q = 0; q < line.quantity; q++) {
        out.push({
          itemId: line.itemId,
          imageUrl: line.chipImageUrl ?? line.imageUrl,
          name: line.name,
        });
      }
    }
    return out;
  }, [lines]);

  const totalSlots = slots.length;
  const chipsVisible = visibleChipCount(totalSlots);
  const hiddenCount = Math.max(0, totalSlots - MAX_VISIBLE_CHIPS);

  useLayoutEffect(() => {
    if (itemCount <= 0) {
      setCartBarReady(false);
      return;
    }
    setCartBarReady(false);

    let frames = 0;
    let cancelled = false;
    const waitForLayout = () => {
      if (cancelled) return;
      frames += 1;
      if (frames < 2) {
        requestAnimationFrame(waitForLayout);
        return;
      }
      setCartBarReady(true);
    };
    requestAnimationFrame(waitForLayout);
    return () => {
      cancelled = true;
    };
  }, [itemCount, chipsVisible, totalSlots]);

  const finishFly = useCallback(
    (key: number) => {
      completedFlyKeys.current.add(key);
      acknowledgeAddFly(key);
      setFlyAnim(null);
    },
    [acknowledgeAddFly],
  );

  const onFlyDone = useCallback(() => {
    setFlyAnim((current) => {
      if (current) finishFly(current.key);
      return null;
    });
  }, [finishFly]);

  const getFlyTarget = useCallback((slotIndex: number): FlyTarget => {
    const slotEl = chipSlotRefs.current[slotIndex];
    if (slotEl) {
      const rect = slotEl.getBoundingClientRect();
      return { left: rect.left, top: rect.top, size: rect.width || CHIP_SIZE };
    }
    const pill = pillRef.current;
    if (pill) return chipTargetRect(pill, slotIndex);
    return { left: 0, top: 0, size: CHIP_SIZE };
  }, []);

  useEffect(() => {
    const event = lastAddFly;
    if (!event || completedFlyKeys.current.has(event.key)) return;
    if (!cartBarReady) return;
    if (!event.chipImageUrl) {
      acknowledgeAddFly(event.key);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const tryStart = () => {
      if (cancelled) return;
      attempts += 1;

      const pill = pillRef.current;
      const pending = pendingFlyRef.current;
      if (!pending || pending.key !== event.key) return;

      if (!pill) {
        if (attempts < 12) requestAnimationFrame(tryStart);
        return;
      }

      const maxSlot = visibleChipCount(pending.slotIndex + 1) - 1;
      if (
        pending.slotIndex > maxSlot &&
        pending.slotIndex >= MAX_VISIBLE_CHIPS - 1
      ) {
        completedFlyKeys.current.add(pending.key);
        acknowledgeAddFly(pending.key);
        return;
      }

      const slotEl = chipSlotRefs.current[pending.slotIndex];
      if (!slotEl) {
        if (attempts < 16) requestAnimationFrame(tryStart);
        return;
      }

      void preloadImage(pending.chipImageUrl).then(() => {
        if (cancelled) return;
        if (pendingFlyRef.current?.key !== event.key) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          const liveTarget = getFlyTarget(pending.slotIndex);
          setFlyAnim({
            key: pending.key,
            imageUrl: pending.chipImageUrl!,
            slotIndex: pending.slotIndex,
            from: pending.sourceRect,
            to: liveTarget,
          });
        });
      });
    };

    requestAnimationFrame(() => requestAnimationFrame(tryStart));
    return () => {
      cancelled = true;
    };
  }, [acknowledgeAddFly, cartBarReady, getFlyTarget, lastAddFly]);

  if (itemCount <= 0 && !flyAnim) return null;

  return (
    <>
      {flyAnim ? (
        <FlyingItem
          anim={flyAnim}
          getTarget={getFlyTarget}
          onDone={onFlyDone}
        />
      ) : null}

      {itemCount > 0 ? (
        <div className="cart-bar-shell fixed bottom-4 left-0 right-0 z-[900] px-4 pointer-events-none">
          <Link
            ref={pillRef}
            href="/cart"
            className="pointer-events-auto mx-auto max-w-[560px] relative flex items-center h-[72px] rounded-2xl bg-svs-orange text-white shadow-[0_12px_32px_rgba(241,106,52,0.38)] no-underline overflow-visible"
          >
            <div
              className="absolute left-0 top-0 bottom-0 flex items-center overflow-visible z-[2]"
              style={{ paddingLeft: PILL_INSET, maxWidth: "46%" }}
            >
              <div className="flex items-center overflow-visible">
                {Array.from({ length: chipsVisible }).map((_, index) => {
                  const slot = slots[index];
                  const isFlyingSlot = flyAnim?.slotIndex === index;
                  const marginLeft = chipMarginLeft(index);

                  if (!slot) return null;
                  return (
                    <div
                      key={`chip-slot-${index}`}
                      ref={(el) => {
                        chipSlotRefs.current[index] = el;
                      }}
                      className="relative shrink-0"
                      style={{ width: CHIP_SIZE, height: CHIP_SIZE, marginLeft }}
                    >
                      <div
                        className="w-full h-full"
                        style={{ opacity: isFlyingSlot ? 0 : 1 }}
                      >
                        <ItemChip
                          imageUrl={slot.imageUrl}
                          name={slot.name}
                        />
                      </div>
                    </div>
                  );
                })}
                {hiddenCount > 0 ? (
                  <div
                    className="shrink-0 flex items-center justify-center rounded-full bg-white/25 text-white text-xs font-extrabold backdrop-blur-[2px]"
                    style={{
                      width: CHIP_SIZE,
                      height: CHIP_SIZE,
                      marginLeft: chipMarginLeft(chipsVisible),
                    }}
                  >
                    +{hiddenCount}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none px-[92px]">
              <span className="text-[13px] sm:text-sm font-extrabold tracking-[0.06em] uppercase text-center leading-tight">
                View cart
              </span>
            </div>

            <div
              className="absolute right-0 top-0 bottom-0 flex items-center justify-end z-[2] pointer-events-none"
              style={{ paddingRight: PILL_INSET, minWidth: 88 }}
            >
              <span className="text-lg sm:text-xl font-extrabold tabular-nums">
                {formatInr(subtotal)}
              </span>
            </div>
          </Link>
        </div>
      ) : null}
    </>
  );
}
