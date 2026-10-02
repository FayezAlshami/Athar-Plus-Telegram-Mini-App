import type { StructuredTextBlock } from "@/entities/shared";

export interface ProductPrice {
  currency: string;
  base_minor: number;
  final_minor: number;
  discount_minor: number;
  membership_discount_minor: number;
  promotion_discount_minor: number;
  local: { currency: string; amount: number } | null;
}

export type ProductStatus = "active" | "out_of_stock" | "hidden";

export interface Product {
  id: number;
  slug: string;
  name: string;
  summary: string | null;
  image_url: string | null;
  status: ProductStatus;
  is_purchasable: boolean;
  is_featured: boolean;
  is_favorite?: boolean;
  category?: { id: number; slug: string; name: string };
  has_variants?: boolean;
  price: ProductPrice;
}

export interface ProductVariant {
  id: number;
  name: string;
  image_url: string | null;
  price: ProductPrice;
  input_fields: ProductInputField[];
}

export type ProductInputFieldType = "text" | "number" | "email" | "phone" | "password" | "select" | "textarea";

export interface ProductInputField {
  key: string;
  type: ProductInputFieldType;
  label: string;
  placeholder: string | null;
  help_text: string | null;
  required: boolean;
  validation: { min?: number; max?: number; pattern?: string };
  options: { value: string; label: string }[];
}

export interface ProductDetail extends Product {
  description: StructuredTextBlock[];
  delivery_note: StructuredTextBlock[];
  fulfillment_type: "manual" | "inventory";
  input_fields: ProductInputField[];
  variants?: ProductVariant[];
}
