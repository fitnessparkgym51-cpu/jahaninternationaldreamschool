import type {Path} from '@sanity/client/csm'
import {createDataAttribute} from '@sanity/visual-editing'

/**
 * Helpers that connect rendered markup back to its Sanity field.
 *
 * Two mechanisms are used together, which is what Sanity's overlay system looks
 * for:
 *
 * 1. **Stega** (free) — when Draft Mode is on, the Sanity client returns strings
 *    with invisible characters encoding the document ID, field path and Studio
 *    URL. Any string rendered as text, or used in an `alt` attribute, becomes a
 *    click-to-edit target automatically. We must *not* strip it from visible text.
 * 2. **`data-sanity` attribute** — needed for values that carry no string, such
 *    as an image asset, a boolean, or a URL we deliberately do not want
 *    stega-encoded. This is built explicitly with `createDataAttribute()`.
 *
 * Stega also corrupts anything used for a comparison or a lookup, so every such
 * value goes through `stegaClean()` first.
 */

const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || '/studio'

/** Document type of the Home page singleton. */
export const HOME_PAGE_TYPE = 'homePage'

/** Document type of the About page singleton. */
export const ABOUT_PAGE_TYPE = 'aboutPage'

/** Document type of the reusable Person document (principal, teachers, staff). */
export const PERSON_TYPE = 'person'

/** A step in a GROQ field path: a field name, an array index or a `_key`. */
export type PathStep = string | number | {_key: string}

export type EditTarget = {
  /** Document id. */
  id: string
  /** Document type. */
  type: string
  /** Field path within the document. */
  path: Path
}

/**
 * Builds the `data-sanity` attribute for a field.
 *
 * Returns `undefined` for an empty path, so the attribute is simply omitted.
 * For "edit anything in this container" targets use the `data-sanity-edit-target`
 * attribute instead: it groups every field inside the container into one
 * overlay and Sanity resolves the shared parent itself.
 */
export function editAttribute({id, type, path}: EditTarget): string | undefined {
  if (!path.length) return undefined

  return createDataAttribute({id, type, path, baseUrl: studioUrl}).toString()
}

/**
 * Builds the path to one item inside a keyed array, e.g.
 * `sections[_key=="hero"]` or `sections[_key=="hero"].heading`.
 *
 * `root` is the array field name, which lets every page build its own edit paths
 * without this module needing to know each page's schema.
 */
export function arrayItemPath(root: string, itemKey: string, ...rest: PathStep[]): Path {
  return [root, {_key: itemKey}, ...rest] as Path
}

/** Builds the path to one Home page section. Kept as a named alias for clarity. */
export function sectionPath(sectionKey: string, ...rest: PathStep[]): Path {
  return arrayItemPath('sections', sectionKey, ...rest)
}

/**
 * Builds a `data-sanity` value for a field inside a **referenced** document,
 * e.g. a Person reached from a page section.
 *
 * The path is relative to that document, so a click opens the person document
 * itself rather than the page field that merely holds the reference. Accepts
 * plain path steps so callers never have to import Sanity's `Path` type.
 */
export function documentFieldAttribute({
  id,
  type,
  path,
}: {
  id: string
  type: string
  path: PathStep[]
}): string | undefined {
  if (!id || !path.length) return undefined
  return editAttribute({id, type, path: path as Path})
}

/**
 * Marks a container as a single click-to-edit target for everything inside it.
 *
 * Sanity computes the common ancestor of the fields in the subtree, so one click
 * lands on the shared parent object. This is how a whole section, feature card,
 * student card or news card can be edited from one click.
 */
export const editTargetAttr = {'data-sanity-edit-target': ''} as const
