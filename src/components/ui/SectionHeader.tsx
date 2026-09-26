import {Reveal} from '@/components/ui/Reveal'
import {editTargetAttr} from '@/lib/editing'
import type {SharedSectionHeaderData} from '@/components/sections/types'

type SectionHeaderProps = {
  /**
   * Structural rather than page-derived: this component is used by every
   * card-grid section on every page, and each page's flat projection produces a
   * slightly different generated type for the same `sectionHeader` object.
   */
  header?: SharedSectionHeaderData | null
  /**
   * `data-sanity` value for the heading, so clicking the heading opens the field
   * that owns it. The subheading is stega-encoded and needs no attribute.
   */
  editHeading?: string
  editTarget?: boolean
  className?: string
}

/**
 * The centred section header used by every card-grid section: heading, the
 * green→gold accent bar, then an optional supporting line.
 *
 * The accent bar is a CSS class (`title-accent-bar`), not markup — see
 * `DESIGN_SYSTEM.md` §6.
 */
export function SectionHeader({
  header,
  editHeading,
  editTarget = true,
  className = '',
}: SectionHeaderProps) {
  if (!header?.heading && !header?.subheading) return null

  return (
    <Reveal
      {...(editTarget ? editTargetAttr : {})}
      className={`mx-auto mb-12 max-w-3xl text-center ${className}`.trim()}
    >
      {header.heading ? (
        <h2
          className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl"
          data-sanity={editHeading}
        >
          {header.heading}
        </h2>
      ) : null}

      <div className="title-accent-bar" />

      {header.subheading ? (
        <p className="mt-4 text-sm text-gray-600 sm:text-base">{header.subheading}</p>
      ) : null}
    </Reveal>
  )
}
