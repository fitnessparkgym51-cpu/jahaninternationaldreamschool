import {defineEnableDraftMode} from 'next-sanity/draft-mode'

import {client} from '@/sanity/lib/client'
import {token} from '@/sanity/lib/token'

/**
 * Activates Draft Mode for the Presentation Tool.
 *
 * The Studio calls this with a signed secret. `defineEnableDraftMode` validates
 * that secret against the Sanity API, so a random visitor cannot turn drafts on.
 * After it redirects, every `sanityFetch` in that session reads the `drafts`
 * perspective with stega encoding, which is what powers click-to-edit.
 *
 * The token below is only used server-side for the validation handshake.
 */
export const {GET} = defineEnableDraftMode({
  client: client.withConfig({token: token || ''}),
})
