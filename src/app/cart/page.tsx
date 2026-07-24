"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMenuCart } from "@/context/MenuCartContext";

/** Cart lives in the sidebar drawer — this route just opens it. */
export default function CartPage() {
  const router = useRouter();
  const { openCart } = useMenuCart();

  useEffect(() => {
    openCart();
    router.replace("/menu");
  }, [openCart, router]);

  return (
    <main className="min-h-[40svh] flex items-center justify-center text-sm text-gray-500">
      Opening cart…
    </main>
  );
}
