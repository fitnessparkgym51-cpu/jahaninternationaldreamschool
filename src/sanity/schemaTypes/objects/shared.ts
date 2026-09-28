import {defineField, defineType} from 'sanity'

import {ICON_OPTIONS, type IconName} from '../../../lib/iconNames'

/** Reusable image + alt text pair used anywhere the CMS manages a picture. */
export const imageWithAltType = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image file',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describes the image for screen readers and search engines.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'alt', media: 'image'},
    prepare: ({title, media}) => ({title: title || 'Image', media, subtitle: 'Image'}),
  },
})

/** Icon picker field shared by navigation, contact lists and cards. */
export function iconField(name = 'icon', title = 'Icon') {
  return defineField({
    name,
    title,
    type: 'string',
    options: {list: [...ICON_OPTIONS], layout: 'dropdown'},
  })
}

export type {IconName}

/** A simple label + destination link. */
export const linkType = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL or page path',
      type: 'string',
      description: 'Example: /about-us or https://example.com/page',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'newTab',
      title: 'Open in a new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'url'},
  },
})

export const buttonVariants = [
  {value: 'primary', title: 'Primary (filled orange)'},
  {value: 'green', title: 'Primary (filled green)'},
  {value: 'outline', title: 'Outline'},
  {value: 'light', title: 'Light / glass'},
  {value: 'invert', title: 'Outline on colour (fills white on hover)'},
  {value: 'white', title: 'Solid white (dark text)'},
  {value: 'link', title: 'Text link (no border)'},
] as const

export type ButtonVariant = (typeof buttonVariants)[number]['value']

/** Call-to-action button: label, destination and visual style. */
export const buttonType = defineType({
  name: 'button',
  title: 'Button',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Button text',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Button URL',
      type: 'string',
      description: 'Example: /admissions or https://wa.me/8801...',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'newTab',
      title: 'Open in a new tab',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'variant',
      title: 'Button style',
      type: 'string',
      options: {list: [...buttonVariants], layout: 'radio'},
      initialValue: 'primary',
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'url', variant: 'variant'},
    prepare: ({title, subtitle, variant}) => ({
      title: title || 'Button',
      subtitle: `${subtitle || 'No URL'} · ${variant || 'primary'}`,
    }),
  },
})

/** Page level search engine + social sharing settings. */
export const seoType = defineType({
  name: 'seo',
  title: 'Search engines & social sharing',
  type: 'object',
  options: {collapsible: true, collapsed: false},
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Page title',
      type: 'string',
      description:
        'Shown as the blue link in Google. "Jahan International Dream School" is added after it automatically unless this title already names the school. Falls back to Site settings › SEO › default title.',
      validation: (rule) => rule.max(60).warning('Keep the title under 60 characters.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'Shown under the title in Google. Falls back to Site settings › SEO › default description.',
      validation: (rule) => rule.max(160).warning('Keep the description under 160 characters.'),
    }),
    defineField({
      name: 'shareImage',
      title: 'Social share image',
      type: 'imageWithAlt',
      description: 'Used for Facebook / WhatsApp previews (recommended 1200 × 630 px).',
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description:
        'Optional, and advanced. Only set this if the same content is genuinely published on several URLs. Leave empty to let the site use this page\'s own address.',
    }),
    defineField({
      name: 'appendSiteName',
      title: 'Add the school name to the page title',
      type: 'boolean',
      initialValue: true,
      description:
        'On: the school name is added after " | " unless the title already contains it. Turn this off only for a page about a different organisation.',
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
      description:
        'Adds a "noindex" tag and removes the page from the sitemap. The page stays reachable by anyone with the link.',
    }),
  ],
})

/** Heading + sub-heading pair used by the card grid sections. */
export const sectionHeaderType = defineType({
  name: 'sectionHeader',
  title: 'Section heading',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Supporting text',
      type: 'text',
      rows: 2,
      description: 'Optional short sentence shown underneath the heading.',
    }),
  ],
  preview: {
    select: {title: 'heading', subtitle: 'subheading'},
  },
})
