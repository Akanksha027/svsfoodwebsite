import MenuCartShell from "@/components/MenuCartShell";
import CartBar from "@/components/CartBar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MenuCartShell>
      {children}
      <div className="lg:hidden">
        <CartBar />
      </div>
    </MenuCartShell>
  );
}
