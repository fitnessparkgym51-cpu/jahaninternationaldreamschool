'use client'

import {useId, useState} from 'react'

/**
 * One day column's heading, and its width in the printed/tabular layout.
 */
export type RoutineDay = {
  name: string
  editAttribute?: string
}

/** One row of a class timetable. */
export type RoutineRowView = {
  key: string
  time: string
  label: string
  /**
   * `lesson` — a subject per day, an em dash when empty
   * `all`    — same every day, shows its own label on a grey background
   * `break`  — shows its own label on a grey background
   */
  kind: string
  cells: string[]
  timeEditAttribute?: string
  labelEditAttribute?: string
  /** Target for a day with no entry yet, so the editor opens the row's subjects. */
  cellsEditAttribute?: string
  cellEditAttributes: (string | undefined)[]
}

export type RoutineView = {
  id: string
  className: string
  session?: string | null
  days: RoutineDay[]
  rows: RoutineRowView[]
  /** Target shown when a class has no rows yet, so the first row can be added. */
  rowsEditAttribute?: string
  /** Click-to-edit target for this class, shown in the timetable header. */
  classNameEditAttribute?: string
  sessionEditAttribute?: string
}

type RoutineTabsProps = {
  routines: RoutineView[]
  printButtonLabel?: string | null
  /** Resolved `data-sanity` for the print button label, so it stays click-to-edit. */
  printButtonEditAttribute?: string
  footnote?: string | null
  footnoteEditAttribute?: string
  emptyStateText?: string | null
  emptyStateEditAttribute?: string
  sectionId?: string | null
}

/**
 * The weekly timetable with one tab per class, plus a print button.
 *
 * This has to run in the browser: which class is selected is behaviour, not
 * content. The questions of *what* each class does come from Sanity — the server
 * component builds this view model, including every `data-sanity` attribute,
 * because a Server Component cannot hand a function to a Client Component.
 *
 * Rendering follows the reference exactly:
 * - a lesson cell with no value renders an em dash in grey
 * - `all` and `break` slots show their own label on a grey background, and need
 *   no per-class data at all
 * - every row and day column comes from the selected class's own document
 */
export function RoutineTabs({
  routines,
  printButtonLabel,
  printButtonEditAttribute,
  footnote,
  footnoteEditAttribute,
  emptyStateText,
  emptyStateEditAttribute,
  sectionId,
}: RoutineTabsProps) {
  const baseId = useId()
  const [activeId, setActiveId] = useState<string | null>(routines[0]?.id ?? null)

  if (!routines.length) {
    return emptyStateText ? (
      <div
        className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center"
        data-routine-empty="true"
        data-sanity={emptyStateEditAttribute}
      >
        <p className="text-sm text-gray-500">{emptyStateText}</p>
      </div>
    ) : null
  }

  const active = routines.find((r) => r.id === activeId) ?? routines[0]

  const {days, rows} = active

  return (
    <>
      {/* Class selector + print */}
      <div className="jid-routine-controls mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select a class">
          {routines.map((routine) => {
            const selected = routine.id === active.id
            return (
              <button
                key={routine.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${routine.id}`}
                aria-selected={selected}
                aria-controls={`${sectionId ?? 'routine'}-panel`}
                onClick={() => setActiveId(routine.id)}
                className={`rounded-md px-4 py-2 text-xs font-bold shadow-sm transition ${
                  selected
                    ? 'bg-jids-green text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-jids-green hover:text-jids-green'
                }`}
                /*
                 * The tab is also a click-to-edit target for this class's routine.
                 * The Presentation overlay consumes the `click`, so the tab switches
                 * on `mousedown` instead: one click shows the class *and* opens its
                 * routine document (with its timetable editor) in the Studio.
                 */
                onMouseDown={() => setActiveId(routine.id)}
                data-sanity={routine.rowsEditAttribute}
              >
                {routine.className}
              </button>
            )
          })}
        </div>

        {printButtonLabel ? (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded border-2 border-jids-green px-5 py-2.5 text-xs font-bold text-jids-green transition duration-200 hover:bg-jids-green hover:text-white"
            data-sanity={printButtonEditAttribute}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z" />
            </svg>
            {printButtonLabel}
          </button>
        ) : null}
      </div>

      {/* Timetable card */}
      <div className="jid-routine-card overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-jids-green px-6 py-4 text-white">
          <h3
            className="text-lg font-extrabold"
            data-sanity={active.classNameEditAttribute}
          >
            {active.className}
          </h3>
          {active.session ? (
            <span
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold"
              data-sanity={active.sessionEditAttribute}
            >
              {active.session}
            </span>
          ) : null}
        </div>

        <div className="jid-routine-scroll overflow-x-auto">
          <table
            className="jid-routine-table w-full min-w-[720px] border-collapse text-left"
            id={sectionId ? `${sectionId}-table` : undefined}
          >
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
                <th scope="col" className="w-40 border-b border-gray-200 px-4 py-3 font-bold">
                  Time
                </th>
                <th scope="col" className="w-28 border-b border-gray-200 px-4 py-3 font-bold">
                  Slot
                </th>
                {days.map((day, i) => (
                  <th
                    key={`${day.name}-${i}`}
                    scope="col"
                    className="border-b border-gray-200 px-4 py-3 font-bold"
                    data-sanity={day.editAttribute}
                  >
                    {day.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((row) => {
                const isWholeRow = row.kind === 'all' || row.kind === 'break'

                return (
                  <tr key={row.key}>
                    <th
                      scope="row"
                      className="whitespace-nowrap border-b border-gray-100 bg-gray-50/60 px-4 py-3 text-left font-semibold text-gray-700"
                      data-sanity={row.timeEditAttribute}
                    >
                      {row.time}
                    </th>
                    <td
                      className="whitespace-nowrap border-b border-gray-100 bg-gray-50/60 px-4 py-3 text-xs uppercase tracking-wider text-gray-500"
                      data-sanity={row.labelEditAttribute}
                    >
                      {row.label}
                    </td>

                    {days.map((day, dayIndex) => {
                      if (isWholeRow) {
                        return (
                          <td
                            key={`${day.name}-${dayIndex}`}
                            className="border-b border-gray-100 bg-gray-100 px-4 py-3 text-center text-xs font-semibold text-gray-600"
                            data-sanity={row.labelEditAttribute}
                          >
                            {row.label}
                          </td>
                        )
                      }

                      const value = row.cells[dayIndex]?.trim() ?? ''
                      // Empty cells stay click-to-edit: an existing entry opens itself,
                      // a missing one opens the row's subject list to add it.
                      const editAttribute = row.cellEditAttributes[dayIndex] ?? row.cellsEditAttribute

                      return (
                        <td
                          key={`${day.name}-${dayIndex}`}
                          className={`border-b border-gray-100 px-4 py-3 text-center ${
                            value ? 'text-xs font-semibold text-jids-green' : 'text-gray-300'
                          }`}
                          data-sanity={editAttribute}
                        >
                          {value || '—'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              {!rows.length ? (
                <tr>
                  <td
                    colSpan={days.length + 2}
                    className="px-4 py-10 text-center text-sm text-gray-400"
                    data-sanity={active.rowsEditAttribute}
                  >
                    —
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {footnote ? (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
            <p className="text-xs text-gray-500" data-sanity={footnoteEditAttribute}>
              {footnote}
            </p>
          </div>
        ) : null}
      </div>
    </>
  )
}
