import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Sanity's CDN already resizes/formats (w, q, auto=format); re-optimising
    // through /_next/image failed with 500s, so serve CDN URLs directly.
    unoptimized: true,
    // All CMS-managed imagery is served from the Sanity image CDN.
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**'},
    ],
  },
}

export default nextConfig
