"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

/**
 * Transparent hero navbar only while #hero-section sits behind the bar.
 * All other pages and scrolled home sections use the solid white bar.
 */
export default function SiteNavbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [overHero, setOverHero] = useState(isHome);

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
      // Hero still visible under the fixed bar → transparent nav
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

  return <Navbar variant={variant} />;
}
