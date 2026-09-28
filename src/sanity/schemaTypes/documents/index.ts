import {defineArrayMember, defineField, defineType} from 'sanity'

import {homeSectionTypeNames} from '../objects/sections'

/* -------------------------------------------------------------------------- */
/* Home page                                                                  */
/* -------------------------------------------------------------------------- */

export const homePageType = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Page sections', default: true},
    {name: 'seo', title: 'SEO'},
    {name: 'settings', title: 'Page settings'},
  ],
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Internal title',
      type: 'string',
      initialValue: 'Home page',
      group: 'settings',
      description: 'Only shown inside the Studio.',
    }),
    defineField({
      name: 'sections',
      title: 'Page sections',
      type: 'array',
      group: 'content',
      description:
        'Drag sections to reorder them. Turn off "Show this section on the website" to hide a section without touching code.',
      of: homeSectionTypeNames.map((type) => defineArrayMember({type})),
    }),
    defineField({
      name: 'seo',
      title: 'Search engines & social sharing',
      type: 'seo',
      group: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Home page sections',
      name: 'homeSections',
      by: [{field: '_updatedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'internalTitle', sections: 'sections'},
    prepare: ({title, sections}) => ({
      title: title || 'Home page',
      subtitle: sections?.length ? `${sections.length} sections` : 'No sections yet',
    }),
  },
})

/* -------------------------------------------------------------------------- */
/* Site settings                                                              */
/* -------------------------------------------------------------------------- */

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    {name: 'identity', title: 'School identity', default: true},
    {name: 'contact', title: 'Contact & social'},
    {name: 'footer', title: 'Footer'},
    {name: 'floating', title: 'Floating buttons'},
    {name: 'seo', title: 'SEO defaults'},
  ],
  fields: [
    defineField({name: 'internalTitle', title: 'Internal title', type: 'string', hidden: true}),
    defineField({
      name: 'brand',
      title: 'School identity',
      type: 'brand',
      group: 'identity',
      description: 'Name, short name and logo used across the header, footer and social previews.',
    }),
    defineField({
      name: 'contact',
      title: 'Contact details',
      type: 'contactBlock',
      group: 'contact',
      description:
        'Shown in the footer and the top bar. This is the school\'s single source of truth for its address, phone numbers and email — keep it identical to the Contact page.',
    }),
    defineField({
      name: 'postalAddress',
      title: 'Postal address (for search engines)',
      type: 'postalAddress',
      group: 'contact',
      description:
        'The same address, split into parts, for the structured data search engines read. Keep it in step with "Contact details".',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social profiles',
      type: 'array',
      group: 'contact',
      of: [defineArrayMember({type: 'socialLink'})],
    }),
    defineField({name: 'footer', title: 'Footer', type: 'footer', group: 'footer'}),
    defineField({
      name: 'floatingContact',
      title: 'Floating contact button',
      type: 'floatingContact',
      group: 'floating',
    }),
    defineField({
      name: 'seo',
      title: 'SEO defaults',
      type: 'seo',
      group: 'seo',
      description: 'Used by any page that does not set its own title, description or share image.',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site settings', subtitle: 'Identity, contact, footer and SEO defaults'}),
  },
})

/* -------------------------------------------------------------------------- */
/* Reusable content documents                                                 */
/* -------------------------------------------------------------------------- */

export const studentSpotlightType = defineType({
  name: 'studentSpotlight',
  title: 'Student spotlight',
  type: 'document',
  groups: [
    {name: 'main', title: 'Student', default: true},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Student name',
      type: 'string',
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'classLabel',
      title: 'Class',
      type: 'string',
      group: 'main',
      description: 'Example: Class II',
    }),
    defineField({
      name: 'photo',
      title: 'Photograph',
      type: 'imageWithAlt',
      group: 'main',
    }),
    defineField({
      name: 'cohortLabel',
      title: 'Cohort label',
      type: 'string',
      group: 'main',
      description: 'Small grey line under the name, e.g. J.I.D.S. Cohort',
    }),
    defineField({
      name: 'schoolName',
      title: 'School admitted to',
      type: 'string',
      group: 'main',
      description: 'Shown in the green pill on the card.',
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'text',
      rows: 2,
      group: 'main',
    }),
    defineField({
      name: 'isVisible',
      title: 'Show on the website',
      type: 'boolean',
      initialValue: true,
      group: 'settings',
    }),
  ],
  orderings: [
    {title: 'Name', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
    {title: 'Newest first', name: 'newest', by: [{field: '_createdAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'name', subtitle: 'schoolName', media: 'photo.image', isVisible: 'isVisible'},
    prepare: ({title, subtitle, media, isVisible}) => ({
      title: title || 'Student spotlight',
      subtitle: isVisible === false ? `Hidden · ${subtitle || ''}` : subtitle,
      media,
    }),
  },
})

export const newsPostType = defineType({
  name: 'newsPost',
  title: 'News & event',
  type: 'document',
  groups: [
    {name: 'main', title: 'Post', default: true},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'main',
      description: 'Short uppercase label, e.g. Academics',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'main',
      description: 'One or two sentences shown on the card.',
    }),
    defineField({name: 'image', title: 'Image', type: 'imageWithAlt', group: 'main'}),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'main',
      options: {source: 'title', maxLength: 96},
      description: 'Click "Generate". The post opens at /news/<this>.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'datetime',
      group: 'main',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'body',
      title: 'Full article',
      type: 'array',
      group: 'main',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({type: 'imageWithAlt', title: 'Image'}),
      ],
    }),
    defineField({
      name: 'link',
      title: 'Read more link',
      type: 'link',
      group: 'main',
      description: 'Optional. Leave empty for a card that does not link anywhere yet.',
    }),
    defineField({
      name: 'isVisible',
      title: 'Show on the website',
      type: 'boolean',
      initialValue: true,
      group: 'settings',
    }),
  ],
  orderings: [
    {title: 'Newest first', name: 'newest', by: [{field: '_createdAt', direction: 'desc'}]},
    {title: 'Title', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', category: 'category', media: 'image.image', isVisible: 'isVisible'},
    prepare: ({title, category, media, isVisible}) => ({
      title: title || 'News & event',
      subtitle: isVisible === false ? `Hidden · ${category || ''}` : category,
      media,
    }),
  },
})
