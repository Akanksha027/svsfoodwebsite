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

export type CartLine = {
  key: string;
  itemId: string;
  petpoojaItemId?: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
  /** Category artwork — transparent PNG for cart bar chips + fly animation. */
  chipImageUrl?: string | null;
  isVeg?: boolean | null;
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

export type AddItemInput = Omit<CartLine, "key" | "quantity"> & {
  quantity?: number;
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
  removeLine: (key: string) => void;
  clearCart: () => void;
};

const CART_KEY = "svs_web_cart_v1";
const EMPTY: CartState = { storeId: "satna", lines: [] };

let cachedSnapshot: CartState = EMPTY;
let cachedSnapshotKey: string | null = null;

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
    lines: parsed.lines.filter((l) => l && l.itemId && l.quantity > 0),
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
      (sum, line) => sum + line.unitPrice * line.quantity,
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
        // Switching outlet clears cart (menus differ per store).
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
        const key = item.itemId;
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
