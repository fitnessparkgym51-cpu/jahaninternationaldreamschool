import {AdmissionsContentMissing} from '@/components/admissions/AdmissionsContentMissing'
import {CalloutSection} from '@/components/admissions/CalloutSection'
import {FaqSection} from '@/components/admissions/FaqSection'
import {FeatureImageSection} from '@/components/admissions/FeatureImageSection'
import {ProcessStepsSection} from '@/components/admissions/ProcessStepsSection'
import {PageCtaSection} from '@/components/sections/PageCtaSection'
import {PageHeroSection} from '@/components/sections/PageHeroSection'
import {ADMISSIONS_PAGE_TYPE, arrayItemPath, editAttribute, type EditField} from '@/lib/editing'
import type {AdmissionsSection} from '@/sanity/types/home'

type AdmissionsSectionsProps = {
  /** `_id` of the Admissions page document, needed for click-to-edit targets. */
  documentId: string
  sections?: AdmissionsSection[] | null
}

/**
 * Renders the Admissions page content sections in the order the editor arranged
 * them.
 *
 * Structurally identical to `HomeSections` and `AboutSections`: order comes from
 * the `sections` array in Sanity, and any section with "Show this section on the
 * website" switched off is skipped here. Each section is told the path of its own
 * array entry, which is what lets the Presentation Tool overlays point at the
 * right field.
 */
export function AdmissionsSections({documentId, sections}: AdmissionsSectionsProps) {
  const visible = (sections ?? []).filter(
    (section): section is AdmissionsSection => Boolean(section) && section.enabled !== false,
  )

  if (!visible.length) return <AdmissionsContentMissing />

  return (
    <>
      {visible.map((section) => {
        const sectionKey = section._key

        /** `data-sanity` value for a field inside this section. */
        const editField: EditField = (...rest) =>
          editAttribute({
            id: documentId,
            type: ADMISSIONS_PAGE_TYPE,
            path: arrayItemPath('sections', sectionKey, ...rest),
          })

        switch (section._type) {
          case 'pageHeroSection':
            return <PageHeroSection key={sectionKey} section={section} editField={editField} />
          case 'processStepsSection':
            return <ProcessStepsSection key={sectionKey} section={section} editField={editField} />
          case 'featureImageSection':
            return <FeatureImageSection key={sectionKey} section={section} editField={editField} />
          case 'calloutSection':
            return <CalloutSection key={sectionKey} section={section} editField={editField} />
          case 'faqSection':
            return <FaqSection key={sectionKey} section={section} editField={editField} />
          case 'pageCtaSection':
            return <PageCtaSection key={sectionKey} section={section} editField={editField} />
          default:
            return null
        }
      })}
    </>
  )
}
