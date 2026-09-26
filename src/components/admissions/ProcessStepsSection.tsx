import {Reveal} from '@/components/ui/Reveal'
import {editTargetAttr, type EditField} from '@/lib/editing'
import type {ProcessStepsSection as ProcessStepsSectionData} from '@/sanity/types/home'

type ProcessStepsSectionProps = {
  section: ProcessStepsSectionData
  editField: EditField
}

/**
 * A numbered "how it works" flow — the five admission steps on this page.
 *
 * The numbers are **generated from the array position**, not stored, so an editor
 * who inserts or deletes a step can never leave a stale number behind. The last
 * step in the reference is emphasised; that is the `isHighlighted` flag per step.
 */
export function ProcessStepsSection({section, editField}: ProcessStepsSectionProps) {
  const steps = (section.steps ?? []).filter((step) => Boolean(step))
  const header = section.header

  if (!header?.heading && !steps.length) return null

  return (
    <section
      id={section.anchorId || undefined}
      className="scroll-mt-24 bg-white px-4 py-16 sm:px-8"
      {...editTargetAttr}
    >
      <div className="mx-auto max-w-7xl">
        {header?.heading ? (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2
              className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl"
              data-sanity={editField('header', 'heading')}
            >
              {header.heading}
            </h2>
            {header.subheading ? (
              <p className="mt-2 text-sm text-gray-500 sm:text-base">{header.subheading}</p>
            ) : null}
          </div>
        ) : null}

        {steps.length ? (
          <ol className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {steps.map((step, index) => (
              <li key={step._key} className="h-full list-none">
                <Reveal
                  delay={index * 70}
                  className="flex h-full flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:shadow-md"
                >
                  <span
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white shadow ${
                      step.isHighlighted ? 'bg-jids-orange' : 'bg-jids-green'
                    }`}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>

                  <h3
                    className="mb-1.5 text-sm font-bold text-gray-900"
                    data-sanity={editField('steps', {_key: step._key}, 'title')}
                  >
                    {step.title}
                  </h3>

                  {step.description ? (
                    <p
                      className="text-xs leading-relaxed text-gray-500"
                      data-sanity={editField('steps', {_key: step._key}, 'description')}
                    >
                      {step.description}
                    </p>
                  ) : null}
                </Reveal>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  )
}
