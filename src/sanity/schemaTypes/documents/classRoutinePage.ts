import {defineArrayMember, defineField, defineType} from 'sanity'

import {routineSectionType} from '../objects/routine'
import {pageCtaSectionType, pageHeroSectionType, pillarsSectionType} from '../objects/pageSections'

/** The sections an editor can add to this page, as type names. */
const classRoutinePageSectionTypeNames: string[] = [
  pageHeroSectionType,
  routineSectionType,
  pillarsSectionType,
  pageCtaSectionType,
].map((type) => type.name as string)

/**
 * The Class Routine page singleton (`/academics/class-routine`).
 *
 * Same shape as every other page singleton — `sections[]`, drag to reorder, an
 * `enabled` switch per section. It is a **separate document** from `academicsPage`
 * because it is a separate URL, with its own SEO and its own place in the
 * Presentation Tool.
 *
 * The document id is fixed to `classRoutinePage`, which is what lets the GROQ be
 * `*[_type == "classRoutinePage"][0]` with no slug lookup.
 */
export const classRoutinePageType = defineType({
  name: 'classRoutinePage',
  title: 'Class routine page',
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
      initialValue: 'Class routine page',
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
      of: classRoutinePageSectionTypeNames.map((type) => defineArrayMember({type})),
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
      title: title || 'Class routine page',
      subtitle: sections?.length ? `${sections.length} sections` : 'No sections yet',
    }),
  },
})
