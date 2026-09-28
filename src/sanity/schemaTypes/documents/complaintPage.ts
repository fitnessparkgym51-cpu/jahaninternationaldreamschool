import {defineField, defineType} from 'sanity'

/**
 * The Complaint Box page (`/complaint-box`).
 *
 * A singleton with a deliberately tiny model. The form itself is code — a topic
 * field, a complaint field and a honeypot — and the only content the school needs
 * to own is the heading above it and one line of explanation.
 *
 * There is **no `seo` block** here, on purpose. The page is kept out of the index
 * by policy: it holds no searchable content, and a thin page in the footer of
 * every page would compete with the real ones. The `noindex` directive and the
 * sitemap exclusion are both declared in `src/lib/routes.ts`, so an editor cannot
 * accidentally publish a page the site has agreed never to advertise. Its `<title>`
 * comes from `heading`, which is the same sentence a parent reads on the page.
 */
export const complaintPageType = defineType({
  name: 'complaintPage',
  title: 'Complaint Box page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Page heading', default: true},
    {name: 'settings', title: 'Page settings'},
  ],
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Internal title',
      type: 'string',
      initialValue: 'Complaint Box page',
      group: 'settings',
      description: 'Only shown inside the Studio.',
    }),
    defineField({
      name: 'heading',
      title: 'Page heading',
      type: 'string',
      group: 'content',
      description: 'The page\'s one H1. Also used as the page title.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro line',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'One or two sentences shown under the heading, explaining that the form is anonymous.',
    }),
  ],
  preview: {
    select: {title: 'internalTitle', heading: 'heading'},
    prepare: ({title, heading}) => ({title: title || 'Complaint Box page', subtitle: heading}),
  },
})
