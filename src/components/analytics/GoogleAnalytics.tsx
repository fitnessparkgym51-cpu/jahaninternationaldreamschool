'use client'

import {useEffect, useRef} from 'react'
import {usePathname} from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * Google Analytics 4, enabled by environment variable.
 *
 * With `NEXT_PUBLIC_GA_MEASUREMENT_ID` unset this renders nothing at all: no
 * script, no globals, no network request. That is the correct default for a
 * school site that has not been given a tracking ID — an invented or guessed ID
 * would send data nowhere while looking configured.
 *
 * Mounted in the `(site)` route group, never in the root layout, so the Sanity
 * Studio is not tracked. The Presentation Tool's preview iframe is a separate
 * document with no ID in its environment, so the preview is unaffected too.
 *
 * App Router note: the library sends one `page_view` when it initialises, but a
 * `next/link` navigation does not reload the document, so client-side
 * navigations would otherwise go unrecorded. The effect below reports one
 * `page_view` per committed URL and remembers the last one it reported, so a page
 * view is never counted twice and never missed.
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const pathname = usePathname()
  const reported = useRef<string | null>(null)

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined' || !pathname) return

    // The query string is read from the URL rather than from `useSearchParams`,
    // which would force a Suspense boundary around this component.
    const page = `${pathname}${window.location.search}`
    if (reported.current === page) return

    const previous = reported.current
    reported.current = page

    window.gtag?.('event', 'page_view', {
      page_path: page,
      page_location: `${window.location.origin}${page}`,
      page_title: document.title,
      // On the first report the browser's own referrer is the honest value; on a
      // client-side navigation the previous route is.
      page_referrer: previous
        ? `${window.location.origin}${previous}`
        : document.referrer,
      send_to: measurementId,
    })
  }, [measurementId, pathname])

  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: true });
        `}
      </Script>
    </>
  )
}
