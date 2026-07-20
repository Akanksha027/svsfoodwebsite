"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  cartLineKey,
  useCart,
  type CartLineAddon,
} from "@/context/CartContext";
import { RollingCounter } from "@/components/RollingCounter";
import { formatInr } from "@/lib/menu-api";
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

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
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

  const heroImage =
    (selectedVariant?.image_url && String(selectedVariant.image_url)) ||
    item.image_url ||
    (Array.isArray(item.image_urls) && item.image_urls[0]) ||
    categoryImageUrl ||
    null;

  const hasDistinctVariantImages = useMemo(() => {
    const urls = new Set(
      variants
        .map((v) => v.image_url)
        .filter((u): u is string => Boolean(u && String(u).trim())),
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
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/45 border-0 cursor-pointer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Customise ${item.name}`}
        className="relative z-[81] w-full sm:max-w-md max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-svs-white shadow-xl"
      >
        <div className="relative w-full aspect-[16/10] bg-svs-cream">
          {heroImage ? (
            <Image
              src={heroImage}
              alt=""
              fill
              className="object-contain p-3"
              sizes="400px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-svs-orange/40">
              SVS
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 h-9 w-9 rounded-full bg-svs-white/95 border-0 shadow-sm flex items-center justify-center cursor-pointer text-svs-ink text-lg font-bold"
            aria-label="Go back"
          >
            ←
          </button>
        </div>

        <div className="px-4 pt-3 pb-5">
          <h2 className="text-lg font-extrabold text-svs-ink leading-snug">
            {item.name}
          </h2>
          {selectedVariant ? (
            <p className="mt-0.5 text-sm text-svs-ink/55">
              {selectedVariant.variant_name}
            </p>
          ) : null}
          <p className="mt-1 text-base font-bold text-svs-ink tabular-nums">
            {formatInr(displayPrice)}
          </p>
          {item.description ? (
            <p className="mt-2 text-sm text-svs-ink/55 line-clamp-3">
              {item.description}
            </p>
          ) : null}

          {hasVariants ? (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-svs-ink/45 mb-2">
                {variants[0]?.group_name || "Choose option"}
              </p>
              {hasDistinctVariantImages ? (
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((variant) => (
                    <VariantImageCard
                      key={variant.item_id}
                      variant={variant}
                      fallback={heroImage}
                      selected={selectedVariant?.item_id === variant.item_id}
                      onSelect={() => setSelectedId(variant.item_id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => {
                    const selected =
                      selectedVariant?.item_id === variant.item_id;
                    return (
                      <button
                        key={variant.item_id}
                        type="button"
                        onClick={() => setSelectedId(variant.item_id)}
                        className={`min-w-[44%] flex-1 rounded-xl border-2 px-3 py-2.5 text-left cursor-pointer transition-colors ${
                          selected
                            ? "border-svs-orange bg-svs-cream"
                            : "border-svs-cream bg-svs-white hover:border-svs-orange/40"
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
              <div key={group.id} className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-svs-ink/45">
                  {group.name}
                </p>
                <p className="mt-0.5 mb-2 text-[11px] text-svs-ink/40">{hint}</p>
                <div className="space-y-1.5">
                  {group.items.map((option) => {
                    const selected = picks.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleAddon(group, option)}
                        className={`w-full flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left cursor-pointer transition-colors ${
                          selected
                            ? "border-svs-orange bg-svs-cream"
                            : "border-svs-cream bg-svs-white hover:border-svs-orange/35"
                        }`}
                      >
                        <span
                          className={`shrink-0 h-5 w-5 rounded-[5px] border-2 flex items-center justify-center text-[11px] font-bold ${
                            selected
                              ? "border-svs-orange bg-svs-orange text-white"
                              : "border-svs-ink/25 bg-svs-white text-transparent"
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

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="inline-flex h-11 items-center overflow-hidden rounded-xl bg-svs-orange text-white shadow-sm">
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
                <RollingCounter value={stagedQty} fontSize={18} color="#ffffff" />
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
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl bg-svs-ink text-white text-sm font-extrabold uppercase tracking-wide border-0 cursor-pointer hover:bg-svs-ink/90"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Stable key for matching cart lines to a sheet selection. */
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
  const src = variant.image_url || fallback;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative rounded-xl border-2 overflow-hidden text-left cursor-pointer bg-svs-cream ${
        selected ? "border-svs-orange" : "border-transparent"
      }`}
    >
      <div className="relative aspect-square w-full">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            className="object-contain p-2"
            sizes="160px"
          />
        ) : null}
      </div>
      <div className="px-2 pb-2">
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
