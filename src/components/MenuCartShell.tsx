"use client";

import type { ReactNode } from "react";
import type { StoreLocation } from "@/data/locations";
import CartDrawer from "@/components/CartDrawer";
import MenuPageHeader from "@/components/MenuPageHeader";
import { MenuCartProvider, useMenuCart } from "@/context/MenuCartContext";

type MenuCartShellProps = {
  store: StoreLocation;
  children: ReactNode;
};

function InnerShell({ children }: { children: ReactNode }) {
  const { isOpen } = useMenuCart();
  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isOpen ? "lg:pr-[400px] xl:pr-[420px]" : "pr-0"
      }`}
    >
      {children}
    </div>
  );
}

export default function MenuCartShell({ store, children }: MenuCartShellProps) {
  return (
    <MenuCartProvider>
      <InnerShell>
        <MenuPageHeader store={store} />
        {children}
      </InnerShell>
      <CartDrawer />
    </MenuCartProvider>
  );
}
