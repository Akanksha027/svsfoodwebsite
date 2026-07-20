"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  updateCustomerProfile,
  uploadCustomerPhoto,
  type WebsiteCustomer,
} from "@/lib/website-customer-api";

const GENDER_OPTIONS = [
  { value: "", label: "Select" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const;

const fieldClass =
  "w-full h-11 rounded-xl border border-gray-200 bg-white px-3.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-[#f16a34] focus:ring-2 focus:ring-[#f16a34]/15";

const labelClass =
  "block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5";

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
      setOk("Profile saved");
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

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={photoBusy}
            className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden border-2 border-gray-100 bg-[#fff4ee] cursor-pointer disabled:opacity-60"
            aria-label="Change profile photo"
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-[#f16a34]">
                {initial}
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-black/45 text-white text-[10px] font-bold py-1 text-center">
              {photoBusy ? "…" : "Edit"}
            </span>
          </button>
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold text-gray-900 truncate">
              {customer.name || "Your profile"}
            </p>
            <p className="text-[13px] text-gray-500 tabular-nums mt-0.5">
              +91 {customer.phone}
            </p>
            <p className="text-[12px] text-gray-400 mt-1">
              Tap photo to upload a new picture
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void onPickPhoto(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 sm:p-6 space-y-4">
        <div>
          <label className={labelClass} htmlFor="profile-name">
            Full name
          </label>
          <input
            id="profile-name"
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
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
            className={`${fieldClass} bg-gray-50 text-gray-500`}
            value={`+91 ${customer.phone}`}
            readOnly
            disabled
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            Login number can’t be changed here
            {customer.alternate_phone
              ? ` · Alt +91 ${customer.alternate_phone}`
              : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="profile-gender">
              Gender
            </label>
            <select
              id="profile-gender"
              className={fieldClass}
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

        {error ? (
          <p className="text-[13px] text-red-600 font-medium">{error}</p>
        ) : null}
        {ok ? (
          <p className="text-[13px] text-emerald-600 font-medium">{ok}</p>
        ) : null}

        <button
          type="button"
          disabled={saving || photoBusy}
          onClick={() => void saveProfile()}
          className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#f16a34] text-white text-sm font-extrabold border-0 cursor-pointer disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}
