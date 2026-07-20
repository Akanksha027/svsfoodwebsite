export type MenuCategory = {
  id: string;
  name: string;
  sort_order: number;
  image_url?: string | null;
  icon_url?: string | null;
};

/**
 * One row in the variant picker (folded by backend `/menu` from sibling
 * Petpooja variation rows). `item_id` is the real DB item row to cart/order.
 */
export type MenuVariant = {
  item_id: string;
  petpooja_item_id?: string | null;
  petpooja_variation_id?: string | null;
  petpooja_variation_row_id?: string | null;
  /** Petpooja group label, e.g. "Size", "Customisation". */
  group_name?: string;
  /** Chip label, e.g. "Medium 8\"" or "Oat Milk". */
  variant_name: string;
  price: number;
  is_available?: boolean;
  image_url?: string | null;
  image_urls?: string[] | null;
};

export type MenuAddonOption = {
  id: string;
  petpooja_addon_item_id?: string | null;
  name: string;
  price: number;
  rank?: number;
  attribute_id?: number | null;
};

export type MenuAddonGroup = {
  id: string;
  petpooja_addon_group_id?: string | null;
  name: string;
  selection_min: number;
  selection_max: number;
  sort_order?: number;
  items: MenuAddonOption[];
};

export type MenuItem = {
  id: string;
  category_id: string;
  petpooja_item_id?: string | null;
  name: string;
  description?: string | null;
  price: number | string;
  image_url?: string | null;
  image_urls?: string[] | null;
  is_veg?: boolean | null;
  is_jain?: boolean | null;
  is_available?: boolean | null;
  badges?: string[] | null;
  sort_order?: number | null;
  /**
   * If non-empty, this card is a parent SKU — customer must pick a variant
   * before add. Never send this card's synthetic `var_*` id as order item_id.
   */
  variants?: MenuVariant[] | null;
  /** Optional addon groups (dressings, toppings, combo slots, etc.). */
  addon_groups?: MenuAddonGroup[] | null;
};

export type MenuPayload = {
  categories: MenuCategory[];
  items: MenuItem[];
};

export function itemHasVariants(item: MenuItem): boolean {
  return Array.isArray(item.variants) && item.variants.length > 0;
}

export function itemHasAddons(item: MenuItem): boolean {
  return Array.isArray(item.addon_groups) && item.addon_groups.length > 0;
}

/** Open the customisation sheet when variants and/or addons exist. */
export function itemNeedsPicker(item: MenuItem): boolean {
  return itemHasVariants(item) || itemHasAddons(item);
}

export function variantItemIds(item: MenuItem): string[] {
  if (!itemHasVariants(item)) return [];
  return (item.variants || []).map((v) => v.item_id).filter(Boolean);
}
