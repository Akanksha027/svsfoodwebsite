"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

const DEFAULT_PLACEHOLDER_HINTS = [
  "Burgers",
  "Pizza",
  "Beverages",
  "Naan & Wraps",
  "Sides",
  "Desserts",
] as const;

type MenuSearchContextValue = {
  query: string;
  setQuery: (q: string) => void;
  placeholderHints: string[];
  setPlaceholderHints: (hints: string[]) => void;
};

const MenuSearchContext = createContext<MenuSearchContextValue | null>(null);

export function MenuSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [placeholderHints, setPlaceholderHints] = useState<string[]>([
    ...DEFAULT_PLACEHOLDER_HINTS,
  ]);
  const pathname = usePathname();
  const onMenu = pathname === "/menu" || pathname.startsWith("/menu/");

  useEffect(() => {
    if (!onMenu) {
      setQuery("");
      setPlaceholderHints([...DEFAULT_PLACEHOLDER_HINTS]);
    }
  }, [onMenu]);

  const value = useMemo(
    () => ({ query, setQuery, placeholderHints, setPlaceholderHints }),
    [query, placeholderHints],
  );

  return (
    <MenuSearchContext.Provider value={value}>
      {children}
    </MenuSearchContext.Provider>
  );
}

export function useMenuSearch() {
  const ctx = useContext(MenuSearchContext);
  if (!ctx) {
    throw new Error("useMenuSearch must be used within MenuSearchProvider");
  }
  return ctx;
}
