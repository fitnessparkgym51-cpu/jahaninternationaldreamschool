import {FaqAccordion, type FaqAccordionItem} from '@/components/admissions/FaqAccordion'
import {Reveal} from '@/components/ui/Reveal'
import {editTargetAttr, type EditField} from '@/lib/editing'
import type {FaqSection as FaqSectionData} from '@/sanity/types/home'

type FaqSectionProps = {
  section: FaqSectionData
  editField: EditField
}

/**
 * Frequently asked questions.
 *
 * A thin server component: it owns the heading and the copy, builds a plain-data
 * view model for the browser-side accordion, and resolves each question's and
 * answer's `data-sanity` attribute here — because a Server Component cannot hand a
 * function to a Client Component.
 */
export function FaqSection({section, editField}: FaqSectionProps) {
  const items = (section.items ?? []).filter((item) => Boolean(item?.question))

  if (!section.heading && !items.length) return null

  const view: FaqAccordionItem[] = items.map((item) => ({
    key: item._key,
    question: item.question ?? '',
    answer: item.answer ?? '',
    isOpenByDefault: item.isOpenByDefault === true,
    questionEditAttribute: item._key
      ? editField('items', {_key: item._key}, 'question')
      : undefined,
    answerEditAttribute: item._key ? editField('items', {_key: item._key}, 'answer') : undefined,
  }))

  return (
    <section
      id={section.anchorId || undefined}
      className="scroll-mt-24 border-t border-gray-100 bg-white px-4 py-16 sm:px-8"
      {...editTargetAttr}
    >
      <div className="mx-auto max-w-3xl">
        {section.heading ? (
          <Reveal className="mb-10 text-center">
            <h2
              className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl"
              data-sanity={editField('heading')}
            >
              {section.heading}
            </h2>
            {section.subheading ? (
              <p
                className="mt-3 text-sm text-gray-600 sm:text-base"
                data-sanity={editField('subheading')}
              >
                {section.subheading}
              </p>
            ) : null}
          </Reveal>
        ) : null}

        {view.length ? <FaqAccordion items={view} /> : null}
      </div>
    </section>
  )
}
