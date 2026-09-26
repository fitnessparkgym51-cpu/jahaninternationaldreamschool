import type {Metadata} from 'next'

import {socialImageUrl} from '@/sanity/lib/image'
import type {Seo} from '@/sanity/types/home'

type BuildMetadataArgs = {
  /** SEO block authored on the page itself. */
  pageSeo?: Seo | null
  /** SEO defaults from Site Settings, used when a page value is empty. */
  siteSeo?: Seo | null
  /** Absolute URL of the page, used to build the canonical link. */
  url?: string
}

/**
 * Turns the CMS SEO fields into Next.js metadata.
 *
 * Page values win over the Site Settings defaults, so an editor can override any
 * single page without touching the site-wide fallback.
 */
export function buildMetadata({pageSeo, siteSeo, url}: BuildMetadataArgs): Metadata {
  const seo = pageSeo ?? siteSeo
  const title = seo?.metaTitle ?? undefined
  const description = seo?.metaDescription ?? undefined
  const shareImage = seo?.shareImage ? socialImageUrl(seo.shareImage) : undefined
  const canonical = seo?.canonicalUrl ?? url

  return {
    title,
    description,
    ...(canonical ? {alternates: {canonical}} : {}),
    ...(title || description || shareImage
      ? {
          openGraph: {
            ...(title ? {title} : {}),
            ...(description ? {description} : {}),
            url: canonical,
            ...(shareImage ? {images: [{url: shareImage, alt: seo?.shareImage?.alt ?? ''}]} : {}),
          },
        }
      : {}),
    ...(seo?.noIndex ? {robots: {index: false, follow: false}} : {}),
  }
}
