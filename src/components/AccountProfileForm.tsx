"use client";

import { useMemo, useRef, useState } from "react";
import {
  updateCustomerProfile,
  uploadCustomerPhoto,
  type WebsiteCustomer,
} from "@/lib/website-customer-api";

const GENDER_OPTIONS = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const;

const fieldClass =
  "w-full h-12 rounded-xl border border-gray-200/90 bg-gray-50/80 px-4 text-[15px] font-semibold text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#f16a34] focus:bg-white focus:ring-[3px] focus:ring-[#f16a34]/12";

const labelClass =
  "block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-2";

function fileToBase64(file: File): Promise<{ base64: string; contentType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const match = result.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        reject(new Error("Could not read image"));
        return;
      }
      resolve({ contentType: match[1], base64: match[2] });
    };
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

function profileCompletion(customer: WebsiteCustomer) {
  const checks = [
    Boolean(customer.name?.trim()),
    Boolean(customer.email?.trim()),
    Boolean(customer.gender),
    Boolean(customer.date_of_birth),
    Boolean(customer.photo_url),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export default function AccountProfileForm({
  customer,
  onSaved,
}: {
  customer: WebsiteCustomer;
  onSaved: (c: WebsiteCustomer) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(customer.name || "");
  const [email, setEmail] = useState(customer.email || "");
  const [gender, setGender] = useState(customer.gender || "");
  const [dob, setDob] = useState(customer.date_of_birth || "");
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState(customer.photo_url || null);

  const initial = (customer.name || customer.phone || "U").charAt(0).toUpperCase();
  const completion = useMemo(() => profileCompletion({ ...customer, name, email, gender, date_of_birth: dob, photo_url: previewUrl }), [customer, name, email, gender, dob, previewUrl]);

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const { customer: next } = await updateCustomerProfile({
        name: name.trim(),
        email: email.trim(),
        gender: gender || "",
        date_of_birth: dob || "",
      });
      onSaved(next);
      setOk("Profile saved successfully");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const onPickPhoto = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose a JPEG, PNG, or WebP image");
      return;
    }
    if (file.size > 3.5 * 1024 * 1024) {
      setError("Photo must be under 3 MB");
      return;
    }
    setPhotoBusy(true);
    setError(null);
    setOk(null);
    try {
      const { base64, contentType } = await fileToBase64(file);
      const { customer: next } = await uploadCustomerPhoto({
        imageBase64: base64,
        contentType,
      });
      setPreviewUrl(next.photo_url || null);
      onSaved(next);
      setOk("Photo updated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload photo");
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const checklist = [
    { label: "Full name", done: Boolean(name.trim()) },
    { label: "Email address", done: Boolean(email.trim()) },
    { label: "Profile photo", done: Boolean(previewUrl) },
    { label: "Gender & birthday", done: Boolean(gender && dob) },
  ];

  return (
    <div className="w-full space-y-5 lg:space-y-6">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f16a34] via-[#f97316] to-[#ea580c] px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10 shadow-[0_24px_64px_-20px_rgba(241,106,52,0.55)]">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-black/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              className="group relative h-28 w-28 shrink-0 rounded-full p-1 bg-white/25 backdrop-blur-sm cursor-pointer disabled:opacity-60 transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
              aria-label="Change profile photo"
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#ffffff ${completion * 3.6}deg, rgba(255,255,255,0.25) 0deg)`,
                }}
                aria-hidden
              />
              <span className="absolute inset-[5px] rounded-full overflow-hidden bg-[#fff4ee] border-2 border-white/90 shadow-lg">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-3xl font-extrabold text-[#f16a34]">
                    {initial}
                  </span>
                )}
              </span>
              <span className="absolute inset-x-3 bottom-2 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-bold py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {photoBusy ? "Uploading…" : "Change photo"}
              </span>
            </button>

            <div className="text-center sm:text-left min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/75 mb-1">
                My account
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate max-w-md">
                {name.trim() || "Your profile"}
              </h1>
              <p className="mt-1.5 text-[15px] font-semibold text-white/90 tabular-nums">
                +91 {customer.phone}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1.5 text-[12px] font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
                Verified member
              </div>
            </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => void onPickPhoto(e.target.files?.[0] || null)}
        />
      </section>

      {/* Main grid — fills available width */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
        <div className="xl:col-span-8 space-y-5">
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-5 sm:p-7">
            <div className="mb-6">
              <h2 className="text-lg font-extrabold text-gray-900">Personal information</h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Keep your details up to date for orders and receipts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="profile-name">
                  Full name
                </label>
                <input
                  id="profile-name"
                  className={fieldClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  maxLength={80}
                  autoComplete="name"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="profile-email">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className={fieldClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={120}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="profile-phone">
                  Mobile
                </label>
                <input
                  id="profile-phone"
                  className={`${fieldClass} bg-gray-100/90 text-gray-500 cursor-not-allowed`}
                  value={`+91 ${customer.phone}`}
                  readOnly
                  disabled
                />
                <p className="text-[11px] text-gray-400 mt-2">
                  Login number can&apos;t be changed
                  {customer.alternate_phone
                    ? ` · Alt +91 ${customer.alternate_phone}`
                    : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-5 sm:p-7">
            <div className="mb-6">
              <h2 className="text-lg font-extrabold text-gray-900">About you</h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Optional — helps us personalize offers and celebrations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass} htmlFor="profile-gender">
                  Gender
                </label>
                <select
                  id="profile-gender"
                  className={`${fieldClass} appearance-none cursor-pointer`}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value || "empty"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="profile-dob">
                  Date of birth
                </label>
                <input
                  id="profile-dob"
                  type="date"
                  className={fieldClass}
                  value={dob}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <aside className="xl:col-span-4 space-y-5">


          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-5 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4ee] text-[#f16a34] mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-[15px] font-extrabold text-gray-900">Your data is safe</h3>
            <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
              We use your information only for orders, support, and personalized offers. Read our{" "}
              <a href="/privacy-policy" className="font-bold text-[#f16a34] no-underline hover:underline">
                privacy policy
              </a>
              .
            </p>
          </div>
        </aside>
      </div>

      {/* Save bar — lifted above mobile cart bar */}
      <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] lg:bottom-0 z-10 -mx-1 px-1 pb-1 pt-2 bg-gradient-to-t from-[#f4f6fb] via-[#f4f6fb] to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-white/95 backdrop-blur-md border border-black/[0.06] shadow-[0_-4px_24px_rgba(15,23,42,0.08)] px-4 py-3.5 sm:px-6">
          <div className="min-h-[20px]">
            {error ? (
              <p className="text-[13px] text-red-600 font-semibold">{error}</p>
            ) : ok ? (
              <p className="text-[13px] text-emerald-600 font-semibold flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {ok}
              </p>
            ) : (
              <p className="text-[13px] text-gray-500">Changes are saved to your SVS Food account.</p>
            )}
          </div>
          <button
            type="button"
            disabled={saving || photoBusy}
            onClick={() => void saveProfile()}
            className="h-12 w-full sm:w-auto sm:min-w-[160px] px-8 rounded-xl bg-gradient-to-r from-[#f16a34] to-[#ea580c] text-white text-sm font-extrabold border-0 cursor-pointer shadow-[0_8px_24px_-6px_rgba(241,106,52,0.55)] transition-all duration-200 hover:shadow-[0_12px_28px_-6px_rgba(241,106,52,0.65)] hover:brightness-105 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
