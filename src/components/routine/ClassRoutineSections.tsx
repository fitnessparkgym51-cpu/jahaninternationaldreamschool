import {ClassRoutineContentMissing} from '@/components/routine/ClassRoutineContentMissing'
import {RoutineSection} from '@/components/routine/RoutineSection'
import {CardGridSection} from '@/components/sections/CardGridSection'
import {PageCtaSection} from '@/components/sections/PageCtaSection'
import {PageHeroSection} from '@/components/sections/PageHeroSection'
import {
  arrayItemPath,
  CLASS_ROUTINE_PAGE_TYPE,
  editAttribute,
  type EditField,
} from '@/lib/editing'
import type {ClassRoutineSection} from '@/sanity/types/home'

type ClassRoutineSectionsProps = {
  /** `_id` of the Class routine page document, for click-to-edit targets. */
  documentId: string
  sections?: ClassRoutineSection[] | null
}

/**
 * Renders the Class routine page content sections in the order the editor
 * arranged them — the same shape as every other page's section mapper.
 *
 * Only `RoutineSection` is new. The hero, the icon-card grid and the closing band
 * are shared with the pages already built.
 */
export function ClassRoutineSections({documentId, sections}: ClassRoutineSectionsProps) {
  const visible = (sections ?? []).filter(
    (section): section is ClassRoutineSection => Boolean(section) && section.enabled !== false,
  )

  if (!visible.length) return <ClassRoutineContentMissing />

  return (
    <>
      {visible.map((section) => {
        const sectionKey = section._key

        /** `data-sanity` value for a field inside this section. */
        const editField: EditField = (...rest) =>
          editAttribute({
            id: documentId,
            type: CLASS_ROUTINE_PAGE_TYPE,
            path: arrayItemPath('sections', sectionKey, ...rest),
          })

        switch (section._type) {
          case 'pageHeroSection':
            return <PageHeroSection key={sectionKey} section={section} editField={editField} />
          case 'routineSection':
            return <RoutineSection key={sectionKey} section={section} editField={editField} />
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
