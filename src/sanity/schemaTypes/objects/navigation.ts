import {defineField, defineType} from 'sanity'

import {iconField} from './shared'

export const topBarLinkType = defineType({
  name: 'topBarLink',
  title: 'Utility link',
  type: 'object',
  fields: [
    iconField(),
    defineField({name: 'label', title: 'Text', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'url', title: 'URL', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'newTab', title: 'Open in a new tab', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {title: 'label', subtitle: 'url', icon: 'icon'},
    prepare: ({title, subtitle, icon}) => ({title, subtitle: [icon, subtitle].filter(Boolean).join(' · ')}),
  },
})

export const navChildLinkType = defineType({
  name: 'navChildLink',
  title: 'Dropdown link',
  type: 'object',
  fields: [
    iconField(),
    defineField({name: 'label', title: 'Text', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'url', title: 'URL', type: 'string', validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {title: 'label', subtitle: 'url', icon: 'icon'},
    prepare: ({title, subtitle, icon}) => ({title, subtitle: [icon, subtitle].filter(Boolean).join(' · ')}),
  },
})

export const navItemType = defineType({
  name: 'navItem',
  title: 'Menu item',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Menu text', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'string',
      description: 'Example: /about-us',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isCurrentPage',
      title: 'Highlight as current page',
      type: 'boolean',
      initialValue: false,
      description: 'Renders this item with the active (pill) style.',
    }),
    defineField({
      name: 'showChevron',
      title: 'Show dropdown arrow',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'highlight',
      title: 'Use active style',
      type: 'boolean',
      initialValue: false,
      description: 'Renders the item with the green pill background.',
    }),
    defineField({
      name: 'children',
      title: 'Dropdown links',
      type: 'array',
      description: 'Add these to create a hover dropdown. Leave empty for a plain link.',
      of: [{type: 'navChildLink'}],
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'url'},
    prepare: ({title, subtitle}) => ({title, subtitle}),
  },
})

export const topBarType = defineType({
  name: 'topBar',
  title: 'Top announcement bar',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Show top bar', type: 'boolean', initialValue: true}),
    defineField({
      name: 'contactLinks',
      title: 'Left links',
      type: 'array',
      description: 'Phone, WhatsApp, social profiles shown on the left.',
      of: [{type: 'topBarLink'}],
    }),
    defineField({
      name: 'badge',
      title: 'Badge text',
      type: 'string',
      description: 'Small pill, e.g. Estd: 2021',
    }),
    defineField({
      name: 'notice',
      title: 'Announcement link',
      type: 'button',
      description: 'Right-hand call to action, e.g. "Admission For 2027".',
    }),
  ],
})

export const headerType = defineType({
  name: 'header',
  title: 'Main header',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Show header', type: 'boolean', initialValue: true}),
    defineField({
      name: 'homeUrl',
      title: 'Logo link',
      type: 'string',
      initialValue: '/',
      description: 'Where the logo links to, usually /',
    }),
    defineField({
      name: 'brandSubline',
      title: 'Brand sub-line',
      type: 'string',
      description: 'Optional second line under the school name.',
    }),
    defineField({
      name: 'items',
      title: 'Menu items',
      type: 'array',
      of: [{type: 'navItem'}],
    }),
    defineField({
      name: 'cta',
      title: 'Header button',
      type: 'button',
    }),
    defineField({
      name: 'mobileMenuTitle',
      title: 'Mobile menu title',
      type: 'string',
      description: 'Shown in the mobile slide-out panel, e.g. J.I.D.S. Menu',
    }),
    defineField({
      name: 'mobileMenuCta',
      title: 'Mobile menu button',
      type: 'button',
    }),
  ],
})

export const navigationType = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  groups: [
    {name: 'topBar', title: 'Top announcement bar', default: true},
    {name: 'header', title: 'Main header'},
  ],
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Internal title',
      type: 'string',
      initialValue: 'Navigation',
      hidden: true,
    }),
    defineField({
      name: 'topBar',
      title: 'Top announcement bar',
      type: 'topBar',
      group: 'topBar',
    }),
    defineField({
      name: 'header',
      title: 'Main header',
      type: 'header',
      group: 'header',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Navigation', subtitle: 'Top bar and main menu'}),
  },
})
