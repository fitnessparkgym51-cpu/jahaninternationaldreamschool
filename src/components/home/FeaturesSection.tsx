import {Icon} from '@/components/ui/Icon'
import {Reveal} from '@/components/ui/Reveal'
import {SanityImage} from '@/components/ui/SanityImage'
import type {EditField} from '@/components/home/HomeSections'
import type {FeaturesSection as FeaturesSectionData} from '@/sanity/types/home'

import {SectionTitle} from './StatsBarSection'

type FeaturesSectionProps = {
  section: FeaturesSectionData
  editField: EditField}

/** "Why parents choose us" â€” three-column feature card grid. */
export function FeaturesSection({section, editField}: FeaturesSectionProps) {
  const cards = section.cards ?? []
  if (!cards.length) return null

  return (
    <section
      className="bg-white px-4 py-20 sm:px-8"
      data-sanity={editField('cards')}
      data-sanity-edit-target=""
    >
      <div className="mx-auto max-w-7xl">
        <SectionTitle header={section.header} editField={editField} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <Reveal
              key={card._key}
              delay={(index % 3) * 120}
              className="card-soft-hover relative flex flex-col justify-start rounded-2xl border border-jids-card-line bg-[#fcfdfc] p-8"
              data-sanity={editField('cards', {_key: card._key})}
            >
              {card.badge ? (
                <span className="absolute right-6 top-6 rounded-full bg-jids-orange px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {card.badge}
                </span>
              ) : null}

              {card.iconImage?.asset ? (
                <SanityImage
                  image={card.iconImage}
                  sizes="72px"
                  className="mb-5 h-[72px] w-[72px] object-contain"
                  editAttribute={editField('cards', {_key: card._key}, 'iconImage')}
                />
              ) : (
                <div
                  className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-jids-icon-bg"
                  data-sanity={editField('cards', {_key: card._key}, 'icon')}
                >
                  <Icon
                    name={card.icon}
                    size={32}
                    className={card.useAmberIcon ? 'text-amber-500' : 'text-jids-green'}
                  />
                </div>
              )}

              <h3 className="mb-2.5 text-lg font-bold text-gray-900">{card.title}</h3>
              {card.description ? (
                <p className="text-sm leading-relaxed text-gray-600">{card.description}</p>
              ) : null}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
