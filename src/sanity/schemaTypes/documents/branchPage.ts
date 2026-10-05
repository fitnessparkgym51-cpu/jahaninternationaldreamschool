import {defineArrayMember, defineField, defineType} from 'sanity'

import {ICON_OPTIONS} from '../../../lib/iconNames'

/**
 * The Branch landing page singleton (`/branch`).
 *
 * Fixed layout: hero (text + image) → feature strip → mission (image + text) →
 * programs → teachers. Each block has a "Show" switch. Page-specific objects are
 * inline because nothing else on the site reuses them.
 */

const iconItem = defineArrayMember({
  type: 'object',
  name: 'branchIconItem',
  title: 'Item',
  fields: [
    defineField({name: 'icon', title: 'Icon', type: 'string', options: {list: [...ICON_OPTIONS], layout: 'dropdown'}}),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'text', title: 'Text', type: 'string'}),
  ],
  preview: {select: {title: 'title', subtitle: 'text'}},
})

const show = defineField({name: 'enabled', title: 'Show this section', type: 'boolean', initialValue: true})
const eyebrow = defineField({name: 'eyebrow', title: 'Small label above heading', type: 'string'})
const heading = defineField({name: 'heading', title: 'Heading', type: 'string'})

export const branchPageType = defineType({
  name: 'branchPage',
  title: 'Branch page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'internalTitle', title: 'Internal title', type: 'string', initialValue: 'Branch page', group: 'content'}),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'content',
      fields: [
        eyebrow,
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'text',
          rows: 2,
          description: 'Press Enter to start a new line.',
        }),
        defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
        defineField({name: 'button', title: 'Button', type: 'button'}),
        defineField({name: 'image', title: 'Image', type: 'imageWithAlt'}),
      ],
    }),
    defineField({
      name: 'features',
      title: 'Feature strip',
      type: 'object',
      group: 'content',
      fields: [show, defineField({name: 'items', title: 'Items', type: 'array', of: [iconItem]})],
    }),
    defineField({
      name: 'about',
      title: 'Mission section',
      type: 'object',
      group: 'content',
      fields: [
        show,
        defineField({name: 'image', title: 'Image', type: 'imageWithAlt'}),
        eyebrow,
        heading,
        defineField({name: 'paragraphs', title: 'Paragraphs', type: 'array', of: [defineArrayMember({type: 'text', rows: 3})]}),
        defineField({name: 'button', title: 'Button', type: 'button'}),
      ],
    }),
    defineField({
      name: 'programs',
      title: 'Programs section',
      type: 'object',
      group: 'content',
      fields: [show, eyebrow, heading, defineField({name: 'items', title: 'Programs', type: 'array', of: [iconItem]})],
    }),
    defineField({
      name: 'teachers',
      title: 'Teachers section',
      type: 'object',
      group: 'content',
      fields: [
        show,
        eyebrow,
        heading,
        defineField({
          name: 'items',
          title: 'Teachers',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'branchTeacher',
              title: 'Teacher',
              fields: [
                defineField({
                  name: 'name',
                  title: 'Name',
                  type: 'string',
                  description: 'Full name of the teacher.',
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: 'role',
                  title: 'Subject / role',
                  type: 'string',
                  description: 'e.g. Quran & Tajweed, Arabic Language, etc.',
                }),
                defineField({
                  name: 'photo',
                  title: 'Photo (optional)',
                  type: 'imageWithAlt',
                  description: 'Upload teacher photo. Shows a default avatar icon if not provided.',
                }),
              ],
              preview: {
                select: {title: 'name', subtitle: 'role', media: 'photo.image'},
                prepare: ({title, subtitle, media}) => ({
                  title: title || 'Teacher',
                  subtitle: subtitle || 'Instructor',
                  media,
                }),
              },
            }),
          ],
        }),
      ],
    }),
    defineField({name: 'seo', title: 'Search engines & social sharing', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Branch page'})},
})
