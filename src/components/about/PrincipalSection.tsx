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
    <section className="px-4 py-16 sm:px-8 sm:py-20" {...editTargetAttr}>
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal direction="left" className="lg:col-span-5">
              <div
                className="group relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border-4 border-white shadow-lg"
                data-sanity={personField('photo')}
              >
                {person?.photo ? (
                  <SanityImage
                    image={person.photo}
                    sourceWidth={960}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    editAttribute={personField('photo')}
                  />
                ) : null}
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10" />
              </div>
            </Reveal>

            <Reveal direction="right" className="flex flex-col justify-center space-y-4 lg:col-span-7">
              {header?.heading ? (
                <h2
                  className="mb-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl"
                  data-sanity={editField('header', 'heading')}
                >
                  {header.heading}
                </h2>
              ) : null}

              {person ? (
                <div>
                  <h3
                    className="text-lg font-bold text-jids-green"
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
                  className="text-sm leading-relaxed text-gray-600 sm:text-base"
                  data-sanity={personField('message', index)}
                >
                  {paragraph}
                </p>
              ))}

              {person?.quote ? (
                <div className="flex items-center gap-4 pt-4">
                  <div className="border-l-4 border-jids-green pl-4">
                    <p
                      className="text-sm font-bold italic text-gray-900"
                      data-sanity={personField('quote')}
                    >
                      {person.quote}
                    </p>
                    {person.quoteAttribution ? (
                      <p
                        className="text-xs font-medium text-gray-500"
                        data-sanity={personField('quoteAttribution')}
                      >
                        {person.quoteAttribution}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
