import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'
import {stegaClean} from 'next-sanity'

import {dataset, projectId} from '../env'
import type {SanityImage} from '../types/home'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({projectId, dataset})

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

/**
 * Strips stega from an image source.
 *
 * Inside Draft Mode every string in a query result is stega-encoded, including
 * `asset._ref`. `@sanity/image-url` parses that reference by splitting on `-`,
 * so the invisible characters would corrupt the generated URL.
 */
function cleanSource(image: SanityImage): SanityImageSource {
  return {
    asset: {_type: 'reference', _ref: stegaClean(image.asset?._ref)},
    crop: image.crop ?? undefined,
    hotspot: image.hotspot ?? undefined,
  } as SanityImageSource
}

/**
 * The asset's plain CDN URL, with no width, quality or format transform.
 *
 * This is what `next/image` receives as its `src`. The custom loader
 * (`src/lib/imageLoader.ts`) then adds `?w=&q=&auto=format` for every candidate
 * width, which is what produces a real `srcset`. Handing `next/image` an
 * already-resized URL instead — as `images.unoptimized` used to require — made it
 * emit a single fixed-size image, so a phone downloaded the 1920px hero.
 */
export function cdnUrl(image: SanityImage): string {
  return urlFor(cleanSource(image)).url()
}

/**
 * Builds a Sanity CDN URL for a CMS image at one exact size.
 *
 * Used where there is no responsive `srcset` to build: Open Graph images, and the
 * logo inside structured data. Everywhere else, let `next/image` and the loader
 * do the resizing.
 */
export function imageUrl(image: SanityImage, width = 1600, quality = 75): string {
  return urlFor(cleanSource(image))
    .width(width)
    .quality(quality)
    .auto('format')
    .url()
}

/** Absolute 1200 × 630 URL, used for Open Graph and other non-responsive cases. */
export function socialImageUrl(image: SanityImage, width = 1200, height = 630): string {
  return urlFor(cleanSource(image))
    .width(width)
    .height(height)
    .fit('crop')
    .auto('format')
    .quality(85)
    .url()
}
