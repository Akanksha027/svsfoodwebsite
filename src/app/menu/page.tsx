import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type MenuPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  return (
    <>
      <Navbar />
      <main className="min-h-[70svh] pt-[72px] md:pt-[88px] lg:pt-[100px] px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-[1100px] mx-auto py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight mb-3">
            Menu
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mb-10">
            {query
              ? `Showing results for “${query}”`
              : "Browse our full menu. Coming soon."}
          </p>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center text-gray-400">
            Menu items will appear here.
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
