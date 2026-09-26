import {defineField, defineType} from 'sanity'

/**
 * A member of staff — the principal, a teacher, or anyone else the school wants
 * to introduce with a name, a role and a photograph.
 *
 * This is a **reusable document**: pages reference it rather than copying its
 * fields, so correcting a name or swapping a photograph updates every page at
 * once. See `WEBSITE_SPEC.md` §3.
 *
 * One schema covers both roles the school needs today:
 * - the **principal** fills in `message` and `quote`,
 * - **teachers** fill in `shortBio`.
 * The unused fields simply do not render.
 */
export const personType = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  groups: [
    {name: 'main', title: 'Profile', default: true},
    {name: 'message', title: 'Personal message'},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Full name',
      type: 'string',
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'designation',
      title: 'Role or designation',
      type: 'string',
      group: 'main',
      description: 'Shown in small capitals under the name.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role on the website',
      type: 'string',
      group: 'main',
      options: {
        list: [
          {value: 'principal', title: 'Principal / Founder'},
          {value: 'teacher', title: 'Teacher'},
          {value: 'staff', title: 'Staff'},
        ],
        layout: 'radio',
      },
      initialValue: 'teacher',
      description: 'Decides which card layout the website uses.',
    }),
    defineField({
      name: 'photo',
      title: 'Photograph',
      type: 'imageWithAlt',
      group: 'main',
      description: 'Portrait orientation (4:5) works best in the team grid.',
    }),
    defineField({
      name: 'badge',
      title: 'Corner badge',
      type: 'string',
      group: 'main',
      description: 'Optional small label in the top-right of the photo, e.g. Placeholder.',
    }),
    defineField({
      name: 'photoPlaceholderLabel',
      title: 'Label shown when there is no photo',
      type: 'string',
      group: 'main',
      description: 'Shown instead of a photograph, e.g. Photo Coming Soon.',
    }),
    defineField({
      name: 'shortBio',
      title: 'Short bio',
      type: 'text',
      rows: 3,
      group: 'main',
      description: 'One or two sentences for the team grid card.',
    }),

    defineField({
      name: 'message',
      title: 'Welcome message',
      type: 'array',
      group: 'message',
      of: [{type: 'text'}],
      description: 'One paragraph per item. Used by the principal profile.',
    }),
    defineField({
      name: 'quote',
      title: 'Pull quote',
      type: 'string',
      group: 'message',
      description: 'A short line set in italics, e.g. the school motto.',
    }),
    defineField({
      name: 'quoteAttribution',
      title: 'Quote attribution',
      type: 'string',
      group: 'message',
      description: 'Small grey line under the quote.',
    }),

    defineField({
      name: 'isVisible',
      title: 'Show on the website',
      type: 'boolean',
      initialValue: true,
      group: 'settings',
      description: 'Turn off to hide this person without deleting them.',
    }),
  ],
  orderings: [
    {title: 'Name', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
    {title: 'Newest first', name: 'newest', by: [{field: '_createdAt', direction: 'desc'}]},
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'designation',
      media: 'photo.image',
      role: 'role',
      isVisible: 'isVisible',
    },
    prepare: ({title, subtitle, media, role, isVisible}) => ({
      title: title || 'Person',
      subtitle: isVisible === false ? `Hidden · ${subtitle || ''}` : subtitle,
      media,
      description: role === 'principal' ? 'Principal' : undefined,
    }),
  },
})
