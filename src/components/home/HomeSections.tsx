import {AboutStorySection} from './AboutStorySection'
import {AdmissionBannerSection} from './AdmissionBannerSection'
import {FeaturesSection} from './FeaturesSection'
import {HeroSection} from './HeroSection'
import {NewsSection} from './NewsSection'
import {ReviewBarSection} from './ReviewBarSection'
import {StudentSpotlightSection} from './StudentSpotlightSection'
import {StatsBarSection} from './StatsBarSection'
import {HOME_PAGE_TYPE, editAttribute, sectionPath, type PathStep} from '@/lib/editing'
import type {HomeSection} from '@/sanity/types/home'

/**
 * Builds the `data-sanity` value for a field inside one Home page section.
 * Returns `undefined` for an empty path, which omits the attribute.
 */
export type EditField = (...rest: PathStep[]) => string | undefined

type HomeSectionsProps = {
  /** `_id` of the Home page document, needed for click-to-edit targets. */
  documentId: string
  sections?: HomeSection[] | null
}

/**
 * Renders the Home page content sections in the order the editor arranged them.
 *
 * Order comes straight from the `sections` array in Sanity, and any section with
 * "Show this section on the website" switched off is skipped here.
 *
 * Each section is told the path of its own entry in the array. That is what lets
 * the Presentation Tool overlays point at the right field when an editor clicks
 * something in the preview.
 */
export function HomeSections({documentId, sections}: HomeSectionsProps) {
  const visible = (sections ?? []).filter(
    (section): section is HomeSection => Boolean(section) && section.enabled !== false,
  )

  return (
    <>
      {visible.map((section) => {
        const sectionKey = section._key

        /** `data-sanity` value for a field inside this section. */
        const editField: EditField = (...rest) =>
          editAttribute({
            id: documentId,
            type: HOME_PAGE_TYPE,
            path: sectionPath(sectionKey, ...rest),
          })

        switch (section._type) {
          case 'heroSection':
            return <HeroSection key={sectionKey} section={section} editField={editField} />
          case 'statsBarSection':
            return <StatsBarSection key={sectionKey} section={section} editField={editField} />
          case 'featuresSection':
            return <FeaturesSection key={sectionKey} section={section} editField={editField} />
          case 'aboutStorySection':
            return <AboutStorySection key={sectionKey} section={section} editField={editField} />
          case 'studentSpotlightSection':
            return <StudentSpotlightSection key={sectionKey} section={section} editField={editField} />
          case 'admissionBannerSection':
            return <AdmissionBannerSection key={sectionKey} section={section} editField={editField} />
          case 'newsSection':
            return <NewsSection key={sectionKey} section={section} editField={editField} />
          case 'reviewBarSection':
            return <ReviewBarSection key={sectionKey} section={section} editField={editField} />
          default:
            return null
        }
      })}
    </>
  )
}
