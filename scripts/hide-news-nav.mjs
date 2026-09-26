// One-off: removes the "News" item from the navbar (navigation document).
// Prints the removed item so it can be re-added in Studio → Navigation.
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-09-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const nav = await client.getDocument('navigation')
const [field, items] = Object.entries(nav.header ?? {}).find(([, v]) => Array.isArray(v) && v.some((i) => i?.label)) ?? []
const news = items?.filter((i) => /^news/i.test(i.label ?? '')) ?? []
if (!news.length) {
  console.log('No News item found in header.', Object.keys(nav.header ?? {}))
} else {
  await client.patch('navigation').unset(news.map((i) => `header.${field}[_key=="${i._key}"]`)).commit()
  console.log('Removed:', JSON.stringify(news))
}
