import {defineArrayMember, defineField, defineType} from 'sanity'

import {ICON_OPTIONS} from '../../../lib/iconNames'

/**
 * Section objects used by the **Admissions** page.
 *
 * Each is deliberately generic so the remaining pages can reuse it:
 * `processStepsSection` suits any "how it works" flow, `faqSection` any
 * question-and-answer list, `calloutSection` any highlighted notice, and
 * `featureImageSection` any single large picture (a brochure, a prospectus, a map).
 *
 * `pageHeroSection` and `pageCtaSection` are shared with every other inner page
 * and live in the same file — they are not duplicated here.
 *
 * Every section repeats the shared `enabled` switch so the Studio behaves
 * identically across pages.
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
/* Numbered process steps                                                     */
/* -------------------------------------------------------------------------- */

/**
 * One step of a numbered flow, e.g. "Collect The Form".
 *
 * The number itself is **not** stored. The website counts the steps and renders
 * 1, 2, 3… in array order, so an editor who inserts or removes a step can never
 * leave a stale number behind.
 */
export const processStepType = defineType({
  name: 'processStep',
  title: 'Step',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 2}),
    defineField({
      name: 'isHighlighted',
      title: 'Highlight this step',
      type: 'boolean',
      initialValue: false,
      description: 'Draws the number circle in the accent colour instead of green.',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description', isHighlighted: 'isHighlighted'},
    prepare: ({title, subtitle, isHighlighted}) => ({
      title: title || 'Step',
      subtitle: isHighlighted ? 'Highlighted' : subtitle,
    }),
  },
})

export const processStepsSectionType = defineType({
  name: 'processStepsSection',
  title: 'Numbered steps',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({
      name: 'anchorId',
      title: 'Anchor id',
      type: 'string',
      group: 'content',
      description: 'Lets buttons and menus link straight to this section, e.g. apply.',
      validation: (rule) =>
        rule.custom((value) =>
          value && /[^a-z0-9-]/.test(value)
            ? 'Use lower-case letters, numbers and hyphens only.'
            : true,
        ),
    }),
    defineField({name: 'header', title: 'Section heading', type: 'sectionHeader', group: 'content'}),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      group: 'content',
      description: 'Drag to reorder. Numbers are generated automatically.',
      validation: (rule) => rule.max(6).warning('More than six steps gets cramped on desktop.'),
      of: [defineArrayMember({type: 'processStep'})],
    }),
  ],
  preview: {
    select: {title: 'header.heading', steps: 'steps', anchorId: 'anchorId'},
    prepare: ({title, steps, anchorId}) => ({
      title: title || 'Numbered steps',
      subtitle: [
        steps?.length ? `${steps.length} steps` : 'No steps yet',
        anchorId ? `#${anchorId}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})

/* -------------------------------------------------------------------------- */
/* Single feature image                                                       */
/* -------------------------------------------------------------------------- */

/**
 * One large image in a framed panel — an admission brochure, a prospectus page,
 * a floor plan. The image is the content; the frame is code.
 */
export const featureImageSectionType = defineType({
  name: 'featureImageSection',
  title: 'Featured image',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({
      name: 'anchorId',
      title: 'Anchor id',
      type: 'string',
      group: 'content',
      description: 'Lets buttons link straight to this image, e.g. download.',
      validation: (rule) =>
        rule.custom((value) =>
          value && /[^a-z0-9-]/.test(value)
            ? 'Use lower-case letters, numbers and hyphens only.'
            : true,
        ),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'imageWithAlt',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      group: 'content',
      description: 'Optional line under the image.',
    }),
    defineField({
      name: 'width',
      title: 'Image width',
      type: 'string',
      group: 'content',
      options: {
        list: [
          {value: 'narrow', title: 'Narrow (reading width)'},
          {value: 'medium', title: 'Medium'},
          {value: 'wide', title: 'Wide'},
        ],
        layout: 'radio',
      },
      initialValue: 'narrow',
    }),
  ],
  preview: {
    select: {title: 'caption', media: 'image.image', anchorId: 'anchorId'},
    prepare: ({title, media, anchorId}) => ({
      title: title || 'Featured image',
      subtitle: anchorId ? `#${anchorId}` : 'Image',
      media,
    }),
  },
})

/* -------------------------------------------------------------------------- */
/* Highlighted callout                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A tinted, bordered notice panel with a heading, a paragraph and an optional
 * button — a referral offer, an important date, a fee warning.
 */
export const calloutSectionType = defineType({
  name: 'calloutSection',
  title: 'Highlighted notice',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({
      name: 'tone',
      title: 'Colour',
      type: 'string',
      group: 'content',
      options: {
        list: [
          {value: 'green', title: 'Green'},
          {value: 'amber', title: 'Amber'},
          {value: 'orange', title: 'Orange'},
        ],
        layout: 'radio',
      },
      initialValue: 'green',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'body', title: 'Text', type: 'text', rows: 3, group: 'content'}),
    defineField({name: 'button', title: 'Button', type: 'button', group: 'content'}),
    defineField({
      name: 'buttonIcon',
      title: 'Button icon',
      type: 'string',
      group: 'content',
      options: {list: [...ICON_OPTIONS], layout: 'dropdown'},
    }),
  ],
  preview: {
    select: {title: 'heading', body: 'body', tone: 'tone'},
    prepare: ({title, body, tone}) => ({
      title: title || 'Highlighted notice',
      subtitle: [tone, body].filter(Boolean).join(' · ') || 'Notice',
    }),
  },
})

/* -------------------------------------------------------------------------- */
/* Frequently asked questions                                                 */
/* -------------------------------------------------------------------------- */

/**
 * One question and its answer. The open/closed behaviour is code; the words are
 * content. `isOpenByDefault` lets the first item start expanded.
 */
export const faqItemType = defineType({
  name: 'faqItem',
  title: 'Question',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isOpenByDefault',
      title: 'Open this one by default',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {title: 'question', subtitle: 'answer', isOpenByDefault: 'isOpenByDefault'},
    prepare: ({title, subtitle, isOpenByDefault}) => ({
      title: title || 'Question',
      subtitle: isOpenByDefault ? `Open by default · ${subtitle}` : subtitle,
    }),
  },
})

export const faqSectionType = defineType({
  name: 'faqSection',
  title: 'Frequently asked questions',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({
      name: 'anchorId',
      title: 'Anchor id',
      type: 'string',
      group: 'content',
      description: 'Lets buttons and menus link straight to this section, e.g. faq.',
      validation: (rule) =>
        rule.custom((value) =>
          value && /[^a-z0-9-]/.test(value)
            ? 'Use lower-case letters, numbers and hyphens only.'
            : true,
        ),
    }),
    defineField({
      name: 'heading',
      title: 'Section heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Supporting line',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      group: 'content',
      description: 'Drag to reorder. Visitors can open one answer at a time.',
      of: [defineArrayMember({type: 'faqItem'})],
    }),
  ],
  preview: {
    select: {title: 'heading', items: 'items', anchorId: 'anchorId'},
    prepare: ({title, items, anchorId}) => ({
      title: title || 'Frequently asked questions',
      subtitle: [
        items?.length ? `${items.length} questions` : 'No questions yet',
        anchorId ? `#${anchorId}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
