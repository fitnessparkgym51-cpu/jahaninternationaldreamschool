import {RoutineTabs, type RoutineView} from '@/components/routine/RoutineTabs'
import {Reveal} from '@/components/ui/Reveal'
import {SectionHeader} from '@/components/ui/SectionHeader'
import {CLASS_ROUTINE_TYPE, documentFieldAttribute, editTargetAttr, type EditField, type PathStep} from '@/lib/editing'
import type {ClassRoutine, RoutineSection as RoutineSectionData} from '@/sanity/types/home'

type RoutineSectionProps = {
  section: RoutineSectionData
  editField: EditField
}

/**
 * The weekly timetable section.
 *
 * A thin server component: it owns the heading, then turns the CMS data into a
 * plain view model and hands it to the client-side `RoutineTabs`, which owns the
 * selected-class state and the print action.
 *
 * Every `data-sanity` attribute is resolved **here**, because a Server Component
 * cannot pass a function to a Client Component. The result is that each
 * day heading, row time, row label, subject cell (empty or not), class name and
 * session is individually click-to-edit, and targets the `classRoutine` document
 * that owns it — where rows and day columns can be added or removed.
 */
export function RoutineSection({section, editField}: RoutineSectionProps) {
  const header = section.header
  const routines = (section.routines ?? []).filter(
    (routine): routine is ClassRoutine => Boolean(routine?.className),
  )

  if (!header?.heading && !routines.length && !section.emptyStateText) return null

  /** `data-sanity` for a field on one routine document. */
  const routineField = (id: string | null | undefined, ...path: PathStep[]) =>
    id ? documentFieldAttribute({id, type: CLASS_ROUTINE_TYPE, path}) : undefined

  const routineViews: RoutineView[] = routines.map((routine) => ({
    id: routine.id,
    className: routine.className ?? '',
    session: routine.session,
    classNameEditAttribute: routineField(routine.id, 'classLevel'),
    sessionEditAttribute: routineField(routine.id, 'session'),
    days: (routine.days ?? []).map((name, index) => ({
      name: name ?? '',
      editAttribute: routineField(routine.id, 'days', index),
    })),
    rowsEditAttribute: routineField(routine.id, 'rows'),
    rows: (routine.rows ?? []).map((row) => {
      const rowPath: PathStep[] = ['rows', {_key: row._key}]
      return {
        key: row._key,
        time: row.time ?? '',
        label: row.label ?? '',
        kind: row.kind ?? 'lesson',
        cells: row.cells ?? [],
        timeEditAttribute: routineField(routine.id, ...rowPath, 'time'),
        labelEditAttribute: routineField(routine.id, ...rowPath, 'label'),
        cellsEditAttribute: routineField(routine.id, ...rowPath, 'cells'),
        cellEditAttributes: (row.cells ?? []).map((_, cellIndex) =>
          routineField(routine.id, ...rowPath, 'cells', cellIndex),
        ),
      }
    }),
  }))

  return (
    <section
      id={section.anchorId || undefined}
      className="scroll-mt-24 bg-white px-4 py-16 sm:px-8 sm:py-20"
      {...editTargetAttr}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader header={header} editHeading={editField('header', 'heading')} />

        <Reveal>
          <RoutineTabs
            routines={routineViews}
            printButtonLabel={section.printButtonLabel}
            printButtonEditAttribute={editField('printButtonLabel')}
            footnote={section.footnote}
            footnoteEditAttribute={editField('footnote')}
            emptyStateText={section.emptyStateText}
            emptyStateEditAttribute={editField('emptyStateText')}
            sectionId={section.anchorId}
          />
        </Reveal>
      </div>
    </section>
  )
}
