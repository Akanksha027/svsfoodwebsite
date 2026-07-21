"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type MenuSearchContextValue = {
  query: string;
  setQuery: (q: string) => void;
};

const MenuSearchContext = createContext<MenuSearchContextValue | null>(null);

export function MenuSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const onMenu = pathname === "/menu" || pathname.startsWith("/menu/");

  useEffect(() => {
    if (!onMenu) setQuery("");
  }, [onMenu]);

  return (
    <MenuSearchContext.Provider value={{ query, setQuery }}>
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
