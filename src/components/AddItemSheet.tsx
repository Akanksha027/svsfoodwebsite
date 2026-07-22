"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  cartLineKey,
  useCart,
  type CartLineAddon,
} from "@/context/CartContext";
import { RollingCounter } from "@/components/RollingCounter";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";
import { formatInr } from "@/lib/menu-api";
import { isImageReady, preloadImages } from "@/lib/preload-image";
import type {
  MenuAddonGroup,
  MenuAddonOption,
  MenuItem,
  MenuVariant,
} from "@/lib/menu-types";

export type AddItemSelection = {
  itemId: string;
  petpoojaItemId?: string | null;
  unitPrice: number;
  variant: MenuVariant | null;
  addons: CartLineAddon[];
  quantity: number;
};

type AddItemSheetProps = {
  item: MenuItem;
  categoryImageUrl?: string | null;
  onClose: () => void;
  onAdd: (selection: AddItemSelection) => void;
  onRemove?: (selection: AddItemSelection) => void;
};

function pickImageUrl(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const c of candidates) {
    const s = String(c || "").trim();
    if (!s || s === "null" || s === "undefined") continue;
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) {
      return s;
    }
  }
  return null;
}

/** Native img avoids Next/Image remote-host failures for Petpooja CDNs. */
function SheetImage({
  src,
  alt = "",
  className,
  priority = false,
}: {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(() => isImageReady(src));

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    if (isImageReady(src)) {
      setReady(true);
      return;
    }
    setReady(false);
    void preloadImages([src]).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-svs-orange/40">
        SVS
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`${className ?? ""} ${ready ? "opacity-100" : "opacity-0"} transition-opacity duration-150`}
      decoding={priority ? "sync" : "async"}
      loading="eager"
      fetchPriority={priority ? "high" : "auto"}
      onLoad={() => setReady(true)}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

export default function AddItemSheet({
  item,
  categoryImageUrl,
  onClose,
  onAdd,
  onRemove,
}: AddItemSheetProps) {
  const { lines } = useCart();
  const variants = useMemo(
    () =>
      (item.variants || []).filter(
        (v) => v && v.item_id && v.is_available !== false,
      ),
    [item.variants],
  );
  const addonGroups = useMemo(
    () =>
      [...(item.addon_groups || [])].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
      ),
    [item.addon_groups],
  );
  const hasVariants = variants.length > 0;

  const [selectedId, setSelectedId] = useState<string | null>(
    () => variants[0]?.item_id ?? null,
  );
  const [selectedAddons, setSelectedAddons] = useState<
    Record<string, string[]>
  >({});
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useBodyScrollLock(mounted);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  function requestClose() {
    setVisible(false);
    window.setTimeout(onClose, 280);
  }

  const selectedVariant =
    variants.find((v) => v.item_id === selectedId) || variants[0] || null;

  const flatAddons = useMemo<CartLineAddon[]>(() => {
    const out: CartLineAddon[] = [];
    for (const group of addonGroups) {
      for (const optionId of selectedAddons[group.id] || []) {
        const option = group.items.find((i) => i.id === optionId);
        if (!option) continue;
        out.push({
          id: option.id,
          petpooja_addon_item_id: option.petpooja_addon_item_id ?? null,
          group_id: group.id,
          petpooja_addon_group_id: group.petpooja_addon_group_id ?? null,
          group_name: group.name,
          name: option.name,
          price: Number(option.price) || 0,
          quantity: 1,
        });
      }
    }
    return out;
  }, [addonGroups, selectedAddons]);

  const unitBasePrice = selectedVariant
    ? Number(selectedVariant.price) || 0
    : Number(item.price) || 0;
  const addonsTotal = flatAddons.reduce(
    (sum, a) => sum + a.price * a.quantity,
    0,
  );
  const displayPrice = unitBasePrice + addonsTotal;

  const canSubmit = useMemo(() => {
    if (hasVariants && !selectedVariant) return false;
    for (const group of addonGroups) {
      const count = (selectedAddons[group.id] || []).length;
      if (count < (group.selection_min ?? 0)) return false;
      if (
        group.selection_max != null &&
        group.selection_max > 0 &&
        count > group.selection_max
      ) {
        return false;
      }
    }
    return true;
  }, [hasVariants, selectedVariant, addonGroups, selectedAddons]);

  const fallbackImage = pickImageUrl(
    item.image_url,
    Array.isArray(item.image_urls) ? item.image_urls[0] : null,
    categoryImageUrl,
  );

  const heroImage =
    pickImageUrl(selectedVariant?.image_url) || fallbackImage;

  const sheetImageUrls = useMemo(() => {
    const urls = new Set<string>();
    if (fallbackImage) urls.add(fallbackImage);
    if (heroImage) urls.add(heroImage);
    for (const v of variants) {
      const u = pickImageUrl(v.image_url, fallbackImage);
      if (u) urls.add(u);
    }
    return [...urls];
  }, [fallbackImage, heroImage, variants]);

  useEffect(() => {
    void preloadImages(sheetImageUrls);
  }, [sheetImageUrls]);

  const hasDistinctVariantImages = useMemo(() => {
    const urls = new Set(
      variants
        .map((v) => pickImageUrl(v.image_url))
        .filter((u): u is string => Boolean(u)),
    );
    return urls.size >= 2;
  }, [variants]);

  const stagedQty = useMemo(() => {
    const itemId = selectedVariant ? selectedVariant.item_id : item.id;
    const key = cartLineKey(itemId, flatAddons);
    const line = lines.find((l) => l.key === key);
    return line?.quantity ?? 0;
  }, [selectedVariant, item.id, flatAddons, lines]);

  function buildSelection(): AddItemSelection {
    return {
      itemId: selectedVariant ? selectedVariant.item_id : item.id,
      petpoojaItemId: selectedVariant
        ? selectedVariant.petpooja_item_id ?? null
        : item.petpooja_item_id ?? null,
      unitPrice: unitBasePrice,
      variant: selectedVariant,
      addons: flatAddons,
      quantity: 1,
    };
  }

  function handlePlus() {
    if (!canSubmit) return;
    onAdd(buildSelection());
  }

  function handleMinus() {
    if (stagedQty <= 0) return;
    onRemove?.(buildSelection());
  }

  function toggleAddon(group: MenuAddonGroup, option: MenuAddonOption) {
    setSelectedAddons((prev) => {
      const current = prev[group.id] || [];
      const isSelected = current.includes(option.id);
      const max = group.selection_max ?? Math.max(1, group.items.length);

      if (isSelected) {
        return { ...prev, [group.id]: current.filter((id) => id !== option.id) };
      }
      if (max <= 1) {
        return { ...prev, [group.id]: [option.id] };
      }
      let next = [...current, option.id];
      while (next.length > max) next.shift();
      return { ...prev, [group.id]: next };
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1600] flex items-end sm:items-center justify-center sm:p-5 md:p-8"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 border-0 cursor-pointer transition-opacity duration-300 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "rgba(15, 15, 15, 0.55)" }}
        onClick={requestClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Customise ${item.name}`}
        className={`relative z-[1601] flex flex-col w-full sm:w-[min(100%,34rem)] md:w-[min(100%,38rem)] max-h-[min(94dvh,820px)] rounded-t-[1.5rem] sm:rounded-[1.5rem] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          visible
            ? "opacity-100 translate-y-0 sm:scale-100"
            : "opacity-0 translate-y-8 sm:translate-y-4 sm:scale-[0.96]"
        }`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] bg-white"
          data-scroll-lock-allow
        >
          <div className="relative w-full bg-white aspect-[4/3] sm:aspect-[16/10] max-h-[min(42vh,320px)] sm:max-h-[340px] md:max-h-[380px]">
            {heroImage ? (
              <SheetImage
                src={heroImage}
                alt={item.name}
                priority
                className="absolute inset-0 m-auto max-h-full max-w-full w-full h-full object-contain p-4 sm:p-6"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-svs-orange/40">
                SVS
              </div>
            )}
            <button
              type="button"
              onClick={requestClose}
              className="absolute top-3 left-3 h-10 w-10 rounded-full bg-white border border-black/[0.06] shadow-md flex items-center justify-center cursor-pointer text-svs-ink text-lg font-bold hover:bg-gray-50 transition-colors"
              aria-label="Go back"
            >
              ←
            </button>
          </div>

          <div className="px-5 sm:px-6 pt-4 pb-5 bg-white">
            <h2 className="text-lg sm:text-xl font-extrabold text-svs-ink leading-snug">
              {item.name}
            </h2>
            {selectedVariant ? (
              <p className="mt-0.5 text-sm text-svs-ink/55">
                {selectedVariant.variant_name}
              </p>
            ) : null}
            <p className="mt-1.5 text-base sm:text-lg font-bold text-svs-ink tabular-nums">
              {formatInr(displayPrice)}
            </p>
            {item.description ? (
              <p className="mt-2 text-sm text-svs-ink/55 leading-relaxed">
                {item.description}
              </p>
            ) : null}

            {hasVariants ? (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-svs-ink/45 mb-2.5">
                  {variants[0]?.group_name || "Choose option"}
                </p>
                {hasDistinctVariantImages ? (
                  <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5">
                    {variants.map((variant) => (
                      <VariantImageCard
                        key={variant.item_id}
                        variant={variant}
                        fallback={fallbackImage}
                        selected={selectedVariant?.item_id === variant.item_id}
                        onSelect={() => setSelectedId(variant.item_id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5">
                    {variants.map((variant) => {
                      const selected =
                        selectedVariant?.item_id === variant.item_id;
                      return (
                        <button
                          key={variant.item_id}
                          type="button"
                          onClick={() => setSelectedId(variant.item_id)}
                          className={`rounded-xl border-2 px-3 py-2.5 text-left cursor-pointer transition-colors ${
                            selected
                              ? "border-svs-orange bg-[#fff4ee]"
                              : "border-gray-200 bg-white hover:border-svs-orange/40"
                          }`}
                        >
                          <span className="block text-sm font-semibold text-svs-ink leading-snug">
                            {variant.variant_name}
                          </span>
                          <span className="mt-0.5 block text-xs font-bold text-svs-ink/60 tabular-nums">
                            {formatInr(variant.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {addonGroups.map((group) => {
              const max =
                group.selection_max ?? Math.max(1, group.items.length);
              const isSingle = max <= 1;
              const hint = isSingle ? "Pick one" : `Pick up to ${max}`;
              const picks = selectedAddons[group.id] || [];
              return (
                <div key={group.id} className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-svs-ink/45">
                    {group.name}
                  </p>
                  <p className="mt-0.5 mb-2.5 text-[11px] text-svs-ink/40">
                    {hint}
                  </p>
                  <div className="space-y-2">
                    {group.items.map((option) => {
                      const selected = picks.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleAddon(group, option)}
                          className={`w-full flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left cursor-pointer transition-colors ${
                            selected
                              ? "border-svs-orange bg-[#fff4ee]"
                              : "border-gray-200 bg-white hover:border-svs-orange/35"
                          }`}
                        >
                          <span
                            className={`shrink-0 h-5 w-5 rounded-[5px] border-2 flex items-center justify-center text-[11px] font-bold ${
                              selected
                                ? "border-svs-orange bg-svs-orange text-white"
                                : "border-svs-ink/25 bg-white text-transparent"
                            }`}
                            aria-hidden
                          >
                            ✓
                          </span>
                          <span className="flex-1 min-w-0 text-sm font-semibold text-svs-ink">
                            {option.name}
                          </span>
                          <span className="shrink-0 text-xs font-bold text-svs-ink/55 tabular-nums">
                            {option.price > 0
                              ? `+${formatInr(option.price)}`
                              : formatInr(0)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {!canSubmit ? (
              <p className="mt-3 text-xs text-svs-orange-dark">
                Pick the required options to add this item.
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="shrink-0 border-t border-gray-100 bg-white px-5 sm:px-6 pt-3.5"
          style={{
            paddingBottom: "max(0.85rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex items-center justify-center">
            <div className="inline-flex h-12 items-center overflow-hidden rounded-xl bg-svs-orange text-white shadow-sm">
              <button
                type="button"
                onClick={handleMinus}
                disabled={stagedQty <= 0}
                className="w-11 h-full flex items-center justify-center text-xl font-bold border-0 bg-transparent cursor-pointer hover:bg-svs-orange-dark disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="min-w-[28px] flex items-center justify-center">
                <RollingCounter
                  value={stagedQty}
                  fontSize={18}
                  color="#ffffff"
                />
              </span>
              <button
                type="button"
                onClick={handlePlus}
                disabled={!canSubmit}
                className="w-11 h-full flex items-center justify-center text-xl font-bold border-0 bg-transparent cursor-pointer hover:bg-svs-orange-dark disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function selectionKey(
  itemId: string,
  addons: { id: string; quantity: number }[],
): string {
  return cartLineKey(itemId, addons);
}

function VariantImageCard({
  variant,
  fallback,
  selected,
  onSelect,
}: {
  variant: MenuVariant;
  fallback: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
  const src = pickImageUrl(variant.image_url, fallback);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative rounded-xl border-2 overflow-hidden text-left cursor-pointer bg-white ${
        selected ? "border-svs-orange" : "border-gray-200"
      }`}
    >
      <div className="relative aspect-square w-full max-h-[150px] bg-white">
        {src ? (
          <SheetImage
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-contain p-2"
          />
        ) : null}
      </div>
      <div className="px-2.5 pb-2.5">
        <p className="text-xs font-semibold text-svs-ink line-clamp-2">
          {variant.variant_name}
        </p>
        <p className="text-[11px] font-bold text-svs-ink/55 tabular-nums">
          {formatInr(variant.price)}
        </p>
      </div>
    </button>
  );
}
