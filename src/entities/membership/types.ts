export type MembershipLevelCode = "normal" | "essential" | "plus";

export interface MembershipLevel {
  code: MembershipLevelCode;
  rank: number;
  name: string;
  description: string | null;
  benefits: string[];
  discount_basis_points: number;
}

export interface MembershipOverview {
  current_level: MembershipLevelCode;
  expires_at: string | null;
  levels: MembershipLevel[];
}
