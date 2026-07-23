"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  closeSupportChatSession,
  confirmSupportChatSession,
  createSupportChatSession,
  fetchCustomerOrders,
  fetchSupportChatSession,
  sendSupportChatMessage,
  type CustomerOrderSummary,
  type SupportChatMessage,
  type SupportChatSession,
} from "@/lib/website-customer-api";
import { formatInr } from "@/lib/menu-api";
import {
  resolveStoreLocation,
  storeDisplayName,
  storeLocations,
} from "@/data/locations";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";

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
  topic,
  bootstrap,
  onClose,
}: {
  order: CustomerOrderSummary | null;
  topic: string;
  bootstrap: {
    session: SupportChatSession;
    messages: SupportChatMessage[];
  } | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(
    bootstrap?.session.id ?? null,
  );
  const [status, setStatus] = useState<string>(
    bootstrap?.session.status ?? "connecting",
  );
  const [sessionMeta, setSessionMeta] = useState<SupportChatSession | null>(
    bootstrap?.session ?? null,
  );
  const [msgs, setMsgs] = useState<SupportChatMessage[]>(
    bootstrap?.messages ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [confirming, setConfirming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(mounted);

  useEffect(() => {
    if (bootstrap?.session.id) {
      setSessionId(bootstrap.session.id);
      setStatus(bootstrap.session.status);
      setSessionMeta(bootstrap.session);
      setMsgs(bootstrap.messages || []);
      setError(null);
    }
  }, [bootstrap]);

  useEffect(() => {
    if (!sessionId) return;
    const poll = async () => {
      try {
        const data = await fetchSupportChatSession(sessionId);
        setStatus(data.session.status);
        setSessionMeta(data.session);
        setMsgs(data.messages || []);
      } catch {
        /* ignore transient poll errors */
      }
    };
    void poll();
    const id = window.setInterval(() => void poll(), 2500);
    return () => window.clearInterval(id);
  }, [sessionId]);

  useEffect(() => {
    if (status === "resolved") {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [status]);

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

  const send = async () => {
    const text = draft.trim();
    if (!text || !sessionId || sending || status === "closed" || status === "resolved")
      return;
    setSending(true);
    setDraft("");
    try {
      const { message } = await sendSupportChatMessage(sessionId, text);
      setMsgs((prev) => [...prev, message]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send message");
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const closeChat = async () => {
    if (!sessionId) return;
    try {
      const { session } = await closeSupportChatSession(sessionId);
      setStatus(session.status);
      setSessionMeta(session);
      const data = await fetchSupportChatSession(sessionId);
      setMsgs(data.messages || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not close chat");
    }
  };

  const submitRating = async () => {
    if (!sessionId || rating < 1) return;
    setConfirming(true);
    setError(null);
    try {
      const { session } = await confirmSupportChatSession(sessionId, {
        rating,
        feedback: feedback.trim() || undefined,
      });
      setStatus(session.status);
      setSessionMeta(session);
      const data = await fetchSupportChatSession(sessionId);
      setMsgs(data.messages || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit feedback");
    } finally {
      setConfirming(false);
    }
  };

  if (!mounted) return null;

  const statusLabel =
    status === "waiting"
      ? "Waiting for an agent"
      : status === "active"
        ? "Connected"
        : status === "resolved"
          ? "Confirm & rate"
          : status === "closed"
            ? "Chat closed"
            : status === "error"
              ? "Unavailable"
              : "Connecting…";

  const canMessage =
    sessionId &&
    status !== "closed" &&
    status !== "resolved" &&
    status !== "error";

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
        aria-label="Help chat"
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
                ? `Order · ${formatOrderWhen(order.created_at)}`
                : "General support"}
              {" · "}
              <span
                className={
                  status === "active"
                    ? "text-emerald-700 font-semibold"
                    : status === "resolved"
                      ? "text-blue-700 font-semibold"
                      : "text-amber-700 font-semibold"
                }
              >
                {statusLabel}
              </span>
            </p>
          </div>
          {canMessage || status === "resolved" ? (
            status === "resolved" ? null : (
            <button
              type="button"
              onClick={() => void closeChat()}
              className="text-[11px] font-bold text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer border-0 bg-transparent"
            >
              End chat
            </button>
            )
          ) : null}
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
          {error ? (
            <p className="text-[13px] text-rose-600 bg-rose-50 rounded-xl px-3 py-2">
              {error}
            </p>
          ) : null}
          {status === "resolved" ? (
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5 text-[12px] text-blue-800 text-center font-semibold">
              Support marked this resolved — please rate your experience below.
            </div>
          ) : null}
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.authorSide === "customer"
                  ? "justify-end"
                  : m.authorSide === "system"
                    ? "justify-center"
                    : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.authorSide === "customer"
                    ? "bg-[#f16a34] text-white rounded-br-md"
                    : m.authorSide === "system"
                      ? "bg-gray-200/80 text-gray-600 text-[11px] px-3 py-1.5"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm"
                }`}
              >
                {m.authorSide === "agent" && m.authorName ? (
                  <p className="text-[10px] font-bold opacity-70 mb-0.5">
                    {m.authorName}
                  </p>
                ) : null}
                {m.body}
              </div>
            </div>
          ))}

          {status === "closed" && sessionMeta?.customerRating != null ? (
            <p className="text-center text-[12px] text-gray-500">
              Thanks for your {sessionMeta.customerRating}/5 rating.
            </p>
          ) : null}

          <div ref={endRef} />
        </div>

        {canMessage ? (
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
                  void send();
                }
              }}
              placeholder="Type your message…"
              className="flex-1 h-11 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-[14px] outline-none focus:border-[#f16a34]"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending}
              className="h-11 px-4 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold border-0 cursor-pointer disabled:opacity-50"
            >
              Send
            </button>
          </div>
        ) : status === "resolved" ? (
          <div
            className="shrink-0 border-t border-[#ffdccc] bg-[#fff8f4] px-4 pt-4 space-y-3"
            style={{
              paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div>
              <p className="text-[14px] font-extrabold text-gray-900">
                Was your issue resolved?
              </p>
              <p className="text-[12px] text-gray-500 mt-0.5">
                Rate your support experience before you go.
              </p>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`h-11 flex-1 rounded-xl border text-lg cursor-pointer ${
                    rating >= n
                      ? "bg-[#fff4ee] border-[#f16a34] text-[#f16a34]"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more (optional)…"
              rows={2}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#f16a34] resize-none"
            />
            <button
              type="button"
              disabled={rating < 1 || confirming}
              onClick={() => void submitRating()}
              className="w-full h-11 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold border-0 cursor-pointer disabled:opacity-50"
            >
              {confirming ? "Submitting…" : "Submit rating & close"}
            </button>
          </div>
        ) : status === "closed" ? (
          <div
            className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 text-center text-[13px] text-gray-500"
            style={{
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            This chat is closed.
          </div>
        ) : null}
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
  const [chatBootstrap, setChatBootstrap] = useState<{
    session: SupportChatSession;
    messages: SupportChatMessage[];
  } | null>(null);
  const [startingChat, setStartingChat] = useState(false);
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

  const startTicket = async () => {
    if (topic === "order_issue" && !selectedOrder && recentOrders.length > 0) {
      return;
    }
    setStartingChat(true);
    try {
      const data = await createSupportChatSession({
        orderId: selectedOrder?.id || null,
        topic,
      });
      setChatBootstrap(data);
      setChatOpen(true);
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "Could not start chat. Try again.",
      );
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-[13px] text-gray-500 leading-relaxed">
        Get store directions, or chat with our online order support team about a
        recent order.
      </p>

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

      <section className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-black/[0.04] bg-[#fafbfc]">
          <h2 className="text-[14px] font-extrabold text-gray-900">
            Raise a ticket
          </h2>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Pick an order from the last 2 days, then open live chat
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
            onClick={() => void startTicket()}
            disabled={
              startingChat ||
              ((topic === "order_issue" || topic === "payment") &&
                recentOrders.length > 0 &&
                !selectedOrder)
            }
            className="w-full h-11 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold border-0 cursor-pointer disabled:opacity-50"
          >
            {startingChat ? "Opening chat…" : "Open help chat"}
          </button>
        </div>
      </section>

      {chatOpen && chatBootstrap ? (
        <HelpChatbot
          order={selectedOrder}
          topic={topic}
          bootstrap={chatBootstrap}
          onClose={() => {
            setChatOpen(false);
            setChatBootstrap(null);
          }}
        />
      ) : null}
    </div>
  );
}
