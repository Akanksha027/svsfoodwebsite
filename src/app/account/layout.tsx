import MenuCartShell from "@/components/MenuCartShell";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MenuCartShell>
      {children}
    </MenuCartShell>
  );
}
