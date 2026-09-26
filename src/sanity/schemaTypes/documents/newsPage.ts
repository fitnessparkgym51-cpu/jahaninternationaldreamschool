import {defineField, defineType} from 'sanity'

/**
 * The News listing page singleton (`/news`). Posts themselves are `newsPost`
 * documents — create, edit or delete them under "News & events".
 */
export const newsPageType = defineType({
  name: 'newsPage',
  title: 'News page',
  type: 'document',
  fields: [
    defineField({name: 'internalTitle', title: 'Internal title', type: 'string', initialValue: 'News page'}),
    defineField({
      name: 'hero',
      title: 'Page header',
      type: 'pageHeroSection',
      initialValue: {
        enabled: true,
        heading: 'News & Events',
        subheading: 'The latest from Jahan International Dream School.',
        appearance: 'pattern',
        crumbs: [
          {_key: 'home', _type: 'breadcrumbItem', label: 'Home', url: '/'},
          {_key: 'news', _type: 'breadcrumbItem', label: 'News'},
        ],
      },
    }),
    defineField({name: 'readMoreLabel', title: '"Read more" text', type: 'string', initialValue: 'Read More'}),
    defineField({name: 'backLabel', title: '"Back to news" text', type: 'string', initialValue: '← Back to News'}),
    defineField({name: 'emptyText', title: 'Text when there are no posts', type: 'string', initialValue: 'No news yet. Check back soon.'}),
    defineField({name: 'seo', title: 'Search engines & social sharing', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'News page'})},
})
