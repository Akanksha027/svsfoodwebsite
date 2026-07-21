"use client";

import { useEffect, useState } from "react";
import {
  updateNotificationPreferences,
  type WebsiteCustomer,
  type WebsiteCustomerNotificationPreferences,
} from "@/lib/website-customer-api";

const DEFAULT_PREFS: WebsiteCustomerNotificationPreferences = {
  channels: { whatsapp: true, email: true, sms: false },
  orders: {
    placed: true,
    confirmed_paid: true,
    preparing: true,
    ready: true,
    out_for_delivery: true,
    delivered: true,
    cancelled: true,
    payment_receipt: true,
  },
  marketing: {
    offers_promos: false,
    new_menu_items: false,
    feedback_requests: true,
  },
  account: { login_otp: true, security_alerts: true },
};

type ToggleRow = {
  key: string;
  title: string;
  description: string;
  locked?: boolean;
  lockedHint?: string;
};

function Toggle({
  on,
  disabled,
  onChange,
}: {
  on: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full border-0 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        on ? "bg-[#f16a34]" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function PrefGroup({
  title,
  subtitle,
  rows,
  values,
  onToggle,
}: {
  title: string;
  subtitle: string;
  rows: ToggleRow[];
  values: Record<string, boolean>;
  onToggle: (key: string, next: boolean) => void;
}) {
  return (
    <section className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-4 sm:px-5 py-3.5 border-b border-black/[0.04] bg-[#fafbfc]">
        <h2 className="text-[14px] font-extrabold text-gray-900">{title}</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      <ul className="divide-y divide-gray-100">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-start gap-3 px-4 sm:px-5 py-3.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-gray-900">{row.title}</p>
              <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                {row.description}
              </p>
              {row.locked && row.lockedHint ? (
                <p className="text-[11px] font-semibold text-amber-700 mt-1">
                  {row.lockedHint}
                </p>
              ) : null}
            </div>
            <Toggle
              on={Boolean(values[row.key])}
              disabled={row.locked}
              onChange={(next) => onToggle(row.key, next)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AccountNotificationsForm({
  customer,
  onSaved,
}: {
  customer: WebsiteCustomer;
  onSaved: (c: WebsiteCustomer) => void;
}) {
  const [prefs, setPrefs] = useState<WebsiteCustomerNotificationPreferences>(
    () => customer.notification_preferences || DEFAULT_PREFS,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setPrefs(customer.notification_preferences || DEFAULT_PREFS);
    setDirty(false);
  }, [customer]);

  const patchGroup = <G extends keyof WebsiteCustomerNotificationPreferences>(
    group: G,
    key: string,
    next: boolean,
  ) => {
    setPrefs((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: next,
      },
    }));
    setDirty(true);
    setOk(null);
    setError(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const { customer: next } = await updateNotificationPreferences(prefs);
      onSaved(next);
      setPrefs(next.notification_preferences || prefs);
      setDirty(false);
      setOk("Preferences saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-[13px] text-gray-500 leading-relaxed">
        Choose how SVS Food reaches you. Order updates go on WhatsApp by default;
        turn off anything you don’t need. Login codes stay on for security.
      </p>

      <PrefGroup
        title="Channels"
        subtitle="Master switches for how we contact you"
        rows={[
          {
            key: "whatsapp",
            title: "WhatsApp",
            description:
              "Order updates, receipts, and offers on your login WhatsApp number.",
          },
          {
            key: "email",
            title: "Email",
            description:
              "Receipts and occasional account mail to your saved email (when set).",
          },
          {
            key: "sms",
            title: "SMS",
            description:
              "Text messages for critical updates. Currently limited — leave off unless you prefer SMS.",
          },
        ]}
        values={prefs.channels}
        onToggle={(key, next) => patchGroup("channels", key, next)}
      />

      <PrefGroup
        title="Order updates"
        subtitle="Step-by-step messages while your food is being prepared and delivered"
        rows={[
          {
            key: "placed",
            title: "Order placed",
            description: "When we receive your order at the kitchen.",
          },
          {
            key: "confirmed_paid",
            title: "Payment confirmed",
            description: "When online payment succeeds (UPI / QR).",
          },
          {
            key: "preparing",
            title: "Preparing",
            description: "Kitchen has started cooking your order.",
          },
          {
            key: "ready",
            title: "Ready for pickup / rider",
            description: "Food is packed and ready at the counter.",
          },
          {
            key: "out_for_delivery",
            title: "Out for delivery",
            description: "Rider is on the way to your address.",
          },
          {
            key: "delivered",
            title: "Delivered",
            description: "Order marked delivered — enjoy your meal.",
          },
          {
            key: "cancelled",
            title: "Cancelled / refunds",
            description: "If an order is cancelled or a refund is processed.",
          },
          {
            key: "payment_receipt",
            title: "Bill / receipt",
            description: "WhatsApp PDF receipt after a successful payment.",
          },
        ]}
        values={prefs.orders}
        onToggle={(key, next) => patchGroup("orders", key, next)}
      />

      <PrefGroup
        title="Offers & engagement"
        subtitle="Optional marketing — off by default for promos"
        rows={[
          {
            key: "offers_promos",
            title: "Offers & coupons",
            description: "Discount codes, festival deals, and loyalty rewards.",
          },
          {
            key: "new_menu_items",
            title: "New on the menu",
            description: "When we launch new dishes at your usual outlet.",
          },
          {
            key: "feedback_requests",
            title: "Feedback requests",
            description: "Occasional invites to rate your order experience.",
          },
        ]}
        values={prefs.marketing}
        onToggle={(key, next) => patchGroup("marketing", key, next)}
      />

      <PrefGroup
        title="Account & security"
        subtitle="Access and safety related messages"
        rows={[
          {
            key: "login_otp",
            title: "Login OTP",
            description: "WhatsApp code when you sign in to your account.",
            locked: true,
            lockedHint: "Required - can’t be turned off",
          },
          {
            key: "security_alerts",
            title: "Security alerts",
            description:
              "Unusual sign-in or important account changes on your number.",
          },
        ]}
        values={prefs.account}
        onToggle={(key, next) => {
          if (key === "login_otp") return;
          patchGroup("account", key, next);
        }}
      />

      {error ? (
        <p className="text-[13px] text-red-600 font-medium">{error}</p>
      ) : null}
      {ok ? (
        <p className="text-[13px] text-emerald-600 font-medium">{ok}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 sticky bottom-4">
        <button
          type="button"
          disabled={saving || !dirty}
          onClick={() => void save()}
          className="h-11 px-6 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold border-0 cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save preferences"}
        </button>
        {!dirty ? (
          <span className="text-[12px] text-gray-400">No unsaved changes</span>
        ) : (
          <span className="text-[12px] text-gray-500">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}
