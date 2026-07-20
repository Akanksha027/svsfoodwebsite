"use client";

import { useCallback, useEffect, useRef } from "react";

const LEN = 6;

type Props = {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
  /** Focus first empty box when true (e.g. OTP step visible). */
  autoFocus?: boolean;
  /** Wait before focus (ms), e.g. login slide animation. */
  focusDelayMs?: number;
};

export default function OtpSixBoxes({
  value,
  onChange,
  onComplete,
  disabled,
  error,
  autoFocus = false,
  focusDelayMs = 0,
}: Props) {
  const digits = value.replace(/\D/g, "").slice(0, LEN).split("");
  while (digits.length < LEN) digits.push("");

  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const completedRef = useRef<string | null>(null);
  const hadAutoFocus = useRef(false);

  const focusFirstEmpty = useCallback(() => {
    const d = value.replace(/\D/g, "").slice(0, LEN);
    const idx = Math.min(d.length, LEN - 1);
    refs.current[idx]?.focus();
  }, [value]);

  useEffect(() => {
    if (disabled || !autoFocus) {
      hadAutoFocus.current = false;
      return;
    }
    const entering = !hadAutoFocus.current;
    hadAutoFocus.current = true;
    const cleared = value.replace(/\D/g, "").length === 0;
    if (!entering && !cleared) return;

    const id = window.setTimeout(() => focusFirstEmpty(), focusDelayMs);
    return () => window.clearTimeout(id);
  }, [autoFocus, disabled, focusDelayMs, value, focusFirstEmpty]);

  const setAt = useCallback(
    (index: number, char: string) => {
      const arr = value.replace(/\D/g, "").slice(0, LEN).split("");
      while (arr.length < LEN) arr.push("");
      arr[index] = char;
      onChange(arr.join("").slice(0, LEN));
      if (char && index < LEN - 1) refs.current[index + 1]?.focus();
    },
    [onChange, value],
  );

  useEffect(() => {
    const d = value.replace(/\D/g, "").slice(0, LEN);
    if (d.length === LEN && onComplete && completedRef.current !== d) {
      completedRef.current = d;
      onComplete(d);
    }
    if (d.length < LEN) completedRef.current = null;
  }, [value, onComplete]);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    if (!pasted) return;
    onChange(pasted);
    refs.current[Math.min(pasted.length, LEN - 1)]?.focus();
  };

  const box = (filled: boolean) =>
    `h-11 w-full min-w-0 rounded-lg border text-center text-[17px] font-bold tabular-nums outline-none transition-colors ${
      error
        ? "border-red-300 bg-red-50"
        : filled
          ? "border-[#f16a34] bg-white"
          : "border-gray-200 bg-white focus:border-[#f16a34] focus:ring-2 focus:ring-[#f16a34]/15"
    } ${disabled ? "opacity-50" : ""}`;

  return (
    <div className="grid grid-cols-6 gap-1.5 w-full" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={d}
          aria-label={`Digit ${i + 1} of 6`}
          className={box(Boolean(d))}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (v.length > 1) {
              onChange(v.slice(0, LEN));
              return;
            }
            setAt(i, v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) {
              refs.current[i - 1]?.focus();
              onChange(value.replace(/\D/g, "").slice(0, -1));
            }
          }}
        />
      ))}
    </div>
  );
}
