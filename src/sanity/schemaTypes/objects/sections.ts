import {defineArrayMember, defineField, defineType} from 'sanity'

import {FEATURE_ICON_OPTIONS} from '../lists/featureIcons'

/** Shared "show this section" switch so editors can hide sections without code. */
const enabledField = defineField({
  name: 'enabled',
  title: 'Show this section on the website',
  type: 'boolean',
  initialValue: true,
  group: 'settings',
})

const settingsGroup = {name: 'settings', title: 'Section settings', default: true}

export const heroSlideType = defineType({
  name: 'heroSlide',
  title: 'Background slide',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Background image',
      type: 'imageWithAlt',
      validation: (rule) => rule.required(),
    }),    defineField({
      name: 'isVisible',
      title: 'Show this slide',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: 'image.alt', media: 'image.image', isVisible: 'isVisible'},
    prepare: ({title, media, isVisible}) => ({
      title: title || 'Background slide',
      media,
      subtitle: isVisible === false ? 'Hidden' : undefined,
    }),
  },
})

export const heroSectionType = defineType({
  name: 'heroSection',
  title: 'Hero banner',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}, {name: 'slides', title: 'Background slides'}],
  fields: [
    enabledField,
    defineField({
      name: 'eyebrow',
      title: 'Badge above the heading',
      type: 'string',
      description: 'Small pill with the school name and establishment year.',
      group: 'content',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      group: 'content',
    }),
    defineField({
      name: 'primaryButton',
      title: 'Primary button',
      type: 'button',
      group: 'content',
    }),
    defineField({
      name: 'secondaryButton',
      title: 'Secondary button',
      type: 'button',
      group: 'content',
    }),
    defineField({
      name: 'highlightBadge',
      title: 'Highlight badge',
      type: 'string',
      description: 'Small glass pill under the buttons.',
      group: 'content',
    }),
    defineField({
      name: 'autoplaySeconds',
      title: 'Rotate slides every (seconds)',
      type: 'number',
      group: 'content',
      description: 'Set to 0 to stop rotating automatically.',
      validation: (rule) => rule.min(0).max(30),
    }),
    defineField({
      name: 'slides',
      title: 'Background slides',
      type: 'array',
      group: 'slides',
      of: [defineArrayMember({type: 'heroSlide'})],
    }),
  ],
  preview: {
    select: {title: 'heading', media: 'slides.0.image.image'},
    prepare: ({title, media}) => ({title: title || 'Hero banner', media, subtitle: 'Hero'}),
  },
})

export const statItemType = defineType({
  name: 'statItem',
  title: 'Statistic',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'Large text, e.g. "Estd. 2021", "100%", "4.9 ★".',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'isSmaller',
      title: 'Use smaller value text',
      type: 'boolean',
      initialValue: false,
      description: 'Turn on for long values such as "Play to Class V".',
    }),
  ],
  preview: {
    select: {title: 'value', subtitle: 'label'},
  },
})

export const statsBarSectionType = defineType({
  name: 'statsBarSection',
  title: 'Key statistics bar',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Statistics'}],
  fields: [
    enabledField,
    defineField({
      name: 'items',
      title: 'Statistics',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.max(4).warning('The bar looks best with four items.'),
      of: [defineArrayMember({type: 'statItem'})],
    }),
  ],
  preview: {
    select: {items: 'items'},
    prepare: ({items}) => ({
      title: 'Key statistics bar',
      subtitle: items?.length ? `${items.length} statistics` : 'No statistics yet',
    }),
  },
})

export const featureCardType = defineType({
  name: 'featureCard',
  title: 'Feature card',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {list: FEATURE_ICON_OPTIONS, layout: 'dropdown'},
    }),
    defineField({
      name: 'iconImage',
      title: 'Picture icon',
      type: 'imageWithAlt',
      description: 'Optional colourful picture. When set, it replaces the icon above.',
    }),
    defineField({
      name: 'badge',
      title: 'Corner badge',
      type: 'string',
      description: 'Optional small label in the top-right corner, e.g. SMART',
    }),
    defineField({
      name: 'useAmberIcon',
      title: 'Amber coloured icon',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
    defineField({
      name: 'isVisible',
      title: 'Show this card',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description', icon: 'icon', isVisible: 'isVisible'},
    prepare: ({title, subtitle, icon, isVisible}) => ({
      title: title || 'Feature card',
      subtitle: isVisible === false ? `Hidden · ${icon || 'no icon'}` : icon || subtitle,
    }),
  },
})

export const featuresSectionType = defineType({
  name: 'featuresSection',
  title: 'Why choose us (feature grid)',
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
      name: 'cards',
      title: 'Feature cards',
      type: 'array',
      group: 'content',
      description: 'Drag to reorder. Three columns on desktop, one on mobile.',
      of: [defineArrayMember({type: 'featureCard'})],
    }),
  ],
  preview: {
    select: {title: 'header.heading', cards: 'cards'},
    prepare: ({title, cards}) => ({
      title: title || 'Why choose us',
      subtitle: cards?.length ? `${cards.length} cards` : 'No cards yet',
    }),
  },
})

export const aboutStorySectionType = defineType({
  name: 'aboutStorySection',
  title: 'Our story (image + text)',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'imageWithAlt',
      group: 'content',
    }),
    defineField({
      name: 'eyebrow',
      title: 'Badge above the heading',
      type: 'string',
      group: 'content',
    }),
    defineField({name: 'heading', title: 'Heading', type: 'string', group: 'content'}),
    defineField({
      name: 'body',
      title: 'Paragraphs',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'text'})],
      description: 'One paragraph per item.',
    }),
    defineField({name: 'link', title: 'Link', type: 'link', group: 'content'}),
    defineField({
      name: 'metaText',
      title: 'Note next to the link',
      type: 'string',
      group: 'content',
      description: 'Short text shown after a divider, e.g. Playgroup to Primary',
    }),
  ],
  preview: {
    select: {title: 'heading', media: 'image.image'},
    prepare: ({title, media}) => ({title: title || 'Our story', media, subtitle: 'Story'}),
  },
})

export const studentSpotlightSectionType = defineType({
  name: 'studentSpotlightSection',
  title: 'Student success stories',
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
      name: 'students',
      title: 'Students',
      type: 'array',
      group: 'content',
      description: 'Pick students from the Student spotlights list. Drag to reorder.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'studentSpotlight'}]})],
    }),
    defineField({name: 'cta', title: 'Button below the grid', type: 'button', group: 'content'}),
  ],
  preview: {
    select: {title: 'header.heading', students: 'students'},
    prepare: ({title, students}) => ({
      title: title || 'Student success stories',
      subtitle: students?.length ? `${students.length} students` : 'No students selected',
    }),
  },
})

export const admissionBannerSectionType = defineType({
  name: 'admissionBannerSection',
  title: 'Admissions call-to-action',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({
      name: 'anchorId',
      title: 'Anchor id',
      type: 'string',
      group: 'content',
      description: 'Links from other sections jump here, e.g. admission',
    }),
    defineField({name: 'badge', title: 'Badge text', type: 'string', group: 'content'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', group: 'content'}),
    defineField({name: 'primaryButton', title: 'Primary button', type: 'button', group: 'content'}),
    defineField({name: 'secondaryButton', title: 'Secondary button', type: 'button', group: 'content'}),
  ],
  preview: {
    select: {title: 'heading'},
    prepare: ({title}) => ({title: title || 'Admissions call-to-action', subtitle: 'Banner'}),
  },
})

export const newsSectionType = defineType({
  name: 'newsSection',
  title: 'News & events',
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
      name: 'posts',
      title: 'News items',
      type: 'array',
      group: 'content',
      description: 'Pick posts from the News & events list. Drag to reorder.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'newsPost'}]})],
    }),
  ],
  preview: {
    select: {title: 'header.heading', posts: 'posts'},
    prepare: ({title, posts}) => ({
      title: title || 'News & events',
      subtitle: posts?.length ? `${posts.length} items` : 'No items selected',
    }),
  },
})

export const reviewBarSectionType = defineType({
  name: 'reviewBarSection',
  title: 'Google reviews bar',
  type: 'object',
  groups: [settingsGroup, {name: 'content', title: 'Content'}],
  fields: [
    enabledField,
    defineField({
      name: 'brandLabel',
      title: 'Platform name',
      type: 'string',
      group: 'content',
      description: 'Rendered in brand colours, e.g. Google',
    }),
    defineField({name: 'score', title: 'Score', type: 'string', group: 'content'}),
    defineField({name: 'summary', title: 'Summary line', type: 'string', group: 'content'}),
    defineField({
      name: 'stars',
      title: 'Number of stars',
      type: 'number',
      group: 'content',
      validation: (rule) => rule.min(0).max(5),
    }),
    defineField({name: 'primaryButton', title: 'Primary button', type: 'button', group: 'content'}),
    defineField({name: 'secondaryButton', title: 'Secondary button', type: 'button', group: 'content'}),
  ],
  preview: {
    select: {score: 'score', summary: 'summary'},
    prepare: ({score, summary}) => ({
      title: 'Google reviews bar',
      subtitle: [score, summary].filter(Boolean).join(' · ') || 'No rating set',
    }),
  },
})

export const homeSectionTypes = [
  heroSectionType,
  statsBarSectionType,
  featuresSectionType,
  aboutStorySectionType,
  studentSpotlightSectionType,
  admissionBannerSectionType,
  newsSectionType,
  reviewBarSectionType,
]

/** Type names of every section an editor can add to the Home page. */
export const homeSectionTypeNames: string[] = homeSectionTypes.map((type) => type.name as string)
