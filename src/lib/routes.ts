/**
 * The public route registry.
 *
 * This is technical route data, not content: the *labels* and the menu itself
 * live in the `navigation` document, but a sitemap, a canonical URL and a
 * structured-data node all need to know which routes exist, which Sanity
 * document owns each one, and which are indexable. Keeping that in one table
 * means a new page is added here once, and the sitemap, the metadata helper and
 * `scripts/verify-seo.mjs` all follow.
 *
 * Rules encoded below:
 * - `noIndex: true` means the page must carry `<meta name="robots" content="noindex">`
 *   and must NOT appear in the sitemap.
 * - Only routes listed here may be linked from the CMS. Do not add a route here
 *   for a page that does not exist — that is how footer links end up 404ing.
 */
export type PublicRoute = {
  /** Site-relative path, no trailing slash except on the home page. */
  path: string
  /** The Sanity document type that owns the page. `null` = no page document. */
  type: string | null
  /** The home page uses the site-wide title as-is, with no brand suffix. */
  isHome?: boolean
  /** Excluded from indexing and from the sitemap. */
  noIndex?: boolean
}

export const PUBLIC_ROUTES: PublicRoute[] = [
  {path: '/', type: 'homePage', isHome: true},
  {path: '/about-us', type: 'aboutPage'},
  {path: '/academics', type: 'academicsPage'},
  {path: '/academics/class-routine', type: 'classRoutinePage'},
  {path: '/admissions', type: 'admissionsPage'},
  {path: '/contact', type: 'contactPage'},
  {path: '/branch', type: 'branchPage'},
  // An anonymous form that returns a tracking ID. Deliberately not indexed: it
  // holds no searchable content and should never compete with the school's pages.
  {path: '/complaint-box', type: null, noIndex: true},
]

/** Routes that may appear in `sitemap.xml` and carry a canonical URL. */
export const INDEXABLE_ROUTES = PUBLIC_ROUTES.filter((route) => !route.noIndex)

/** Looks up a route by path. */
export function findRoute(path: string): PublicRoute | undefined {
  return PUBLIC_ROUTES.find((route) => route.path === path)
}

/** The Sanity document type for a path, or `undefined` if the path is not public. */
export function routeType(path: string): string | undefined {
  return findRoute(path)?.type ?? undefined
}
