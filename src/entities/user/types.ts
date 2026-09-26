import type { Locale } from "@/lib/i18n/config";
import type { MembershipLevelCode } from "@/entities/membership/types";

export interface User {
  id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
  locale: Locale;
  membership: { level: MembershipLevelCode; expires_at: string | null };
  member_since: string | null;
}

export interface AuthSession {
  access_token: string;
  token_type: "Bearer";
  user: User;
  start_param: string | null;
}
