import type {Metadata} from 'next'
import {Geist_Mono, Plus_Jakarta_Sans} from 'next/font/google'

import './globals.css'

import {siteUrl} from '@/lib/site'

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

/**
 * Site-wide metadata defaults.
 *
 * Everything here is a *fallback*. Every real page builds its own metadata in
 * `generateMetadata` from the Sanity `seo` object (see `src/lib/metadata.ts`), so
 * an editor can change any title, description or share image without a deploy.
 * These values only apply to routes that have no page document — the 404 page —
 * and to the social card defaults.
 *
 * Two things are deliberately *not* CMS content, because they are properties of
 * the deploy rather than of the school:
 *
 * - `metadataBase`, so any relative URL Next emits resolves to an absolute one.
 *   It comes from `NEXT_PUBLIC_SITE_URL`, which is a deployment requirement:
 *   without it the site has no canonical origin and Search Console cannot verify
 *   it. See `SEO_CHECKLIST.md`.
 * - The brand name in the default title. It is duplicated here on purpose: a
 *   fallback must not depend on a network round trip, and Sanity's
 *   `siteSettings.seo.metaTitle` already carries it for real pages.
 */
export const metadata: Metadata = {
  // Left undefined when the deploy has no origin configured: `new URL('/')` would
  // throw at build time. Pages build absolute canonicals through `absoluteUrl()`.
  ...(siteUrl() ? {metadataBase: new URL(siteUrl() as string)} : {}),
  // A plain string, not `{default, template}`. Each page emits
  // `title.absolute`, already branded by `composeTitle`; a template would append
  // the school name a second time to titles that already contain it.
  title: 'Jahan International Dream School (J.I.D.S.)',
  description:
    'Jahan International Dream School (J.I.D.S.), an English and Bangla medium school in Tongi, Gazipur. Play Group to Class 10. Enquire about 2027 admissions.',
  applicationName: 'Jahan International Dream School',
  openGraph: {
    type: 'website',
    siteName: 'Jahan International Dream School',
  },
  twitter: {
    card: 'summary_large_image',
  },
  formatDetection: {
    telephone: true,
  },
}

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  )
}
