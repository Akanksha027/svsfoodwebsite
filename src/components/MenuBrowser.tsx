"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { type StoreLocation } from "@/data/locations";
import { SELECTED_STORE_KEY } from "@/lib/config";
import { useCart } from "@/context/CartContext";
import { useMenuCart } from "@/context/MenuCartContext";
import { formatInr, titleCaseName } from "@/lib/menu-api";
import { preloadImage, preloadImages } from "@/lib/preload-image";
import type { MenuCategory, MenuItem, MenuPayload } from "@/lib/menu-types";

type MenuBrowserProps = {
  store: StoreLocation;
  initialQuery?: string;
  menu: MenuPayload | null;
  errorMessage?: string | null;
};

function VegDot({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-[3px] border shrink-0 ${
        isVeg ? "border-svs-green" : "border-svs-orange"
      }`}
      aria-label={isVeg ? "Veg" : "Non-veg"}
      title={isVeg ? "Veg" : "Non-veg"}
    >
      <span
        className={`h-2 w-2 rounded-full ${isVeg ? "bg-svs-green" : "bg-svs-orange"}`}
      />
    </span>
  );
}

function itemMatchesQuery(item: MenuItem, q: string): boolean {
  if (!q) return true;
  const hay = `${item.name} ${item.description || ""}`.toLowerCase();
  return hay.includes(q);
}

export default function MenuBrowser({
  store,
  initialQuery = "",
  menu,
  errorMessage,
}: MenuBrowserProps) {
  const { setStoreId } = useCart();
  const { isOpen } = useMenuCart();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const scrollingToRef = useRef(false);
  const query = initialQuery.trim().toLowerCase();

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_STORE_KEY, store.id);
      localStorage.setItem("svs_menu_browse_store", store.id);
    } catch {
      /* ignore */
    }
    setStoreId(store.id);
  }, [store.id, setStoreId]);

  const categories = useMemo(() => {
    return [...(menu?.categories || [])].sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
    );
  }, [menu]);

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const cat of categories) map.set(cat.id, []);
    for (const item of menu?.items || []) {
      if (!itemMatchesQuery(item, query)) continue;
      const bucket = map.get(item.category_id);
      if (bucket) bucket.push(item);
    }
    for (const [, list] of map) {
      list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
    return map;
  }, [menu, categories, query]);

  const visibleCategories = useMemo(
    () =>
      categories.filter((c) => (itemsByCategory.get(c.id) || []).length > 0),
    [categories, itemsByCategory],
  );

  useEffect(() => {
    if (visibleCategories.length === 0) {
      setActiveCategoryId(null);
      return;
    }
    setActiveCategoryId((prev) =>
      prev && visibleCategories.some((c) => c.id === prev)
        ? prev
        : visibleCategories[0]!.id,
    );
  }, [visibleCategories]);

  // Warm category artwork before first add-to-cart fly animation.
  useEffect(() => {
    void preloadImages(
      visibleCategories.map((c) => c.image_url || c.icon_url),
    );
  }, [visibleCategories]);

  useEffect(() => {
    const nodes = visibleCategories
      .map((c) => sectionRefs.current[c.id])
      .filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingToRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target?.id) {
          setActiveCategoryId(top.target.id.replace(/^cat-/, ""));
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCategories]);

  const scrollToCategory = (categoryId: string) => {
    const el = sectionRefs.current[categoryId];
    if (!el) return;
    setActiveCategoryId(categoryId);
    scrollingToRef.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      scrollingToRef.current = false;
    }, 700);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      {visibleCategories.length > 0 && (
        <div className={`sticky top-[72px] md:top-[88px] z-40 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 bg-svs-cream/95 backdrop-blur-md transition-all duration-300 ${
          isOpen ? "lg:top-[160px]" : "lg:top-[176px]"
        }`}>
          <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-1">
            {visibleCategories.map((cat) => {
              const active = cat.id === activeCategoryId;
              const catImage = cat.image_url || cat.icon_url || null;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => scrollToCategory(cat.id)}
                  className={`group shrink-0 flex flex-col items-center gap-2 w-[88px] sm:w-[100px] cursor-pointer bg-transparent border-0 p-0 outline-none ${
                    active ? "opacity-100" : "opacity-80"
                  }`}
                >
                  <div className={`relative shrink-0 transition-all duration-300 ${
                    isOpen ? "w-[60px] h-[60px] sm:w-[68px] sm:h-[68px]" : "w-[76px] h-[76px] sm:w-[88px] sm:h-[88px]"
                  }`}>
                    <div className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out will-change-transform origin-center scale-100 group-hover:scale-110">
                      {catImage ? (
                        <Image
                          src={catImage}
                          alt=""
                          fill
                          draggable={false}
                          className="object-contain pointer-events-none select-none"
                          sizes="88px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-svs-orange/70">
                          SVS
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`pointer-events-none text-xs sm:text-sm font-bold leading-tight text-center line-clamp-2 ${
                      active ? "text-svs-orange" : "text-svs-ink/80"
                    }`}
                  >
                    {titleCaseName(cat.name)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-8 rounded-2xl border border-svs-orange/20 bg-svs-cream px-5 py-8 text-center text-svs-orange-dark">
          {errorMessage}
        </div>
      )}

      {!errorMessage && !menu && (
        <div className="mt-8 rounded-2xl border border-dashed border-svs-cream bg-svs-white px-5 py-16 text-center text-svs-ink/40">
          Loading menu...
        </div>
      )}

      {!errorMessage && menu && visibleCategories.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-svs-cream bg-svs-white px-5 py-16 text-center text-svs-ink/50">
          {query
            ? `No items match "${initialQuery.trim()}".`
            : "No published items for this outlet yet."}
        </div>
      )}

      <div className="mt-6 sm:mt-8 space-y-10 sm:space-y-12 pb-20">
        {visibleCategories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            items={itemsByCategory.get(cat.id) || []}
            sectionRef={(el) => {
              sectionRefs.current[cat.id] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CategorySection({
  category,
  items,
  sectionRef,
}: {
  category: MenuCategory;
  items: MenuItem[];
  sectionRef: (el: HTMLElement | null) => void;
}) {
  return (
    <section
      id={`cat-${category.id}`}
      ref={sectionRef}
      className="scroll-mt-[160px] md:scroll-mt-[180px] lg:scroll-mt-[320px]"
    >
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        {category.image_url || category.icon_url ? (
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
            <Image
              src={(category.image_url || category.icon_url)!}
              alt=""
              fill
              className="object-contain"
              sizes="56px"
            />
          </div>
        ) : null}
        <h2 className="text-xl sm:text-2xl font-extrabold text-svs-ink tracking-tight">
          {titleCaseName(category.name)}
        </h2>
        <span className="text-sm font-medium text-svs-ink/40">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {items.map((item) => (
          <li key={item.id}>
            <MenuItemCard
              item={item}
              categoryImageUrl={category.image_url || category.icon_url || null}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function MenuItemCard({
  item,
  categoryImageUrl,
}: {
  item: MenuItem;
  categoryImageUrl: string | null;
}) {
  const { addItem, setQuantity, lines } = useCart();
  const imageRef = useRef<HTMLDivElement>(null);
  const displayImage =
    item.image_url ||
    (Array.isArray(item.image_urls) && item.image_urls[0]) ||
    categoryImageUrl ||
    null;
  const available = item.is_available !== false;
  const customisable =
    Array.isArray(item.variants) && item.variants.length > 0;
  const unitPrice = Number(item.price) || 0;
  const line = lines.find((l) => l.itemId === item.id);
  const quantity = line?.quantity ?? 0;

  useEffect(() => {
    void preloadImage(categoryImageUrl);
  }, [categoryImageUrl]);

  const flySource = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) return undefined;
    const rect = imageRef.current?.getBoundingClientRect();
    return rect
      ? {
          sourceRect: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          },
        }
      : undefined;
  };

  const onAdd = () => {
    if (!available) return;
    void preloadImage(categoryImageUrl).then(() => {
      addItem(
        {
          itemId: item.id,
          petpoojaItemId: item.petpooja_item_id,
          name: item.name,
          unitPrice,
          imageUrl: displayImage,
          chipImageUrl: categoryImageUrl,
          isVeg: item.is_veg,
        },
        flySource(),
      );
    });
  };

  const onIncrement = () => {
    if (!available) return;
    onAdd();
  };

  const onDecrement = () => {
    if (quantity <= 0) return;
    setQuantity(item.id, quantity - 1);
  };

  const subtitle =
    item.description?.trim() ||
    (customisable ? "Customisable" : item.is_veg === false ? "Non-veg" : "Veg");

  return (
    <article
      className={`flex flex-col h-full rounded-xl border border-svs-cream bg-svs-white p-2.5 sm:p-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${
        available ? "" : "opacity-60"
      }`}
    >
      {/* Image — top, centered, no bg box */}
      <div
        ref={imageRef}
        className="relative w-full aspect-[4/3] flex items-center justify-center mb-2"
      >
        {displayImage ? (
          <Image
            src={displayImage}
            alt={item.name}
            fill
            className="object-contain pointer-events-none select-none p-1"
            sizes="(max-width: 640px) 45vw, 200px"
            draggable={false}
          />
        ) : (
          <div className="text-xs font-semibold text-svs-orange/40">SVS</div>
        )}
        {!available ? (
          <div className="absolute inset-0 flex items-center justify-center bg-svs-white/70 rounded-lg">
            <span className="text-[11px] font-bold text-svs-orange-dark uppercase tracking-wide">
              Sold out
            </span>
          </div>
        ) : null}
      </div>

      {/* Veg / type pill */}
      <div className="flex items-center gap-1.5 mb-1 min-h-[18px]">
        <VegDot isVeg={item.is_veg !== false} />
        {customisable ? (
          <span className="text-[10px] font-semibold text-svs-ink/40 uppercase tracking-wide">
            Options
          </span>
        ) : null}
      </div>

      {/* Title */}
      <h3 className="text-[13px] sm:text-sm font-semibold text-svs-ink leading-snug line-clamp-2 min-h-[2.6em] mb-0.5">
        {item.name}
      </h3>

      {/* Subtitle — weight / description line */}
      <p className="text-[11px] sm:text-xs text-svs-ink/40 line-clamp-1 mb-auto">
        {subtitle}
      </p>

      {/* Footer — price left, ADD / stepper right */}
      <div className="flex items-end justify-between gap-2 mt-3 pt-1">
        <div className="min-w-0">
          <p className="text-[15px] sm:text-base font-bold text-svs-ink leading-none tabular-nums">
            {formatInr(unitPrice)}
          </p>
          {customisable ? (
            <p className="text-[10px] text-svs-ink/40 mt-0.5">onwards</p>
          ) : null}
        </div>

        {quantity > 0 ? (
          <div className="shrink-0 inline-flex items-center h-8 rounded-lg bg-svs-orange text-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={onDecrement}
              className="w-8 h-full flex items-center justify-center font-bold text-base cursor-pointer bg-transparent border-0 hover:bg-svs-orange-dark"
              aria-label={`Remove one ${item.name}`}
            >
              −
            </button>
            <span className="min-w-[22px] text-center text-sm font-bold tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              disabled={!available}
              onClick={onIncrement}
              className="w-8 h-full flex items-center justify-center font-bold text-base cursor-pointer bg-transparent border-0 hover:bg-svs-orange-dark disabled:opacity-40"
              aria-label={`Add one ${item.name}`}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!available}
            onClick={onAdd}
            className="shrink-0 h-8 min-w-[64px] px-3 rounded-lg border-2 border-svs-orange bg-svs-cream text-svs-orange text-xs font-extrabold uppercase tracking-wide cursor-pointer hover:bg-svs-cream disabled:border-svs-ink/20 disabled:text-svs-ink/40 disabled:bg-svs-cream/50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </article>
  );
}
