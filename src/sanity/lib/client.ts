import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from '../env'

/**
 * Read-only client for published content.
 *
 * `stega.studioUrl` is the important part: it is the absolute URL of the Studio
 * that hosts the Presentation Tool. When a draft preview is active the client
 * encodes Content Source Map metadata into the strings it returns, and the
 * overlays render a click-to-edit target that sends the editor back to that
 * exact URL and field. Without it, overlays appear but clicking does nothing.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || '/studio',
    enabled: true,
  },
})
