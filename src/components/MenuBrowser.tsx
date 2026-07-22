"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import AddItemSheet, {
  type AddItemSelection,
} from "@/components/AddItemSheet";
import { RollingCounter } from "@/components/RollingCounter";
import { type StoreLocation } from "@/data/locations";
import { SELECTED_STORE_KEY } from "@/lib/config";
import { cartLineKey, useCart } from "@/context/CartContext";
import { useMenuSearch } from "@/context/MenuSearchContext";
import MenuNavSearch from "@/components/MenuNavSearch";
import { formatInr, titleCaseName } from "@/lib/menu-api";
import { preloadImage, preloadImages, preloadItemSheetImages } from "@/lib/preload-image";
import type { MenuCategory, MenuItem, MenuPayload } from "@/lib/menu-types";
import {
  itemHasVariants,
  itemNeedsPicker,
  variantItemIds,
} from "@/lib/menu-types";

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

function itemMatchesQuery(
  item: MenuItem,
  categoryName: string,
  q: string,
): boolean {
  if (!q) return true;
  const hay = `${item.name} ${item.description || ""} ${categoryName}`.toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((token) => {
    if (hay.includes(token)) return true;
    if (token.length > 3 && token.endsWith("s") && hay.includes(token.slice(0, -1))) {
      return true;
    }
    if (token.length > 2 && hay.includes(`${token}s`)) return true;
    return false;
  });
}

function findDessertsCategory(categories: MenuCategory[]): MenuCategory | null {
  return (
    categories.find((c) => /dessert/i.test(c.name)) ??
    categories.find((c) => /sweet/i.test(c.name)) ??
    null
  );
}

export default function MenuBrowser({
  store,
  initialQuery = "",
  menu,
  errorMessage,
}: MenuBrowserProps) {
  const { setStoreId } = useCart();
  const { query: searchQuery, setQuery: setSearchQuery, setPlaceholderHints } =
    useMenuSearch();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const categoryBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const stickyStackRef = useRef<HTMLDivElement | null>(null);
  const scrollingToRef = useRef(false);
  const lastActiveRef = useRef<string | null>(null);
  const stripScrollRaf = useRef<number | null>(null);
  const stripScrollTimer = useRef<number | null>(null);

  useEffect(() => {
    if (initialQuery.trim()) setSearchQuery(initialQuery.trim());
  }, [initialQuery, setSearchQuery]);

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

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

  const categoryById = useMemo(() => {
    const map = new Map<string, MenuCategory>();
    for (const cat of categories) map.set(cat.id, cat);
    return map;
  }, [categories]);

  const searchResults = useMemo(() => {
    if (!isSearching || !menu) return null;

    const matched: { item: MenuItem; category: MenuCategory }[] = [];
    for (const item of menu.items || []) {
      const category = categoryById.get(item.category_id);
      if (!category) continue;
      if (itemMatchesQuery(item, category.name, query)) {
        matched.push({ item, category });
      }
    }

    matched.sort(
      (a, b) => (a.item.sort_order || 0) - (b.item.sort_order || 0),
    );

    if (matched.length > 0) {
      return { items: matched, isFallback: false };
    }

    const desserts = findDessertsCategory(categories);
    if (!desserts) return { items: [], isFallback: false };

    const fallbackItems = (menu.items || [])
      .filter((item) => item.category_id === desserts.id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((item) => ({ item, category: desserts }));

    return { items: fallbackItems, isFallback: true };
  }, [isSearching, menu, categories, categoryById, query]);

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const cat of categories) map.set(cat.id, []);
    if (isSearching) return map;
    for (const item of menu?.items || []) {
      const bucket = map.get(item.category_id);
      if (bucket) bucket.push(item);
    }
    for (const [, list] of map) {
      list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
    return map;
  }, [menu, categories, isSearching]);

  const visibleCategories = useMemo(
    () =>
      categories.filter((c) => (itemsByCategory.get(c.id) || []).length > 0),
    [categories, itemsByCategory],
  );

  useEffect(() => {
    const names = visibleCategories
      .map((c) => c.name?.trim())
      .filter((name): name is string => Boolean(name));
    if (names.length > 0) setPlaceholderHints(names);
  }, [visibleCategories, setPlaceholderHints]);

  // Keep sticky offset locked to real navbar height (no gap for items to peek through).
  useEffect(() => {
    const nav = document.getElementById("main-navbar");
    const stack = stickyStackRef.current;
    if (!nav) return;

    const sync = () => {
      const nh = Math.round(nav.getBoundingClientRect().height);
      if (nh <= 0) return;
      document.body.style.setProperty("--menu-nav-sticky-top", `${nh}px`);
      document.body.style.setProperty("--menu-nav-offset", `${nh}px`);
      const sh = stack ? Math.round(stack.getBoundingClientRect().height) : 0;
      if (sh > 0) {
        document.body.style.setProperty(
          "--menu-nav-scroll-mt",
          `${nh + sh}px`,
        );
      }
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(nav);
    if (stack) ro.observe(stack);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [isSearching, visibleCategories.length]);

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

  // Stable scroll-spy: last section whose top crossed the sticky stack bottom.
  useEffect(() => {
    if (isSearching || visibleCategories.length === 0) return;

    let raf = 0;
    let settleTimer: number | null = null;
    lastActiveRef.current = activeCategoryId;

    const pickActive = () => {
      if (scrollingToRef.current) return;

      const stack = document.querySelector(".menu-sticky-stack");
      const nav = document.getElementById("main-navbar");
      const focusY = stack
        ? stack.getBoundingClientRect().bottom + 8
        : (nav?.getBoundingClientRect().bottom ?? 72) + 12;

      // Last category whose section top has scrolled past the sticky edge.
      let nextId = visibleCategories[0]?.id ?? null;
      for (const cat of visibleCategories) {
        const el = sectionRefs.current[cat.id];
        if (!el) continue;
        if (el.getBoundingClientRect().top <= focusY) {
          nextId = cat.id;
        } else {
          break;
        }
      }

      if (!nextId || nextId === lastActiveRef.current) return;

      // Hysteresis: ignore tiny boundary crossings while previous still covers focus.
      const prevId = lastActiveRef.current;
      if (prevId) {
        const prevEl = sectionRefs.current[prevId];
        if (prevEl) {
          const prev = prevEl.getBoundingClientRect();
          if (prev.top <= focusY + 48 && prev.bottom > focusY + 80) {
            return;
          }
        }
      }

      lastActiveRef.current = nextId;
      setActiveCategoryId(nextId);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        pickActive();
      });
      if (settleTimer != null) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        pickActive();
      }, 120);
    };

    pickActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (settleTimer != null) window.clearTimeout(settleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only rebind when category list / search mode changes
  }, [visibleCategories, isSearching]);

  // Nudge horizontal strip only after vertical scroll settles; never while finger is moving.
  useEffect(() => {
    if (!activeCategoryId || isSearching) return;
    const btn = categoryBtnRefs.current[activeCategoryId];
    const scroller = categoryScrollRef.current;
    if (!btn || !scroller) return;

    if (stripScrollTimer.current != null) {
      window.clearTimeout(stripScrollTimer.current);
    }
    if (stripScrollRaf.current != null) {
      cancelAnimationFrame(stripScrollRaf.current);
      stripScrollRaf.current = null;
    }

    const nudge = () => {
      const btnLeft = btn.offsetLeft;
      const btnRight = btnLeft + btn.offsetWidth;
      const viewLeft = scroller.scrollLeft;
      const viewRight = viewLeft + scroller.clientWidth;
      const pad = 20;

      // Only scroll when the tile is actually clipped — avoids constant micro-nudges.
      if (btnLeft >= viewLeft + pad && btnRight <= viewRight - pad) return;

      const target = btnLeft - scroller.clientWidth / 2 + btn.offsetWidth / 2;
      const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      const next = Math.max(0, Math.min(target, max));
      if (Math.abs(scroller.scrollLeft - next) < 16) return;

      scroller.scrollTo({ left: next, behavior: "smooth" });
    };

    // Wait until scroll idle so horizontal motion does not fight vertical scroll.
    stripScrollTimer.current = window.setTimeout(nudge, 280);

    const onScroll = () => {
      if (stripScrollTimer.current != null) {
        window.clearTimeout(stripScrollTimer.current);
      }
      stripScrollTimer.current = window.setTimeout(nudge, 280);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (stripScrollTimer.current != null) {
        window.clearTimeout(stripScrollTimer.current);
      }
    };
  }, [activeCategoryId, isSearching]);

  const scrollToCategory = (categoryId: string) => {
    const el = sectionRefs.current[categoryId];
    if (!el) return;
    lastActiveRef.current = categoryId;
    setActiveCategoryId(categoryId);
    scrollingToRef.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      scrollingToRef.current = false;
    }, 1000);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Search + categories scroll up together, then stick under the logo bar */}
      <div
        ref={stickyStackRef}
        className="menu-sticky-stack sticky z-[1390] -mx-4 sm:mx-0 px-4 sm:px-0 pt-4 md:pt-5 pb-2 sm:pb-3 bg-svs-cream"
      >
        <div className="menu-sticky-search lg:hidden mb-1 w-full mt-0 flex justify-center">
          <MenuNavSearch docked />
        </div>

        {!isSearching && visibleCategories.length > 0 ? (
          <div
            ref={categoryScrollRef}
            className="menu-category-scroll flex gap-2.5 sm:gap-3 md:gap-3.5 overflow-x-auto pt-2 md:pt-4 pb-0.5 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {visibleCategories.map((cat) => {
              const active = cat.id === activeCategoryId;
              const catImage = cat.image_url || cat.icon_url || null;
              return (
                <button
                  key={cat.id}
                  type="button"
                  ref={(node) => {
                    categoryBtnRefs.current[cat.id] = node;
                  }}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`menu-category-tile shrink-0 cursor-pointer border-0 p-0 outline-none ${
                    active ? "menu-category-tile--active" : ""
                  }`}
                  aria-current={active ? "true" : undefined}
                >
                  <span className="menu-category-tile__icon-ring" aria-hidden>
                    {catImage ? (
                      <span className="menu-category-tile__icon-media">
                        <Image
                          src={catImage}
                          alt=""
                          fill
                          draggable={false}
                          className="object-contain pointer-events-none select-none"
                          sizes="96px"
                        />
                      </span>
                    ) : (
                      <span className="menu-category-tile__icon-fallback">SVS</span>
                    )}
                  </span>
                  <span className="menu-category-tile__label">
                    {titleCaseName(cat.name)}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

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

      {!errorMessage && menu && isSearching && searchResults && (
        <>
          {searchResults.isFallback ? (
            <p className="mt-2 mb-4 text-sm text-svs-ink/55 text-center sm:text-left">
              No matches for &ldquo;{searchQuery.trim()}&rdquo; — here are our
              desserts instead
            </p>
          ) : null}

          {searchResults.items.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-svs-cream bg-svs-white px-5 py-16 text-center text-svs-ink/50">
              {`No items match "${searchQuery.trim()}".`}
            </div>
          ) : (
            <ul className="mt-4 sm:mt-6 grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5 pb-20">
              {searchResults.items.map(({ item, category }) => (
                <li key={item.id}>
                  <MenuItemCard
                    item={item}
                    categoryImageUrl={
                      category.image_url || category.icon_url || null
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {!errorMessage && menu && !isSearching && visibleCategories.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-svs-cream bg-svs-white px-5 py-16 text-center text-svs-ink/50">
          No published items for this outlet yet.
        </div>
      )}

      {!isSearching ? (
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
      ) : null}
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
      className="scroll-mt-[var(--menu-nav-scroll-mt,11.75rem)]"
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

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5 md:gap-4 lg:gap-5">
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
  const {
    addItem,
    setQuantity,
    lines,
    quantityForItemIds,
    decrementLastMatching,
  } = useCart();
  const imageRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const displayImage =
    item.image_url ||
    (Array.isArray(item.image_urls) && item.image_urls[0]) ||
    categoryImageUrl ||
    null;
  const available = item.is_available !== false;
  const customisable = itemNeedsPicker(item);
  const hasVariants = itemHasVariants(item);
  const unitPrice = Number(item.price) || 0;
  const childIds = useMemo(() => {
    if (hasVariants) return variantItemIds(item);
    return [item.id];
  }, [hasVariants, item]);
  const quantity = quantityForItemIds(childIds);

  useEffect(() => {
    void preloadImage(categoryImageUrl);
    void preloadImage(displayImage);
  }, [categoryImageUrl, displayImage]);

  /* Warm customise-sheet CDN URLs before Add is tapped (Next/Image cache ≠ raw URL). */
  useEffect(() => {
    if (!customisable || !available) return;
    const node = articleRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      void preloadItemSheetImages(item, categoryImageUrl);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        void preloadItemSheetImages(item, categoryImageUrl);
        io.disconnect();
      },
      { rootMargin: "240px 0px", threshold: 0.01 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [customisable, available, item, categoryImageUrl]);

  const openPicker = () => {
    void preloadItemSheetImages(item, categoryImageUrl);
    setPickerOpen(true);
  };

  const flySource = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      return undefined;
    }
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

  const commitSelection = (selection: AddItemSelection) => {
    const variantSuffix = selection.variant?.variant_name
      ? ` (${selection.variant.variant_name})`
      : "";
    void preloadImage(categoryImageUrl).then(() => {
      addItem(
        {
          itemId: selection.itemId,
          petpoojaItemId: selection.petpoojaItemId,
          name: `${item.name}${variantSuffix}`,
          unitPrice: selection.unitPrice,
          imageUrl: selection.variant?.image_url || displayImage,
          chipImageUrl: categoryImageUrl,
          isVeg: item.is_veg,
          parentItemId: hasVariants ? item.id : null,
          variantName: selection.variant?.variant_name ?? null,
          variantGroupName: selection.variant?.group_name ?? null,
          addons: selection.addons,
          quantity: selection.quantity,
        },
        flySource(),
      );
    });
  };

  const removeSelection = (selection: AddItemSelection) => {
    const key = cartLineKey(selection.itemId, selection.addons);
    const line = lines.find((l) => l.key === key);
    if (!line) return;
    setQuantity(line.key, line.quantity - 1);
  };

  const onAdd = () => {
    if (!available) return;
    if (customisable) {
      openPicker();
      return;
    }
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

  const openCard = () => {
    if (!available || !customisable) return;
    openPicker();
  };

  const onIncrement = () => {
    if (!available) return;
    if (customisable) {
      openPicker();
      return;
    }
    onAdd();
  };

  const onDecrement = () => {
    if (quantity <= 0) return;
    if (customisable) {
      decrementLastMatching(childIds);
      return;
    }
    const line = lines.find((l) => l.itemId === item.id);
    if (!line) return;
    setQuantity(line.key, quantity - 1);
  };

  const subtitle =
    item.description?.trim() ||
    (customisable
      ? "Customisable"
      : item.is_veg === false
        ? "Non-veg"
        : "Veg");

  return (
    <>
      <article
        ref={articleRef}
        role={customisable && available ? "button" : undefined}
        tabIndex={customisable && available ? 0 : undefined}
        onClick={openCard}
        onKeyDown={(e) => {
          if (!customisable || !available) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openCard();
          }
        }}
        className={`flex flex-col h-full rounded-xl border border-svs-cream bg-svs-white overflow-hidden ${
          available ? "" : "opacity-60"
        } ${customisable && available ? "cursor-pointer" : ""}`}
      >
        <div
          ref={imageRef}
          className="relative w-full aspect-[4/3] flex items-center justify-center bg-svs-cream shrink-0"
        >
          {displayImage ? (
            <Image
              src={displayImage}
              alt={item.name}
              fill
              className="object-cover pointer-events-none select-none"
              sizes="(max-width: 640px) 45vw, 200px"
              draggable={false}
            />
          ) : (
            <div className="text-xs font-semibold text-svs-orange/40">SVS</div>
          )}
          {!available ? (
            <div className="absolute inset-0 flex items-center justify-center bg-svs-white/70">
              <span className="text-[11px] font-bold text-svs-orange-dark uppercase tracking-wide">
                Sold out
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col flex-1 p-2 sm:p-2.5">
          <h3 className="text-[13px] sm:text-sm font-semibold text-svs-ink leading-snug line-clamp-2 min-h-[2.6em] mb-auto">
            {item.name}
          </h3>

          <div className="flex items-end justify-between gap-2 mt-2 pt-1">
            <div className="min-w-0">
              <p className="text-[15px] sm:text-base font-bold text-svs-ink leading-none tabular-nums">
                {formatInr(unitPrice)}
              </p>
            </div>

            {quantity > 0 ? (
              <div
                className="shrink-0 inline-flex items-center h-8 rounded-lg bg-svs-orange text-white overflow-hidden shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={onDecrement}
                  className="w-8 h-full flex items-center justify-center font-bold text-base cursor-pointer bg-transparent border-0 hover:bg-svs-orange-dark"
                  aria-label={`Remove one ${item.name}`}
                >
                  −
                </button>
                <span className="min-w-[22px] flex items-center justify-center">
                  <RollingCounter value={quantity} fontSize={14} color="#ffffff" />
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
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                className="shrink-0 h-8 min-w-[64px] px-3 rounded-lg border-2 border-svs-orange bg-svs-cream text-svs-orange text-xs font-extrabold uppercase tracking-wide cursor-pointer hover:bg-svs-cream disabled:border-svs-ink/20 disabled:text-svs-ink/40 disabled:bg-svs-cream/50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            )}
          </div>
        </div>
      </article>

      {pickerOpen ? (
        <AddItemSheet
          item={item}
          categoryImageUrl={categoryImageUrl}
          onClose={() => setPickerOpen(false)}
          onAdd={commitSelection}
          onRemove={removeSelection}
        />
      ) : null}
    </>
  );
}
