import type {SharedPageHeroData} from '@/components/sections/types'
import type {UiButton} from '@/components/ui/types'

import type {Navigation, SiteSettings} from './home'

/**
 * Hand-written result type for `contactPageQuery`. Structural, like the shared
 * UI types, so it does not depend on `sanity typegen` having been re-run.
 * Keep in sync with the query and `schemaTypes/documents/contactPage.ts`.
 */
export type ContactForm = {
  heading?: string | null
  intro?: string | null
  nameLabel?: string | null
  namePlaceholder?: string | null
  whatsappLabel?: string | null
  whatsappPrefix?: string | null
  whatsappPlaceholder?: string | null
  ageLabel?: string | null
  agePlaceholder?: string | null
  ageOptions?: string[] | null
  classLabel?: string | null
  classPlaceholder?: string | null
  classOptions?: string[] | null
  messageLabel?: string | null
  messagePlaceholder?: string | null
  robotLabel?: string | null
  submitLabel?: string | null
  successMessage?: string | null
}

export type ContactPage = {
  id: string
  hero?: (SharedPageHeroData & {enabled?: boolean | null}) | null
  infoCard?: {
    heading?: string | null
    items?:
      | {_key: string; icon?: string | null; label?: string | null; value?: string | null; note?: string | null}[]
      | null
    button?: UiButton | null
  } | null
  mapCard?: {
    title?: string | null
    address?: string | null
    rating?: string | null
    reviewCount?: string | null
    pinLabel?: string | null
    landmarks?: string[] | null
    attribution?: string | null
    mapUrl?: string | null
    button?: UiButton | null
  } | null
  form?: ContactForm | null
  review?: {
    enabled?: boolean | null
    rating?: string | null
    headline?: string | null
    text?: string | null
    button?: UiButton | null
  } | null
}

export type ContactPageData = {
  siteSettings: SiteSettings | null
  navigation: Navigation | null
  contact: ContactPage | null
}
