"use client";

import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import AppDownloadPromo from "@/components/AppDownloadPromo";
import {
  deleteCustomerAddress,
  fetchCustomerOrders,
  setDefaultCustomerAddress,
  type CustomerOrderSummary,
  type WebsiteCustomerAddress,
} from "@/lib/website-customer-api";
import { formatInr } from "@/lib/menu-api";

type AccountSection = "orders" | "addresses";

function formatOrderWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function orderStatusHeadline(status: string | undefined) {
  const s = (status || "").toLowerCase();
  if (s.includes("deliver") && s.includes("ed")) return "Order arrived";
  if (s.includes("cancel")) return "Order cancelled";
  if (s.includes("prepar") || s.includes("accepted") || s.includes("confirmed")) {
    return "Preparing your order";
  }
  if (s.includes("out") || s.includes("dispatch")) return "On the way";
  return "Order in progress";
}

function isPastStatus(status: string | undefined) {
  const s = (status || "").toLowerCase();
  return (
    s.includes("deliver") ||
    s.includes("cancel") ||
    s.includes("complete") ||
    s.includes("closed")
  );
}

function IconOrders({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPin({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconLock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M8 11V8a4 4 0 118 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLogout({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevron({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OrderCard({ order }: { order: CustomerOrderSummary }) {
  const past = isPastStatus(order.status);
  return (
    <Link
      href={`/order/${encodeURIComponent(order.id)}?store=${encodeURIComponent(order.store_id)}`}
      className="block rounded-xl border border-gray-200/90 bg-white px-4 py-3.5 no-underline shadow-sm hover:border-gray-300 hover:shadow transition-all"
    >
      <div className="flex items-center gap-3">
        <div
          className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-full ${
            past ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-[#f16a34]"
          }`}
        >
          {past ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
              <path
                d="M12 8v4l2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-gray-900 leading-snug">
            {orderStatusHeadline(order.status)}
          </p>
          <p className="text-[13px] text-gray-500 mt-0.5 tabular-nums">
            {order.total_amount != null ? formatInr(order.total_amount) : "—"}
            <span className="mx-1.5 text-gray-300">•</span>
            {formatOrderWhen(order.created_at)}
            {order.cod_unpaid ? (
              <span className="ml-2 text-[10px] font-bold text-[#c2410c]">
                COD · unpaid
              </span>
            ) : null}
          </p>
        </div>
        <IconChevron className="w-5 h-5 shrink-0 text-gray-400" />
      </div>
    </Link>
  );
}

function AddressCard({
  addr,
  onDefault,
  onDelete,
  busy,
}: {
  addr: WebsiteCustomerAddress;
  onDefault: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200/90 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex gap-3">
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          <IconPin className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-gray-900">
            {addr.label}
            {addr.is_default ? (
              <span className="ml-2 text-[11px] font-bold text-[#f16a34]">Default</span>
            ) : null}
          </p>
          <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
            {addr.formatted_address}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {!addr.is_default ? (
              <button
                type="button"
                disabled={busy}
                onClick={onDefault}
                className="text-[12px] font-bold text-[#f16a34] bg-orange-50 px-3 py-1.5 rounded-lg cursor-pointer border-0 disabled:opacity-50"
              >
                Set default
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="text-[12px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg cursor-pointer border-0 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const navBtn =
  "w-full flex items-center gap-3 px-4 py-3 text-left text-[15px] font-medium border-0 cursor-pointer transition-colors";

export default function AccountPageClient() {
  const router = useRouter();
  const { customer, loading, logout, refreshCustomer, openLogin } =
    useWebsiteAuth();
  const [section, setSection] = useState<AccountSection>("orders");
  const [ordersTab, setOrdersTab] = useState<"active" | "past">("past");
  const [orders, setOrders] = useState<{
    active: CustomerOrderSummary[];
    past: CustomerOrderSummary[];
  } | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addrBusy, setAddrBusy] = useState(false);

  useEffect(() => {
    const syncTab = () => {
      const t = new URLSearchParams(window.location.search).get("tab");
      setSection(t === "addresses" ? "addresses" : "orders");
    };
    syncTab();
    window.addEventListener("popstate", syncTab);
    return () => window.removeEventListener("popstate", syncTab);
  }, []);

  const goSection = useCallback(
    (s: AccountSection) => {
      setSection(s);
      const path = s === "addresses" ? "/account?tab=addresses" : "/account";
      router.replace(path, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    if (!loading && !customer) openLogin();
  }, [loading, customer, openLogin]);

  useEffect(() => {
    if (!customer) return;
    let cancelled = false;
    setOrdersLoading(true);
    fetchCustomerOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {
        if (!cancelled) setOrders({ active: [], past: [] });
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customer]);

  const handleLogout = async () => {
    await logout();
    router.push("/menu");
  };

  const onSetDefault = async (id: string) => {
    setAddrBusy(true);
    try {
      await setDefaultCustomerAddress(id);
      await refreshCustomer();
    } finally {
      setAddrBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    setAddrBusy(true);
    try {
      await deleteCustomerAddress(id);
      await refreshCustomer();
    } finally {
      setAddrBusy(false);
    }
  };

  const shell =
    "min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-72px)] pt-14 sm:pt-16 lg:pt-[72px] bg-[#f4f5f7]";

  if (loading) {
    return (
      <div className={shell}>
        <p className="p-6 text-sm text-gray-500">Loading account…</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className={`${shell} flex items-center justify-center px-4`}>
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-extrabold text-gray-900 mb-2">My account</h1>
          <p className="text-sm text-gray-600 mb-6">
            Log in with your mobile to see orders and saved addresses.
          </p>
          <button
            type="button"
            onClick={openLogin}
            className="h-11 px-6 rounded-xl bg-gray-900 text-white text-sm font-extrabold cursor-pointer border-0"
          >
            Continue with mobile
          </button>
        </div>
      </div>
    );
  }

  const list = ordersTab === "active" ? orders?.active ?? [] : orders?.past ?? [];

  const navItem = (s: AccountSection, label: string, icon: ReactNode) => (
    <button
      type="button"
      onClick={() => goSection(s)}
      className={`${navBtn} ${
        section === s
          ? "bg-gray-100 text-gray-900 font-semibold"
          : "bg-transparent text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span className="text-gray-500">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className={shell}>
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row lg:items-stretch">
        <aside className="lg:w-[272px] shrink-0 lg:sticky lg:top-[72px] lg:max-h-[calc(100dvh-72px)] lg:overflow-y-auto bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
          <div className="px-4 py-4 lg:py-5 border-b border-gray-100">
            <p className="text-[15px] font-bold text-gray-900 tabular-nums">
              +91 {customer.phone}
            </p>
            {customer.name ? (
              <p className="text-[13px] text-gray-500 mt-0.5 truncate">{customer.name}</p>
            ) : null}
          </div>

          <nav className="py-2 flex-1">
            {navItem("addresses", "My Addresses", <IconPin />)}
            {navItem("orders", "My Orders", <IconOrders />)}
            <Link
              href="/privacy-policy"
              className={`${navBtn} text-gray-700 hover:bg-gray-50 no-underline`}
            >
              <span className="text-gray-500">
                <IconLock />
              </span>
              Account privacy
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className={`${navBtn} text-gray-700 hover:bg-gray-50 mt-1`}
            >
              <span className="text-gray-500">
                <IconLogout />
              </span>
              Logout
            </button>
          </nav>

          <div className="hidden lg:block border-t border-gray-100 p-4">
            <AppDownloadPromo compact />
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-10">
          {section === "orders" ? (
            <>
              <h1 className="text-[22px] font-extrabold text-gray-900 mb-4 lg:mb-5">
                My Orders
              </h1>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setOrdersTab("active")}
                  className={`px-4 py-2 rounded-full text-[13px] font-bold cursor-pointer border transition-colors ${
                    ordersTab === "active"
                      ? "bg-white border-gray-900 text-gray-900 shadow-sm"
                      : "bg-transparent border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersTab("past")}
                  className={`px-4 py-2 rounded-full text-[13px] font-bold cursor-pointer border transition-colors ${
                    ordersTab === "past"
                      ? "bg-white border-gray-900 text-gray-900 shadow-sm"
                      : "bg-transparent border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Past
                </button>
              </div>
              <div className="space-y-3 max-w-2xl">
                {ordersLoading ? (
                  <p className="text-sm text-gray-500 py-8">Loading orders…</p>
                ) : list.length === 0 ? (
                  <div className="rounded-xl bg-white border border-gray-200 px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      No {ordersTab} orders yet.
                    </p>
                    <Link
                      href="/menu"
                      className="inline-block mt-4 text-sm font-bold text-[#f16a34] no-underline"
                    >
                      Order from menu →
                    </Link>
                  </div>
                ) : (
                  list.map((o) => <OrderCard key={o.id} order={o} />)
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-[22px] font-extrabold text-gray-900 mb-4 lg:mb-5">
                My Addresses
              </h1>
              <div className="space-y-3 max-w-2xl">
                {customer.addresses.length === 0 ? (
                  <div className="rounded-xl bg-white border border-gray-200 px-6 py-12 text-center">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      No saved addresses yet. Add one when you checkout delivery while
                      logged in.
                    </p>
                  </div>
                ) : (
                  customer.addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      addr={addr}
                      busy={addrBusy}
                      onDefault={() => void onSetDefault(addr.id)}
                      onDelete={() => void onDelete(addr.id)}
                    />
                  ))
                )}
              </div>
            </>
          )}

          <div className="lg:hidden mt-8 max-w-2xl">
            <AppDownloadPromo />
          </div>
        </main>
      </div>
    </div>
  );
}
