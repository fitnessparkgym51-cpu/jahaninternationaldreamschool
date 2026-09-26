import type {UiButton, UiCrumb} from '@/components/ui/types'

/**
 * Structural prop types for the section components that more than one page uses.
 *
 * See `@/components/ui/types` for why these are structural rather than derived
 * from a single page's query result. The short version: `pageHeroSection` and
 * `pageCtaSection` appear in the About, Admissions and future projections, and
 * each flat projection produces a slightly different generated type for the same
 * section, so a shared component cannot be bound to any one of them.
 */
export type SharedPageHeroData = {
  heading?: string | null
  subheading?: string | null
  appearance?: string | null
  showIconWatermark?: boolean | null
  eyebrow?: string | null
  eyebrowIcon?: string | null
  crumbs?: (UiCrumb | null)[] | null
  buttons?: (UiButton | null)[] | null
}

export type SharedPageCtaData = {
  anchorId?: string | null
  badge?: string | null
  heading?: string | null
  subheading?: string | null
  primaryButton?: UiButton | null
  secondaryButton?: UiButton | null
}

export type SharedSectionHeaderData = {
  heading?: string | null
  subheading?: string | null
}

export type SharedIconCard = {
  _key?: string | null
  icon?: string | null
  tone?: string | null
  title?: string | null
  description?: string | null
}

/**
 * The icon-card grid (`pillarsSection` in the schema).
 *
 * The schema type keeps its original name for the About page's vision / mission /
 * philosophy cards; this structural shape lets the same component render it on any
 * page.
 */
export type SharedCardGridData = {
  anchorId?: string | null
  enabled?: boolean | null
  header?: SharedSectionHeaderData | null
  pillars?: (SharedIconCard | null)[] | null
}
