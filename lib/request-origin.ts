/** Use the canonical public origin behind a proxy; otherwise compare with the actual Host. */
export function sameOrigin(
  request: Request,
  siteURL = process.env.NEXT_PUBLIC_SITE_URL,
): boolean {
  try {
    const origin = new URL(request.headers.get("origin") || "");
    if (!["http:", "https:"].includes(origin.protocol)) return false;
    if (siteURL) return origin.origin === new URL(siteURL).origin;
    return origin.host === request.headers.get("host");
  } catch {
    return false;
  }
}
