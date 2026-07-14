export type MenuCategory = {
  id: string;
  name: string;
  sort_order: number;
  image_url?: string | null;
  icon_url?: string | null;
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
  variants?: unknown[] | null;
};

export type MenuPayload = {
  categories: MenuCategory[];
  items: MenuItem[];
};
