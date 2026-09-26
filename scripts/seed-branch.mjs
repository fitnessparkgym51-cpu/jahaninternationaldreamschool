// Replaces the Branch page content with the landing-page reference copy and
// points the navbar "Branch" item at /branch. Images are left for the editor to upload.
// Usage: node --env-file=.env.local scripts/seed-branch.mjs
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-09-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const item = (_key, icon, title, text) => ({_key, _type: 'branchIconItem', icon, title, text})
const btn = (label, url) => ({_type: 'button', label, url, variant: 'green'})

await client.createOrReplace({
  _id: 'branchPage',
  _type: 'branchPage',
  internalTitle: 'Branch page',
  hero: {
    eyebrow: 'Welcome to Al Noor Madrasa',
    heading: 'Learn Quran\nBuild a Better Future',
    text: "Al Noor Madrasa provides a peaceful and disciplined environment for Islamic education, helping students grow with Qur'an, knowledge and good character.",
    button: btn('Learn More', '#mission'),
  },
  features: {
    enabled: true,
    items: [
      item('quran', 'book-open', 'Quran Learning', 'Proper recitation and understanding of the Quran.'),
      item('islamic', 'mosque', 'Islamic Studies', 'Fiqh, Aqidah, Seerah and other essential subjects.'),
      item('teachers', 'users', 'Qualified Teachers', 'Experienced and dedicated teachers.'),
      item('safe', 'shield-check', 'Safe Environment', 'A clean, peaceful and supportive atmosphere.'),
    ],
  },
  about: {
    enabled: true,
    eyebrow: 'About Us',
    heading: 'Our Mission',
    paragraphs: [
      'Al Noor Madrasa aims to nurture righteous, knowledgeable and confident individuals who will contribute to a better society and a brighter future.',
      'We focus on providing quality Islamic education with modern and simple learning methods.',
    ],
    button: btn('About Our Madrasa', '/about-us'),
  },
  programs: {
    enabled: true,
    eyebrow: 'Our Programs',
    heading: 'What We Teach',
    items: [
      item('recitation', 'book-open', 'Quran Recitation', 'With Tajweed'),
      item('studies', 'book', 'Islamic Studies', 'Fiqh, Aqidah, Seerah'),
      item('arabic', 'pencil', 'Arabic Language', 'Reading & Writing'),
      item('character', 'star', 'Character Building', 'Good Manners & Values'),
    ],
  },
  teachers: {
    enabled: true,
    eyebrow: 'Our Teachers',
    heading: 'Meet Our Teachers',
    items: [
      {_key: 't1', _type: 'branchTeacher', name: 'Maulana Rashid Ahmed', role: 'Quran & Tajweed'},
      {_key: 't2', _type: 'branchTeacher', name: 'Hafiz Salman Khan', role: 'Islamic Studies'},
      {_key: 't3', _type: 'branchTeacher', name: 'Ustaz Faruk Hossain', role: 'Arabic Language'},
    ],
  },
})
await client.delete('drafts.branchPage').catch(() => {})

const nav = await client.getDocument('navigation')
const navItem = nav.header?.items?.find((i) => /^branch$/i.test(i.label ?? ''))
if (navItem) await client.patch('navigation').set({[`header.items[_key=="${navItem._key}"].url`]: '/branch'}).commit()
console.log('branchPage replaced')
