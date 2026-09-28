import type {ImageLoaderProps} from 'next/image'

/**
 * `next/image` loader for CMS images.
 *
 * The Sanity image CDN already resizes, re-encodes and caches, so there is no
 * reason to run images through `/_next/image` as well — that only added a hop,
 * a cache layer and a failure mode. This loader is what makes `next/image` do the
 * one thing it is actually for: pick a sensible candidate width from the `sizes`
 * attribute and emit a `srcset` the browser can choose from.
 *
 * Before this existed, `images.unoptimized` was set, which meant every image was
 * served at one fixed width. A 390px-wide phone downloaded the 1920px hero —
 * roughly 20× the pixels it displayed, and the single largest cost to Largest
 * Contentful Paint on this site.
 *
 * `auto=format` makes the CDN content-negotiate: a browser that supports AVIF or
 * WebP gets it, one that does not gets the original. That is also why Next's own
 * `formats` option is irrelevant here and left at its default.
 *
 * Configured through `images.loaderFile` in `next.config.ts`. It must stay
 * dependency-free: `next/image` bundles it into the client as well as the server.
 */
export default function sanityImageLoader({src, width, quality}: ImageLoaderProps): string {
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 75))
  url.searchParams.set('auto', 'format')
  return url.toString()
}
