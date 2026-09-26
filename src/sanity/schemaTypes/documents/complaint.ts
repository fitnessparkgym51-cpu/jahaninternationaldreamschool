import {defineField, defineType} from 'sanity'

/**
 * An anonymous Complaint Box submission. Created only by `/api/complaints`
 * (server-side, write token) and deleted automatically after 30 days by
 * `/api/complaints/cleanup`. Holds no identifying information by design.
 */
export const complaintType = defineType({
  name: 'complaint',
  title: 'Complaint',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'string',
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: 'complaint',
      title: 'Complaint',
      type: 'text',
      rows: 8,
      validation: (r) => r.required().max(2000),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted',
      type: 'datetime',
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    {title: 'Newest first', name: 'submittedAtDesc', by: [{field: 'submittedAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'topic', date: 'submittedAt', body: 'complaint'},
    prepare: ({title, date, body}) => ({
      title,
      subtitle: `${date ? new Date(date).toLocaleString() : ''} — ${String(body ?? '').slice(0, 80)}`,
    }),
  },
})
