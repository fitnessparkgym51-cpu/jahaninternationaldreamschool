/**
 * Structural prop types for the shared UI primitives.
 *
 * These describe only the fields each component actually reads, rather than being
 * derived from one page's query result.
 *
 * The reason is concrete: every page query is a *flat* projection of all of that
 * page's section fields, so the generated `button` type differs slightly from page
 * to page (the About projection produces `_key: null`, the Admissions one
 * `_key: string`). A shared primitive typed against any single page's result
 * cannot accept the other pages'. Structural types keep the primitives genuinely
 * shareable, while a field the component reads but the schema lacks is still
 * caught at the call site.
 */

export type UiButton = {
  _key?: string | null
  label?: string | null
  url?: string | null
  newTab?: boolean | null
  variant?: string | null
}

export type UiLink = {
  _key?: string | null
  label?: string | null
  url?: string | null
  newTab?: boolean | null
}

export type UiCrumb = {
  _key?: string | null
  label?: string | null
  url?: string | null
}

export type UiImage = {
  asset?: {_ref?: string | null} | null
  crop?: unknown
  hotspot?: unknown
  alt?: string | null
}
