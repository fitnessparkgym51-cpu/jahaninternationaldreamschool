import type {MetadataRoute} from 'next'

import {siteUrl} from '@/lib/site'

/**
 * `/robots.txt`, generated at build time from the deployment's own origin.
 *
 * The policy is deliberately minimal, because a crawler instruction that is
 * wrong is much more expensive than one that is missing:
 *
 * - `Allow: /` — every public page is crawlable. Nothing here blocks JavaScript,
 *   CSS, fonts or images, so pages can render fully before they are indexed.
 * - `Disallow: /studio` and `Disallow: /api/` — the authoring environment and the
 *   form/webhook endpoints. Neither should ever appear in a result.
 * - `Disallow: /*?` — any URL with a query string. Draft Mode and the Sanity
 *   Presentation Tool both work by adding a query parameter to a normal path
 *   (`?sanity-preview-pathname=…`), and a preview must not be indexed.
 *   `Sitemap:` is not a query string, so this does not conflict with the line
 *   below.
 * - `Sitemap:` — the absolute sitemap URL, so search engines do not have to guess.
 *
 * Note what this file cannot do: `robots.txt` cannot remove a URL that is
 * already indexed, and it is not a substitute for `noindex`. That is what the
 * `seo.noIndex` switch in Sanity and the route registry in `src/lib/routes.ts`
 * are for. The two must agree — `scripts/verify-seo.mjs` checks that they do.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio', '/studio/', '/api/', '/*?'],
      },
    ],
    ...(origin ? {sitemap: `${origin}/sitemap.xml`} : {}),
    host: origin,
  }
}
