"use client";

const PRESET_TAGS = ["Home", "Work", "Hotel", "Other"] as const;

type AddressLabelPickerProps = {
  label: string;
  onChange: (label: string) => void;
};

export default function AddressLabelPicker({
  label,
  onChange,
}: AddressLabelPickerProps) {
  const normalized = label.trim() || "Home";
  const isPreset = (PRESET_TAGS as readonly string[]).includes(normalized);
  const activePreset = isPreset ? normalized : "Other";
  const customValue = isPreset && normalized !== "Other" ? "" : normalized === "Other" ? "" : normalized;

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
        Save as
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESET_TAGS.map((tag) => {
          const active = activePreset === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(tag === "Other" ? (customValue || "Other") : tag)}
              className={`h-9 px-3.5 rounded-full text-[13px] font-bold border cursor-pointer transition-colors ${
                active
                  ? "bg-[#fff4ee] border-[#f16a34] text-[#f16a34]"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      {activePreset === "Other" ? (
        <input
          type="text"
          value={customValue === "Other" ? "" : customValue}
          onChange={(e) => {
            const v = e.target.value.slice(0, 40);
            onChange(v.trim() ? v : "Other");
          }}
          placeholder="Name this address (e.g. Mom’s place)"
          maxLength={40}
          className="mt-2.5 w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-[14px] font-semibold text-gray-900 outline-none focus:border-[#f16a34] focus:ring-2 focus:ring-[#f16a34]/15"
          aria-label="Custom address name"
        />
      ) : null}
    </div>
  );
}

export function normalizeAddressLabel(raw: string | null | undefined) {
  const t = String(raw || "").trim().slice(0, 40);
  return t || "Home";
}
