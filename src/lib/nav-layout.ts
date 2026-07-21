/** Match `#main-navbar` height — use for overlays that should not cover the bar. */
export const NAV_TOP_CLASS = "top-14 sm:top-16 md:top-20 lg:top-[72px]";

export function accountOverlayShellClass(isHome: boolean) {
  return isHome
    ? "fixed inset-0 z-[1500] pointer-events-none"
    : "fixed inset-0 z-[1200] pointer-events-none";
}

/** Landing `/` — no dim; invisible dismiss layer only. Elsewhere keep tint below nav. */
export function accountOverlayBackdropClass(
  isHome: boolean,
  variant: "login" | "menu" = "menu",
) {
  if (isHome) {
    return "pointer-events-auto absolute inset-0 bg-transparent cursor-default touch-none border-0";
  }
  const belowNavTint =
    variant === "login" ? "bg-svs-ink/45 backdrop-blur-md" : "bg-black/25";
  return `pointer-events-auto absolute inset-x-0 bottom-0 ${NAV_TOP_CLASS} ${belowNavTint} cursor-default touch-none border-0`;
}

export function accountLoginPanelWrapClass(isHome: boolean) {
  return isHome
    ? "pointer-events-none fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
    : `pointer-events-none fixed inset-x-0 bottom-0 ${NAV_TOP_CLASS} flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6`;
}

export function accountMenuPanelClass(isHome: boolean) {
  const pos = `${NAV_TOP_CLASS} mt-2 right-3 sm:right-4 md:right-6 lg:right-8`;
  return `pointer-events-auto absolute ${pos} w-[min(calc(100vw-1.5rem),300px)] rounded-2xl bg-white border border-black/[0.04] shadow-[0_12px_40px_rgba(0,0,0,0.14)] overflow-hidden otp-step-in z-[1201]`;
}
