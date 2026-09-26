import {stegaClean} from 'next-sanity'

import {Icon} from '@/components/ui/Icon'
import {Reveal} from '@/components/ui/Reveal'
import {SectionHeader} from '@/components/ui/SectionHeader'
import {editTargetAttr, type EditField} from '@/lib/editing'
import type {SharedCardGridData, SharedIconCard} from '@/components/sections/types'

/** Icon-tile colour pairs. The tone is editorial, the classes are code. */
const TONE_CLASSES: Record<string, string> = {
  green: 'bg-jids-icon-bg text-jids-green',
  orange: 'bg-red-50 text-jids-orange',
  amber: 'bg-amber-50 text-amber-600',
  pink: 'bg-pink-100 text-pink-500',
  blue: 'bg-blue-100 text-blue-600',
}

type CardGridSectionProps = {
  section: SharedCardGridData
  editField: EditField
}

/**
 * A responsive grid of icon cards.
 *
 * Rendered from the `pillarsSection` schema, which was first built for the About
 * page's vision / mission / philosophy. It is generic and reused here for the
 * curriculum highlights.
 *
 * The icon *name* is CMS (so the Studio's icon picker drives it); the tile colour is
 * a bounded choice, because a grid of identically coloured tiles reads poorly and
 * the reference deliberately tints each one differently.
 */
export function CardGridSection({section, editField}: CardGridSectionProps) {
  const cards = (section.pillars ?? []).filter(
    (card): card is SharedIconCard => Boolean(card?.title),
  )
  const header = section.header

  if (!header?.heading && !cards.length) return null

  return (
    <section
      id={section.anchorId || undefined}
      className="scroll-mt-24 border-t border-gray-100 bg-gray-50/70 px-4 py-16 sm:px-8 sm:py-20"
      {...editTargetAttr}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader header={header} editHeading={editField('header', 'heading')} />

        {cards.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {cards.map((card, index) => {
              // `tone` and `icon` are used as lookup keys, so they must be clean.
              const tone = TONE_CLASSES[stegaClean(card.tone) ?? 'green'] ?? TONE_CLASSES.green
              const key = card._key ?? String(index)

              return (
                <Reveal
                  key={key}
                  delay={index * 70}
                  className="card-soft-hover flex flex-col justify-start rounded-2xl border border-jids-green-line bg-white p-7 shadow-sm"
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}
                    data-sanity={editField('pillars', {_key: key}, 'icon')}
                  >
                    <Icon name={card.icon} size={24} />
                  </div>

                  <h3
                    className="mb-2 text-lg font-bold text-gray-900"
                    data-sanity={editField('pillars', {_key: key}, 'title')}
                  >
                    {card.title}
                  </h3>

                  {card.description ? (
                    <p
                      className="text-sm leading-relaxed text-gray-600"
                      data-sanity={editField('pillars', {_key: key}, 'description')}
                    >
                      {card.description}
                    </p>
                  ) : null}
                </Reveal>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
