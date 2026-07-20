"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  fetchCustomerOrders,
  type CustomerOrderSummary,
} from "@/lib/website-customer-api";
import { formatInr } from "@/lib/menu-api";
import {
  resolveStoreLocation,
  storeDisplayName,
  storeLocations,
} from "@/data/locations";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";

type ChatMsg = {
  id: string;
  role: "bot" | "user";
  text: string;
};

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

function isWithinPastDays(iso: string, days: number) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t >= Date.now() - days * 24 * 60 * 60 * 1000;
}

function HelpChatbot({
  order,
  onClose,
}: {
  order: CustomerOrderSummary | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>(() => {
    const store = order
      ? storeDisplayName(resolveStoreLocation(order.store_id))
      : null;
    const intro = order
      ? `Hi! I’m here to help with your order from ${store}. What went wrong? (Chat isn’t connected yet — this is a preview.)`
      : "Hi! Tell me how we can help. (Chat isn’t connected yet — this is a preview.)";
    return [{ id: "m0", role: "bot", text: intro }];
  });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(mounted);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };
    setDraft("");
    setMsgs((prev) => [
      ...prev,
      userMsg,
      {
        id: `b-${Date.now()}`,
        role: "bot",
        text: "Thanks — support chat will connect here soon. You can also use Directions under Connect to a store if you need the outlet location.",
      },
    ]);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 border-0 cursor-pointer"
        aria-label="Close chat"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Help chatbot"
        className="relative z-[1301] flex flex-col w-full sm:w-[min(100%,420px)] h-[min(88dvh,640px)] rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-[#fff4ee]">
          <div className="h-10 w-10 rounded-full bg-[#f16a34] text-white flex items-center justify-center text-sm font-extrabold">
            SVS
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold text-gray-900">Help chat</p>
            <p className="text-[11px] text-gray-500 truncate">
              {order
                ? `Ticket · Order · ${formatOrderWhen(order.created_at)}`
                : "General support"}
              {" · "}
              <span className="text-amber-700 font-semibold">Preview only</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full border-0 bg-white/80 text-gray-600 text-lg font-bold cursor-pointer"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#f16a34] text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div
          className="shrink-0 border-t border-gray-100 bg-white px-3 pt-3 flex gap-2"
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type your message…"
            className="flex-1 h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-[14px] outline-none focus:border-[#f16a34]"
          />
          <button
            type="button"
            onClick={send}
            className="h-11 px-4 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold border-0 cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function AccountHelpCenter() {
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | "none">("none");
  const [chatOpen, setChatOpen] = useState(false);
  const [topic, setTopic] = useState("order_issue");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCustomerOrders()
      .then((data) => {
        if (cancelled) return;
        const all = [...(data.active || []), ...(data.past || [])];
        setOrders(all);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const recentOrders = useMemo(
    () =>
      orders
        .filter((o) => isWithinPastDays(o.created_at, 2))
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
    [orders],
  );

  const selectedOrder =
    selectedId === "none"
      ? null
      : recentOrders.find((o) => o.id === selectedId) || null;

  const startTicket = () => {
    if (topic === "order_issue" && !selectedOrder && recentOrders.length > 0) {
      return;
    }
    setChatOpen(true);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-[13px] text-gray-500 leading-relaxed">
        Get store directions, or raise a ticket about a recent order. Support
        chat opens as a preview for now.
      </p>

      {/* Connect to store */}
      <section className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-black/[0.04] bg-[#fafbfc]">
          <h2 className="text-[14px] font-extrabold text-gray-900">
            Connect to a store
          </h2>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Get directions to your nearest SVS Food outlet
          </p>
        </div>
        <ul className="divide-y divide-gray-100">
          {storeLocations.map((store) => (
            <li
              key={store.id}
              className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-gray-900">
                  {storeDisplayName(store)}
                </p>
                <p className="text-[12px] text-gray-500 mt-0.5 leading-snug line-clamp-2">
                  {store.address}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <a
                  href={store.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center px-3.5 rounded-lg bg-[#f16a34] text-white text-[12px] font-extrabold no-underline"
                >
                  Directions
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Raise ticket */}
      <section className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-black/[0.04] bg-[#fafbfc]">
          <h2 className="text-[14px] font-extrabold text-gray-900">
            Raise a ticket
          </h2>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Pick an order from the last 2 days, then open chat
          </p>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Topic
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "order_issue", label: "Order issue" },
                  { id: "payment", label: "Payment / refund" },
                  { id: "other", label: "Something else" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTopic(t.id);
                    if (t.id !== "order_issue") setSelectedId("none");
                  }}
                  className={`h-9 px-3.5 rounded-full text-[13px] font-bold border cursor-pointer ${
                    topic === t.id
                      ? "bg-[#fff4ee] border-[#f16a34] text-[#f16a34]"
                      : "bg-white border-gray-200 text-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {topic === "order_issue" || topic === "payment" ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Order (past 2 days)
              </p>
              {loading ? (
                <p className="text-[13px] text-gray-500 py-4">Loading orders…</p>
              ) : recentOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                  <p className="text-[13px] text-gray-500">
                    No orders in the last 2 days. You can still chat about something else, or get directions to a store.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {recentOrders.map((o) => {
                    const active = selectedId === o.id;
                    const store = resolveStoreLocation(o.store_id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setSelectedId(o.id)}
                        className={`w-full text-left rounded-xl border px-3.5 py-3 cursor-pointer transition-colors ${
                          active
                            ? "border-[#f16a34] bg-orange-50 ring-1 ring-[#f16a34]/20"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-extrabold text-gray-900">
                            {storeDisplayName(store)}
                          </span>
                          <span className="text-[12px] font-bold tabular-nums text-gray-700">
                            {o.total_amount != null
                              ? formatInr(o.total_amount)
                              : "—"}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 capitalize">
                          {o.order_type.replace(/_/g, " ")} ·{" "}
                          {formatOrderWhen(o.created_at)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          <button
            type="button"
            onClick={startTicket}
            disabled={
              (topic === "order_issue" || topic === "payment") &&
              recentOrders.length > 0 &&
              !selectedOrder
            }
            className="w-full h-11 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold border-0 cursor-pointer disabled:opacity-50"
          >
            Open help chat
          </button>
          <p className="text-[11px] text-gray-400 text-center">
            Chatbot UI only — live support connection coming soon
          </p>
        </div>
      </section>

      {chatOpen ? (
        <HelpChatbot
          order={selectedOrder}
          onClose={() => setChatOpen(false)}
        />
      ) : null}
    </div>
  );
}
