import Image from 'next/image'
import {stegaClean} from 'next-sanity'

import {cdnUrl} from '@/sanity/lib/image'
import type {SanityImage as SanityImageData} from '@/sanity/types/home'

type SanityImageProps = {
  image?: SanityImageData | null
  /**
   * How wide the image renders at each breakpoint.
   *
   * This is the whole point of the responsive pipeline: it is what lets the
   * browser choose a small file on a phone and a large one on a desktop monitor.
   * Every call site specifies it, because "how wide is this box" is a layout
   * fact, not something the image component can guess.
   */
  sizes?: string
  className?: string
  priority?: boolean
  /**
   * `data-sanity` value for the image field, so clicking the picture opens the
   * matching Sanity image panel (asset, alt text, crop and hotspot).
   *
   * The `alt` text is stega-encoded and would otherwise win the overlay
   * priority, pointing at the alt field instead of the image itself.
   */
  editAttribute?: string
}

/**
 * Renders a CMS image. The parent owns the box (aspect ratio / height) because
 * the image is absolutely filled into it.
 */
export function SanityImage({
  image,
  sizes = '100vw',
  className,
  priority = false,
  editAttribute,
}: SanityImageProps) {
  if (!image?.asset?._ref) return null

  return (
    <Image
      // The URL is built from the asset reference, not from CMS text, so it
      // carries no stega payload. It carries no size either: the custom loader
      // adds `?w=&q=&auto=format` per candidate, so the browser gets a real
      // `srcset` and picks by `sizes`.
      src={cdnUrl(image)}
      alt={stegaClean(image.alt ?? '')}
      sizes={sizes}
      fill
      priority={priority}
      className={className}
      data-sanity={editAttribute}
    />
  )
}
