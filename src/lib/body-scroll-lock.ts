"use client";

import { useEffect } from "react";

/**
 * Ref-counted body scroll lock so nested popups don't unlock early.
 * Keeps the vertical scrollbar visible (no layout jump / navbar shift).
 */
let lockCount = 0;
let lockedScrollY = 0;

function preventScroll(e: Event) {
  // Allow scrolling inside modal/dialog panels
  const target = e.target as HTMLElement | null;
  if (target?.closest?.("[data-scroll-lock-allow], [role='dialog']")) {
    return;
  }
  e.preventDefault();
}

function applyLock() {
  lockedScrollY = window.scrollY || window.pageYOffset || 0;
  const html = document.documentElement;

  html.classList.add("svs-scroll-locked");
  // Keep scrollbar gutter visible; block page scroll via overflow + listeners
  html.style.overflowY = "scroll";
  html.style.overscrollBehavior = "none";
  document.body.style.overflow = "hidden";
  document.body.style.overscrollBehavior = "none";
  document.body.style.touchAction = "none";

  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });
}

function clearLock() {
  const html = document.documentElement;
  html.classList.remove("svs-scroll-locked");
  html.style.overflowY = "";
  html.style.overscrollBehavior = "";
  document.body.style.overflow = "";
  document.body.style.overscrollBehavior = "";
  document.body.style.touchAction = "";

  window.removeEventListener("wheel", preventScroll);
  window.removeEventListener("touchmove", preventScroll);

  // Restore exact scroll if anything drifted
  window.scrollTo(0, lockedScrollY);
}

export function lockBodyScroll() {
  if (typeof document === "undefined") return;
  lockCount += 1;
  if (lockCount === 1) applyLock();
}

export function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) clearLock();
}

/** Lock page scroll while `locked` is true. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [locked]);
}
