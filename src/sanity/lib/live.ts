// Live Content API integration for visual editing.
//
// `sanityFetch` handles three things for us:
//   - perspective switching: published content normally, drafts inside Draft Mode
//   - stega encoding: only when Draft Mode is active, so published pages are clean
//   - cache tagging, so <SanityLive /> can revalidate exactly the affected data
//
// `SanityLive` subscribes to content changes and pushes updates into the page
// without a refresh. Both tokens are server-side only; next-sanity hands the
// browser a short-lived exchange rather than the raw token.
import {defineLive} from 'next-sanity/live'

import {client} from './client'
import {token} from './token'

export const {sanityFetch, SanityLive} = defineLive({
  client,
  serverToken: token,
  browserToken: token,
})
