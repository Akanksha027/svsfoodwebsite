import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { MenuCartProvider } from "@/context/MenuCartContext";
import { WebsiteAuthProvider } from "@/context/WebsiteAuthContext";
import SiteNavbar from "@/components/SiteNavbar";
import AccountLoginPopup from "@/components/AccountLoginPopup";
import AccountMenuDropdown from "@/components/AccountMenuDropdown";
import PoweredBy from "@/components/PoweredBy";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

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
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body>
        <CartProvider>
          <WebsiteAuthProvider>
            <MenuCartProvider>
              <SiteNavbar />
              {children}
              <AccountLoginPopup />
              <AccountMenuDropdown />
              <PoweredBy />
            </MenuCartProvider>
          </WebsiteAuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
