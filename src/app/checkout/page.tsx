"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import CartCheckoutForm, {
  CartCheckoutFormPaged,
} from "@/components/CartCheckoutForm";
import { useCart } from "@/context/CartContext";
import { useWebCheckout } from "@/hooks/useWebCheckout";
import { storeDisplayName } from "@/data/locations";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import { persistCheckoutDeliveryAddress } from "@/lib/website-customer-api";
import { resolveDeliveryCoords } from "@/lib/reverse-geocode";

export default function CheckoutPage() {
  const router = useRouter();
  const { itemCount, store, clearCart } = useCart();
  const checkout = useWebCheckout({ active: itemCount > 0 });
  const { customer, refreshCustomer } = useWebsiteAuth();
  const deliveryAddressModeRef = useRef<string | "new">("new");

  const onPlaceOrder = async () => {
    try {
      const result = await checkout.placeOrder();
      if (customer && checkout.orderType === "delivery") {
        const coords = resolveDeliveryCoords(checkout.addressHint);
        try {
          await persistCheckoutDeliveryAddress({
            customer,
            flat: checkout.flat,
            street: checkout.street,
            area: checkout.area,
            landmark: checkout.landmark,
            pincode: checkout.pincode,
            label: checkout.addressLabel,
            latitude: coords?.lat ?? null,
            longitude: coords?.lng ?? null,
          });
          await refreshCustomer();
        } catch {
          /* optional */
        }
      }
      if (result.kind === "cod") {
        router.push(
          `/order/${encodeURIComponent(result.orderId)}?store=${encodeURIComponent(result.storeSlug)}&cod=1`,
        );
        return;
      }
      sessionStorage.setItem(
        "svs_pending_payment",
        JSON.stringify(result.pending),
      );
      clearCart();
      router.push(
        `/pay?order=${encodeURIComponent(result.pending.orderId)}&store=${encodeURIComponent(result.pending.storeSlug)}`,
      );
    } catch {
      /* shown on form */
    }
  };

  if (itemCount === 0) {
    return (
      <>
        <main className="min-h-[60svh] pt-[100px] px-4 text-center bg-svs-cream">
          <p className="text-svs-ink/50 mb-4">Your cart is empty.</p>
          <Link href="/menu" className="text-svs-orange font-bold">
            Browse menu
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="min-h-[70svh] pt-[72px] md:pt-[88px] lg:pt-[72px] px-4 sm:px-6 lg:px-8 pb-16 bg-svs-cream">
        <div className="max-w-[480px] mx-auto py-8 sm:py-10">
          <Link
            href="/cart"
            className="text-sm font-semibold text-svs-orange no-underline hover:underline"
          >
            ← Back to cart
          </Link>
          <h1 className="text-2xl font-extrabold text-svs-ink tracking-tight mt-2 mb-1">
            Checkout
          </h1>
          <p className="text-sm text-svs-ink/50 mb-6">
            {storeDisplayName(store)} · {itemCount} item
            {itemCount === 1 ? "" : "s"}
          </p>
          <div className="rounded-2xl border border-svs-cream bg-svs-white shadow-sm overflow-hidden">
            <CartCheckoutFormPaged
              checkout={checkout}
              onPlaceOrder={onPlaceOrder}
              onAddressSelectionChange={(id) => {
                deliveryAddressModeRef.current = id;
              }}
            />
          </div>
          <p className="text-xs text-svs-ink/45 mt-4 text-center">
            On the menu page, checkout also opens in the cart sidebar.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
