import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    /**
     * Every CMS image is already on the Sanity CDN, which resizes, re-encodes and
     * caches. Routing them through `/_next/image` added a hop and used to fail
     * with 500s, so optimisation happens at the CDN instead — via the custom
     * loader, which also restores a real `srcset`.
     */
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    /**
     * Candidate widths for `sizes="100vw"` images. The 480 and 640 entries matter
     * on phones; without them a handset would be offered the 750px file for a
     * 390px viewport.
     *
     * Kept short on purpose. Every entry is emitted into each image's `srcset`, so
     * a long ladder bloats the HTML of a page carrying a dozen images. `imageSizes`
     * (the default, 16–384) covers the fixed-size slots — the 48px crest, the 72px
     * feature icons, the 96px spotlight avatars.
     */
    deviceSizes: [480, 640, 828, 1080, 1200, 1600, 1920],
    // All CMS-managed imagery is served from the Sanity image CDN.
    remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**'}],
  },
}

export default nextConfig
