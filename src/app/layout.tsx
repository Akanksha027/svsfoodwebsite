import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { MenuCartProvider } from "@/context/MenuCartContext";
import { MenuSearchProvider } from "@/context/MenuSearchContext";
import { WebsiteAuthProvider } from "@/context/WebsiteAuthContext";
import SiteNavbar from "@/components/SiteNavbar";
import AccountLoginPopup from "@/components/AccountLoginPopup";
import AccountMenuDropdown from "@/components/AccountMenuDropdown";
import CartDrawer from "@/components/CartDrawer";
import PoweredBy from "@/components/PoweredBy";

export const metadata: Metadata = {
  metadataBase: new URL("https://svsfood.com"),
  title: "SVS Food | Order Online | Dine-in, Takeaway & Delivery",
  description:
    "Order from SVS Food: wraps, sides, combos and more. Dine-in, takeaway, or home delivery, cooked fresh every time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-bagoss antialiased">
      <body className="font-bagoss">
        <CartProvider>
          <WebsiteAuthProvider>
            <MenuCartProvider>
              <MenuSearchProvider>
                <SiteNavbar />
                {children}
                <CartDrawer />
                <AccountLoginPopup />
                <AccountMenuDropdown />
                <PoweredBy />
              </MenuSearchProvider>
            </MenuCartProvider>
          </WebsiteAuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
