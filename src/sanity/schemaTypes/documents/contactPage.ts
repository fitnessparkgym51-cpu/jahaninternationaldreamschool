import {defineArrayMember, defineField, defineType} from 'sanity'

import {ICON_OPTIONS} from '../../../lib/iconNames'

/**
 * The Contact page singleton (`/contact`).
 *
 * The page has a fixed layout (hero → contact card + map card → inquiry form →
 * Google review banner), so it uses four typed objects rather than a section
 * array. Initial values are the reference content from `JIDS/contactus.html`,
 * so a freshly created document is already complete — just publish it.
 *
 * Form submissions are stored as separate `contactSubmission` documents.
 */

const str = (name: string, title: string, initialValue?: string, required = false) =>
  defineField({
    name,
    title,
    type: 'string',
    initialValue,
    validation: required ? (rule) => rule.required() : undefined,
  })

const button = (name: string, title: string, label: string, url: string, variant: string) =>
  defineField({
    name,
    title,
    type: 'button',
    initialValue: {label, url, newTab: true, variant},
  })

const WHATSAPP = 'https://wa.me/8801717103326'

export const contactPageType = defineType({
  name: 'contactPage',
  title: 'Contact page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Page content', default: true},
    {name: 'form', title: 'Inquiry form'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Internal title',
      type: 'string',
      initialValue: 'Contact page',
      description: 'Only shown inside the Studio.',
      group: 'content',
    }),
    defineField({
      name: 'hero',
      title: 'Page header',
      type: 'pageHeroSection',
      group: 'content',
      initialValue: {
        enabled: true,
        heading: 'Contact Us',
        appearance: 'pattern',
        crumbs: [
          {_key: 'home', _type: 'breadcrumbItem', label: 'Home', url: '/'},
          {_key: 'contact', _type: 'breadcrumbItem', label: 'Contact'},
        ],
      },
    }),
    defineField({
      name: 'infoCard',
      title: 'Visit, call or message card',
      type: 'object',
      group: 'content',
      fields: [
        str('heading', 'Heading', 'Visit, Call Or Message', true),
        defineField({
          name: 'items',
          title: 'Contact details',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'contactDetail',
              title: 'Contact detail',
              fields: [
                defineField({
                  name: 'icon',
                  title: 'Icon',
                  type: 'string',
                  options: {list: [...ICON_OPTIONS], layout: 'dropdown'},
                }),
                str('label', 'Label', undefined, true),
                str('value', 'Value', undefined, true),
                str('note', 'Extra line (optional)'),
              ],
              preview: {select: {title: 'label', subtitle: 'value'}},
            }),
          ],
          initialValue: [
            {_key: 'address', _type: 'contactDetail', icon: 'map-pin', label: 'Address', value: 'TNT, Tongi, Gazipur'},
            {_key: 'phone', _type: 'contactDetail', icon: 'phone', label: 'Phone', value: '01717-103326'},
            {_key: 'whatsapp', _type: 'contactDetail', icon: 'whatsapp', label: 'WhatsApp', value: '+880 1717-103326'},
            {_key: 'email', _type: 'contactDetail', icon: 'mail', label: 'Email', value: 'jids21@gmail.com'},
            {
              _key: 'hours',
              _type: 'contactDetail',
              icon: 'clock',
              label: 'Office Hours',
              value: 'Sunday–Thursday: 8:00am–3:00pm',
              note: 'Friday & Saturday: Closed',
            },
          ],
        }),
        button('button', 'Button', 'Chat On WhatsApp', WHATSAPP, 'primary'),
      ],
    }),
    defineField({
      name: 'mapCard',
      title: 'Map card',
      type: 'object',
      group: 'content',
      fields: [
        str('title', 'School name', 'Jahan International Dream School', true),
        str('address', 'Address line', 'TNT, Tongi, Gazipur'),
        str('rating', 'Rating', '4.7'),
        str('reviewCount', 'Review count', '(140+)'),
        str('pinLabel', 'Map pin label', 'JIDS Campus'),
        defineField({
          name: 'landmarks',
          title: 'Landmark labels on the map',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
          validation: (rule) => rule.max(2),
          initialValue: ['Tongi Govt. College', 'Dhaka-Mymensingh Hwy'],
        }),
        str('attribution', 'Small map caption', 'Map data ©2026 Gazipur City'),
        defineField({
          name: 'mapUrl',
          title: 'Google Maps link (optional)',
          type: 'url',
          description: 'If set, clicking the map opens this link.',
        }),
        button('button', 'Button', 'Chat On WhatsApp', WHATSAPP, 'outline'),
      ],
    }),
    defineField({
      name: 'form',
      title: 'Inquiry form',
      type: 'object',
      group: 'form',
      description: 'Submissions appear in the Studio under "Contact inquiries".',
      fields: [
        str('heading', 'Heading', "What's Happening At Jahan International Dream School"),
        str('intro', 'Intro line', 'A glimpse of recent classroom moments, competitions and celebrations, or send us an inquiry.'),
        str('nameLabel', 'Name label', 'Your Name', true),
        str('namePlaceholder', 'Name placeholder', 'Parent / guardian name'),
        str('whatsappLabel', 'WhatsApp label', 'Your WhatsApp Number', true),
        str('whatsappPrefix', 'Country code shown in the box', '+880'),
        str('whatsappPlaceholder', 'WhatsApp placeholder', '01717-103326'),
        str('ageLabel', "Child's age label", "Child's Age", true),
        str('agePlaceholder', "Child's age placeholder", 'Select age...'),
        defineField({
          name: 'ageOptions',
          title: "Child's age choices",
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
          initialValue: ['3 Years', '4 Years', '5 Years', '6 Years', '7+ Years'],
        }),
        str('classLabel', 'Class label', 'Class Interested In', true),
        str('classPlaceholder', 'Class placeholder', 'Select class...'),
        defineField({
          name: 'classOptions',
          title: 'Class choices',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
          initialValue: [
            'Play Group',
            'Nursery',
            'Kindergarten (KG)',
            'Class 1',
            'Class 2',
            'Class 3 to 5',
            'Class 6 to 10',
          ],
        }),
        str('messageLabel', 'Message label', 'Your Message'),
        str('messagePlaceholder', 'Message placeholder', 'Tell us how we can help...'),
        str('robotLabel', 'Robot check text', "I'm not a robot"),
        str('submitLabel', 'Submit button text', 'Send Message', true),
        str('successMessage', 'Message after sending', 'Thank you! We have received your message and will contact you soon.'),
      ],
    }),
    defineField({
      name: 'review',
      title: 'Google review banner',
      type: 'object',
      group: 'content',
      fields: [
        defineField({name: 'enabled', title: 'Show this banner', type: 'boolean', initialValue: true}),
        str('rating', 'Rating', '4.7'),
        str('headline', 'Headline', 'Happy With Jahan International Dream School? Please Leave Us A Review!'),
        defineField({
          name: 'text',
          title: 'Supporting text',
          type: 'text',
          rows: 2,
          initialValue: "We're rated 4.7 by 140+ families on Google. Your review helps other parents find us.",
        }),
        button('button', 'Button', 'Leave A Google Review', 'https://g.page/r/review', 'green'),
      ],
    }),
    defineField({name: 'seo', title: 'Search engines & social sharing', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Contact page'})},
})

/** One inquiry sent from the Contact page form. Created only by `/api/contact`. */
export const contactSubmissionType = defineType({
  name: 'contactSubmission',
  title: 'Contact inquiry',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string'}),
    defineField({name: 'whatsapp', title: 'WhatsApp number', type: 'string'}),
    defineField({name: 'childAge', title: "Child's age", type: 'string'}),
    defineField({name: 'classInterested', title: 'Class interested in', type: 'string'}),
    defineField({name: 'message', title: 'Message', type: 'text', rows: 6}),
    defineField({name: 'submittedAt', title: 'Submitted', type: 'datetime'}),
  ],
  orderings: [
    {title: 'Newest first', name: 'submittedAtDesc', by: [{field: 'submittedAt', direction: 'desc'}]},
  ],
  preview: {
    select: {name: 'name', phone: 'whatsapp', cls: 'classInterested', date: 'submittedAt'},
    prepare: ({name, phone, cls, date}) => ({
      title: `${name ?? 'Unknown'} — ${phone ?? ''}`,
      subtitle: `${cls ?? ''} · ${date ? new Date(date).toLocaleString() : ''}`,
    }),
  },
})
