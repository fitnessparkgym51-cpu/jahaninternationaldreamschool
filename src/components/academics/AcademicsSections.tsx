import {AcademicsContentMissing} from '@/components/academics/AcademicsContentMissing'
import {ClassTableSection} from '@/components/academics/ClassTableSection'
import {PageCtaSection} from '@/components/sections/PageCtaSection'
import {PageHeroSection} from '@/components/sections/PageHeroSection'
import {CardGridSection} from '@/components/sections/CardGridSection'
import {
  ACADEMICS_PAGE_TYPE,
  arrayItemPath,
  editAttribute,
  type EditField,
} from '@/lib/editing'
import type {AcademicsSection} from '@/sanity/types/home'

type AcademicsSectionsProps = {
  /** `_id` of the Academics page document, needed for click-to-edit targets. */
  documentId: string
  sections?: AcademicsSection[] | null
}

/**
 * Renders the Academics page content sections in the order the editor arranged them.
 *
 * Structurally identical to `HomeSections`, `AboutSections` and
 * `AdmissionsSections`: order comes from the `sections` array in Sanity, and any
 * section with "Show this section on the website" switched off is skipped here.
 *
 * Only `ClassTableSection` is new to this page. The hero, the icon-card grid and
 * the closing band are all shared with the pages already built.
 */
export function AcademicsSections({documentId, sections}: AcademicsSectionsProps) {
  const visible = (sections ?? []).filter(
    (section): section is AcademicsSection => Boolean(section) && section.enabled !== false,
  )

  if (!visible.length) return <AcademicsContentMissing />

  return (
    <>
      {visible.map((section) => {
        const sectionKey = section._key

        /** `data-sanity` value for a field inside this section. */
        const editField: EditField = (...rest) =>
          editAttribute({
            id: documentId,
            type: ACADEMICS_PAGE_TYPE,
            path: arrayItemPath('sections', sectionKey, ...rest),
          })

        switch (section._type) {
          case 'pageHeroSection':
            return <PageHeroSection key={sectionKey} section={section} editField={editField} />
          case 'classTableSection':
            return <ClassTableSection key={sectionKey} section={section} editField={editField} />
          case 'pillarsSection':
            return <CardGridSection key={sectionKey} section={section} editField={editField} />
          case 'pageCtaSection':
            return <PageCtaSection key={sectionKey} section={section} editField={editField} />
          default:
            return null
        }
      })}
    </>
  )
}
