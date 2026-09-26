import {AboutContentMissing} from '@/components/about/AboutContentMissing'
import {PageCtaSection} from '@/components/sections/PageCtaSection'
import {PageHeroSection} from '@/components/sections/PageHeroSection'
import {PeopleGridSection} from '@/components/about/PeopleGridSection'
import {CardGridSection} from '@/components/sections/CardGridSection'
import {PrincipalSection} from '@/components/about/PrincipalSection'
import {ABOUT_PAGE_TYPE, arrayItemPath, editAttribute, type EditField} from '@/lib/editing'
import type {AboutSection} from '@/sanity/types/home'


type AboutSectionsProps = {
  /** `_id` of the About page document, needed for click-to-edit targets. */
  documentId: string
  sections?: AboutSection[] | null
}

/**
 * Renders the About page content sections in the order the editor arranged them.
 *
 * Structurally identical to `HomeSections`: order comes from the `sections` array
 * in Sanity, and any section with "Show this section on the website" switched off
 * is skipped here. Each section is told the path of its own array entry, which is
 * what lets the Presentation Tool overlays point at the right field.
 */
export function AboutSections({documentId, sections}: AboutSectionsProps) {
  const visible = (sections ?? []).filter(
    (section): section is AboutSection => Boolean(section) && section.enabled !== false,
  )

  if (!visible.length) return <AboutContentMissing />

  return (
    <>
      {visible.map((section) => {
        const sectionKey = section._key

        /** `data-sanity` value for a field inside this section. */
        const editField: EditField = (...rest) =>
          editAttribute({
            id: documentId,
            type: ABOUT_PAGE_TYPE,
            path: arrayItemPath('sections', sectionKey, ...rest),
          })

        switch (section._type) {
          case 'pageHeroSection':
            return <PageHeroSection key={sectionKey} section={section} editField={editField} />
          case 'principalSection':
            return <PrincipalSection key={sectionKey} section={section} editField={editField} />
          case 'peopleGridSection':
            return <PeopleGridSection key={sectionKey} section={section} editField={editField} />
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
