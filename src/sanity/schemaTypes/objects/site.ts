import {defineField, defineType} from 'sanity'

import {iconField} from './shared'

/** School identity — reused by the header, the footer and structured data. */
export const brandType = defineType({
  name: 'brand',
  title: 'School identity',
  type: 'object',
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo / crest',
      type: 'imageWithAlt',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'School name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'acronym',
      title: 'Short name',
      type: 'string',
      description: 'Used in badges and tight spaces, e.g. J.I.D.S.',
    }),
    defineField({
      name: 'establishedLabel',
      title: 'Establishment line',
      type: 'string',
      description: 'Shown next to the short name, e.g. Estd: 2021',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'acronym', media: 'logo.image'},
  },
})

/** Address, phone numbers and email shown in the footer and top bar. */
export const contactBlockType = defineType({
  name: 'contactBlock',
  title: 'Contact details',
  type: 'object',
  fields: [
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'phoneLabel',
      title: 'Landline number',
      type: 'string',
    }),
    defineField({
      name: 'phoneHref',
      title: 'Landline link',
      type: 'string',
      description: 'Example: tel:880248111854',
    }),
    defineField({
      name: 'mobileLabel',
      title: 'Mobile / WhatsApp number',
      type: 'string',
    }),
    defineField({
      name: 'mobileHref',
      title: 'Mobile link',
      type: 'string',
      description: 'Example: tel:8801820080080',
    }),
    defineField({
      name: 'emailLabel',
      title: 'Email address',
      type: 'string',
    }),
    defineField({
      name: 'emailHref',
      title: 'Email link',
      type: 'string',
      description: 'Example: mailto:info@jids.edu.bd',
    }),
  ],
})

/**
 * The postal address in structured form, for search engines.
 *
 * `contactBlock.address` is free text written for humans and shown in the footer.
 * Search engines need the same place split into its parts, and they must be
 * machine-readable — a parser cannot reliably tell "TNT, Tongi, Gazipur" into
 * street, city and region. This block is the only place that split lives, so the
 * footer text and the structured data are edited side by side in one document.
 *
 * Only fill in what the school has confirmed. An empty `streetAddress` is normal
 * and correct: a wrong street address sends parents to the wrong gate, which is
 * worse than publishing only the town.
 */
export const postalAddressType = defineType({
  name: 'postalAddress',
  title: 'Postal address (for search engines)',
  type: 'object',
  fields: [
    defineField({
      name: 'streetAddress',
      title: 'Street or area',
      type: 'string',
      description: 'Optional. Leave empty unless the full street address is confirmed.',
    }),
    defineField({
      name: 'addressLocality',
      title: 'Town or city',
      type: 'string',
      description: 'Example: Tongi',
    }),
    defineField({
      name: 'addressRegion',
      title: 'District or division',
      type: 'string',
      description: 'Example: Gazipur',
    }),
    defineField({
      name: 'addressCountry',
      title: 'Country',
      type: 'string',
      initialValue: 'BD',
      description: 'Two-letter country code. Bangladesh is BD.',
    }),
  ],
  preview: {
    select: {title: 'addressLocality', subtitle: 'addressRegion'},
    prepare: ({title, subtitle}) => ({
      title: [title, subtitle].filter(Boolean).join(', ') || 'Postal address',
      subtitle: 'Used in structured data only',
    }),
  },
})

export const socialLinkType = defineType({
  name: 'socialLink',
  title: 'Social link',
  type: 'object',
  fields: [
    iconField(),
    defineField({name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'url', title: 'URL', type: 'url', validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {title: 'label', subtitle: 'url', icon: 'icon'},
    prepare: ({title, subtitle, icon}) => ({title, subtitle: `${icon ?? 'link'} · ${subtitle}`}),
  },
})

/** Small Facebook-style preview card in the footer. */
export const socialPreviewCardType = defineType({
  name: 'socialPreviewCard',
  title: 'Social page preview card',
  type: 'object',
  fields: [
    defineField({
      name: 'bannerLabel',
      title: 'Banner label',
      type: 'string',
      description: 'Orange pill on the coloured banner, e.g. "2027 Admission starts Sep 21".',
    }),
    defineField({
      name: 'image',
      title: 'Thumbnail',
      type: 'imageWithAlt',
    }),
    defineField({name: 'title', title: 'Page title', type: 'string'}),
    defineField({name: 'subtitle', title: 'Page subtitle', type: 'string'}),
    defineField({name: 'description', title: 'Short description', type: 'text', rows: 2}),
    defineField({name: 'url', title: 'Page URL', type: 'url'}),
  ],
  preview: {
    select: {title: 'title', media: 'image.image', bannerLabel: 'bannerLabel'},
    prepare: ({title, media, bannerLabel}) => ({title: title || 'Social card', media, subtitle: bannerLabel}),
  },
})

/** The "Find us" map placeholder block. */
export const mapCardType = defineType({
  name: 'mapCard',
  title: 'Map card',
  type: 'object',
  fields: [
    defineField({name: 'buttonLabel', title: 'Button text', type: 'string'}),
    defineField({name: 'url', title: 'Map URL', type: 'url'}),
    defineField({name: 'pinLabel', title: 'Pin label', type: 'string'}),
    defineField({name: 'areaLabel', title: 'Area caption', type: 'string'}),
  ],
})

export const footerType = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'object',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Show footer',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Highlighted line under the school name, e.g. "Best Education. The Right Investment."',
    }),
    defineField({
      name: 'contactItems',
      title: 'Contact list',
      type: 'array',
      description: 'Address, phone numbers, email — each line with its own icon.',
      of: [{type: 'contactListItem'}],
    }),
    defineField({name: 'quickLinksTitle', title: 'Quick links heading', type: 'string'}),
    defineField({
      name: 'quickLinks',
      title: 'Quick links',
      type: 'array',
      of: [{type: 'link'}],
    }),
    defineField({name: 'socialTitle', title: 'Social column heading', type: 'string'}),
    defineField({
      name: 'socialCard',
      title: 'Social page card',
      type: 'socialPreviewCard',
    }),
    defineField({name: 'mapTitle', title: 'Map column heading', type: 'string'}),
    defineField({
      name: 'map',
      title: 'Map card',
      type: 'mapCard',
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright text',
      type: 'string',
      description: 'Example: © 2021–2026 Jahan International Dream School. All rights reserved.',
    }),
    defineField({
      name: 'legalLinks',
      title: 'Legal links',
      type: 'array',
      of: [{type: 'link'}],
    }),
  ],
})

export const contactListItemType = defineType({
  name: 'contactListItem',
  title: 'Contact line',
  type: 'object',
  fields: [
    iconField(),
    defineField({name: 'label', title: 'Text', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'href',
      title: 'Link (optional)',
      type: 'string',
      description: 'Example: tel:8801820080080 or mailto:info@school.com — leave empty for plain text.',
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'href', icon: 'icon'},
    prepare: ({title, subtitle, icon}) => ({title, subtitle: [icon, subtitle].filter(Boolean).join(' · ')}),
  },
})

/** Bottom-right floating chat button. */
export const floatingContactType = defineType({
  name: 'floatingContact',
  title: 'Floating contact button',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Show floating button', type: 'boolean', initialValue: true}),
    defineField({
      name: 'bubbleLabel',
      title: 'Bubble text',
      type: 'string',
      description: 'Desktop-only pill next to the icon, e.g. "Need Help? Chat with us".',
    }),
    defineField({name: 'icon', title: 'Icon', type: 'string', options: {list: ['whatsapp']}}),
    defineField({name: 'url', title: 'Destination URL', type: 'url'}),
    defineField({name: 'ariaLabel', title: 'Accessible label', type: 'string'}),
  ],
})
