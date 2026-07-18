"use client";

import type { ReactNode } from "react";
import CartDrawer from "@/components/CartDrawer";

/** Menu page shell: cart drawer overlays menu (no layout shift). */
export default function MenuCartShell({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
}
