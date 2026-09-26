import {ButtonLink} from '@/components/ui/SmartLink'
import {editTargetAttr} from '@/lib/editing'
import type {EditField} from '@/components/home/HomeSections'
import type {ReviewBarSection as ReviewBarSectionData} from '@/sanity/types/home'

type ReviewBarSectionProps = {
  section: ReviewBarSectionData
  editField: EditField
}

const WORDMARK_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335']

/** Wordmark coloured the way Google colours it. */
function ColourWord({word}: {word: string}) {
  return (
    <span className="font-bold tracking-tight">
      {word.split('').map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          style={{color: WORDMARK_COLORS[index % WORDMARK_COLORS.length]}}
        >
          {letter}
        </span>
      ))}
    </span>
  )
}

/** Trust strip: rating score, star count and the two review links. */
export function ReviewBarSection({section, editField}: ReviewBarSectionProps) {
  const stars = Math.max(0, Math.min(5, section.stars ?? 0))
  if (!section.brandLabel && !section.score && !section.primaryButton) return null

  return (
    <section
      className="border-y border-gray-200 bg-gray-50/60 px-4 py-6"
      {...editTargetAttr}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 text-center sm:gap-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {section.brandLabel ? (
            <span className="text-xl tracking-tight" data-sanity={editField('brandLabel')}>
              <ColourWord word={section.brandLabel} />
            </span>
          ) : null}
          {section.score ? (
            <span className="text-lg font-bold text-gray-900" data-sanity={editField('score')}>
              {section.score}
            </span>
          ) : null}
          {section.summary ? (
            <span
              className="text-sm font-medium text-gray-600"
              data-sanity={editField('summary')}
            >
              {section.summary}
            </span>
          ) : null}
          {stars > 0 ? (
            <div
              className="flex text-amber-400"
              aria-label={`${stars} out of 5 stars`}
              data-sanity={editField('stars')}
            >
              {Array.from({length: stars}).map((_, index) => (
                <span key={index} aria-hidden="true">
                  ★
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {section.primaryButton || section.secondaryButton ? (
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink
              button={section.primaryButton}
              variant="green"
              className="px-5 py-2 text-sm"
              editAttribute={editField('primaryButton')}
            />
            <ButtonLink
              button={section.secondaryButton}
              variant="link"
              className="text-sm"
              editAttribute={editField('secondaryButton')}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
