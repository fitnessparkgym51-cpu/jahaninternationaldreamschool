import {defineArrayMember, defineField, defineType} from 'sanity'

import {ICON_OPTIONS} from '../../../lib/iconNames'

/**
 * Section objects for the **inner** pages (About, Academics, Admissions, …).
 *
 * These are intentionally generic. `pageHeroSection` and `pageCtaSection` are the
 * two blocks that every inner page needs, so they are defined once here and
 * reused by all of them rather than copied per page. See `WEBSITE_SPEC.md` §3.
 *
 * Every section repeats the shared `enabled` switch and the `settings` group from
 * `sections.ts`, so the Studio behaves identically across pages.
 */

const enabledField = defineField({
  name: 'enabled',
  title: 'Show this section on the website',
  type: 'boolean',
  initialValue: true,
  group: 'settings',
})

const settingsGroup = {name: 'settings', title: 'Section settings', default: true}

/* -------------------------------------------------------------------------- */
/* Page hero banner                                                            */
/* -------------------------------------------------------------------------- */

/** One step of the breadcrumb trail. The final step is the page itself. */
export const breadcrumbItemType = defineType({
  name: 'breadcrumbItem',
  title: 'Breadcrumb step',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Text',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link to',
      type: 'string',
      description: 'Leave empty for the last step, which is the current page.',
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'url'},
    prepare: ({title, subtitle}) => ({
      title: title || 'Breadcrumb step',
      subtitle: subtitle || 'Current page (not a link)',
    }),
  },
})

export const pageHeroSectionType = defineType({
  name: 'pageHeroSection',
  title: 'Page header',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({
      name: 'heading',
      title: 'Page heading',
      type: 'string',
      group: 'content',
      description: 'The single main heading at the top of the page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Supporting line',
      type: 'string',
      group: 'content',
      description: 'Optional sentence under the heading.',
    }),
    defineField({
      name: 'crumbs',
      title: 'Breadcrumb trail',
      type: 'array',
      group: 'content',
      description: 'Home, then each parent page. The last one is not a link.',
      of: [defineArrayMember({type: 'breadcrumbItem'})],
    }),
  ],
  preview: {
    select: {title: 'heading', crumbs: 'crumbs'},
    prepare: ({title, crumbs}) => ({
      title: title || 'Page header',
      subtitle: crumbs?.length ? `Breadcrumb · ${crumbs.length} steps` : 'Page header',
    }),
  },
})

/* -------------------------------------------------------------------------- */
/* Principal profile                                                           */
/* -------------------------------------------------------------------------- */

/**
 * The school leader's profile: a portrait beside a welcome message.
 *
 * The person's name, role, photograph, message and quote live on the referenced
 * `person` document — not here. The section owns only its own heading and the
 * reference itself.
 */
export const principalSectionType = defineType({
  name: 'principalSection',
  title: 'Principal profile',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({
      name: 'header',
      title: 'Section heading',
      type: 'sectionHeader',
      group: 'content',
    }),
    defineField({
      name: 'principal',
      title: 'Principal',
      type: 'reference',
      group: 'content',
      to: [{type: 'person'}],
      description: 'Pick the person whose role is "Principal / Founder".',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'header.heading', name: 'principal.name', media: 'principal.photo.image'},
    prepare: ({title, name, media}) => ({
      title: title || 'Principal profile',
      subtitle: name || 'No principal selected',
      media,
    }),
  },
})

/* -------------------------------------------------------------------------- */
/* Team grid                                                                   */
/* -------------------------------------------------------------------------- */

/** A grid of people, e.g. the teaching team. */
export const peopleGridSectionType = defineType({
  name: 'peopleGridSection',
  title: 'Team grid',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({
      name: 'anchorId',
      title: 'Anchor id',
      type: 'string',
      group: 'content',
      description:
        'Lets other pages link straight to this section, e.g. our-teachers. Lower case, no spaces.',
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
      name: 'people',
      title: 'People',
      type: 'array',
      group: 'content',
      description: 'Pick people from the People list. Drag to reorder.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'person'}]})],
    }),
    defineField({
      name: 'emptyStateText',
      title: 'Message shown when nobody is listed',
      type: 'string',
      group: 'content',
      description: 'Leave empty to hide the notice entirely.',
    }),
    defineField({name: 'cta', title: 'Button below the grid', type: 'button', group: 'content'}),
  ],
  preview: {
    select: {title: 'header.heading', people: 'people', anchorId: 'anchorId'},
    prepare: ({title, people, anchorId}) => ({
      title: title || 'Team grid',
      subtitle: [
        people?.length ? `${people.length} people` : 'No people selected yet',
        anchorId ? `#${anchorId}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})

/* -------------------------------------------------------------------------- */
/* Guiding philosophy                                                          */
/* -------------------------------------------------------------------------- */

/** One of the school's defining statements — vision, mission, values. */
export const pillarCardType = defineType({
  name: 'pillarCard',
  title: 'Pillar',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {list: [...ICON_OPTIONS], layout: 'dropdown'},
    }),
    defineField({
      name: 'tone',
      title: 'Icon colour',
      type: 'string',
      options: {
        list: [
          {value: 'green', title: 'Green'},
          {value: 'orange', title: 'Orange'},
          {value: 'amber', title: 'Amber'},
        ],
        layout: 'radio',
      },
      initialValue: 'green',
      description: 'Tints the icon tile so neighbouring pillars stay distinguishable.',
    }),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 4}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description', icon: 'icon', tone: 'tone'},
    prepare: ({title, subtitle, icon, tone}) => ({
      title: title || 'Pillar',
      subtitle: [icon, tone].filter(Boolean).join(' · ') || subtitle,
    }),
  },
})

export const pillarsSectionType = defineType({
  name: 'pillarsSection',
  title: 'Pillars (vision, mission, values)',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({
      name: 'header',
      title: 'Section heading',
      type: 'sectionHeader',
      group: 'content',
    }),
    defineField({
      name: 'pillars',
      title: 'Pillars',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.max(4).warning('Three pillars read best on desktop.'),
      of: [defineArrayMember({type: 'pillarCard'})],
    }),
  ],
  preview: {
    select: {title: 'header.heading', pillars: 'pillars'},
    prepare: ({title, pillars}) => ({
      title: title || 'Pillars',
      subtitle: pillars?.length ? `${pillars.length} pillars` : 'No pillars yet',
    }),
  },
})

/* -------------------------------------------------------------------------- */
/* Closing call to action                                                      */
/* -------------------------------------------------------------------------- */

/** The coloured band that closes an inner page. Reused by every inner page. */
export const pageCtaSectionType = defineType({
  name: 'pageCtaSection',
  title: 'Closing call to action',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({name: 'badge', title: 'Badge text', type: 'string', group: 'content'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'subheading', title: 'Supporting text', type: 'text', rows: 2, group: 'content'}),
    defineField({name: 'primaryButton', title: 'Primary button', type: 'button', group: 'content'}),
    defineField({name: 'secondaryButton', title: 'Secondary button', type: 'button', group: 'content'}),
  ],
  preview: {
    select: {title: 'heading', badge: 'badge'},
    prepare: ({title, badge}) => ({
      title: title || 'Call to action',
      subtitle: badge || 'Closing band',
    }),
  },
})

/** Every section an editor can add to an inner page. */
export const innerPageSectionTypes = [
  pageHeroSectionType,
  principalSectionType,
  peopleGridSectionType,
  pillarsSectionType,
  pageCtaSectionType,
]

/** Type names of the inner-page sections, for the `sections` array. */
export const innerPageSectionTypeNames: string[] = innerPageSectionTypes.map(
  (type) => type.name as string,
)
