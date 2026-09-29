/**
 * Maps a Mini App `startapp` parameter to an in-app route.
 * Supported: product_<id|slug>, p_<id>, category_<slug>, campaign_<slug>, membership, wallet.
 * A product share may end with `_r_` plus an 8-character referral code.
 * Parameters never carry secrets or personal data.
 */
const SAFE_SEGMENT = /^[A-Za-z0-9-]{1,96}$/;
const REFERRAL_SUFFIX = /_r_([A-Za-z0-9]{8})$/;

export function parseStartParam(startParam: string | null | undefined): { route: string | null; referralCode: string | null } {
  if (!startParam) return { route: null, referralCode: null };
  const match = startParam.match(REFERRAL_SUFFIX);
  const referralCode = match?.[1] ?? null;
  const body = match?.index === undefined ? startParam : startParam.slice(0, match.index);
  return { route: routeForStartParam(body), referralCode };
}

export function productStartParam(productId: number, referralCode?: string | null): string {
  const base = `product_${productId}`;
  return referralCode && /^[A-Za-z0-9]{8}$/.test(referralCode) ? `${base}_r_${referralCode}` : base;
}

export function miniAppDeepLink(botUsername: string, startParam: string): string {
  const name = botUsername.replace(/^@/, "");
  return `https://t.me/${name}?startapp=${encodeURIComponent(startParam)}`;
}

export function routeForStartParam(startParam: string | null | undefined): string | null {
  if (!startParam) return null;

  const [kind, ...rest] = startParam.split("_");
  const value = rest.join("_").replaceAll("_", "-");

  switch (kind) {
    case "membership":
      return "/membership";
    case "wallet":
      return "/wallet";
    case "product":
      return SAFE_SEGMENT.test(value) ? `/products/${value}` : null;
    case "p":
      return /^\d{1,12}$/.test(value) ? `/products/${value}` : null;
    case "category":
      return SAFE_SEGMENT.test(value) ? `/categories/${value}` : null;
    case "campaign":
      return SAFE_SEGMENT.test(value) ? `/campaigns/${value}` : null;
    default:
      return null;
  }
}
