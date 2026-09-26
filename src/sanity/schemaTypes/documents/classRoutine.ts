import {defineArrayMember, defineField, defineType} from 'sanity'

import {TimetableInput} from '../../components/TimetableInput'

/** `defineArrayMember` takes the type name, not the type object. */
const CLASS_ROUTINE_ROW_TYPE = 'classRoutineRow'

/**
 * One class's weekly timetable.
 *
 * This is a **reusable document** for the same reason `classLevel` is: a timetable
 * is a per-class entity that may well be referenced from more than one page, and
 * keeping it separate means the Class routine page stays readable and a routine can
 * be corrected on its own.
 *
 * The class **name is not stored here** — it comes from the referenced `classLevel`
 * document, so renaming a class updates its timetable, the Academics table and
 * anything else that shows it, all from one edit.
 *
 * The whole table — day columns, rows and subjects — lives here, so each class
 * can be edited, extended or trimmed independently.
 */
export const classRoutineType = defineType({
  name: 'classRoutine',
  title: 'Class routine',
  type: 'document',
  components: {input: TimetableInput},
  groups: [
    {name: 'main', title: 'Routine', default: true},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'classLevel',
      title: 'Class',
      type: 'reference',
      group: 'main',
      to: [{type: 'classLevel'}],
      description: 'The class this timetable belongs to. The name is taken from here.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'session',
      title: 'Session',
      type: 'string',
      group: 'main',
      description: 'Shown in the pill beside the class name, e.g. Morning Session: 8:00 AM – 2:00 PM',
    }),
    defineField({
      name: 'days',
      title: 'Day columns',
      type: 'array',
      group: 'main',
      description:
        'Column headings, left to right, e.g. Sunday … Thursday. Add or remove a day here, then add or remove the matching subject in each row.',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'rows',
      title: 'Timetable rows',
      type: 'array',
      group: 'main',
      description: "Top to bottom. Add, remove or drag rows to change this class's timetable.",
      of: [defineArrayMember({type: CLASS_ROUTINE_ROW_TYPE})],
    }),
    defineField({
      name: 'sortOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 50,
      group: 'settings',
      description: 'Lower numbers come first. Use 10, 20, 30 … to leave room to insert.',
      validation: (rule) => rule.min(0).max(999),
    }),
    defineField({
      name: 'isVisible',
      title: 'Show on the website',
      type: 'boolean',
      initialValue: true,
      group: 'settings',
      description: 'Turn off to hide this timetable without deleting it.',
    }),
  ],
  orderings: [
    {title: 'Display order', name: 'sortAsc', by: [{field: 'sortOrder', direction: 'asc'}]},
    {title: 'Newest first', name: 'newest', by: [{field: '_createdAt', direction: 'desc'}]},
  ],
  preview: {
    select: {
      className: 'classLevel.name',
      session: 'session',
      rowCount: 'rows',
      isVisible: 'isVisible',
      sortOrder: 'sortOrder',
    },
    prepare: ({className, session, rowCount, isVisible, sortOrder}) => ({
      title: className || 'Class routine',
      subtitle: isVisible === false
        ? `Hidden · ${rowCount?.length ?? 0} rows`
        : `${rowCount?.length ?? 0} rows · ${session || 'no session set'}`,
      description: sortOrder === undefined ? undefined : `Order ${sortOrder}`,
    }),
  },
})
