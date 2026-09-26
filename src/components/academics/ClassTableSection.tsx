import {Reveal} from '@/components/ui/Reveal'
import {CLASS_LEVEL_TYPE, documentFieldAttribute, editTargetAttr, type EditField, type PathStep} from '@/lib/editing'
import type {ClassLevel, ClassTableSection as ClassTableSectionData} from '@/sanity/types/home'

type ClassTableSectionProps = {
  section: ClassTableSectionData
  editField: EditField
}

/**
 * The class catalogue, rendered as the reference's four-column table.
 *
 * Rows are **referenced** `classLevel` documents, so each cell is click-to-edit
 * against the class itself rather than the page holding the reference. Editing a
 * class's age range once updates it here and anywhere else it is reused.
 *
 * On a narrow screen the table scrolls inside its own container
 * (`overflow-x-auto` + a `min-w-` on the table) rather than pushing the whole page
 * sideways.
 */
export function ClassTableSection({section, editField}: ClassTableSectionProps) {
  const classes = (section.classes ?? []).filter(
    (item): item is ClassLevel => Boolean(item?.name) && item?.isVisible !== false,
  )
  const header = section.header
  const labels = section.columnLabels

  if (!header?.heading && !classes.length && !section.emptyStateText) return null

  /** `data-sanity` value for a field on one class document. */
  const classField = (id: string | null | undefined, ...path: PathStep[]) =>
    id ? documentFieldAttribute({id, type: CLASS_LEVEL_TYPE, path}) : undefined

  return (
    <section
      id={section.anchorId || undefined}
      className="scroll-mt-24 bg-white px-4 py-16 sm:px-8 sm:py-20"
      {...editTargetAttr}
    >
      <div className="mx-auto max-w-5xl">
        {header?.heading ? (
          <Reveal className="mb-10 text-center">
            <h2
              className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
              data-sanity={editField('header', 'heading')}
            >
              {header.heading}
            </h2>
            {header.subheading ? (
              <p
                className="mt-2 text-sm text-gray-600 sm:text-base"
                data-sanity={editField('header', 'subheading')}
              >
                {header.subheading}
              </p>
            ) : null}
          </Reveal>
        ) : null}

        {classes.length ? (
          <Reveal>
            <div className="overflow-x-auto rounded-xl border border-gray-200/90 bg-white shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  {/*
                    The column headings are display-only text, so they keep their
                    stega encoding — that is what makes them click-to-edit. The
                    explicit `data-sanity` below is a belt-and-braces target.
                    (Contrast the `tone` and `icon` lookups elsewhere, which must
                    be cleaned because they are used as keys.)
                  */}
                  <tr className="bg-jids-green text-sm font-semibold tracking-wide text-white">
                    <th
                      scope="col"
                      className="w-1/5 px-6 py-3.5 font-semibold"
                      data-sanity={editField('columnLabels', 'class')}
                    >
                      {labels?.class ?? 'Class'}
                    </th>
                    <th
                      scope="col"
                      className="w-1/6 px-6 py-3.5 font-semibold"
                      data-sanity={editField('columnLabels', 'age')}
                    >
                      {labels?.age ?? 'Age'}
                    </th>
                    <th
                      scope="col"
                      className="w-1/4 px-6 py-3.5 font-semibold"
                      data-sanity={editField('columnLabels', 'medium')}
                    >
                      {labels?.medium ?? 'Medium'}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3.5 font-semibold"
                      data-sanity={editField('columnLabels', 'focus')}
                    >
                      {labels?.focus ?? 'Focus'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {classes.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-jids-green-tint">
                      <th
                        scope="row"
                        className="px-6 py-4 text-left font-medium text-jids-green"
                        data-sanity={classField(item.id, 'name')}
                      >
                        {item.name}
                      </th>
                      <td className="px-6 py-4 text-gray-600" data-sanity={classField(item.id, 'ageRange')}>
                        {item.ageRange}
                      </td>
                      <td className="px-6 py-4 text-gray-600" data-sanity={classField(item.id, 'medium')}>
                        {item.medium}
                      </td>
                      <td className="px-6 py-4 text-gray-600" data-sanity={classField(item.id, 'focus')}>
                        {item.focus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        ) : section.emptyStateText ? (
          <Reveal>
            <div
              className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center"
              data-sanity={editField('emptyStateText')}
            >
              <p className="text-sm text-gray-500">{section.emptyStateText}</p>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  )
}
