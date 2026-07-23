import Link from "next/link";
import type { MenuCategory, MenuItem, MenuPayload } from "@/lib/menu-types";
import { titleCaseName } from "@/lib/menu-api";

type MenuSeoFooterProps = {
  menu: MenuPayload | null;
  storeId: string;
};

type PipeRow = {
  label: string;
  links: { href: string; label: string }[];
};

function menuSearchHref(storeId: string, query: string) {
  const params = new URLSearchParams({ store: storeId, q: query });
  return `/menu?${params.toString()}`;
}

function menuCategoryHref(storeId: string, categoryId: string) {
  const params = new URLSearchParams({ store: storeId });
  return `/menu?${params.toString()}#cat-${categoryId}`;
}

function uniqueByLabel<T extends { label: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = item.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function sortedCategories(categories: MenuCategory[]) {
  return [...categories].sort((a, b) => a.sort_order - b.sort_order);
}

function sortedItems(items: MenuItem[]) {
  return [...items].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
}

function isComboLike(name: string) {
  return /combo|feast|meal|thali|bucket|platter/i.test(name);
}

function PipeLinkRow({ label, links }: PipeRow) {
  if (links.length === 0) return null;

  return (
    <p className="text-[13px] leading-relaxed text-svs-ink/70 sm:text-[14px]">
      <span className="font-bold text-svs-ink">{label}:</span>{" "}
      {links.map((link, i) => (
        <span key={`${label}-${link.href}-${link.label}`}>
          {i > 0 ? (
            <span className="mx-1.5 text-svs-ink/25" aria-hidden>
              |
            </span>
          ) : null}
          <Link
            href={link.href}
            className="text-svs-ink/65 transition-colors hover:text-svs-orange"
          >
            {link.label}
          </Link>
        </span>
      ))}
    </p>
  );
}

function SeoBlock({
  title,
  rows,
}: {
  title: string;
  rows: PipeRow[];
}) {
  const visible = rows.filter((r) => r.links.length > 0);
  if (visible.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-[15px] font-extrabold tracking-tight text-svs-ink sm:text-base">
        {title}
      </h2>
      <div className="space-y-2">
        {visible.map((row) => (
          <PipeLinkRow key={row.label} label={row.label} links={row.links} />
        ))}
      </div>
    </section>
  );
}

export default function MenuSeoFooter({ menu, storeId }: MenuSeoFooterProps) {
  if (!menu?.categories?.length) return null;

  const categories = sortedCategories(menu.categories).filter((c) =>
    menu.items.some((item) => item.category_id === c.id),
  );
  const items = sortedItems(menu.items);

  const categoryLinks = categories.map((cat) => ({
    href: menuCategoryHref(storeId, cat.id),
    label: titleCaseName(cat.name),
  }));

  const productLinks = uniqueByLabel(
    items.slice(0, 16).map((item) => ({
      href: menuSearchHref(storeId, item.name),
      label: titleCaseName(item.name),
    })),
  );

  const popularProductLinks = uniqueByLabel(
    [...items]
      .reverse()
      .slice(0, 20)
      .map((item) => ({
        href: menuSearchHref(storeId, item.name),
        label: titleCaseName(item.name),
      })),
  );

  const comboLinks = uniqueByLabel(
    items
      .filter((item) => isComboLike(item.name))
      .slice(0, 10)
      .map((item) => ({
        href: menuSearchHref(storeId, item.name),
        label: titleCaseName(item.name),
      })),
  );

  const trendingRows: PipeRow[] = [
    { label: "Categories", links: categoryLinks },
    { label: "Products", links: productLinks.slice(0, 10) },
    {
      label: comboLinks.length > 0 ? "Combos" : "Favourites",
      links:
        comboLinks.length > 0
          ? comboLinks
          : productLinks.slice(4, 12),
    },
  ];

  const popularRows: PipeRow[] = [
    { label: "Products", links: popularProductLinks },
    {
      label: "Favourites",
      links: productLinks.slice(0, 8),
    },
    { label: "Categories", links: categoryLinks },
  ];

  return (
    <aside
      className="border-t border-svs-ink/10 bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
      aria-label="Menu searches and categories"
    >
      <div className="mx-auto max-w-7xl space-y-9 sm:space-y-11">
        <SeoBlock title="Trending Searches" rows={trendingRows} />
        <SeoBlock title="Popular Searches" rows={popularRows} />

        {categoryLinks.length > 0 ? (
          <section>
            <h2 className="mb-4 text-[15px] font-extrabold tracking-tight text-svs-ink sm:text-base">
              Categories
            </h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10 lg:gap-y-4">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] font-bold leading-snug text-svs-ink transition-colors hover:text-svs-orange sm:text-[14px]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
