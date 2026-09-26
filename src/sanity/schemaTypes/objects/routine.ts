import {defineArrayMember, defineField, defineType} from 'sanity'

/* -------------------------------------------------------------------------- */
/* One row of a class timetable                                               */
/* -------------------------------------------------------------------------- */

/**
 * One row of a class's timetable: its time, its label, and one subject per day.
 *
 * Rows live on the `classRoutine` document itself, so every class owns its whole
 * table — add, remove, reorder or retime rows for one class without touching the
 * others.
 */
export const classRoutineRowType = defineType({
  name: 'classRoutineRow',
  title: 'Timetable row',
  type: 'object',
  fields: [
    defineField({
      name: 'time',
      title: 'Time',
      type: 'string',
      description: 'e.g. 8:30 – 9:15',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Slot name',
      type: 'string',
      description: 'e.g. Period 1, Assembly, Break, Lunch',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Row type',
      type: 'string',
      options: {
        list: [
          {value: 'lesson', title: 'Lessons (a subject for each day)'},
          {value: 'all', title: 'Same every day (e.g. Assembly)'},
          {value: 'break', title: 'Break (grey, no subjects)'},
        ],
        layout: 'radio',
      },
      initialValue: 'lesson',
      description: '"Same every day" and "Break" rows show the slot name across every day.',
    }),
    defineField({
      name: 'cells',
      title: 'Subjects by day',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description:
        'One entry per day column, in the same order as the Day columns above. Leave an entry empty for no class.',
      hidden: ({parent}) => parent?.kind === 'all' || parent?.kind === 'break',
    }),
  ],
  preview: {
    select: {label: 'label', time: 'time', kind: 'kind', cells: 'cells'},
    prepare: ({label, time, kind, cells}) => ({
      title: [time, label].filter(Boolean).join(' · ') || 'Timetable row',
      subtitle:
        kind === 'lesson' || !kind
          ? (cells ?? []).filter(Boolean).join(' · ') || 'no subjects yet'
          : kind === 'all'
            ? 'Same every day'
            : 'Break',
    }),
  },
})

/* -------------------------------------------------------------------------- */
/* The timetable section                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The weekly timetable section: a heading, the class tabs and the print button.
 *
 * Each class's table (day columns, rows, subjects) lives in its referenced
 * `classRoutine` document, so a timetable is editable — and click-to-editable —
 * on its own.
 */
export const routineSectionType = defineType({
  name: 'routineSection',
  title: 'Weekly timetable',
  type: 'object',
  groups: [
    {name: 'settings', title: 'Section settings', default: true},
    {name: 'content', title: 'Content'},
  ],
  fields: [
    defineField({
      name: 'enabled',
      title: 'Show this section on the website',
      type: 'boolean',
      initialValue: true,
      group: 'settings',
    }),
    defineField({
      name: 'anchorId',
      title: 'Anchor id',
      type: 'string',
      group: 'settings',
      description: 'Lets menus link straight to the timetable, e.g. routine.',
      validation: (rule) =>
        rule.custom((value) =>
          value && /[^a-z0-9-]/.test(value)
            ? 'Use lower-case letters, numbers and hyphens only.'
            : true,
        ),
    }),
    defineField({
      name: 'header',
      title: 'Section heading',
      type: 'sectionHeader',
      group: 'content',
    }),
    defineField({
      name: 'routines',
      title: 'Class routines',
      type: 'array',
      group: 'content',
      description: 'Pick routines from the Class routines list. Drag to reorder the tabs.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'classRoutine'}]})],
    }),
    defineField({
      name: 'printButtonLabel',
      title: 'Print button text',
      type: 'string',
      group: 'content',
      description: 'Leave empty to hide the print button.',
    }),
    defineField({
      name: 'footnote',
      title: 'Note under the table',
      type: 'text',
      rows: 2,
      group: 'content',
    }),
    defineField({
      name: 'emptyStateText',
      title: 'Message shown when no routines are listed',
      type: 'string',
      group: 'content',
      description: 'Leave empty to hide the notice entirely.',
    }),
  ],
  preview: {
    select: {title: 'header.heading', routines: 'routines', anchorId: 'anchorId'},
    prepare: ({title, routines, anchorId}) => ({
      title: title || 'Weekly timetable',
      subtitle: [
        routines?.length ? `${routines.length} routines` : 'no routines yet',
        anchorId ? `#${anchorId}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
