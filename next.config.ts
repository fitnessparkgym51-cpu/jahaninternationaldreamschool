import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // All CMS-managed imagery is served from the Sanity image CDN.
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**'},
    ],
  },
}

export default nextConfig
