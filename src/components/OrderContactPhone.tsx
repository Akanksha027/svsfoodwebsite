"use client";

import { useEffect, useState } from "react";
import { changeOrderCustomerMobile } from "@/lib/orders-api";

type Tone = "light" | "account" | "test";

type OrderContactPhoneProps = {
  phone: string | null | undefined;
  canChange?: boolean;
  storeId?: string;
  orderId?: string;
  tone?: Tone;
  /** Local-only change (for /test mock). */
  onChanged?: (mobile: string) => void;
};

function normalizeDigits(raw: string) {
  return String(raw || "").replace(/\D/g, "").slice(-10);
}

function isValidMobile(digits: string) {
  return /^[6-9]\d{9}$/.test(digits);
}

const toneStyles: Record<
  Tone,
  {
    label: string;
    value: string;
    link: string;
    input: string;
    btn: string;
    btnGhost: string;
    hint: string;
    err: string;
  }
> = {
  light: {
    label: "text-[11px] font-extrabold uppercase tracking-wide text-svs-ink/35",
    value: "text-sm font-semibold text-svs-ink no-underline tabular-nums",
    link: "text-[12px] font-bold text-svs-orange border-0 bg-transparent p-0 cursor-pointer",
    input:
      "w-full h-10 rounded-xl border border-svs-cream bg-white px-3 text-sm font-semibold text-svs-ink tabular-nums outline-none focus:border-svs-orange",
    btn: "h-10 rounded-xl bg-svs-orange text-white text-sm font-extrabold px-4 border-0 cursor-pointer disabled:opacity-50",
    btnGhost:
      "h-10 rounded-xl bg-transparent text-svs-ink/50 text-sm font-bold px-3 border-0 cursor-pointer",
    hint: "text-[11px] text-svs-ink/40 mt-1.5",
    err: "text-[11px] text-red-600 mt-1.5",
  },
  account: {
    label: "text-[10px] font-bold uppercase tracking-wider text-gray-400",
    value: "text-sm font-semibold text-gray-800 no-underline tabular-nums",
    link: "text-[12px] font-bold text-[#f16a34] border-0 bg-transparent p-0 cursor-pointer",
    input:
      "w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 tabular-nums outline-none focus:border-[#f16a34]",
    btn: "h-10 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold px-4 border-0 cursor-pointer disabled:opacity-50",
    btnGhost:
      "h-10 rounded-xl bg-transparent text-gray-500 text-sm font-bold px-3 border-0 cursor-pointer",
    hint: "text-[11px] text-gray-400 mt-1.5",
    err: "text-[11px] text-red-600 mt-1.5",
  },
  test: {
    label: "text-[11px] font-extrabold uppercase tracking-wide text-[#1a1a1a]/35",
    value: "text-sm font-semibold text-[#1a1a1a] no-underline tabular-nums",
    link: "text-[12px] font-bold text-[#f16a34] border-0 bg-transparent p-0 cursor-pointer",
    input:
      "w-full h-10 rounded-xl border border-[#fff4ee] bg-white px-3 text-sm font-semibold text-[#1a1a1a] tabular-nums outline-none focus:border-[#f16a34]",
    btn: "h-10 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold px-4 border-0 cursor-pointer disabled:opacity-50",
    btnGhost:
      "h-10 rounded-xl bg-transparent text-[#1a1a1a]/45 text-sm font-bold px-3 border-0 cursor-pointer",
    hint: "text-[11px] text-[#1a1a1a]/40 mt-1.5",
    err: "text-[11px] text-red-600 mt-1.5",
  },
};

export default function OrderContactPhone({
  phone,
  canChange = false,
  storeId,
  orderId,
  tone = "light",
  onChanged,
}: OrderContactPhoneProps) {
  const styles = toneStyles[tone];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(!canChange);
  const [display, setDisplay] = useState(phone || "");

  useEffect(() => {
    setDisplay(phone || "");
  }, [phone]);

  useEffect(() => {
    setLocked(!canChange);
  }, [canChange]);

  if (!display && !editing) return null;

  const startEdit = () => {
    setDraft(display.replace(/\D/g, "").slice(-10));
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const save = async () => {
    const digits = normalizeDigits(draft);
    if (!isValidMobile(digits)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (digits === normalizeDigits(display)) {
      setError("Enter a different mobile number");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (onChanged && (!storeId || !orderId)) {
        onChanged(digits);
      } else if (storeId && orderId) {
        const result = await changeOrderCustomerMobile({
          storeId,
          orderId,
          mobile: digits,
        });
        setDisplay(result.customer_mobile);
        onChanged?.(result.customer_mobile);
      } else {
        throw new Error("Missing order context");
      }
      setLocked(true);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update number");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className={styles.label}>Phone</p>
        {!editing && !locked && display ? (
          <button type="button" className={styles.link} onClick={startEdit}>
            Change
          </button>
        ) : null}
      </div>

      {editing ? (
        <div>
          <div className="flex gap-2">
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={styles.input}
              placeholder="10-digit mobile"
              aria-label="New contact number"
            />
            <button
              type="button"
              className={styles.btn}
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? "…" : "Save"}
            </button>
            <button type="button" className={styles.btnGhost} disabled={saving} onClick={cancel}>
              Cancel
            </button>
          </div>
          {error ? <p className={styles.err}>{error}</p> : (
            <p className={styles.hint}>You can change this only once. Saved as your alternate number.</p>
          )}
        </div>
      ) : (
        <a href={`tel:${display}`} className={styles.value}>
          {display}
        </a>
      )}
    </div>
  );
}
