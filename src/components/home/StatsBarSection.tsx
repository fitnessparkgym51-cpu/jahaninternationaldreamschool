import {Reveal} from '@/components/ui/Reveal'
import type {EditField} from '@/components/home/HomeSections'
import type {SectionHeader, StatsBarSection as StatsBarSectionData} from '@/sanity/types/home'

type StatsBarProps = {
  section: StatsBarSectionData
  editField: EditField
}

/** Centred heading with the thin green→gold accent bar from the reference. */
export function SectionTitle({
  header,
  editField,
}: {
  header?: SectionHeader | null
  editField: EditField
}) {
  if (!header?.heading) return null

  return (
    <Reveal className="mx-auto mb-14 max-w-3xl text-center" editAttribute={editField('header')}>
      <h2 className="mb-3 text-2xl font-extrabold text-[#1a202c] sm:text-4xl">{header.heading}</h2>
      <div className="title-accent-bar" />
      {header.subheading ? (
        <p className="mt-4 text-sm text-gray-500 sm:text-base">{header.subheading}</p>
      ) : null}
    </Reveal>
  )
}

/** Orange milestone band under the hero. */
export function StatsBarSection({section, editField}: StatsBarProps) {
  const items = section.items ?? []
  if (!items.length) return null

  return (
    <section
      className="stat-bar-shadow relative z-20 bg-jids-orange px-4 py-9 text-white sm:px-8"
      data-sanity={editField('items')}
      data-sanity-edit-target=""
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 text-center sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={`${item._key}`}
            className="flex items-center justify-between gap-4 border-b border-white/15 py-3.5 last:border-b-0 sm:block sm:border-b-0 sm:px-3 sm:py-0 lg:border-l lg:border-white/15 lg:first:border-l-0 xl:px-8"
            data-sanity={editField('items', {_key: item._key})}
          >
            <div
              className={`flex h-9 items-center whitespace-nowrap font-extrabold leading-none tracking-tight sm:h-12 sm:justify-center sm:text-3xl xl:h-14 xl:text-4xl ${
                item.isSmaller ? 'text-xl sm:text-2xl xl:text-3xl' : 'text-2xl'
              }`}
            >
              {item.value}
            </div>
            <div className="text-xs font-medium leading-snug text-white/90 sm:mt-2.5 sm:min-h-[1.5rem] sm:text-center sm:text-sm xl:whitespace-nowrap">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
