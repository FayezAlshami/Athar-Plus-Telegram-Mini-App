export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  accent_color: string | null;
  products_count?: number;
  children?: Category[];
}
