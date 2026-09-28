import type {Navigation, SiteSettings} from './home'

/**
 * Result type for `complaintPageQuery`.
 *
 * Hand-written and structural, like `types/contact.ts`, so it does not depend on
 * `sanity typegen` having been re-run. Keep in sync with the query and
 * `schemaTypes/documents/complaintPage.ts`.
 *
 * The page has no `seo` block on purpose — see that schema file. Its `<title>` is
 * the heading, and its indexability is a technical decision in
 * `src/lib/routes.ts`, not something an editor can flip.
 */
export type ComplaintPage = {
  id: string
  internalTitle?: string | null
  heading?: string | null
  intro?: string | null
}

export type ComplaintPageData = {
  siteSettings: SiteSettings | null
  navigation: Navigation | null
  complaint: ComplaintPage | null
}
