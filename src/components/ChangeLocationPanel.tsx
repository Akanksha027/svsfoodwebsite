"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useWebsiteAuth } from "@/context/WebsiteAuthContext";
import { searchDeliveryLocations } from "@/lib/location-search";
import {
  applyMenuDeliverySelection,
  applySavedAddressSelection,
  formatSavedAddressDisplay,
} from "@/lib/menu-delivery-location";
import { fetchDeliveryAddressHint } from "@/lib/reverse-geocode";
import {
  clearLocationDenied,
  rememberNearestStoreFromSavedLocation,
  requestUserLocationDetailed,
} from "@/lib/user-location";
import {
  deleteCustomerAddress,
  type WebsiteCustomerAddress,
} from "@/lib/website-customer-api";
import {
  lockBodyScroll,
  unlockBodyScroll,
} from "@/lib/body-scroll-lock";

type PanelPosition = {
  top: number;
  left: number;
  width: number;
};

type PanelLayout = "dropdown" | "sheet";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
};

function measurePanelPosition(anchor: HTMLElement): PanelPosition {
  const rect = anchor.getBoundingClientRect();
  const width = Math.min(440, window.innerWidth - 24);
  let left = rect.left;
  if (left + width > window.innerWidth - 12) {
    left = window.innerWidth - 12 - width;
  }
  left = Math.max(12, left);
  return {
    top: rect.bottom + 6,
    left,
    width,
  };
}

function HomeIcon() {
  return (
    <svg
      className="h-5 w-5 text-[#f16a34]"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 3 3 10.5V20a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1v-9.5L12 3z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}

function AddressCard({
  addr,
  onSelect,
  onEdit,
  onDelete,
  deleting,
}: {
  addr: WebsiteCustomerAddress;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start gap-3 border-0 bg-transparent p-0 cursor-pointer text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f16a34]/10">
          <HomeIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-gray-900 capitalize">
            {addr.label || "Home"}
          </span>
          <span className="mt-1 block text-[13px] leading-snug text-gray-500">
            {formatSavedAddressDisplay(addr)}
          </span>
        </span>
      </button>
      <div className="mt-3 flex items-center gap-2 pl-[52px]">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f16a34]/20 bg-[#f16a34]/10 text-[#f16a34] cursor-pointer"
          aria-label="Edit address"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 cursor-pointer disabled:opacity-50"
          aria-label="Delete address"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export default function ChangeLocationPanel({
  open,
  onClose,
  anchorRef,
}: Props) {
  const router = useRouter();
  const { customer, openLogin, refreshCustomer } = useWebsiteAuth();
  const [portalReady, setPortalReady] = useState(false);
  const [renderPanel, setRenderPanel] = useState(false);
  const [entered, setEntered] = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPosition | null>(null);
  const [panelLayout, setPanelLayout] = useState<PanelLayout>("dropdown");
  const [search, setSearch] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Awaited<ReturnType<typeof searchDeliveryLocations>>
  >([]);
  const [detectBusy, setDetectBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const searchSeq = useRef(0);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  // Only lock page scroll for the mobile bottom sheet — desktop dropdown stays put.
  useEffect(() => {
    if (!open || panelLayout !== "sheet") return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [open, panelLayout]);

  useLayoutEffect(() => {
    if (!open && !renderPanel) {
      setPanelPos(null);
      return;
    }

    const anchor = anchorRef.current;
    const mq = window.matchMedia("(max-width: 767px)");

    const update = () => {
      if (mq.matches) {
        setPanelLayout("sheet");
        setPanelPos({ top: 0, left: 0, width: window.innerWidth });
        return;
      }
      setPanelLayout("dropdown");
      if (!anchorRef.current) return;
      setPanelPos(measurePanelPosition(anchorRef.current));
    };

    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, renderPanel, anchorRef]);

  useEffect(() => {
    if (open) {
      setRenderPanel(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
      return () => cancelAnimationFrame(raf);
    }

    setEntered(false);
    const timer = window.setTimeout(() => {
      setRenderPanel(false);
      setPanelPos(null);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSearchResults([]);
      setMessage(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = search.trim();
    if (q.length < 3) {
      setSearchResults([]);
      return;
    }

    const seq = ++searchSeq.current;
    setSearchBusy(true);
    const timer = window.setTimeout(() => {
      void searchDeliveryLocations(q)
        .then((results) => {
          if (searchSeq.current !== seq) return;
          setSearchResults(results);
        })
        .catch(() => {
          if (searchSeq.current !== seq) return;
          setSearchResults([]);
        })
        .finally(() => {
          if (searchSeq.current === seq) setSearchBusy(false);
        });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [open, search]);

  const finishPick = useCallback(
    (displayLine: string, lat: number, lng: number, source: "detected" | "search") => {
      applyMenuDeliverySelection({
        displayLine,
        lat,
        lng,
        source,
      });
      onClose();
    },
    [onClose],
  );

  const onDetect = async () => {
    setDetectBusy(true);
    setMessage(null);
    clearLocationDenied();
    const result = await requestUserLocationDetailed({
      force: true,
      highAccuracy: true,
      timeoutMs: 22000,
    });
    if (!result.ok) {
      setMessage(result.message);
      setDetectBusy(false);
      return;
    }
    rememberNearestStoreFromSavedLocation();
    const hint = await fetchDeliveryAddressHint();
    const line =
      hint?.formatted ||
      `${result.location.lat.toFixed(4)}, ${result.location.lng.toFixed(4)}`;
    finishPick(line, result.location.lat, result.location.lng, "detected");
    setDetectBusy(false);
  };

  const onSelectSaved = (addr: WebsiteCustomerAddress) => {
    applySavedAddressSelection(addr);
    onClose();
  };

  const onDeleteAddress = async (addr: WebsiteCustomerAddress) => {
    if (!window.confirm("Delete this saved address?")) return;
    setDeletingId(addr.id);
    setMessage(null);
    try {
      await deleteCustomerAddress(addr.id);
      await refreshCustomer();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Could not delete address.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (!portalReady || !renderPanel || !panelPos) return null;

  const isSheet = panelLayout === "sheet";

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close change location"
        onClick={onClose}
        className={`fixed inset-0 z-[1550] border-0 cursor-pointer bg-black/30 touch-none transition-opacity duration-300 ease-out ${
          entered ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-location-title"
        className={`fixed z-[1551] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-y-auto overscroll-contain transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isSheet
            ? "inset-x-0 bottom-0 rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] max-h-[min(88dvh,100dvh)]"
            : "rounded-2xl p-4 sm:p-5"
        } ${
          entered
            ? "opacity-100 translate-y-0"
            : isSheet
              ? "opacity-100 translate-y-full"
              : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
        style={
          isSheet
            ? undefined
            : {
                top: panelPos.top,
                left: panelPos.left,
                width: panelPos.width,
                maxHeight: `min(82vh, calc(100vh - ${panelPos.top}px - 12px))`,
              }
        }
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2
            id="change-location-title"
            className="text-lg font-extrabold text-gray-900"
          >
            Change Location
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent text-gray-400 hover:text-gray-600 cursor-pointer text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={detectBusy}
            onClick={() => void onDetect()}
            className="h-11 w-full rounded-xl bg-[#f16a34] px-4 text-sm font-bold text-white border-0 cursor-pointer hover:bg-[#e05a28] disabled:opacity-60 shadow-sm"
          >
            {detectBusy ? "Detecting…" : "Detect my location"}
          </button>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-300" />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-[11px] font-bold text-gray-500">
              OR
            </span>
            <span className="h-px flex-1 bg-gray-300" />
          </div>
          <div className="relative w-full">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search delivery location"
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none focus:border-[#f16a34] focus:ring-2 focus:ring-[#f16a34]/15"
            />
            {search.trim().length >= 3 ? (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                {searchBusy ? (
                  <p className="px-3 py-3 text-sm text-gray-500">Searching…</p>
                ) : searchResults.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-gray-500">
                    No places found
                  </p>
                ) : (
                  searchResults.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() =>
                        finishPick(row.label, row.lat, row.lng, "search")
                      }
                      className="block w-full border-0 border-b border-gray-100 bg-white px-3 py-2.5 text-left text-sm text-gray-800 cursor-pointer hover:bg-orange-50 last:border-b-0"
                    >
                      {row.label}
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>

        {message ? (
          <p className="mt-3 text-xs font-semibold text-[#c2410c] bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            {message}
          </p>
        ) : null}

        <div className="mt-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-[15px] font-extrabold text-gray-900">
              Your saved addresses
            </h3>
            <Link
              href="/account?tab=addresses&add=1"
              onClick={onClose}
              className="text-xs font-bold text-[#f16a34] no-underline hover:underline shrink-0"
            >
              + Add new
            </Link>
          </div>

          {!customer ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Log in to see and save delivery addresses.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openLogin();
                }}
                className="h-10 px-4 rounded-lg bg-[#f16a34] text-white text-sm font-bold border-0 cursor-pointer"
              >
                Log in
              </button>
            </div>
          ) : customer.addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600 mb-3">No saved addresses yet.</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/account?tab=addresses&add=1");
                }}
                className="h-10 px-4 rounded-lg bg-[#f16a34] text-white text-sm font-bold border-0 cursor-pointer"
              >
                Add address in account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {customer.addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  addr={addr}
                  onSelect={() => onSelectSaved(addr)}
                  onEdit={() => {
                    onClose();
                    router.push("/account?tab=addresses");
                  }}
                  onDelete={() => void onDeleteAddress(addr)}
                  deleting={deletingId === addr.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
