"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useMenuCart } from "@/context/MenuCartContext";

/**
 * Transparent hero navbar only while #hero-section sits behind the bar.
 * All other pages and scrolled home sections use the solid white bar.
 * Menu page uses Blinkit-style delivery + cart in the same navbar.
 */
export default function SiteNavbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isMenu = pathname === "/menu" || pathname.startsWith("/menu/");
  const { closeCart, isOpen } = useMenuCart();
  const [overHero, setOverHero] = useState(isHome);

  useEffect(() => {
    if (!isMenu && isOpen) closeCart();
  }, [isMenu, isOpen, closeCart]);

  useEffect(() => {
    if (!isHome) {
      setOverHero(false);
      return;
    }

    const update = () => {
      const hero = document.getElementById("hero-section");
      if (!hero) {
        setOverHero(false);
        return;
      }
      const nav = document.getElementById("main-navbar");
      const navH = nav?.offsetHeight ?? 72;
      setOverHero(hero.getBoundingClientRect().bottom > navH + 2);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome, pathname]);

  const variant = isHome && overHero ? "hero" : "default";

  return <Navbar variant={variant} menuMode={isMenu} />;
}
