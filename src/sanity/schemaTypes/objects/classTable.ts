import {defineArrayMember, defineField, defineType} from 'sanity'

/** The four column headings of the class table, so the school can rename them. */
export const classTableColumnsType = defineType({
  name: 'classTableColumns',
  title: 'Column headings',
  type: 'object',
  fields: [
    defineField({
      name: 'class',
      title: 'First column',
      type: 'string',
      initialValue: 'Class',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'age',
      title: 'Second column',
      type: 'string',
      initialValue: 'Age',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'medium',
      title: 'Third column',
      type: 'string',
      initialValue: 'Medium',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'focus',
      title: 'Fourth column',
      type: 'string',
      initialValue: 'Focus',
      validation: (rule) => rule.required(),
    }),
  ],
})

/**
 * The class catalogue rendered as a table.
 *
 * The rows are **references** to `classLevel` documents, so a class's age range or
 * focus text is edited in one place. The column headings are CMS fields too: the
 * school may want "Age Group" rather than "Age", and that should not need a code
 * change.
 */
export const classTableSectionType = defineType({
  name: 'classTableSection',
  title: 'Class table',
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
      group: 'content',
      description: 'Lets menus link straight to the table, e.g. curriculum-table.',
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
      name: 'columnLabels',
      title: 'Column headings',
      type: 'classTableColumns',
      group: 'content',
      description: 'Rename these if the school prefers different wording.',
    }),
    defineField({
      name: 'classes',
      title: 'Classes',
      type: 'array',
      group: 'content',
      description: 'Pick classes from the Classes list. Drag to reorder, or edit a class itself.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'classLevel'}]})],
    }),
    defineField({
      name: 'emptyStateText',
      title: 'Message shown when no classes are listed',
      type: 'string',
      group: 'content',
      description: 'Leave empty to hide the notice entirely.',
    }),
  ],
  preview: {
    select: {title: 'header.heading', classes: 'classes', anchorId: 'anchorId'},
    prepare: ({title, classes, anchorId}) => ({
      title: title || 'Class table',
      subtitle: [
        classes?.length ? `${classes.length} classes` : 'No classes selected yet',
        anchorId ? `#${anchorId}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
