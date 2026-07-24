"use client";

const PRESET_TAGS = ["Home", "Work", "Hotel", "Other"] as const;

const inputClass =
  "mt-1.5 w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-[13px] text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-[#f16a34] focus:ring-2 focus:ring-[#f16a34]/10";

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
  const customValue =
    isPreset && normalized !== "Other"
      ? ""
      : normalized === "Other"
        ? ""
        : normalized;

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">
        Save as
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESET_TAGS.map((tag) => {
          const active = activePreset === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() =>
                onChange(tag === "Other" ? customValue || "Other" : tag)
              }
              className={`h-8 px-3 rounded-full text-[11px] font-bold border cursor-pointer transition-colors bg-white ${
                active
                  ? "border-[#f16a34] text-[#f16a34] bg-orange-50/40"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
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
          placeholder="Name this address"
          maxLength={40}
          className={inputClass}
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
