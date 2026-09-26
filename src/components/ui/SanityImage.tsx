import Image from 'next/image'
import {stegaClean} from 'next-sanity'

import {imageUrl} from '@/sanity/lib/image'
import type {SanityImage as SanityImageData} from '@/sanity/types/home'

type SanityImageProps = {
  image?: SanityImageData | null
  /** Largest width the layout can display. */
  sourceWidth?: number
  /** Tells the browser how wide the image renders, so it picks a sensible size. */
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
  sourceWidth = 1600,
  sizes = '100vw',
  className,
  priority = false,
  editAttribute,
}: SanityImageProps) {
  if (!image?.asset?._ref) return null

  return (
    <Image
      // The URL is built from the asset reference, not from CMS text, so it
      // carries no stega payload.
      src={imageUrl(image, sourceWidth)}
      alt={stegaClean(image.alt ?? '')}
      sizes={sizes}
      fill
      priority={priority}
      className={className}
      data-sanity={editAttribute}
    />
  )
}
