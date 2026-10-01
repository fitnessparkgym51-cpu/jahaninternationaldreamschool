import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {stegaClean} from 'next-sanity'

import {socialImageUrl} from '@/sanity/lib/image'
import {getPageSeo} from '@/sanity/lib/fetch'
import type {Seo} from '@/sanity/types/home'

import {absoluteUrl} from './site'

type BuildMetadataArgs = {
  /** SEO block authored on the page itself. */
  pageSeo?: Seo | null
  /** SEO defaults from Site Settings, used when a page value is empty. */
  siteSeo?: Seo | null
  /** The school's name, used to brand the title. From `siteSettings.brand.name`. */
  siteName?: string | null
  /** Site-relative path of the page, e.g. `/about-us`. Builds the canonical. */
  pathname: string
  /** The home page shows the site-wide title as-is, with no brand suffix. */
  isHome?: boolean
  /** Extra reasons to keep the page out of the index (Draft Mode). */
  forceNoIndex?: boolean
}

/**
 * Removes Visual Editing payloads and normalises whitespace.
 *
 * Every string that reaches `<title>`, `<meta>` or a canonical URL goes through
 * here. Stega characters are invisible in a browser but they are copied into
 * search results, social scrapes and analytics, so a leak is silent and
 * permanent. `getPageSeo` already fetches with stega disabled; this is the
 * backstop for any value that arrives by another route.
 */
function clean(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const cleaned = stegaClean(value).replace(/\s+/g, ' ').trim()
  return cleaned || undefined
}

/** Case- and punctuation-insensitive "does this title already say the brand". */
function mentionsBrand(title: string, brand: string): boolean {
  const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '')
  return normalise(title).includes(normalise(brand))
}

/**
 * Builds the final `<title>` for a page.
 *
 * The school name is appended after ` | ` only when the editor's own title does
 * not already contain it. The Home page title *is* the school name, so appending
 * there would produce "Jahan International Dream School | Jahan International
 * Dream School" — the duplication this function exists to prevent.
 *
 * A page that is about a different organisation (see `appendSiteName` in the
 * `seo` schema) opts out entirely, because appending the host school's name to
 * it would be a false claim.
 */
export function composeTitle({
  title,
  siteName,
  isHome,
  append = true,
}: {
  title?: string
  siteName?: string | null
  isHome?: boolean
  append?: boolean
}): string | undefined {
  if (!title) return undefined
  if (isHome || !append || !siteName) return title
  if (mentionsBrand(title, siteName)) return title
  // "J.I.D.S." in the title already brands it; appending would read badly.
  const acronym = siteName.match(/\b([A-Z](?:\.[A-Z])+\.?)/)?.[1]
  if (acronym && mentionsBrand(title, acronym)) return title
  return `${title} | ${siteName}`
}

/**
 * Turns the CMS SEO fields into Next.js metadata.
 *
 * Page values win over the Site Settings defaults **field by field**, so a page
 * that only sets a title still inherits the site-wide share image and
 * description. Page-level `canonicalUrl` is the only canonical an editor may
 * override: the site-wide one is a fallback for the Home page only, because
 * applying it to every page would tell the search engines they are all the same
 * document.
 */
export function buildMetadata({
  pageSeo,
  siteSeo,
  siteName,
  pathname,
  isHome = false,
  forceNoIndex = false,
}: BuildMetadataArgs): Metadata {
  const title = composeTitle({
    title: clean(pageSeo?.metaTitle) ?? clean(siteSeo?.metaTitle),
    siteName: clean(siteName),
    isHome,
    append: pageSeo?.appendSiteName ?? siteSeo?.appendSiteName ?? true,
  })

  const description = clean(pageSeo?.metaDescription) ?? clean(siteSeo?.metaDescription)

  const shareImage = pageSeo?.shareImage?.asset
    ? pageSeo.shareImage
    : siteSeo?.shareImage?.asset
      ? siteSeo.shareImage
      : undefined
  const shareImageUrl = shareImage ? socialImageUrl(shareImage) : undefined
  const shareImageAlt = clean(shareImage?.alt)

  const editorCanonical = clean(pageSeo?.canonicalUrl) ?? (isHome ? clean(siteSeo?.canonicalUrl) : undefined)
  const canonical = editorCanonical ?? absoluteUrl(pathname)

  // TEMPORARY (client preview / testing deploy): keep every page out of the
  // search index regardless of the CMS switch. Revert by deleting the `true ||`.
  const noIndex = true || forceNoIndex || pageSeo?.noIndex === true || siteSeo?.noIndex === true

  return {
    // `absolute` bypasses the root layout's `title.template`, so the CMS title is
    // emitted exactly as composed above — no second brand suffix.
    ...(title ? {title: {absolute: title}} : {}),
    ...(description ? {description} : {}),
    alternates: {canonical},
    ...(title || description || shareImageUrl
      ? {
          openGraph: {
            type: 'website',
            ...(title ? {title} : {}),
            ...(description ? {description} : {}),
            url: canonical,
            siteName: clean(siteName) ?? undefined,
            ...(shareImageUrl
              ? {
                  images: [
                    {
                      url: shareImageUrl,
                      width: 1200,
                      height: 630,
                      ...(shareImageAlt ? {alt: shareImageAlt} : {}),
                    },
                  ],
                }
              : {}),
          },
        }
      : {}),
    ...(noIndex ? {robots: {index: false, follow: false}} : {}),
  }
}

/**
 * The one `generateMetadata` body every public page uses.
 *
 * A new page gets correct titles, a canonical, Open Graph tags, draft-mode
 * protection and sitemap eligibility by calling this with its route. Nothing
 * about the SEO of a page is assembled inside a page component.
 */
export async function buildPageMetadata(route: {
  type: string
  pathname: string
  isHome?: boolean
  noIndex?: boolean
}): Promise<Metadata> {
  const {page, site, brandName} = await getPageSeo(route.type)
  // A preview renders draft content on a public URL. It must never be indexed,
  // and the sitemap and robots rules assume published pages only.
  const {isEnabled: isPreview} = await draftMode()

  return buildMetadata({
    pageSeo: page,
    siteSeo: site,
    siteName: brandName,
    pathname: route.pathname,
    isHome: route.isHome,
    forceNoIndex: isPreview || route.noIndex,
  })
}
