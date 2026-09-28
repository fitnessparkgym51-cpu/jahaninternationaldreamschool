import {stegaClean} from 'next-sanity'

import {absoluteUrl, siteUrl} from '@/lib/site'
import {getPageSeo} from '@/sanity/lib/fetch'
import {imageUrl, socialImageUrl} from '@/sanity/lib/image'
import type {SiteSettings} from '@/sanity/types/home'

/**
 * Structured data (JSON-LD) for the whole site.
 *
 * Deliberately small. Every node here is generated from a document the school
 * already published, and nothing is asserted that the school has not confirmed:
 * no ratings, no reviews, no prices, no opening hours, no accreditation, no staff
 * counts. A rich result that later proves unsupported costs more than it was ever
 * worth.
 *
 * What is emitted, and why:
 *
 * - `EducationalOrganization` — the accurate Schema.org type for a school. It is
 *   a subtype of `Organization`, so this single node covers both; adding a
 *   separate `Organization` node would be duplicate markup for the same entity.
 * - `WebSite` — carries the site's official name, which is what Google can show
 *   as the site name in a branded result. It names the publisher by `@id`, so the
 *   organisation is described once and referenced everywhere else.
 * - `WebPage` — one per route, named and described from the same SEO values as
 *   `<title>` and the canonical link, so it cannot drift from what is rendered.
 * - `BreadcrumbList` — emitted only where a breadcrumb is actually visible, from
 *   `PageHeroSection`, so the markup can never disagree with the page.
 * - `Article` — not emitted. There is no news article route; the news documents
 *   are cards on the home page. Add it when an article page exists.
 *
 * `@id` values are stable absolute URLs, so the graph is a set of references
 * rather than a pile of repeated organisation blocks.
 */

const ORGANIZATION_ID = '#organization'
const WEBSITE_ID = '#website'

type Json = Record<string, unknown>

/** Strips stega and collapses whitespace, then drops anything empty. */
function text(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const cleaned = stegaClean(value).replace(/\s+/g, ' ').trim()
  return cleaned || undefined
}

/** `tel:` / `mailto:` hrefs back to a readable number or address. */
function readable(value: string | null | undefined): string | undefined {
  const cleaned = text(value)
  if (!cleaned) return undefined
  if (cleaned.startsWith('tel:')) return cleaned.slice(4).replace(/^880/, '+880')
  if (cleaned.startsWith('mailto:')) return cleaned.slice(7)
  return cleaned
}

/**
 * The site-wide graph: the school and the website, emitted once per page.
 *
 * Contact details come from `siteSettings.contact` and the crest from
 * `siteSettings.brand`, so correcting a phone number or replacing the logo
 * updates the structured data on every page with no code change.
 */
export function SiteJsonLd({site}: {site: SiteSettings | null}) {
  if (!site) return null

  const name = text(site.brand?.name)
  const origin = siteUrl()
  const logo = site.brand?.logo
  const shareImage = site.seo?.shareImage

  const organization: Json = {
    '@type': 'EducationalOrganization',
    '@id': `${origin ?? ''}${ORGANIZATION_ID}`,
    ...(name ? {name} : {}),
    ...(text(site.brand?.acronym) ? {alternateName: text(site.brand?.acronym)} : {}),
    ...(origin ? {url: origin} : {}),
    ...(logo?.asset ? {logo: {'@type': 'ImageObject', url: imageUrl(logo, 512, 90)}} : {}),
    ...(shareImage?.asset ? {image: socialImageUrl(shareImage)} : {}),
    ...(site.seo?.metaDescription ? {description: text(site.seo.metaDescription)} : {}),
  }

  // Contact points, only where the school has published a value.
  const phone = readable(site.contact?.mobileHref) ?? readable(site.contact?.phoneHref)
  const email = readable(site.contact?.emailHref)
  if (phone || email) {
    organization.contactPoint = [
      ...(phone
        ? [
            {
              '@type': 'ContactPoint',
              telephone: phone,
              contactType: 'admissions',
              ...(origin ? {url: `${origin}/contact`} : {}),
            },
          ]
        : []),
      ...(email ? [{'@type': 'ContactPoint', email, contactType: 'admissions'}] : []),
    ]
    if (phone) organization.telephone = phone
    if (email) organization.email = email
  }

  // The postal address is authored as a structured block in Sanity, because a
  // search engine cannot take "TNT, Tongi, Gazipur" apart reliably. `streetAddress`
  // stays out of the markup until the school confirms it: a wrong street address
  // sends parents to the wrong gate, which is worse than publishing only the town.
  const postal = site.postalAddress
  if (postal?.addressLocality || postal?.addressRegion || postal?.addressCountry) {
    organization.address = {
      '@type': 'PostalAddress',
      ...(text(postal.streetAddress) ? {streetAddress: text(postal.streetAddress)} : {}),
      ...(text(postal.addressLocality) ? {addressLocality: text(postal.addressLocality)} : {}),
      ...(text(postal.addressRegion) ? {addressRegion: text(postal.addressRegion)} : {}),
      ...(text(postal.addressCountry) ? {addressCountry: text(postal.addressCountry)} : {}),
    }
  }

  // `sameAs` is limited to genuine profile pages. A WhatsApp click-to-chat link
  // is a contact channel, not a profile, and is expressed as a contact point.
  const sameAs = (site.socialLinks ?? [])
    .map((link) => text(link?.url))
    .filter(
      (url): url is string =>
        Boolean(url) &&
        /^https:\/\/(www\.)?(facebook|instagram|linkedin|youtube|twitter|x)\./i.test(url as string),
    )
  if (sameAs.length) organization.sameAs = sameAs

  const website: Json = {
    '@type': 'WebSite',
    '@id': `${origin ?? ''}${WEBSITE_ID}`,
    ...(name ? {name} : {}),
    ...(text(site.brand?.acronym) ? {alternateName: text(site.brand?.acronym)} : {}),
    ...(origin ? {url: origin} : {}),
    publisher: {'@id': `${origin ?? ''}${ORGANIZATION_ID}`},
    inLanguage: 'en',
  }

  return <JsonLdGraph graph={[organization, website]} />
}

/** One `WebPage` node per route. */
export async function PageJsonLd({
  type,
  pathname,
}: {
  /** The page's Sanity document type, used to look its SEO block up. */
  type: string
  pathname: string
}) {
  const {page, site, brandName} = await getPageSeo(type)

  const title = text(page?.metaTitle) ?? text(site?.metaTitle) ?? text(brandName)
  const description = text(page?.metaDescription) ?? text(site?.metaDescription)
  const url = absoluteUrl(pathname)
  const origin = siteUrl()
  const shareImage = page?.shareImage ?? site?.shareImage

  return (
    <JsonLdGraph
      graph={[
        {
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          ...(title ? {name: title} : {}),
          ...(description ? {description} : {}),
          ...(origin ? {isPartOf: {'@id': `${origin}${WEBSITE_ID}`}} : {}),
          ...(origin ? {about: {'@id': `${origin}${ORGANIZATION_ID}`}} : {}),
          ...(shareImage?.asset
            ? {primaryImageOfPage: {'@type': 'ImageObject', url: socialImageUrl(shareImage)}}
            : {}),
          inLanguage: 'en',
        },
      ]}
    />
  )
}

/**
 * A `BreadcrumbList` built from the crumbs the page actually renders.
 *
 * Used by `PageHeroSection`, which owns both the visible trail and this markup,
 * so the two can never disagree. It takes no URL for the page itself: the last
 * crumb *is* the current page and never has a URL in the CMS, so its `item` is
 * omitted rather than guessed.
 */
export function BreadcrumbJsonLd({
  crumbs,
}: {
  crumbs: {label?: string | null; url?: string | null}[]
}) {
  const items = crumbs
    .map((crumb) => ({label: text(crumb?.label), url: text(crumb?.url)}))
    .filter((crumb): crumb is {label: string; url: string | undefined} => Boolean(crumb.label))

  // A single crumb is not a trail. Emitting it would be noise.
  if (items.length < 2) return null

  const origin = siteUrl()

  return (
    <JsonLdGraph
      graph={[
        {
          '@type': 'BreadcrumbList',
          itemListElement: items.map((crumb) => ({
            '@type': 'ListItem',
            position: items.indexOf(crumb) + 1,
            name: crumb.label,
            ...(origin && crumb.url ? {item: absoluteUrl(crumb.url)} : {}),
          })),
        },
      ]}
    />
  )
}

function JsonLdGraph({graph, id}: {graph: Json[]; id?: string}) {
  if (!graph.length) return null

  const payload = {
    '@context': 'https://schema.org',
    ...(id ? {'@id': id} : {}),
    '@graph': graph,
  }

  return (
    <script
      type="application/ld+json"
      // `<` is escaped below, so no CMS string can close this element early.
      dangerouslySetInnerHTML={{__html: serialize(payload)}}
    />
  )
}

/**
 * JSON for a `<script>` body.
 *
 * `JSON.stringify` leaves `<` alone, so a CMS string containing `</script>` would
 * end the element and inject markup. Replacing it with its JSON escape is valid
 * JSON, parses back to the same string, and cannot terminate the tag.
 */
function serialize(payload: unknown): string {
  return JSON.stringify(payload).replace(/</g, '\\u003c')
}
