import {draftMode} from 'next/headers'

import {GoogleAnalytics} from '@/components/analytics/GoogleAnalytics'
import {DisableDraftMode} from '@/components/visual-editing/DisableDraftMode'
import {SiteJsonLd} from '@/components/seo/JsonLd'
import {VisualEditing} from 'next-sanity/visual-editing'

import {getSiteSettings} from '@/sanity/lib/fetch'
import {SanityLive} from '@/sanity/lib/live'

/**
 * Layout for every public page, and the layout the Presentation Tool previews.
 *
 * It is deliberately a route group layout rather than part of the root layout.
 * The Studio itself is mounted at `/studio` in this same app, and visual editing
 * has to be initialised only on the site routes — initialising it in the root
 * layout would attach the overlays to the Studio's own iframe context and break
 * the connection.
 *
 * - `<SanityLive />` runs on every request and revalidates the page when content
 *   changes, which is what makes the preview update without a manual refresh. It
 *   ships to production on purpose: the Presentation Tool has to work against the
 *   deployed site, not only against `next dev`. See `SEO_CHECKLIST.md` for the
 *   measured size cost of that decision and the options for reducing it.
 * - `<VisualEditing />` renders only inside Draft Mode. It scans the rendered DOM
 *   for stega-encoded strings and `data-sanity` attributes and draws the
 *   click-to-edit overlays on top of them.
 * - `<SiteJsonLd />` describes the school once, here, rather than repeating an
 *   organisation block on every page. `getSiteSettings` is wrapped in React
 *   `cache()`, and the page components call the same fetcher, so this costs no
 *   extra round trip.
 * - `<GoogleAnalytics />` lives here rather than in the root layout so the Studio
 *   is never tracked. It renders nothing without `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
 */
export default async function SiteLayout({children}: LayoutProps<'/'>) {
  const {isEnabled} = await draftMode()
  const siteSettings = await getSiteSettings()

  return (
    <>
      <GoogleAnalytics />
      <SiteJsonLd site={siteSettings} />
      {children}
      <SanityLive />
      {isEnabled ? (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      ) : null}
    </>
  )
}
