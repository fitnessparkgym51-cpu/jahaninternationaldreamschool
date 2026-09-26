import {defineField, defineType} from 'sanity'

/**
 * One class the school offers, e.g. "Class 5".
 *
 * This is a **reusable document**, not a field on a page. The class catalogue is
 * needed in more than one place: the Academics table, the Admissions "which class
 * is my child in?" content, and the Contact enquiry form's class picker. Keeping it
 * as documents means the age range or focus text is corrected once and every
 * appearance updates together.
 *
 * The Academics page references these rather than copying the rows, so
 * click-to-edit on a row opens the class itself.
 */
export const classLevelType = defineType({
  name: 'classLevel',
  title: 'Class',
  type: 'document',
  groups: [
    {name: 'main', title: 'Class details', default: true},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Class name',
      type: 'string',
      group: 'main',
      description: 'e.g. Play Group, KG, Class 5',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ageRange',
      title: 'Age range',
      type: 'string',
      group: 'main',
      description: 'e.g. 3–4 yrs',
    }),
    defineField({
      name: 'medium',
      title: 'Medium of instruction',
      type: 'string',
      group: 'main',
      description: 'e.g. English & Bangla',
    }),
    defineField({
      name: 'focus',
      title: 'Learning focus',
      type: 'text',
      rows: 2,
      group: 'main',
      description: 'One short sentence describing what this class covers.',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 50,
      group: 'main',
      description: 'Lower numbers come first. Use 10, 20, 30 … to leave room to insert.',
      validation: (rule) => rule.min(0).max(999),
    }),
    defineField({
      name: 'isVisible',
      title: 'Show on the website',
      type: 'boolean',
      initialValue: true,
      group: 'settings',
      description: 'Turn off to retire a class without deleting its history.',
    }),
  ],
  orderings: [
    {title: 'Display order', name: 'sortAsc', by: [{field: 'sortOrder', direction: 'asc'}]},
    {title: 'Name', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
    {title: 'Newest first', name: 'newest', by: [{field: '_createdAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'name', subtitle: 'ageRange', isVisible: 'isVisible', sortOrder: 'sortOrder'},
    prepare: ({title, subtitle, isVisible, sortOrder}) => ({
      title: title || 'Class',
      subtitle: isVisible === false ? `Hidden · ${subtitle || ''}` : subtitle,
      description: sortOrder === undefined ? undefined : `Order ${sortOrder}`,
    }),
  },
})
