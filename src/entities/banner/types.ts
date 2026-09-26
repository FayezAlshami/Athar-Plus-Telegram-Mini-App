import type { Category } from "@/entities/category/types";
import type { Product } from "@/entities/product/types";

export type BannerTargetType = "product" | "category" | "membership" | "campaign" | "url";

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  image_url: string | null;
  theme: "navy" | "gold" | "turquoise";
  target: { type: BannerTargetType; value: string | null } | null;
}

export interface HomeFeed {
  banners: Banner[];
  categories: Category[];
  featured_products: Product[];
  popular_products: Product[];
}
