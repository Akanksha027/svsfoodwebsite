"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCart } from "@/context/CartContext";
import { formatInr } from "@/lib/menu-api";
import type { MenuItem, MenuPayload } from "@/lib/menu-types";
import { itemHasVariants } from "@/lib/menu-types";

const SKIP_CATEGORY = /dip|addon|extra|sauce|taste maker|customisation|customization/i;

function itemImage(item: MenuItem): string | null {
  const url =
    item.image_url ||
    (Array.isArray(item.image_urls) && item.image_urls[0]) ||
    null;
  return typeof url === "string" && url.trim() ? url.trim() : null;
}

function categoryImage(
  menu: MenuPayload,
  categoryId: string,
): string | null {
  const cat = menu.categories.find((c) => c.id === categoryId);
  const url = cat?.image_url || cat?.icon_url || null;
  return typeof url === "string" && url.trim() ? url.trim() : null;
}

function displayPrice(item: MenuItem): number {
  if (Array.isArray(item.variants) && item.variants.length > 0) {
    const prices = item.variants
      .map((v) => Number(v.price))
      .filter((n) => Number.isFinite(n));
    if (prices.length) return Math.min(...prices);
  }
  const n = typeof item.price === "string" ? Number(item.price) : item.price;
  return Number.isFinite(n) ? n : 0;
}

function resolveImage(menu: MenuPayload, item: MenuItem): string | null {
  return itemImage(item) || categoryImage(menu, item.category_id);
}

/** One featured item per category, then fill to exactly 4 */
function pickFourFeatured(menu: MenuPayload): MenuItem[] {
  const cats = [...menu.categories]
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .filter((c) => !SKIP_CATEGORY.test(c.name));

  const picked: MenuItem[] = [];
  const used = new Set<string>();

  for (const cat of cats) {
    if (picked.length >= 4) break;
    const candidates = menu.items
      .filter(
        (i) =>
          i.category_id === cat.id &&
          i.is_available !== false &&
          !used.has(i.id),
      )
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const withImg =
      candidates.find((i) => Boolean(resolveImage(menu, i))) ?? candidates[0];
    if (withImg) {
      picked.push(withImg);
      used.add(withImg.id);
    }
  }

  if (picked.length < 4) {
    const rest = menu.items
      .filter(
        (i) =>
          i.is_available !== false &&
          !used.has(i.id) &&
          !SKIP_CATEGORY.test(
            menu.categories.find((c) => c.id === i.category_id)?.name || "",
          ),
      )
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    for (const item of rest) {
      if (picked.length >= 4) break;
      picked.push(item);
    }
  }

  return picked.slice(0, 4);
}

function StarburstBadge({ children }: { children: ReactNode }) {
  return (
    <span
      className="relative inline-flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center sm:h-[5.25rem] sm:w-[5.25rem]"
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full text-[#f5e27a]"
      >
        <polygon
          fill="currentColor"
          points="50,2 56,18 72,8 68,24 88,22 74,36 96,42 76,50 96,58 74,64 88,78 68,76 72,92 56,82 50,98 44,82 28,92 32,76 12,78 26,64 4,58 24,50 4,42 26,36 12,22 32,24 28,8 44,18"
        />
      </svg>
      <span className="relative z-[1] max-w-[3.4rem] text-center text-[7px] font-bold uppercase leading-[1.15] tracking-wide text-svs-ink sm:max-w-[4rem] sm:text-[8px]">
        {children}
      </span>
    </span>
  );
}

function addMenuItemToCart(
  addItem: ReturnType<typeof useCart>["addItem"],
  item: MenuItem,
  imageUrl: string | null,
  chipImageUrl: string | null,
) {
  if (item.is_available === false) return;

  if (itemHasVariants(item)) {
    const variant = [...(item.variants || [])]
      .filter((v) => v.is_available !== false)
      .sort((a, b) => Number(a.price) - Number(b.price))[0];
    if (!variant) return;
    addItem({
      itemId: variant.item_id,
      petpoojaItemId: variant.petpooja_item_id,
      name: `${item.name} (${variant.variant_name})`,
      unitPrice: Number(variant.price) || 0,
      imageUrl: variant.image_url || imageUrl,
      chipImageUrl: chipImageUrl ?? imageUrl,
      isVeg: item.is_veg,
      parentItemId: item.id,
      variantName: variant.variant_name,
      variantGroupName: variant.group_name ?? null,
    });
    return;
  }

  addItem({
    itemId: item.id,
    petpoojaItemId: item.petpooja_item_id,
    name: item.name,
    unitPrice: Number(item.price) || 0,
    imageUrl,
    chipImageUrl: chipImageUrl ?? imageUrl,
    isVeg: item.is_veg,
  });
}

function ProductCard({
  item,
  imageUrl,
  chipImageUrl,
}: {
  item: MenuItem;
  imageUrl: string | null;
  chipImageUrl: string | null;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const price = displayPrice(item);
  const name = item.name.toUpperCase();
  const desc = (item.description || "").trim().toUpperCase();
  const soldOut = item.is_available === false;

  const onAdd = () => {
    if (soldOut) return;
    addMenuItemToCart(addItem, item, imageUrl, chipImageUrl);
    router.push(`/menu?item=${encodeURIComponent(item.id)}`);
  };

  return (
    <article className="flex h-full flex-col border border-svs-orange/15 bg-white">
      <div className="relative mx-auto mt-6 h-[180px] w-[85%] sm:mt-8 sm:h-[210px]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f3efe6] text-[11px] uppercase tracking-wide text-svs-ink/35">
            SVS Food
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 text-[12px] font-bold uppercase leading-tight tracking-[0.02em] text-svs-ink sm:text-[13px]">
            {name}
          </h3>
          <p className="shrink-0 text-[13px] font-medium text-[#e83e8c] sm:text-sm">
            {formatInr(price)}
          </p>
        </div>

        {desc ? (
          <p className="mt-2 line-clamp-2 text-[10px] font-normal uppercase leading-relaxed tracking-[0.04em] text-svs-ink/70 sm:text-[11px]">
            {desc}
          </p>
        ) : (
          <p className="mt-2 text-[10px] font-normal uppercase tracking-[0.04em] text-svs-ink/40 sm:text-[11px]">
            Fresh from SVS
          </p>
        )}

        <div className="mt-auto flex justify-end pt-5">
          <button
            type="button"
            onClick={onAdd}
            disabled={soldOut}
            className="flex h-8 w-8 items-center justify-center border border-[#c8c4bc] text-[#8a867e] transition-colors hover:border-svs-orange hover:text-svs-orange disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Add ${item.name} to cart`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[14px] w-[14px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function TryThemTodayClient({ menu }: { menu: MenuPayload }) {
  const items = pickFourFeatured(menu);
  if (items.length === 0) return null;

  return (
    <section
      id="try-them-today"
      className="relative w-full bg-[#fff4ee]"
      aria-labelledby="try-them-today-heading"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-14">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <h2
              id="try-them-today-heading"
              className="text-[1.5rem] font-bold uppercase tracking-tight text-svs-ink sm:text-[1.85rem] md:text-[2.15rem]"
            >
              Try them today!
            </h2>
            <StarburstBadge>
              Free delivery
              <br />
              from ₹99
            </StarburstBadge>
          </div>
          <Link
            href="/menu"
            className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-svs-ink underline underline-offset-4 sm:text-xs"
          >
            See all
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:mt-10 sm:gap-5 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              imageUrl={resolveImage(menu, item)}
              chipImageUrl={categoryImage(menu, item.category_id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
