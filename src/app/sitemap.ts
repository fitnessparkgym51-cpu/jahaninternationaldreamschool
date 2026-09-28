import type {MetadataRoute} from 'next'

import {absoluteUrl} from '@/lib/site'
import {INDEXABLE_ROUTES} from '@/lib/routes'
import {client} from '@/sanity/lib/client'
import {sitemapQuery} from '@/sanity/lib/queries'

/**
 * Regenerated at most once an hour.
 *
 * The site is small and a sitemap does not need to be live, but it must not be
 * frozen either: this is what makes a newly published page appear without a
 * redeploy. Publishing also busts the Sanity CDN, so the next regeneration picks
 * the new document up.
 */
export const revalidate = 3600

type SitemapDoc = {
  _type: string
  _updatedAt: string
  noIndex?: boolean | null
}

/**
 * `/sitemap.xml` — the list of pages a search engine should index.
 *
 * Rules, all of them enforced here rather than trusted to the CMS:
 *
 * - Only routes in the registry (`src/lib/routes.ts`) are listed, so a link in the
 *   footer can never put a 404 into the sitemap.
 * - `noIndex` routes are skipped, whether the flag comes from the route registry
 *   or from the editor in Sanity. This is the check that keeps a hidden page from
 *   being advertised in the sitemap while `robots.txt` still allows crawling.
 * - Data is read through the plain client with stega off. Draft content can never
 *   reach a public file, even if the request carries a Draft Mode cookie.
 * - `lastModified` is the document's real `_updatedAt`. It is not a publication
 *   date and it is not invented.
 * - `changeFrequency` is deliberately omitted: it is a hint Google ignores, and
 *   there is no honest way to know how often a school edits a page.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const types = INDEXABLE_ROUTES.map((route) => route.type).filter((type) => type !== null)

  const docs = await client
    .fetch<SitemapDoc[]>(sitemapQuery, {types}, {stega: false})
    .catch(() => [] as SitemapDoc[])

  const lastModifiedByType = new Map(
    docs.filter((doc) => !doc.noIndex).map((doc) => [doc._type, doc._updatedAt]),
  )

  return INDEXABLE_ROUTES.flatMap((route, index) => {
    if (!route.type) return []
    const lastModified = lastModifiedByType.get(route.type)
    // No published document means no content to advertise. The route may still
    // render, but an empty page does not belong in a sitemap.
    if (!lastModified) return []

    return [
      {
        url: absoluteUrl(route.path),
        lastModified: new Date(lastModified),
        // A relative hint, not a claim: the home page first, then the sections a
        // parent is most likely to be looking for.
        priority: route.isHome ? 1 : index < 5 ? 0.8 : 0.6,
      },
    ]
  })
}
