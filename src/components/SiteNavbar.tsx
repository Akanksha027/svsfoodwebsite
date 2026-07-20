"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useMenuCart } from "@/context/MenuCartContext";

/**
 * Transparent hero navbar only while #hero-section sits behind the bar.
 * Elsewhere the bar uses cream so it matches the page and covers scrolled content.
 * Menu and account pages use Blinkit-style delivery + cart in the same navbar.
 * Account also shows a Menu shortcut left of cart.
 */
export default function SiteNavbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAccount =
    pathname === "/account" || pathname.startsWith("/account/");
  const isMenu =
    pathname === "/menu" ||
    pathname.startsWith("/menu/") ||
    isAccount;
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

  return (
    <Navbar
      variant={variant}
      menuMode={isMenu}
      accountMode={isAccount}
      homePage={isHome}
    />
  );
}
