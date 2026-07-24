"use client";

import { useEffect } from "react";

/**
 * Ref-counted body scroll lock so nested popups don't unlock early.
 * `soft` mode only blocks wheel/touch — use on home hero so sticky canvas stays visible.
 */
let hardLockCount = 0;
let softLockCount = 0;
let lockedScrollY = 0;

function preventScroll(e: Event) {
  const target = e.target as HTMLElement | null;
  if (target?.closest?.("[data-scroll-lock-allow], [role='dialog']")) {
    return;
  }
  e.preventDefault();
}

function readLockedScrollY() {
  const fromBody = Math.abs(parseInt(document.body.style.top || "0", 10));
  return lockedScrollY || fromBody || 0;
}

function applyHardLock() {
  lockedScrollY = window.scrollY || window.pageYOffset || 0;
  const html = document.documentElement;

  html.classList.add("svs-scroll-locked");
  html.style.overflow = "hidden";
  html.style.overflowY = "hidden";
  html.style.overscrollBehavior = "none";

  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
  document.body.style.overscrollBehavior = "none";
  document.body.style.touchAction = "none";

  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });
}

function clearHardLock() {
  const html = document.documentElement;
  const scrollY = readLockedScrollY();

  html.classList.remove("svs-scroll-locked");
  html.style.overflow = "";
  html.style.overflowY = "";
  html.style.overscrollBehavior = "";

  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflow = "";
  document.body.style.overscrollBehavior = "";
  document.body.style.touchAction = "";

  window.removeEventListener("wheel", preventScroll);
  window.removeEventListener("touchmove", preventScroll);

  // Restore after releasing fixed body — double rAF avoids the jump-to-top flash.
  requestAnimationFrame(() => {
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
    requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - scrollY) > 2) {
        window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
      }
    });
  });
}

function applySoftLock() {
  document.body.style.touchAction = "none";
  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });
}

function clearSoftLock() {
  document.body.style.touchAction = "";
  window.removeEventListener("wheel", preventScroll);
  window.removeEventListener("touchmove", preventScroll);
}

export function lockBodyScroll(soft = false) {
  if (typeof document === "undefined") return;
  if (soft) {
    softLockCount += 1;
    if (softLockCount === 1) applySoftLock();
    return;
  }
  hardLockCount += 1;
  if (hardLockCount === 1) applyHardLock();
}

export function unlockBodyScroll(soft = false) {
  if (typeof document === "undefined") return;
  if (soft) {
    softLockCount = Math.max(0, softLockCount - 1);
    if (softLockCount === 0) clearSoftLock();
    return;
  }
  hardLockCount = Math.max(0, hardLockCount - 1);
  if (hardLockCount === 0) clearHardLock();
}

/** Lock page scroll while `locked` is true. Pass `soft` on home hero to preserve sticky video. */
export function useBodyScrollLock(locked: boolean, soft = false) {
  useEffect(() => {
    if (!locked) return;
    lockBodyScroll(soft);
    return () => unlockBodyScroll(soft);
  }, [locked, soft]);
}
