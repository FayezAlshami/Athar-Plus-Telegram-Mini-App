/**
 * Maps a Mini App `startapp` parameter to an in-app route.
 * Supported: product_<id|slug>, category_<slug>, campaign_<slug>, membership, wallet.
 * Parameters never carry secrets or personal data.
 */
const SAFE_SEGMENT = /^[A-Za-z0-9-]{1,96}$/;

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
    case "category":
      return SAFE_SEGMENT.test(value) ? `/categories/${value}` : null;
    case "campaign":
      return SAFE_SEGMENT.test(value) ? `/campaigns/${value}` : null;
    default:
      return null;
  }
}
