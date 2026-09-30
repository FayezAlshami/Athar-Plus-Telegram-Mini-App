import type { Category } from "@/entities/category/types";
import type { Product } from "@/entities/product/types";

export type BannerTargetType = "product" | "category" | "membership" | "campaign" | "url";

export interface Banner {
  id: number;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  image_url: string | null;
  /** 1 fits the whole image in the frame. Higher values zoom in. */
  image_zoom?: number;
  image_x?: number;
  image_y?: number;
  theme: "navy" | "gold" | "turquoise";
  target: { type: BannerTargetType; value: string | null } | null;
}

export interface HomeFeed {
  banners: Banner[];
  categories: Category[];
  featured_products: Product[];
  popular_products: Product[];
}
