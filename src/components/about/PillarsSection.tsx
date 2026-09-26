import {Icon} from '@/components/ui/Icon'
import {SectionHeader} from '@/components/ui/SectionHeader'
import {Reveal} from '@/components/ui/Reveal'
import {stegaClean} from 'next-sanity'
import {editTargetAttr} from '@/lib/editing'
import type {EditField} from '@/components/about/AboutSections'
import type {PillarsSection as PillarsSectionData} from '@/sanity/types/home'

/** Icon-tile colour pairs. The tone is editorial, the classes are code. */
const TONE_CLASSES: Record<string, string> = {
  green: 'bg-jids-icon-bg text-jids-green',
  orange: 'bg-red-50 text-jids-orange',
  amber: 'bg-amber-50 text-amber-600',
}

type PillarsSectionProps = {
  section: PillarsSectionData
  editField: EditField
}

/**
 * The school's defining statements — vision, mission, core philosophy.
 *
 * Each pillar is an icon tile plus a title and a paragraph. The icon *name* is
 * CMS (so the Studio's icon picker drives it); the tile colour is a bounded
 * three-way choice, because reproducing the reference needs the pillars to be
 * visually distinguishable.
 */
export function PillarsSection({section, editField}: PillarsSectionProps) {
  const pillars = (section.pillars ?? []).filter((pillar) => Boolean(pillar))
  const header = section.header

  if (!header?.heading && !pillars.length) return null

  return (
    <section className="bg-gray-50/70 px-4 py-16 sm:px-8 sm:py-20" {...editTargetAttr}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader header={header} editHeading={editField('header', 'heading')} />

        {pillars.length ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {pillars.map((pillar, index) => {
              // `tone` and `icon` are used as lookup keys, so they must be clean.
              const tone = TONE_CLASSES[stegaClean(pillar.tone) ?? 'green'] ?? TONE_CLASSES.green

              return (
                <Reveal
                  key={pillar._key}
                  delay={index * 80}
                  className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg ${tone}`}
                    data-sanity={editField('pillars', {_key: pillar._key}, 'icon')}
                  >
                    <Icon name={pillar.icon} size={24} />
                  </div>

                  <h3
                    className="mb-2 text-lg font-bold text-gray-900"
                    data-sanity={editField('pillars', {_key: pillar._key}, 'title')}
                  >
                    {pillar.title}
                  </h3>

                  {pillar.description ? (
                    <p
                      className="text-sm leading-relaxed text-gray-600"
                      data-sanity={editField('pillars', {_key: pillar._key}, 'description')}
                    >
                      {pillar.description}
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
