"use client";

import {
  APP_DOWNLOAD_URL,
  storeQrImageUrl,
} from "@/lib/app-store-links";

type Props = {
  className?: string;
  /** Tighter copy and layout for account dropdown. */
  compact?: boolean;
};

export default function AppDownloadPromo({
  className = "",
  compact = false,
}: Props) {
  const downloadUrl = APP_DOWNLOAD_URL;
  const qrSize = compact ? 64 : 72;
  const qrSrc = storeQrImageUrl(downloadUrl, qrSize * 2);

  return (
    <div
      className={`flex items-center gap-2.5 ${compact ? "" : "rounded-xl border border-gray-100 bg-gray-50 p-3"} ${className}`.trim()}
    >
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-md border border-gray-200 bg-white p-1 shadow-sm no-underline hover:border-[#f16a34]/40 transition-colors"
        aria-label="Download SVS Food app"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt="Scan to download the SVS Food app"
          width={qrSize}
          height={qrSize}
          className="block rounded-sm"
        />
      </a>
      <div className="min-w-0">
        <p
          className={`font-extrabold text-gray-900 leading-tight ${compact ? "text-[12px]" : "text-[13px]"
            }`}
        >
          Get the SVS Food app
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
          Scan to download
        </p>
      </div>
    </div>
  );
}
