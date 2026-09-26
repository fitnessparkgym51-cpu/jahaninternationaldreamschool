import {draftMode} from 'next/headers'

import {DisableDraftMode} from '@/components/visual-editing/DisableDraftMode'
import {VisualEditing} from 'next-sanity/visual-editing'

import {SanityLive} from '@/sanity/lib/live'

/**
 * Layout for the pages the Presentation Tool previews.
 *
 * It is deliberately a route group layout rather than part of the root layout.
 * The Studio itself is mounted at `/studio` in this same app, and visual editing
 * has to be initialised only on the site routes — initialising it in the root
 * layout would attach the overlays to the Studio's own iframe context and break
 * the connection.
 *
 * - `<SanityLive />` runs on every request and revalidates the page when content
 *   changes, which is what makes the preview update without a manual refresh.
 * - `<VisualEditing />` runs only inside Draft Mode. It scans the rendered DOM
 *   for stega-encoded strings and `data-sanity` attributes and draws the
 *   click-to-edit overlays on top of them.
 */
export default async function SiteLayout({children}: LayoutProps<'/'>) {
  const {isEnabled} = await draftMode()

  return (
    <>
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
