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
 * Builds a Sanity CDN URL for a CMS image.
 *
 * `next/image` generates the responsive `srcset` itself, so this only needs to
 * return the largest source the layout can display.
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
