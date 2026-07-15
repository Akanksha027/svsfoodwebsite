"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MenuCartContextValue = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const MenuCartContext = createContext<MenuCartContextValue | null>(null);

export function MenuCartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo(
    () => ({ isOpen, openCart, closeCart, toggleCart }),
    [isOpen, openCart, closeCart, toggleCart],
  );

  return (
    <MenuCartContext.Provider value={value}>{children}</MenuCartContext.Provider>
  );
}

export function useMenuCart() {
  const ctx = useContext(MenuCartContext);
  if (!ctx) {
    throw new Error("useMenuCart must be used within MenuCartProvider");
  }
  return ctx;
}
