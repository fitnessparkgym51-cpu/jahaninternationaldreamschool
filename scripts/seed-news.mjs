// Creates the News page singleton and gives existing posts a slug + date (additive only).
// Usage: node --env-file=.env.local scripts/seed-news.mjs
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-09-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

await client.createIfNotExists({
  _id: 'newsPage',
  _type: 'newsPage',
  internalTitle: 'News page',
  hero: {
    _type: 'pageHeroSection',
    enabled: true,
    heading: 'News & Events',
    subheading: 'The latest from Jahan International Dream School.',
    appearance: 'pattern',
    crumbs: [
      {_key: 'home', _type: 'breadcrumbItem', label: 'Home', url: '/'},
      {_key: 'news', _type: 'breadcrumbItem', label: 'News'},
    ],
  },
  readMoreLabel: 'Read More',
  backLabel: '← Back to News',
  emptyText: 'No news yet. Check back soon.',
})

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 96)
const posts = await client.fetch(`*[_type == "newsPost" && !(_id in path("drafts.**"))]{_id, title, _createdAt, slug, publishedAt}`)
for (const p of posts) {
  const set = {}
  if (!p.slug?.current) set.slug = {_type: 'slug', current: slugify(p.title || p._id)}
  if (!p.publishedAt) set.publishedAt = p._createdAt
  if (Object.keys(set).length) await client.patch(p._id).set(set).commit()
}
console.log(`newsPage ready; ${posts.length} posts checked`)
