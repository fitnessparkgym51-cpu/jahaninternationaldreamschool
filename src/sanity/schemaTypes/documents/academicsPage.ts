import {defineArrayMember, defineField, defineType} from 'sanity'

import {classTableSectionType} from '../objects/classTable'
import {pageCtaSectionType, pageHeroSectionType, pillarsSectionType} from '../objects/pageSections'

/** The sections an editor can add to this page, as type names. */
const academicsSectionTypeNames: string[] = [
  pageHeroSectionType,
  classTableSectionType,
  pillarsSectionType,
  pageCtaSectionType,
].map((type) => type.name as string)

/**
 * The Academics page singleton (`/academics`).
 *
 * Same shape as `homePage`, `aboutPage` and `admissionsPage` — `sections[]`, drag
 * to reorder, an `enabled` switch per section — so the Studio behaves identically
 * and this file is the starting point for each remaining page.
 *
 * The document id is fixed to `academicsPage` (see `structure.ts`), which is what
 * lets the GROQ be `*[_type == "academicsPage"][0]` with no slug lookup.
 */
export const academicsPageType = defineType({
  name: 'academicsPage',
  title: 'Academics page',
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
      initialValue: 'Academics page',
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
      of: academicsSectionTypeNames.map((type) => defineArrayMember({type})),
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
      title: title || 'Academics page',
      subtitle: sections?.length ? `${sections.length} sections` : 'No sections yet',
    }),
  },
})
