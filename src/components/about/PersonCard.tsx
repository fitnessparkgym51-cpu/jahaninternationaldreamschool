import {Icon} from '@/components/ui/Icon'
import {SanityImage} from '@/components/ui/SanityImage'
import {Reveal} from '@/components/ui/Reveal'
import {documentFieldAttribute, editTargetAttr, PERSON_TYPE, type PathStep} from '@/lib/editing'
import type {Person} from '@/sanity/types/home'

type PersonCardProps = {
  person: Person
  /** Staggers the scroll reveal across the grid. */
  delay?: number
}

/**
 * One card in the teaching-team grid.
 *
 * Every field comes from the referenced `person` document, and so does the
 * click-to-edit target: clicking the card opens the person in the Studio rather
 * than the page field that holds the reference. The `data-sanity` attributes are
 * therefore built against `person.id`, not the page id.
 *
 * A person with no photograph renders the reference's dashed placeholder tile â€”
 * a single-person icon, an editable "coming soon" label, and an optional corner
 * badge. That is how the twelve unfilled teacher cards in the reference are
 * reproduced without inventing photographs or hiding the gap from editors.
 */
export function PersonCard({person, delay = 0}: PersonCardProps) {
  if (!person?.name) return null

  /** `data-sanity` value for a field on this person's own document. */
  const personField = (...path: PathStep[]) =>
    documentFieldAttribute({id: person.id, type: PERSON_TYPE, path})

  return (
    <Reveal
      as="article"
      delay={delay}
      {...editTargetAttr}
      className="card-soft-hover overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-dashed border-gray-200 bg-gray-100">
        {person.photo ? (
          <SanityImage
            image={person.photo}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            editAttribute={personField('photo')}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center px-4 text-center"
            data-sanity={personField('photo')}
          >
            <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-400">
              <Icon name="user" size={32} />
            </span>
            {person.photoPlaceholderLabel ? (
              <p
                className="text-xs font-semibold uppercase tracking-wider text-gray-400"
                data-sanity={personField('photoPlaceholderLabel')}
              >
                {person.photoPlaceholderLabel}
              </p>
            ) : null}
          </div>
        )}

        {person.badge ? (
          <span
            className="absolute right-3 top-3 rounded-full border border-gray-200 bg-white/90 px-2 py-1 text-[10px] font-bold text-gray-500 shadow-sm"
            data-sanity={personField('badge')}
          >
            {person.badge}
          </span>
        ) : null}
      </div>

      <div className="p-5 text-center">
        <h3 className="text-base font-bold text-gray-900" data-sanity={personField('name')}>
          {person.name}
        </h3>

        {person.designation ? (
          <p
            className="mt-1 text-xs font-semibold uppercase tracking-wider text-jids-green"
            data-sanity={personField('designation')}
          >
            {person.designation}
          </p>
        ) : null}

        {person.shortBio ? (
          <p
            className="mt-3 text-xs leading-relaxed text-gray-500"
            data-sanity={personField('shortBio')}
          >
            {person.shortBio}
          </p>
        ) : null}
      </div>
    </Reveal>
  )
}
