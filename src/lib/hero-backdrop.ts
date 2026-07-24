/** Snapshot the home hero canvas for modal backdrops (sticky breaks under scroll lock). */
export function captureHeroCanvasBackdrop(): string | null {
  const canvas = document.querySelector<HTMLCanvasElement>("#hero-section canvas");
  if (!canvas || canvas.width < 1 || canvas.height < 1) return null;

  try {
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch {
    return null;
  }
}

export function isOverHeroSection(): boolean {
  const hero = document.getElementById("hero-section");
  if (!hero) return false;
  const nav = document.getElementById("main-navbar");
  const navH = nav?.offsetHeight ?? 72;
  return hero.getBoundingClientRect().bottom > navH + 2;
}
