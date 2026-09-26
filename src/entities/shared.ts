export type ISODateString = string;

/** Money is always transported in integer minor units. */
export interface Money {
  amountMinor: number;
  currency: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export type StructuredTextBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] };
