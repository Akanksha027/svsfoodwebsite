"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { StoreLocation } from "@/data/locations";
import { resolveStoreLocation } from "@/data/locations";
import { SELECTED_STORE_KEY } from "@/lib/config";

export type CartLineAddon = {
  id: string;
  petpooja_addon_item_id?: string | null;
  group_id: string;
  petpooja_addon_group_id?: string | null;
  group_name: string;
  name: string;
  price: number;
  quantity: number;
};

export type CartLine = {
  key: string;
  /** Real menu / variant DB id (never synthetic `var_*` parent card id). */
  itemId: string;
  petpoojaItemId?: string | null;
  name: string;
  /** Unit base price without addons. */
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
  /** Category artwork — transparent PNG for cart bar chips + fly animation. */
  chipImageUrl?: string | null;
  isVeg?: boolean | null;
  /** Parent card id when this line is a variation child. */
  parentItemId?: string | null;
  variantName?: string | null;
  variantGroupName?: string | null;
  addons: CartLineAddon[];
  addonsTotal: number;
};

type CartState = {
  storeId: string;
  lines: CartLine[];
};

export type CartAddFlyEvent = {
  key: number;
  itemId: string;
  chipImageUrl?: string | null;
  slotIndex: number;
  sourceRect: { left: number; top: number; width: number; height: number };
};

export type AddItemInput = Omit<CartLine, "key" | "quantity" | "addons" | "addonsTotal"> & {
  quantity?: number;
  addons?: CartLineAddon[];
};

export type AddItemOptions = {
  sourceRect?: { left: number; top: number; width: number; height: number };
};

type CartContextValue = {
  store: StoreLocation;
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  lastAddFly: CartAddFlyEvent | null;
  acknowledgeAddFly: (key: number) => void;
  setStoreId: (storeId: string) => void;
  addItem: (item: AddItemInput, options?: AddItemOptions) => void;
  setQuantity: (key: string, quantity: number) => void;
  /** Decrement the most recently added line whose itemId is in `itemIds`. */
  decrementLastMatching: (itemIds: string[]) => void;
  quantityForItemIds: (itemIds: string[]) => number;
  removeLine: (key: string) => void;
  clearCart: () => void;
};

const CART_KEY = "svs_web_cart_v3";
const EMPTY: CartState = { storeId: "satna", lines: [] };

let cachedSnapshot: CartState = EMPTY;
let cachedSnapshotKey: string | null = null;

export function lineUnitTotal(line: {
  unitPrice: number;
  addonsTotal?: number;
}): number {
  return (Number(line.unitPrice) || 0) + (Number(line.addonsTotal) || 0);
}

export function addonsSignature(
  addons: { id: string; quantity: number }[] | null | undefined,
): string {
  return (addons || [])
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((a) => `${a.id}:${a.quantity}`)
    .join("|");
}

export function cartLineKey(
  itemId: string,
  addons?: { id: string; quantity: number }[] | null,
): string {
  const sig = addonsSignature(addons);
  return sig ? `${itemId}::${sig}` : itemId;
}

function normalizeAddons(addons?: CartLineAddon[] | null): {
  addons: CartLineAddon[];
  addonsTotal: number;
} {
  const list = (addons || []).map((a) => ({
    id: a.id,
    petpooja_addon_item_id: a.petpooja_addon_item_id ?? null,
    group_id: a.group_id,
    petpooja_addon_group_id: a.petpooja_addon_group_id ?? null,
    group_name: a.group_name,
    name: a.name,
    price: Number(a.price) || 0,
    quantity: Math.max(1, Number(a.quantity) || 1),
  }));
  const addonsTotal = list.reduce(
    (sum, a) => sum + a.price * a.quantity,
    0,
  );
  return { addons: list, addonsTotal };
}

function parseCartFromRaw(raw: string | null): CartState {
  if (!raw) {
    const storeId =
      (typeof window !== "undefined" &&
        localStorage.getItem(SELECTED_STORE_KEY)) ||
      "satna";
    return { storeId, lines: [] };
  }
  const parsed = JSON.parse(raw) as CartState;
  if (!parsed || !Array.isArray(parsed.lines)) return EMPTY;
  return {
    storeId: parsed.storeId || "satna",
    lines: parsed.lines
      .filter((l) => l && l.itemId && l.quantity > 0)
      .map((l) => {
        const { addons, addonsTotal } = normalizeAddons(l.addons);
        return {
          ...l,
          addons,
          addonsTotal: l.addonsTotal ?? addonsTotal,
        };
      }),
  };
}

function readCart(): CartState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(CART_KEY);
    const key = raw ?? `__empty__:${localStorage.getItem(SELECTED_STORE_KEY) || "satna"}`;
    if (key === cachedSnapshotKey) return cachedSnapshot;
    cachedSnapshotKey = key;
    cachedSnapshot = parseCartFromRaw(raw);
    return cachedSnapshot;
  } catch {
    if (cachedSnapshotKey === "__error__") return cachedSnapshot;
    cachedSnapshotKey = "__error__";
    cachedSnapshot = EMPTY;
    return cachedSnapshot;
  }
}

function writeCart(state: CartState) {
  const serialized = JSON.stringify(state);
  localStorage.setItem(CART_KEY, serialized);
  try {
    localStorage.setItem(SELECTED_STORE_KEY, state.storeId);
  } catch {
    /* ignore */
  }
  cachedSnapshotKey = serialized;
  cachedSnapshot = {
    storeId: state.storeId,
    lines: state.lines,
  };
  window.dispatchEvent(new Event("svs-cart-change"));
}

function subscribe(onChange: () => void) {
  const handler = () => onChange();
  window.addEventListener("svs-cart-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("svs-cart-change", handler);
    window.removeEventListener("storage", handler);
  };
}

function useCartState(): CartState {
  return useSyncExternalStore(subscribe, readCart, () => EMPTY);
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const state = useCartState();
  const [lastAddFly, setLastAddFly] = useState<CartAddFlyEvent | null>(null);

  const acknowledgeAddFly = useCallback((key: number) => {
    setLastAddFly((prev) => (prev?.key === key ? null : prev));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const store = resolveStoreLocation(state.storeId);
    const subtotal = state.lines.reduce(
      (sum, line) => sum + lineUnitTotal(line) * line.quantity,
      0,
    );
    const itemCount = state.lines.reduce((sum, line) => sum + line.quantity, 0);

    return {
      store,
      lines: state.lines,
      itemCount,
      subtotal,
      lastAddFly,
      acknowledgeAddFly,
      setStoreId: (storeId) => {
        const next = resolveStoreLocation(storeId);
        const current = readCart();
        if (current.storeId === next.id) return;
        writeCart({ storeId: next.id, lines: [] });
      },
      addItem: (item, options) => {
        const current = readCart();
        const slotIndex = current.lines.reduce(
          (sum, line) => sum + line.quantity,
          0,
        );
        const storeId =
          current.storeId ||
          localStorage.getItem(SELECTED_STORE_KEY) ||
          "satna";
        const { addons, addonsTotal } = normalizeAddons(item.addons);
        const key = cartLineKey(item.itemId, addons);
        const existing = current.lines.find((l) => l.key === key);
        let lines: CartLine[];
        if (existing) {
          lines = current.lines.map((l) =>
            l.key === key
              ? { ...l, quantity: l.quantity + (item.quantity || 1) }
              : l,
          );
        } else {
          lines = [
            ...current.lines,
            {
              key,
              itemId: item.itemId,
              petpoojaItemId: item.petpoojaItemId,
              name: item.name,
              unitPrice: item.unitPrice,
              quantity: item.quantity || 1,
              imageUrl: item.imageUrl,
              chipImageUrl: item.chipImageUrl ?? item.imageUrl,
              isVeg: item.isVeg,
              parentItemId: item.parentItemId ?? null,
              variantName: item.variantName ?? null,
              variantGroupName: item.variantGroupName ?? null,
              addons,
              addonsTotal,
            },
          ];
        }
        writeCart({ storeId, lines });
        if (options?.sourceRect) {
          const chipImage =
            item.chipImageUrl ??
            existing?.chipImageUrl ??
            item.imageUrl ??
            null;
          setLastAddFly({
            key: Date.now(),
            itemId: item.itemId,
            chipImageUrl: chipImage,
            slotIndex,
            sourceRect: options.sourceRect,
          });
        }
      },
      setQuantity: (key, quantity) => {
        const current = readCart();
        const lines =
          quantity <= 0
            ? current.lines.filter((l) => l.key !== key)
            : current.lines.map((l) =>
                l.key === key ? { ...l, quantity } : l,
              );
        writeCart({ ...current, lines });
      },
      decrementLastMatching: (itemIds) => {
        if (!itemIds.length) return;
        const set = new Set(itemIds);
        const current = readCart();
        for (let i = current.lines.length - 1; i >= 0; i--) {
          const line = current.lines[i]!;
          if (!set.has(line.itemId)) continue;
          const nextQty = line.quantity - 1;
          const lines =
            nextQty <= 0
              ? current.lines.filter((_, idx) => idx !== i)
              : current.lines.map((l, idx) =>
                  idx === i ? { ...l, quantity: nextQty } : l,
                );
          writeCart({ ...current, lines });
          return;
        }
      },
      quantityForItemIds: (itemIds) => {
        if (!itemIds.length) return 0;
        const set = new Set(itemIds);
        return state.lines.reduce(
          (sum, line) => (set.has(line.itemId) ? sum + line.quantity : sum),
          0,
        );
      },
      removeLine: (key) => {
        const current = readCart();
        writeCart({
          ...current,
          lines: current.lines.filter((l) => l.key !== key),
        });
      },
      clearCart: () => {
        const current = readCart();
        writeCart({ storeId: current.storeId, lines: [] });
      },
    };
  }, [acknowledgeAddFly, lastAddFly, state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export const GST_RATE = 0.05;
export const DELIVERY_FEE = 40;

export function trunc2(n: number): number {
  return Math.trunc((Number(n) || 0) * 100) / 100;
}

export function computeTotals(input: {
  subtotal: number;
  discountAmount?: number;
  orderType: "dine_in" | "takeaway" | "delivery";
}) {
  const discount = Math.max(0, Number(input.discountAmount) || 0);
  const taxable = trunc2(Math.max(0, input.subtotal - discount));
  const gstAmount = trunc2(taxable * GST_RATE);
  const deliveryCharges =
    input.orderType === "delivery" ? DELIVERY_FEE : 0;
  const grandTotal = trunc2(taxable + gstAmount + deliveryCharges);
  return { taxable, gstAmount, deliveryCharges, grandTotal };
}
