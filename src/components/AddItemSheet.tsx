"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  cartLineKey,
  useCart,
  type CartLineAddon,
} from "@/context/CartContext";
import { RollingCounter } from "@/components/RollingCounter";
import { resolveAddonImageUrl } from "@/lib/addon-image";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";
import {
  buildComboImageContext,
  isComboItem,
  orderComboAddonGroups,
} from "@/lib/combo-option-image";
import { formatInr } from "@/lib/menu-api";
import { pickImageUrl } from "@/lib/menu-item-image";
import { isImageReady, preloadImages } from "@/lib/preload-image";
import type {
  MenuAddonGroup,
  MenuAddonOption,
  MenuCategory,
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
  categories?: MenuCategory[];
  menuItems?: MenuItem[];
  onClose: () => void;
  onAdd: (selection: AddItemSelection) => void;
  onRemove?: (selection: AddItemSelection) => void;
};

/** Pre-select first option in each required addon group (combo slots). */
function buildDefaultAddonSelections(
  groups: MenuAddonGroup[],
): Record<string, string[]> {
  const defaults: Record<string, string[]> = {};
  for (const group of groups) {
    const min = group.selection_min ?? 0;
    if (min >= 1 && group.items.length > 0) {
      defaults[group.id] = [group.items[0].id];
    }
  }
  return defaults;
}

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
  categories = [],
  menuItems = [],
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
  const isCombo = useMemo(
    () => isComboItem(item, categories),
    [item, categories],
  );
  const orderedAddonGroups = useMemo(
    () => orderComboAddonGroups(addonGroups, isCombo),
    [addonGroups, isCombo],
  );

  const comboImages = useMemo(
    () =>
      buildComboImageContext({
        item,
        categories,
        items: menuItems,
        isCombo,
      }),
    [item, categories, menuItems, isCombo],
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    () => variants[0]?.item_id ?? null,
  );
  const [selectedAddons, setSelectedAddons] = useState<
    Record<string, string[]>
  >(() => buildDefaultAddonSelections(addonGroups));
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setSelectedId(variants[0]?.item_id ?? null);
    setSelectedAddons(buildDefaultAddonSelections(addonGroups));
  }, [item.id, addonGroups, variants]);

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

  const requestClose = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setVisible(false);
    window.setTimeout(onClose, 280);
  }, [onClose]);

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

  const itemCategory = useMemo(
    () => categories.find((c) => c.id === item.category_id) ?? null,
    [categories, item.category_id],
  );

  const fallbackImage = pickImageUrl(
    item.image_url,
    Array.isArray(item.image_urls) ? item.image_urls[0] : null,
    categoryImageUrl,
    itemCategory?.image_url,
    itemCategory?.icon_url,
  );

  const hasDistinctVariantImages = useMemo(() => {
    if (variants.length < 2) return false;
    const urls = variants.map((v) =>
      typeof v.image_url === "string" ? v.image_url.trim() : "",
    );
    if (urls.some((u) => u === "")) return false;
    return new Set(urls).size === urls.length;
  }, [variants]);

  const heroImage = useMemo(() => {
    if (hasDistinctVariantImages && selectedVariant?.image_url) {
      return pickImageUrl(selectedVariant.image_url, fallbackImage) || fallbackImage;
    }
    return fallbackImage;
  }, [hasDistinctVariantImages, selectedVariant, fallbackImage]);

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
      <div
        role="presentation"
        aria-hidden
        className={`absolute inset-0 cursor-pointer transition-opacity duration-300 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "rgba(15, 15, 15, 0.55)" }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={requestClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Customise ${item.name}`}
        className={`relative z-[1601] flex flex-col w-full sm:w-[min(100%,56rem)] h-[min(76dvh,560px)] min-h-[min(76dvh,560px)] max-h-[min(76dvh,560px)] rounded-t-[1.5rem] sm:rounded-[1.5rem] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          visible
            ? "opacity-100 translate-y-0 sm:scale-100"
            : "opacity-0 translate-y-8 sm:translate-y-4 sm:scale-[0.96]"
        }`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-1 min-h-0 flex-col md:flex-row h-full">
          {/* Left — hero image (kiosk-style: main photo stays here while picking) */}
          <div className="relative shrink-0 md:w-[38%] lg:w-[36%] h-[min(28vh,200px)] md:h-full bg-white border-b md:border-b-0 md:border-r border-gray-100">
            <div className="relative w-full h-full md:absolute md:inset-0 md:flex md:items-center md:justify-center md:p-6 lg:p-8">
              {heroImage ? (
                <SheetImage
                  src={heroImage}
                  alt={item.name}
                  priority
                  className="absolute inset-0 m-auto max-h-full max-w-full w-full h-full object-contain p-4 md:p-0"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-svs-orange/40">
                  SVS
                </div>
              )}
              <button
                type="button"
                onClick={requestClose}
                className="absolute top-3 left-3 h-10 w-10 rounded-full bg-white border border-black/[0.06] shadow-md flex items-center justify-center cursor-pointer text-svs-ink text-lg font-bold hover:bg-gray-50 transition-colors z-10"
                aria-label="Go back"
              >
                ←
              </button>
            </div>
          </div>

          {/* Right — title + selections (scrollable) */}
          <div
            className="flex flex-col flex-1 min-h-0 min-w-0"
            data-scroll-lock-allow
          >
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-4 pb-4">
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
                <p className="mt-2 text-sm text-svs-ink/55 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              ) : null}

              {hasVariants ? (
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-svs-ink/45 mb-2.5">
                    {variants[0]?.group_name || "Choose option"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => {
                      const selected =
                        selectedVariant?.item_id === variant.item_id;
                      return (
                        <button
                          key={variant.item_id}
                          type="button"
                          onClick={() => setSelectedId(variant.item_id)}
                          className={`rounded-xl border-2 px-3 py-2 text-left cursor-pointer transition-colors min-w-[7.5rem] ${
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
                </div>
              ) : null}

              {orderedAddonGroups.map((group) => {
                const max =
                  group.selection_max ?? Math.max(1, group.items.length);
                const isSingle = max <= 1;
                const hint = isSingle ? "Pick one" : `Pick up to ${max}`;
                const picks = selectedAddons[group.id] || [];
                const isComboRequiredSlot =
                  isCombo && (group.selection_min ?? 0) >= 1;

                return (
                  <div key={group.id} className="mt-5">
                    {isComboRequiredSlot ? (
                      <ComboOptionCarousel
                        group={group}
                        hint={hint}
                        picks={picks}
                        resolveOptionImage={(option) =>
                          comboImages.resolveComboOptionImage(
                            group,
                            option.name,
                          )
                        }
                        onToggle={(option) => toggleAddon(group, option)}
                      />
                    ) : (
                      <>
                        <p className="text-xs font-bold uppercase tracking-wide text-svs-ink/45">
                          {group.name}
                        </p>
                        <p className="mt-0.5 mb-2.5 text-[11px] text-svs-ink/40">
                          {hint}
                        </p>
                        <div className="space-y-2">
                          {group.items.map((option) => {
                            const selected = picks.includes(option.id);
                            const optionImage =
                              resolveAddonImageUrl(option.name) ?? fallbackImage;
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
                                {optionImage ? (
                                  <span className="relative shrink-0 h-11 w-11 rounded-lg overflow-hidden bg-white border border-gray-100">
                                    <SheetImage
                                      src={optionImage}
                                      alt=""
                                      className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    {selected ? (
                                      <span className="absolute inset-0 bg-svs-orange/15 flex items-center justify-center">
                                        <span className="h-4 w-4 rounded-full bg-svs-orange text-white text-[10px] font-bold flex items-center justify-center">
                                          ✓
                                        </span>
                                      </span>
                                    ) : null}
                                  </span>
                                ) : (
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
                                )}
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
                      </>
                    )}
                  </div>
                );
              })}

              {!canSubmit ? (
                <p className="mt-3 text-xs text-svs-orange-dark">
                  Pick the required options to add this item.
                </p>
              ) : null}
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

function ComboOptionCarousel({
  group,
  hint,
  picks,
  resolveOptionImage,
  onToggle,
}: {
  group: MenuAddonGroup;
  hint: string;
  picks: string[];
  resolveOptionImage: (option: MenuAddonOption) => string | null;
  onToggle: (option: MenuAddonOption) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollHints = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth > 8;
    setCanScrollLeft(overflow && el.scrollLeft > 8);
    setCanScrollRight(
      overflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 8,
    );
  }, []);

  useEffect(() => {
    updateScrollHints();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollHints, { passive: true });
    const ro = new ResizeObserver(updateScrollHints);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollHints);
      ro.disconnect();
    };
  }, [group.items.length, updateScrollHints]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardStep = Math.max(160, Math.round(el.clientWidth * 0.72));
    el.scrollBy({ left: direction * cardStep, behavior: "smooth" });
  };

  const showArrows = canScrollLeft || canScrollRight;

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-svs-ink/45">
            {group.name}
          </p>
          <p className="mt-0.5 text-[11px] text-svs-ink/40">{hint}</p>
        </div>
        {showArrows ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              disabled={!canScrollLeft}
              className="h-8 w-8 rounded-full border border-gray-200 bg-white text-svs-ink text-sm font-bold flex items-center justify-center cursor-pointer hover:border-svs-orange/40 hover:bg-[#fff4ee] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              aria-label={`Scroll ${group.name} left`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              disabled={!canScrollRight}
              className="h-8 w-8 rounded-full border border-gray-200 bg-white text-svs-ink text-sm font-bold flex items-center justify-center cursor-pointer hover:border-svs-orange/40 hover:bg-[#fff4ee] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              aria-label={`Scroll ${group.name} right`}
            >
              →
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory [scrollbar-width:thin]"
      >
        {group.items.map((option) => {
          const selected = picks.includes(option.id);
          const optionImage = resolveOptionImage(option);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option)}
              className={`snap-start shrink-0 w-[7.5rem] sm:w-[8.25rem] rounded-xl border-2 overflow-hidden text-left cursor-pointer transition-colors ${
                selected
                  ? "border-svs-orange bg-[#fff4ee]"
                  : "border-gray-200 bg-white hover:border-svs-orange/35"
              }`}
              aria-pressed={selected}
            >
              <div className="relative aspect-square w-full bg-white">
                {optionImage ? (
                  <SheetImage
                    src={optionImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-svs-orange/35">
                    SVS
                  </div>
                )}
                {selected ? (
                  <span className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-svs-orange text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                    ✓
                  </span>
                ) : null}
              </div>
              <div className="px-2 pb-2 pt-1">
                <p className="text-[11px] font-semibold text-svs-ink line-clamp-2 leading-snug">
                  {option.name}
                </p>
                <p className="mt-0.5 text-[10px] font-bold text-svs-ink/55 tabular-nums">
                  {option.price > 0
                    ? `+${formatInr(option.price)}`
                    : formatInr(0)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
