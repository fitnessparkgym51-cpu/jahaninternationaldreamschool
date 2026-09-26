import {defineArrayMember, defineField, defineType} from 'sanity'

import {innerPageSectionTypeNames} from '../objects/pageSections'

/**
 * The About page singleton.
 *
 * Mirrors the Home page's shape exactly — `sections[]`, drag to reorder, an
 * `enabled` switch per section — so the Studio behaves the same way and future
 * pages can copy this file as their starting point.
 *
 * The document id is fixed to `aboutPage` (see `structure.ts`), which is what
 * lets the GROQ be `*[_type == "aboutPage"][0]` with no slug lookup.
 */
export const aboutPageType = defineType({
  name: 'aboutPage',
  title: 'About page',
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
      initialValue: 'About page',
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
      of: innerPageSectionTypeNames.map((type) => defineArrayMember({type})),
    }),
    defineField({
      name: 'seo',
      title: 'Search engines & social sharing',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: {title: 'internalTitle', sections: 'sections'},
    prepare: ({title, sections}) => ({
      title: title || 'About page',
      subtitle: sections?.length ? `${sections.length} sections` : 'No sections yet',
    }),
  },
})
