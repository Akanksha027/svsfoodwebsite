"use client";

import { useEffect } from "react";

/**
 * Ref-counted body scroll lock so nested popups (login + cart, etc.)
 * don't unlock early when one of them closes.
 *
 * Uses `position: fixed` + scroll restore so iOS Safari can't rubber-band
 * the page behind the overlay.
 */
let lockCount = 0;
let lockedScrollY = 0;

function applyLock() {
  lockedScrollY = window.scrollY || window.pageYOffset || 0;
  const html = document.documentElement;
  html.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";
  document.body.style.overflow = "hidden";
  document.body.style.overscrollBehavior = "none";
  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

function clearLock() {
  const html = document.documentElement;
  html.style.overflow = "";
  html.style.overscrollBehavior = "";
  document.body.style.overflow = "";
  document.body.style.overscrollBehavior = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
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
