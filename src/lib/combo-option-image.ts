import { resolveAddonImageUrl } from "@/lib/addon-image";
import {
  pickImageUrl,
  resolveCategoryImageUrl,
  resolveItemImageUrl,
} from "@/lib/menu-item-image";
import type {
  MenuAddonGroup,
  MenuCategory,
  MenuItem,
} from "@/lib/menu-types";

export function isComboItem(
  item: MenuItem,
  categories: MenuCategory[],
): boolean {
  const cat = categories.find((c) => c.id === item.category_id);
  return /combo/i.test(cat?.name ?? "");
}

export function isBeverageAddonGroup(group: MenuAddonGroup): boolean {
  return /\b(beverages?|drinks?)\b/i.test(group.name);
}

export function orderComboAddonGroups(
  groups: MenuAddonGroup[],
  isCombo: boolean,
): MenuAddonGroup[] {
  if (!isCombo) return groups;
  const required: MenuAddonGroup[] = [];
  const extras: MenuAddonGroup[] = [];
  for (const g of groups) {
    if ((g.selection_min ?? 0) >= 1) required.push(g);
    else extras.push(g);
  }
  return [...required, ...extras];
}

type ComboImageContext = {
  item: MenuItem;
  categories: MenuCategory[];
  items: MenuItem[];
  isCombo: boolean;
};

export function buildComboImageContext(input: ComboImageContext) {
  const { item, categories, items, isCombo } = input;
  const catById = new Map(categories.map((c) => [c.id, c] as const));
  const comboItemCategoryImage = resolveCategoryImageUrl(
    catById.get(item.category_id),
  );

  const comboOptionImageByName = new Map<string, string>();
  if (isCombo) {
    for (const it of items) {
      const cat = catById.get(it.category_id);
      const url = resolveItemImageUrl(it, cat);
      if (url) comboOptionImageByName.set(it.name.trim().toLowerCase(), url);
    }
  }

  const beverageCategoryIds = new Set<string>();
  let beverageCategoryImage: string | null = null;
  for (const c of categories) {
    const n = c.name.trim().toLowerCase();
    if (/^beverages?$/.test(n) || /^drinks?$/.test(n)) {
      beverageCategoryIds.add(c.id);
      if (!beverageCategoryImage) {
        beverageCategoryImage = resolveCategoryImageUrl(c);
      }
    }
  }

  const comboBeverageCatalogItems: {
    name: string;
    tokens: string[];
    image: string;
  }[] = [];

  if (isCombo && beverageCategoryIds.size > 0) {
    for (const it of items) {
      if (!beverageCategoryIds.has(it.category_id)) continue;
      const cat = catById.get(it.category_id);
      const url = resolveItemImageUrl(it, cat);
      const name = it.name.trim().toLowerCase();
      if (!url || !name) continue;
      comboBeverageCatalogItems.push({
        name,
        tokens: name.split(/[^a-z0-9]+/).filter(Boolean),
        image: url,
      });
    }
  }

  const comboItemCategoryImages: { name: string; image: string }[] = [];
  if (isCombo) {
    for (const it of items) {
      const cat = catById.get(it.category_id);
      if (!cat || cat.id === item.category_id) continue;
      const url = resolveCategoryImageUrl(cat);
      if (!url) continue;
      const key = it.name.trim().toLowerCase();
      if (!key) continue;
      comboItemCategoryImages.push({ name: key, image: url });
    }
  }

  const comboGroupFallbackById = new Map<string, string>();
  if (isCombo) {
    const catByName = new Map<string, MenuCategory>();
    for (const c of categories) {
      const k = c.name.trim().toLowerCase();
      if (k) catByName.set(k, c);
    }

    for (const g of item.addon_groups ?? []) {
      const groupName = g.name.trim().toLowerCase();
      if (!groupName || isBeverageAddonGroup(g)) continue;

      let matched = catByName.get(groupName) ?? null;
      if (!matched) {
        let best: { cat: MenuCategory; len: number } | null = null;
        for (const c of categories) {
          if (c.id === item.category_id) continue;
          const cName = c.name.trim().toLowerCase();
          if (!cName) continue;
          if (groupName.includes(cName) && (!best || cName.length > best.len)) {
            best = { cat: c, len: cName.length };
          }
        }
        matched = best?.cat ?? null;
      }
      if (!matched || matched.id === item.category_id) continue;
      const url = resolveCategoryImageUrl(matched);
      if (url) comboGroupFallbackById.set(g.id, url);
    }
  }

  function findComboBeverageItemImage(optionName: string): string | null {
    const first = optionName
      .trim()
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)[0];
    if (!first || comboBeverageCatalogItems.length === 0) return null;

    let best: { score: number; image: string } | null = null;
    for (const entry of comboBeverageCatalogItems) {
      if (!entry.tokens.some((w) => w === first)) continue;
      const score =
        entry.name === first ? 200 : 100 + Math.min(entry.name.length, first.length);
      if (!best || score > best.score) best = { score, image: entry.image };
    }
    return best?.image ?? null;
  }

  function findComboOptionCategoryFallback(optionName: string): string | null {
    const k = optionName.trim().toLowerCase();
    if (!k || comboItemCategoryImages.length === 0) return null;
    let best: { len: number; image: string } | null = null;
    for (const e of comboItemCategoryImages) {
      const a = e.name;
      const matches = a === k || a.includes(k) || k.includes(a);
      if (!matches) continue;
      const len = Math.min(a.length, k.length);
      if (!best || len > best.len) best = { len, image: e.image };
    }
    return best?.image ?? null;
  }

  function resolveComboOptionImage(
    group: MenuAddonGroup,
    optionName: string,
  ): string | null {
    const registry = resolveAddonImageUrl(optionName);
    const exact = comboOptionImageByName.get(optionName.trim().toLowerCase()) ?? null;

    if (isBeverageAddonGroup(group)) {
      return (
        registry ??
        exact ??
        findComboBeverageItemImage(optionName) ??
        beverageCategoryImage ??
        comboGroupFallbackById.get(group.id) ??
        comboItemCategoryImage
      );
    }

    return (
      registry ??
      exact ??
      findComboOptionCategoryFallback(optionName) ??
      comboGroupFallbackById.get(group.id) ??
      comboItemCategoryImage
    );
  }

  return {
    resolveComboOptionImage,
    comboGroupFallbackById,
  };
}
