"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useMenuCart } from "@/context/MenuCartContext";

/**
 * Navbar is transparent on every page. Home hero uses white icons while
 * #hero-section sits behind the bar; elsewhere uses ink icons on the page bg.
 * Menu page only uses Blinkit-style delivery + cart in the navbar.
 */
export default function SiteNavbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isMenu = pathname === "/menu" || pathname.startsWith("/menu/");
  const isAccount =
    pathname === "/account" || pathname.startsWith("/account/");
  const isCart = pathname === "/cart";
  const isTest = pathname === "/test" || pathname.startsWith("/test/");
  const { closeCart, isOpen } = useMenuCart();
  const [overHero, setOverHero] = useState(isHome);

  if (isTest) return null;

  useEffect(() => {
    if (!isMenu && !isAccount && isOpen) closeCart();
  }, [isMenu, isAccount, isOpen, closeCart]);

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
      homePage={isHome}
      accountPage={isAccount}
      cartPage={isCart}
    />
  );
}
