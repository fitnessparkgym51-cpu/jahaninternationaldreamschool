import {defineArrayMember, defineField, defineType} from 'sanity'

import {
  calloutSectionType,
  faqSectionType,
  featureImageSectionType,
  processStepsSectionType,
} from '../objects/admissionSections'
import {pageCtaSectionType, pageHeroSectionType} from '../objects/pageSections'

/**
 * The sections an editor can add to this page, as type names. `defineArrayMember`
 * takes a name, not the type object.
 */
const admissionsSectionTypeNames: string[] = [
  pageHeroSectionType,
  processStepsSectionType,
  featureImageSectionType,
  calloutSectionType,
  faqSectionType,
  pageCtaSectionType,
].map((type) => type.name as string)

/**
 * The Admissions page singleton.
 *
 * Same shape as `homePage` and `aboutPage` — `sections[]`, drag to reorder, an
 * `enabled` switch per section — so the Studio behaves the same way and future
 * pages copy this file as their starting point.
 *
 * The document id is fixed to `admissionsPage` (see `structure.ts`), which is what
 * lets the GROQ be `*[_type == "admissionsPage"][0]` with no slug lookup.
 */
export const admissionsPageType = defineType({
  name: 'admissionsPage',
  title: 'Admissions page',
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
      initialValue: 'Admissions page',
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
      of: admissionsSectionTypeNames.map((type) => defineArrayMember({type})),
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
      title: title || 'Admissions page',
      subtitle: sections?.length ? `${sections.length} sections` : 'No sections yet',
    }),
  },
})
