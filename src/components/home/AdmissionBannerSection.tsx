import {Reveal} from '@/components/ui/Reveal'
import {ButtonLink} from '@/components/ui/SmartLink'
import {editTargetAttr} from '@/lib/editing'
import type {EditField} from '@/components/home/HomeSections'
import type {AdmissionBannerSection as AdmissionBannerSectionData} from '@/sanity/types/home'

type AdmissionBannerSectionProps = {
  section: AdmissionBannerSectionData
  editField: EditField
}

/** Dark green admissions banner with two calls to action. */
export function AdmissionBannerSection({section, editField}: AdmissionBannerSectionProps) {
  if (!section.heading && !section.badge && !section.primaryButton && !section.secondaryButton) {
    return null
  }

  return (
    <section
      id={section.anchorId || undefined}
      className="bg-jids-green-deep px-4 py-16 text-center text-white sm:px-8"
      {...editTargetAttr}
    >
      <Reveal className="mx-auto max-w-4xl">
        {section.badge ? (
          <span className="mb-4 inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-jids-green-deep">
            {section.badge}
          </span>
        ) : null}

        {section.heading ? (
          <h2 className="mb-8 text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {section.heading}
          </h2>
        ) : null}

        {section.primaryButton || section.secondaryButton ? (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <ButtonLink
              button={section.primaryButton}
              className="px-7 py-3"
              editAttribute={editField('primaryButton')}
            />
            <ButtonLink
              button={section.secondaryButton}
              variant="light"
              className="px-7 py-3"
              editAttribute={editField('secondaryButton')}
            />
          </div>
        ) : null}
      </Reveal>
    </section>
  )
}
