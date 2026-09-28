/**
 * The site's own origin, in one place.
 *
 * Canonical URLs, `robots.txt`, the sitemap and the structured data all have to
 * agree on a single production origin, and none of them may invent one. The
 * environment variables are checked in this order:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — the only value to set by hand. Set it to the
 *    production origin with no trailing slash, e.g. `https://www.example.com`.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` — supplied automatically by
 *    Vercel. Useful as a fallback so a deployment still emits valid canonical
 *    URLs, but they are never the authority: see `SEO_CHECKLIST.md`.
 *
 * If none is set the site has no origin. Callers must degrade rather than guess,
 * because a canonical pointing at the wrong host is worse than no canonical.
 */
export function siteUrl(): string | undefined {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL

  if (!fromEnv) return undefined

  // Strip a trailing slash so `${siteUrl()}/about-us` never doubles up.
  return fromEnv.trim().replace(/\/+$/, '')
}

/** True when the production origin is configured. Deployment gate, not a warning. */
export function hasSiteUrl(): boolean {
  return Boolean(siteUrl())
}

/**
 * Builds an absolute URL for a site-relative path.
 *
 * Returns the bare path when no origin is configured, so callers still produce a
 * usable (relative) value instead of `undefined/about-us`.
 */
export function absoluteUrl(path: string): string {
  const origin = siteUrl()
  const normalised = path.startsWith('/') ? path : `/${path}`
  return origin ? `${origin}${normalised}` : normalised
}
