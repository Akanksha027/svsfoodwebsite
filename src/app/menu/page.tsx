import type { Metadata } from "next";
import Footer from "@/components/Footer";
import MenuLoader from "@/components/MenuLoader";
import NearestStoreGate from "@/components/NearestStoreGate";
import CartBar from "@/components/CartBar";
import MenuCartShell from "@/components/MenuCartShell";
import { resolveStoreLocation, storeDisplayName } from "@/data/locations";
import { fetchStoreMenu } from "@/lib/menu-api";

type MenuPageProps = {
  searchParams: Promise<{ q?: string; store?: string }>;
};

export async function generateMetadata({
  searchParams,
}: MenuPageProps): Promise<Metadata> {
  const { store: storeParam } = await searchParams;
  const store = resolveStoreLocation(storeParam);
  return {
    title: `Menu · ${storeDisplayName(store)} | SVS Food`,
    description: `Browse the SVS Food menu at ${storeDisplayName(store)}. Burgers, wraps, pizza, sides and more.`,
  };
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const { q, store: storeParam } = await searchParams;
  const hasStoreParam = Boolean(storeParam?.trim());
  const store = resolveStoreLocation(storeParam);
  const query = (q || "").trim();

  let menu = null;
  let errorMessage: string | null = null;

  try {
    menu = await fetchStoreMenu(store.backendStoreId);
  } catch (err) {
    errorMessage =
      err instanceof Error
        ? err.message
        : "Could not load the menu. Please try again.";
  }

  return (
    <MenuCartShell store={store}>
      <NearestStoreGate
        hasStoreParam={hasStoreParam}
        currentStoreId={store.id}
        query={query}
      />
      <main className="min-h-[70svh] pt-[72px] md:pt-[88px] lg:pt-[128px] px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12 bg-svs-cream">
        <div className="py-8 sm:py-10">
          <MenuLoader
            key={store.backendStoreId}
            store={store}
            initialQuery={query}
            initialMenu={menu}
            initialError={errorMessage}
          />
        </div>
      </main>
      <div className="lg:hidden">
        <CartBar />
      </div>
      <Footer menuStoreId={store.id} />
    </MenuCartShell>
  );
}
