"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import {
  useCart,
  computeTotals,
  type CartLine,
} from "@/context/CartContext";
import { formatInr } from "@/lib/menu-api";
import { storeDisplayName } from "@/data/locations";
import {
  composeDeliveryAddress,
  fetchDeliveryAddressHint,
  resolveDeliveryCoords,
  type DeliveryAddressHint,
} from "@/lib/reverse-geocode";
import { requestUserLocation } from "@/lib/user-location";
import {
  confirmCashPayment,
  createPaymentSession,
  createWebOrder,
  type WebOrderType,
} from "@/lib/orders-api";

const PHONE_RE = /^[6-9][0-9]{9}$/;

type PayMethod = "online" | "cod";

const inputClass =
  "mt-1.5 w-full h-11 rounded-xl border border-svs-cream bg-svs-cream px-3.5 text-[15px] text-svs-ink outline-none transition-colors focus:border-svs-orange focus:ring-2 focus:ring-svs-orange/15";

const textareaClass =
  "mt-1.5 w-full min-h-[88px] rounded-xl border border-svs-cream bg-svs-cream px-3.5 py-2.5 text-[15px] text-svs-ink outline-none transition-colors focus:border-svs-orange focus:ring-2 focus:ring-svs-orange/15 resize-y";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, store, subtotal, clearCart, itemCount } = useCart();
  const [orderType, setOrderType] = useState<WebOrderType>("delivery");
  const [payMethod, setPayMethod] = useState<PayMethod>("online");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [flat, setFlat] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressHint, setAddressHint] = useState<DeliveryAddressHint | null>(
    null,
  );
  const [addressLoading, setAddressLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(
    () => computeTotals({ subtotal, orderType }),
    [subtotal, orderType],
  );

  const codAllowed = orderType === "delivery" || orderType === "takeaway";
  const effectivePay: PayMethod =
    orderType === "dine_in" ? "online" : payMethod;

  const fullAddress = useMemo(
    () =>
      composeDeliveryAddress({
        flat,
        street,
        area,
        landmark,
        pincode,
      }),
    [flat, street, area, landmark, pincode],
  );

  useEffect(() => {
    let cancelled = false;
    setAddressLoading(true);
    void fetchDeliveryAddressHint().then((hint) => {
      if (cancelled) return;
      setAddressHint(hint);
      if (hint) {
        setArea((prev) => prev || hint.formatted);
        if (hint.postcode) {
          setPincode((prev) => prev || hint.postcode || "");
        }
      }
      setAddressLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const placeOrder = async () => {
    setError(null);
    const mobile = phone.trim();
    if (!PHONE_RE.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (orderType === "delivery") {
      if (flat.trim().length < 2) {
        setError("Enter flat / house / floor number.");
        return;
      }
      if (street.trim().length < 3) {
        setError("Enter street, building, or society name.");
        return;
      }
      if (area.trim().length < 6) {
        setError("Enter area / locality (pre-filled from GPS, edit if needed).");
        return;
      }
      if (fullAddress.length < 20) {
        setError("Please complete your full delivery address.");
        return;
      }
    }

    setBusy(true);
    try {
      let deliveryCoords =
        orderType === "delivery" ? resolveDeliveryCoords(addressHint) : null;

      if (orderType === "delivery" && !deliveryCoords) {
        const fresh = await requestUserLocation();
        if (fresh) {
          deliveryCoords = { lat: fresh.lat, lng: fresh.lng };
          setAddressHint((prev) =>
            prev
              ? { ...prev, lat: fresh.lat, lng: fresh.lng }
              : {
                  formatted: area.trim() || "Your location",
                  lat: fresh.lat,
                  lng: fresh.lng,
                  savedAt: new Date().toISOString(),
                },
          );
        }
      }

      if (orderType === "delivery" && !deliveryCoords) {
        setError(
          "Turn on location access so we can share your delivery pin with the rider.",
        );
        setBusy(false);
        return;
      }

      const order = await createWebOrder({
        storeId: store.backendStoreId,
        orderType,
        items: lines.map((line: CartLine) => ({
          item_id: line.itemId,
          unit_price: line.unitPrice,
          price: line.unitPrice,
          petpooja_item_id: line.petpoojaItemId,
          name: line.name,
          quantity: line.quantity,
          addons: [],
        })),
        subtotal,
        gstAmount: totals.gstAmount,
        grandTotal: totals.grandTotal,
        deliveryCharges: totals.deliveryCharges,
        customerMobile: mobile,
        customerName: name.trim() || undefined,
        customerAddress:
          orderType === "delivery" ? fullAddress : undefined,
        customerLatitude: deliveryCoords?.lat,
        customerLongitude: deliveryCoords?.lng,
        customerNotes: notes.trim() || undefined,
      });

      if (effectivePay === "cod") {
        await confirmCashPayment({
          storeId: store.backendStoreId,
          orderId: order.order_id,
        });
        clearCart();
        router.push(
          `/order/${encodeURIComponent(order.order_id)}?store=${encodeURIComponent(store.id)}&cod=1`,
        );
        return;
      }

      const session = await createPaymentSession({
        storeId: store.backendStoreId,
        orderId: order.order_id,
        amount: totals.grandTotal,
        customerPhone: mobile,
      });

      sessionStorage.setItem(
        "svs_pending_payment",
        JSON.stringify({
          orderId: order.order_id,
          orderNumber: order.order_number,
          storeSlug: store.id,
          storeId: store.backendStoreId,
          transactionId: session.transaction_id,
          qrPayload: session.qr_payload,
          amount: session.amount,
          isMock: session.is_mock === true,
        }),
      );

      clearCart();
      router.push(
        `/pay?order=${encodeURIComponent(order.order_id)}&store=${encodeURIComponent(store.id)}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  };

  const typeBtn = (type: WebOrderType, label: string, sub: string) => (
    <button
      key={type}
      type="button"
      onClick={() => {
        setOrderType(type);
        if (type === "dine_in") setPayMethod("online");
      }}
      className={`flex-1 rounded-2xl px-3 py-3.5 text-left cursor-pointer border transition-all ${
        orderType === type
          ? "bg-svs-cream border-svs-orange ring-1 ring-svs-orange/30"
          : "bg-svs-white border-svs-cream hover:border-svs-orange/30"
      }`}
    >
      <span
        className={`block text-sm font-extrabold ${
          orderType === type ? "text-svs-orange" : "text-svs-ink"
        }`}
      >
        {label}
      </span>
      <span className="block text-[11px] text-svs-ink/50 mt-0.5">{sub}</span>
    </button>
  );

  return (
    <>
      <main className="min-h-[70svh] pt-[72px] md:pt-[88px] lg:pt-[72px] px-4 sm:px-6 lg:px-8 pb-16 bg-svs-cream">
        <div className="max-w-[1040px] mx-auto py-8 sm:py-10">
          <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <Link
                href="/cart"
                className="text-sm font-semibold text-svs-orange no-underline hover:underline"
              >
                ← Back to cart
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-svs-ink tracking-tight mt-2">
                Checkout
              </h1>
              <p className="text-sm text-svs-ink/50 mt-1">
                {storeDisplayName(store)} · {itemCount} item
                {itemCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-5 lg:gap-8 items-start">
            <div className="space-y-4 sm:space-y-5">
              <section className="rounded-2xl border border-svs-cream bg-svs-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(58,30,18,0.04)]">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-svs-ink/40 mb-3">
                  How would you like it?
                </h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  {typeBtn("dine_in", "Dine-in", "Eat at the restaurant")}
                  {typeBtn("takeaway", "Takeaway", "Pick up at counter")}
                  {typeBtn("delivery", "Delivery", "We deliver to you")}
                </div>
              </section>

              {orderType === "delivery" ? (
                <section className="rounded-2xl border-2 border-svs-orange/25 bg-svs-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(58,30,18,0.04)] space-y-4">
                  <div>
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-svs-orange">
                      Deliver to
                    </h2>
                    {addressLoading ? (
                      <p className="text-xs text-svs-ink/50 mt-1">
                        Finding your area from GPS…
                      </p>
                    ) : addressHint ? (
                      <p className="text-xs text-svs-ink/50 mt-1">
                        Area pre-filled from your location, add flat no. &amp;
                        street below
                      </p>
                    ) : (
                      <p className="text-xs text-svs-ink/50 mt-1">
                        Enter where we should deliver your order
                      </p>
                    )}
                  </div>

                  <label className="block text-sm">
                    <span className="font-semibold text-svs-ink/80">
                      Flat / House no. / Floor *
                    </span>
                    <input
                      value={flat}
                      onChange={(e) => setFlat(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. 402, Tower B, 4th floor"
                      autoComplete="address-line2"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="font-semibold text-svs-ink/80">
                      Street / Building / Society *
                    </span>
                    <input
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Ojas Imperia, Narmada Road"
                      autoComplete="address-line1"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="font-semibold text-svs-ink/80">
                      Area / Locality *
                    </span>
                    <textarea
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      rows={2}
                      className={textareaClass}
                      placeholder="Colony, area, city"
                      autoComplete="address-level2"
                    />
                  </label>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block text-sm">
                      <span className="font-semibold text-svs-ink/80">
                        Landmark
                      </span>
                      <input
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className={inputClass}
                        placeholder="Near petrol pump, mall…"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="font-semibold text-svs-ink/80">
                        PIN code
                      </span>
                      <input
                        value={pincode}
                        onChange={(e) =>
                          setPincode(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        inputMode="numeric"
                        className={inputClass}
                        placeholder="6-digit PIN"
                        autoComplete="postal-code"
                      />
                    </label>
                  </div>
                </section>
              ) : (
                <section className="rounded-2xl border border-dashed border-svs-cream bg-svs-cream px-4 py-3 text-sm text-svs-ink/60">
                  Need delivery?{" "}
                  <button
                    type="button"
                    onClick={() => setOrderType("delivery")}
                    className="font-bold text-svs-orange bg-transparent border-0 cursor-pointer p-0 underline"
                  >
                    Switch to Delivery
                  </button>{" "}
                  to enter your address.
                </section>
              )}

              {codAllowed ? (
                <section className="rounded-2xl border border-svs-cream bg-svs-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(58,30,18,0.04)]">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-svs-ink/40 mb-3">
                    Payment
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayMethod("online")}
                      className={`rounded-2xl px-4 py-3.5 text-sm font-bold cursor-pointer border text-left transition-all ${
                        effectivePay === "online"
                          ? "bg-svs-orange text-white border-svs-orange"
                          : "bg-svs-white text-svs-ink border-svs-cream hover:border-svs-orange/30"
                      }`}
                    >
                      Pay online
                      <span
                        className={`block text-xs font-medium mt-0.5 ${
                          effectivePay === "online"
                            ? "text-white/85"
                            : "text-svs-ink/50"
                        }`}
                      >
                        UPI QR
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayMethod("cod")}
                      className={`rounded-2xl px-4 py-3.5 text-sm font-bold cursor-pointer border text-left transition-all ${
                        effectivePay === "cod"
                          ? "bg-svs-orange text-white border-svs-orange"
                          : "bg-svs-white text-svs-ink border-svs-cream hover:border-svs-orange/30"
                      }`}
                    >
                      {orderType === "delivery"
                        ? "Cash on delivery"
                        : "Pay at counter"}
                      <span
                        className={`block text-xs font-medium mt-0.5 ${
                          effectivePay === "cod"
                            ? "text-white/85"
                            : "text-svs-ink/50"
                        }`}
                      >
                        {orderType === "delivery"
                          ? "Pay when food arrives"
                          : "Pay in cash at outlet"}
                      </span>
                    </button>
                  </div>
                </section>
              ) : null}

              <section className="rounded-2xl border border-svs-cream bg-svs-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(58,30,18,0.04)] space-y-4">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-svs-ink/40">
                  Your details
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block text-sm sm:col-span-2">
                    <span className="font-semibold text-svs-ink/80">Name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="font-semibold text-svs-ink/80">
                      Mobile number *
                    </span>
                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      inputMode="numeric"
                      className={inputClass}
                      placeholder="10-digit mobile"
                      autoComplete="tel"
                    />
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="font-semibold text-svs-ink/80">
                    Notes for kitchen
                  </span>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 250))}
                    className={inputClass}
                    placeholder="Less spicy, no onion…"
                  />
                </label>
              </section>

              {error ? (
                <p className="text-sm font-semibold text-svs-orange-dark rounded-xl bg-svs-cream border border-svs-orange/20 px-4 py-3">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                disabled={busy}
                onClick={placeOrder}
                className="lg:hidden w-full h-12 rounded-full bg-svs-orange hover:bg-svs-orange-dark disabled:bg-svs-ink/20 text-white font-bold cursor-pointer shadow-[0_8px_24px_rgba(241,106,52,0.28)]"
              >
                {busy
                  ? "Placing order…"
                  : effectivePay === "cod"
                    ? `Place order · ${formatInr(totals.grandTotal)}`
                    : `Pay ${formatInr(totals.grandTotal)}`}
              </button>
            </div>

            <aside className="lg:sticky lg:top-[100px] space-y-4">
              <section className="rounded-2xl border border-svs-cream bg-svs-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(58,30,18,0.04)] space-y-3">
                <h2 className="font-extrabold text-svs-ink">Order summary</h2>
                <ul className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-sm">
                  {lines.map((line) => (
                    <li
                      key={line.key}
                      className="flex justify-between gap-2 text-svs-ink/80"
                    >
                      <span className="truncate">
                        {line.quantity}× {line.name}
                      </span>
                      <span className="font-semibold tabular-nums shrink-0">
                        {formatInr(line.unitPrice * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2 text-sm pt-2 border-t border-svs-cream">
                  <div className="flex justify-between">
                    <span className="text-svs-ink/60">Item total</span>
                    <span className="font-semibold">{formatInr(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-svs-ink/60">GST (5%)</span>
                    <span className="font-semibold">
                      {formatInr(totals.gstAmount)}
                    </span>
                  </div>
                  {totals.deliveryCharges > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-svs-ink/60">Delivery</span>
                      <span className="font-semibold">
                        {formatInr(totals.deliveryCharges)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-base font-extrabold pt-2 border-t border-svs-cream">
                    <span>To pay</span>
                    <span className="text-svs-orange">
                      {formatInr(totals.grandTotal)}
                    </span>
                  </div>
                </div>
              </section>

              <button
                type="button"
                disabled={busy}
                onClick={placeOrder}
                className="hidden lg:flex w-full h-12 items-center justify-center rounded-full bg-svs-orange hover:bg-svs-orange-dark disabled:bg-svs-ink/20 text-white font-bold cursor-pointer shadow-[0_8px_24px_rgba(241,106,52,0.28)]"
              >
                {busy
                  ? "Placing order…"
                  : effectivePay === "cod"
                    ? `Place order · ${formatInr(totals.grandTotal)}`
                    : `Pay ${formatInr(totals.grandTotal)}`}
              </button>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
