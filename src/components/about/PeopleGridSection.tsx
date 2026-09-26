import {ButtonLink} from '@/components/ui/SmartLink'
import {SectionHeader} from '@/components/ui/SectionHeader'
import {Reveal} from '@/components/ui/Reveal'
import {editTargetAttr} from '@/lib/editing'
import {PersonCard} from '@/components/about/PersonCard'
import type {EditField} from '@/components/about/AboutSections'
import type {PeopleGridSection as PeopleGridSectionData} from '@/sanity/types/home'

type PeopleGridSectionProps = {
  section: PeopleGridSectionData
  editField: EditField
}

/**
 * A grid of people — the teaching team on the About page, reusable for staff or
 * leadership on any later page.
 *
 * When no people are selected the section renders its heading plus a single
 * editorial notice rather than a broken grid of empty cards. The notice text is a
 * CMS field, so an editor controls or removes it.
 */
export function PeopleGridSection({section, editField}: PeopleGridSectionProps) {
  const people = (section.people ?? []).filter(
    (person) => Boolean(person) && person?.isVisible !== false,
  )
  const header = section.header

  if (!header?.heading && !people.length && !section.emptyStateText) return null

  return (
    <section
      id={section.anchorId || undefined}
      className="scroll-mt-24 px-4 py-16 sm:px-8 sm:py-20"
      {...editTargetAttr}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader header={header} editHeading={editField('header', 'heading')} />

        {people.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {people.map((person, index) => (
              <PersonCard key={person.id} person={person} delay={index * 80} />
            ))}
          </div>
        ) : section.emptyStateText ? (
          <Reveal className="mx-auto max-w-2xl">
            <div
              className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center"
              data-sanity={editField('emptyStateText')}
            >
              <p className="text-sm text-gray-500">{section.emptyStateText}</p>
            </div>
          </Reveal>
        ) : null}

        {section.cta ? (
          <div className="mt-12 flex justify-center">
            <ButtonLink button={section.cta} editAttribute={editField('cta')} />
          </div>
        ) : null}
      </div>
    </section>
  )
}
