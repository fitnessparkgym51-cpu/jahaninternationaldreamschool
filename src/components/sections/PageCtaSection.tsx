import {ButtonLink} from '@/components/ui/SmartLink'
import {Reveal} from '@/components/ui/Reveal'
import {editTargetAttr, type EditField} from '@/lib/editing'
import type {SharedPageCtaData} from '@/components/sections/types'

type PageCtaSectionProps = {
  section: SharedPageCtaData
  editField: EditField
}

/**
 * The orange band that closes an inner page, with an optional badge, supporting
 * line and up to two buttons.
 *
 * Generic by design so the other inner pages reuse the same section object.
 */
export function PageCtaSection({section, editField}: PageCtaSectionProps) {
  if (!section.heading) return null

  return (
    <section
      id={section.anchorId || undefined}
      className="scroll-mt-24 bg-jids-orange px-4 py-12 text-center text-white sm:px-8"
      {...editTargetAttr}
    >
      <Reveal className="mx-auto max-w-4xl space-y-4">
        {section.badge ? (
          <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            {section.badge}
          </span>
        ) : null}

        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
          {section.heading}
        </h2>

        {section.subheading ? (
          <p className="mx-auto max-w-2xl text-sm font-medium text-white/95 sm:text-base">
            {section.subheading}
          </p>
        ) : null}

        {section.primaryButton || section.secondaryButton ? (
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {section.primaryButton ? (
              <ButtonLink
                button={section.primaryButton}
                editAttribute={editField('primaryButton')}
                className="px-8 py-2.5 text-sm sm:text-base shadow-sm"
              />
            ) : null}
            {section.secondaryButton ? (
              <ButtonLink
                button={section.secondaryButton}
                editAttribute={editField('secondaryButton')}
                className="px-8 py-2.5 text-sm sm:text-base shadow-sm"
              />
            ) : null}
          </div>
        ) : null}
      </Reveal>
    </section>
  )
}
