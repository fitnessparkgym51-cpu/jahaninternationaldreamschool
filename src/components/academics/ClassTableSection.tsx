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
      className="scroll-mt-24 bg-white px-4 py-14 sm:px-8 sm:py-16 lg:py-20"
      {...editTargetAttr}
    >
      <div className="mx-auto max-w-6xl">
        {header?.heading ? (
          <Reveal className="mb-8 text-center sm:mb-10">
            <h2
              className="text-2xl font-bold tracking-tight text-balance text-gray-900 sm:text-3xl"
              data-sanity={editField('header', 'heading')}
            >
              {header.heading}
            </h2>
            {/* The green→gold accent bar every other section heading on the site
                uses. Decoration belongs to the design system, so it is code. */}
            <div className="title-accent-bar" />
            {header.subheading ? (
              <p
                className="mt-4 text-sm text-pretty text-gray-600 sm:text-base"
                data-sanity={editField('header', 'subheading')}
              >
                {header.subheading}
              </p>
            ) : null}
          </Reveal>
        ) : null}

        {classes.length ? (
          <Reveal>
            {/*
              `relative` hosts the scroll-hint fade below. The table keeps its
              `overflow-x-auto` + `min-w-[640px]` contract — on a phone the focus
              column is still reached by scrolling the table sideways — and the
              fade is what tells a visitor that there is something to scroll to.
            */}
            <div className="relative">
              <div className="overflow-x-auto rounded-2xl border border-gray-200/90 bg-white shadow-sm">
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
                        className="w-1/5 px-4 py-3 font-semibold sm:px-6 sm:py-3.5"
                        data-sanity={editField('columnLabels', 'class')}
                      >
                        {labels?.class ?? 'Class'}
                      </th>
                      <th
                        scope="col"
                        className="w-1/6 px-4 py-3 font-semibold sm:px-6 sm:py-3.5"
                        data-sanity={editField('columnLabels', 'age')}
                      >
                        {labels?.age ?? 'Age'}
                      </th>
                      <th
                        scope="col"
                        className="w-1/4 px-4 py-3 font-semibold sm:px-6 sm:py-3.5"
                        data-sanity={editField('columnLabels', 'medium')}
                      >
                        {labels?.medium ?? 'Medium'}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 font-semibold sm:px-6 sm:py-3.5"
                        data-sanity={editField('columnLabels', 'focus')}
                      >
                        {labels?.focus ?? 'Focus'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {classes.map((item) => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-jids-green-tint focus-within:bg-jids-green-tint"
                      >
                        <th
                          scope="row"
                          className="px-4 py-3.5 text-left font-medium text-pretty text-jids-green sm:px-6 sm:py-4"
                          data-sanity={classField(item.id, 'name')}
                        >
                          {item.name}
                        </th>
                        <td
                          className="px-4 py-3.5 text-pretty text-gray-600 sm:px-6 sm:py-4"
                          data-sanity={classField(item.id, 'ageRange')}
                        >
                          {item.ageRange}
                        </td>
                        <td
                          className="px-4 py-3.5 text-pretty text-gray-600 sm:px-6 sm:py-4"
                          data-sanity={classField(item.id, 'medium')}
                        >
                          {item.medium}
                        </td>
                        <td
                          className="px-4 py-3.5 text-pretty text-gray-600 sm:px-6 sm:py-4"
                          data-sanity={classField(item.id, 'focus')}
                        >
                          {item.focus}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/*
                Decorative only, and pure CSS: a soft fade on the right edge that
                signals there is more table to the right. It carries no text and
                no CMS field, and it never intercepts touches
                (`pointer-events-none`), so scrolling still works. Hidden from
                `md` (768px) up, which is where the table's `min-w-[640px]` finally
                fits the container and there is nothing left to scroll to.
              */}
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent md:hidden"
                aria-hidden="true"
              />
            </div>
          </Reveal>
        ) : section.emptyStateText ? (
          <Reveal>
            <div
              className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center"
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
