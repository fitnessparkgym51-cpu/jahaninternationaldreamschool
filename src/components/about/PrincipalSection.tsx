import {SanityImage} from '@/components/ui/SanityImage'
import {Reveal} from '@/components/ui/Reveal'
import {
  documentFieldAttribute,
  editTargetAttr,
  PERSON_TYPE,
  type EditField,
  type PathStep,
} from '@/lib/editing'
import type {PrincipalSection as PrincipalSectionData} from '@/sanity/types/home'

type PrincipalSectionProps = {
  section: PrincipalSectionData
  editField: EditField
}

/**
 * The principal's profile: portrait on the left, welcome message on the right.
 *
 * The section owns its heading and the *reference*. The name, designation,
 * photograph, message and quote all belong to the referenced `person` document, so
 * they are click-to-edit against that document and not against this page.
 */
export function PrincipalSection({section, editField}: PrincipalSectionProps) {
  const person = section.principal
  const header = section.header

  if (!header?.heading && !person) return null

  /** `data-sanity` value for a field on the principal's own document. */
  const personField = (...path: PathStep[]) =>
    person ? documentFieldAttribute({id: person.id, type: PERSON_TYPE, path}) : undefined

  const paragraphs = person?.message ?? []

  return (
    <section className="px-4 py-14 sm:px-8 sm:py-16 lg:py-20" {...editTargetAttr}>
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
          {/*
            `overflow-x-clip` keeps the two columns' pre-reveal
            `translateX(±44px)` from widening the page on narrow phones — the
            same treatment the Home page's story section uses. Only the horizontal
            axis is clipped, so the vertical reveal and the portrait are untouched.
          */}
          <div className="grid grid-cols-1 items-start gap-8 overflow-x-clip sm:gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-14">
            <Reveal direction="left" className="lg:col-span-5">
              {/*
                The column is `w-full` rather than capped at `max-w-md`: the text
                column is much taller than a 4:3 crop, so a narrow centred portrait
                left a void above and below it. Filling the column with a square
                crop and aligning both columns to the top removes that gap.
              */}
              <div
                className="group relative aspect-square w-full overflow-hidden rounded-2xl border-4 border-white shadow-lg"
                data-sanity={personField('photo')}
              >
                {person?.photo ? (
                  <SanityImage
                    image={person.photo}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    editAttribute={personField('photo')}
                  />
                ) : null}
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10" />
              </div>
            </Reveal>

            <Reveal direction="right" className="flex flex-col justify-center space-y-4 sm:space-y-5 lg:col-span-7">
              {header?.heading ? (
                <h2
                  className="mb-1 text-2xl font-extrabold tracking-tight text-balance text-gray-900 sm:text-3xl lg:text-4xl"
                  data-sanity={editField('header', 'heading')}
                >
                  {header.heading}
                </h2>
              ) : null}

              {person ? (
                <div>
                  <h3
                    className="text-lg font-bold text-balance text-jids-green"
                    data-sanity={personField('name')}
                  >
                    {person.name}
                  </h3>
                  {person.designation ? (
                    <p
                      className="text-xs font-semibold uppercase tracking-wider text-gray-400"
                      data-sanity={personField('designation')}
                    >
                      {person.designation}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-[15px] leading-relaxed text-pretty text-gray-600 sm:text-base"
                  data-sanity={personField('message', index)}
                >
                  {paragraph}
                </p>
              ))}

              {person?.quote ? (
                <div className="border-l-4 border-jids-green py-0.5 pl-4 pt-2">
                  <p
                    className="text-sm font-bold italic text-pretty text-gray-900"
                    data-sanity={personField('quote')}
                  >
                    {person.quote}
                  </p>
                  {person.quoteAttribution ? (
                    <p
                      className="mt-0.5 text-xs font-medium text-gray-500"
                      data-sanity={personField('quoteAttribution')}
                    >
                      {person.quoteAttribution}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
