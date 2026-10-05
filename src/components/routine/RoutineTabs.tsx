'use client'

import {stegaClean} from 'next-sanity'

import {useEffect, useId, useState} from 'react'

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
  initialClass?: string
  printButtonLabel?: string | null
  /** Resolved `data-sanity` for the print button label, so it stays click-to-edit. */
  printButtonEditAttribute?: string
  footnote?: string | null
  footnoteEditAttribute?: string
  emptyStateText?: string | null
  emptyStateEditAttribute?: string
  sectionId?: string | null
}

function findMatchingRoutine(routines: RoutineView[], identifier?: string | null): RoutineView | null {
  if (!identifier) return null
  const clean = identifier.trim().toLowerCase().replace(/^drafts\./, '')
  return (
    routines.find((r) => r.id.toLowerCase() === clean) ||
    routines.find((r) => r.id.toLowerCase().replace(/^class-routine-/, '') === clean) ||
    routines.find((r) => r.className.toLowerCase() === clean) ||
    routines.find((r) => r.className.toLowerCase().replace(/\s+/g, '-') === clean) ||
    null
  )
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
  initialClass,
  printButtonLabel,
  printButtonEditAttribute,
  footnote,
  footnoteEditAttribute,
  emptyStateText,
  emptyStateEditAttribute,
  sectionId,
}: RoutineTabsProps) {
  const baseId = useId()
  const initialMatch = findMatchingRoutine(routines, initialClass)
  const [activeId, setActiveId] = useState<string | null>(initialMatch?.id ?? routines[0]?.id ?? null)

  const handleSelectTab = (routineId: string) => {
    setActiveId(routineId)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('class', routineId)
      window.history.replaceState(null, '', url.toString())
    }
  }

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search)
      const classParam = params.get('class')
      const matched = findMatchingRoutine(routines, classParam)
      if (matched && matched.id !== activeId) {
        setActiveId(matched.id)
      }
    }

    handleUrlChange()

    window.addEventListener('popstate', handleUrlChange)
    window.addEventListener('hashchange', handleUrlChange)
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      window.removeEventListener('hashchange', handleUrlChange)
    }
  }, [routines, activeId])

  if (!routines.length) {
    return emptyStateText ? (
      <div
        className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-10 sm:px-6 sm:py-12 text-center"
        data-routine-empty="true"
        data-sanity={emptyStateEditAttribute}
      >
        <p className="text-xs sm:text-sm text-gray-500">{emptyStateText}</p>
      </div>
    ) : null
  }

  const active = routines.find((r) => r.id === activeId) ?? routines[0]

  const {days, rows} = active

  return (
    <>
      {/* Class selector + print */}
      <div className="jid-routine-controls mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1.5 sm:gap-2"
          role="tablist"
          aria-label="Select a class"
        >
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
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectTab(routine.id)
                }}
                className={`rounded-lg sm:rounded-md px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold shadow-sm transition active:scale-95 touch-manipulation focus-visible:ring-2 focus-visible:ring-jids-green ${
                  selected
                    ? 'bg-jids-green text-white shadow'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-jids-green hover:text-jids-green'
                }`}
                /*
                 * Deliberately NOT a click-to-edit target.
                 *
                 * A tab is a control, and the Presentation overlay swallows the
                 * click on any element carrying `data-sanity`. Making the tab
                 * editable therefore means the editor cannot switch classes: the
                 * overlay opens the Studio and the tab never changes. The way into
                 * a class's routine is its name in the timetable header below,
                 * which is a label, not a control, so it can safely be an edit
                 * target. `onPointerDown` and `onClick` call `stopPropagation` to
                 * prevent parent `data-sanity-edit-target` from swallowing the click.
                 */
              >
                {stegaClean(routine.className)}
              </button>
            )
          })}
        </div>

        {printButtonLabel ? (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-lg sm:rounded border-2 border-jids-green px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold text-jids-green transition duration-200 hover:bg-jids-green hover:text-white active:bg-jids-green active:text-white touch-manipulation focus-visible:ring-2 focus-visible:ring-jids-green"
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
      <div
        id={`${sectionId ?? 'routine'}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active.id}`}
        className="jid-routine-card relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-jids-green px-4 py-3 sm:px-6 sm:py-4 text-white">
          <div className="flex items-center gap-2">
            <h3
              className="text-base sm:text-lg font-extrabold"
              data-sanity={active.classNameEditAttribute}
            >
              {active.className}
            </h3>
            <span className="hidden text-xs text-white/70 sm:inline" aria-hidden="true">
              •
            </span>
            <span className="hidden text-xs font-medium text-white/80 sm:inline">
              Class Timetable
            </span>
          </div>
          {active.session ? (
            <span
              className="rounded-full bg-white/15 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold"
              data-sanity={active.sessionEditAttribute}
            >
              {active.session}
            </span>
          ) : null}
        </div>

        {/* Mobile scroll hint */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/90 px-4 py-2 text-[11px] font-medium text-gray-500 sm:hidden">
          <span className="flex items-center gap-1.5">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-jids-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            Scroll horizontally to view all days
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Sun – Thu
          </span>
        </div>

        <div className="relative">
          <div className="jid-routine-scroll overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table
              className="jid-routine-table w-full min-w-[720px] border-collapse text-left"
              id={sectionId ? `${sectionId}-table` : undefined}
            >
              <thead>
                <tr className="bg-gray-50 text-[11px] sm:text-xs uppercase tracking-wider text-gray-600">
                  <th
                    scope="col"
                    className="sticky left-0 z-20 w-32 sm:w-40 border-b border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3 font-bold text-gray-700 shadow-[1px_0_0_0_#e5e7eb]"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="w-24 sm:w-28 border-b border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3 font-bold"
                  >
                    Slot
                  </th>
                  {days.map((day, i) => (
                    <th
                      key={`${day.name}-${i}`}
                      scope="col"
                      className="min-w-[100px] sm:min-w-0 border-b border-gray-200 px-3 py-2.5 sm:px-4 sm:py-3 font-bold"
                      data-sanity={day.editAttribute}
                    >
                      {day.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm">
                {rows.map((row) => {
                  const isWholeRow = row.kind === 'all' || row.kind === 'break'

                  return (
                    <tr key={row.key} className="transition-colors hover:bg-gray-50/50">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 whitespace-nowrap border-b border-gray-100 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-gray-700 shadow-[1px_0_0_0_#e5e7eb]"
                        data-sanity={row.timeEditAttribute}
                      >
                        {row.time}
                      </th>
                      <td
                        className="whitespace-nowrap border-b border-gray-100 bg-gray-50/60 px-3 py-2.5 sm:px-4 sm:py-3 text-[11px] sm:text-xs uppercase tracking-wider text-gray-500"
                        data-sanity={row.labelEditAttribute}
                      >
                        {row.label}
                      </td>

                      {days.map((day, dayIndex) => {
                        if (isWholeRow) {
                          return (
                            <td
                              key={`${day.name}-${dayIndex}`}
                              className="border-b border-gray-100 bg-gray-100 px-3 py-2.5 sm:px-4 sm:py-3 text-center text-xs font-semibold text-gray-600"
                              data-sanity={row.labelEditAttribute}
                            >
                              {row.label}
                            </td>
                          )
                        }

                        const value = row.cells[dayIndex]?.trim() ?? ''
                        // Empty cells stay click-to-edit: an existing entry opens itself,
                        // a missing one opens the row's subject list to add it.
                        const editAttribute =
                          row.cellEditAttributes[dayIndex] ?? row.cellsEditAttribute

                        return (
                          <td
                            key={`${day.name}-${dayIndex}`}
                            className={`border-b border-gray-100 px-3 py-2.5 sm:px-4 sm:py-3 text-center transition-colors ${
                              value
                                ? 'text-xs sm:text-sm font-semibold text-jids-green'
                                : 'text-gray-300'
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
                      className="px-4 py-8 sm:py-10 text-center text-sm text-gray-400"
                      data-sanity={active.rowsEditAttribute}
                    >
                      —
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Decorative scroll fade on small screens, matching the Academics table pattern */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent sm:w-12 lg:hidden"
            aria-hidden="true"
          />
        </div>

        {footnote ? (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
            <p
              className="text-[11px] sm:text-xs leading-relaxed text-gray-500"
              data-sanity={footnoteEditAttribute}
            >
              {footnote}
            </p>
          </div>
        ) : null}
      </div>
    </>
  )
}
