/**
 * Seeds the Sanity dataset with the initial **Academics page** content and the
 * reusable `classLevel` documents it references.
 *
 * DEVELOPMENT ONLY — a one-off bootstrap, not part of the website. The site never
 * reads these files: once seeded, everything lives in Sanity and is edited through
 * the Studio.
 *
 * This script is deliberately **additive**: it creates or replaces only the
 * `academicsPage` document and the 13 `classLevel` documents. It never touches Home,
 * About, Admissions, Site settings or Navigation, so it is safe to re-run at any
 * time — including after hand-editing content in the Studio.
 *
 * Usage:
 *   node scripts/seed-academics.mjs
 *
 * Authentication: set SANITY_API_WRITE_TOKEN, or run `npx sanity login` first.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'd04rgvdr'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-25'

/* -------------------------------------------------------------------------- */
/* Client                                                                     */
/* -------------------------------------------------------------------------- */

function resolveToken() {
  if (process.env.SANITY_API_WRITE_TOKEN) return process.env.SANITY_API_WRITE_TOKEN

  const cliConfig = path.join(os.homedir(), '.config', 'sanity', 'config.json')
  if (fs.existsSync(cliConfig)) {
    const {authToken} = JSON.parse(fs.readFileSync(cliConfig, 'utf8'))
    if (authToken) return authToken
  }

  throw new Error('No write token found. Set SANITY_API_WRITE_TOKEN or run `npx sanity login`.')
}

const client = createClient({projectId, dataset, apiVersion, token: resolveToken(), useCdn: false})

/* -------------------------------------------------------------------------- */
/* Reusable document: the class catalogue                                      */
/* -------------------------------------------------------------------------- */

/**
 * The 13 classes, verbatim from `JIDS/classesoffered.html`.
 *
 * These are **documents**, not rows on a page, because the class list is needed in
 * more than one place — the Academics table, and later the Admissions and Contact
 * content. Correcting a class's age range once updates every appearance.
 *
 * `sortOrder` leaves gaps (10, 20, 30 …) so a class can be inserted later without
 * renumbering the rest.
 */
const CLASSES = [
  ['Play Group', '3–4 yrs', 'Social skills, sensory development & play-based learning'],
  ['Nursery', '4–5 yrs', 'Pre-literacy, phonics & early numeracy'],
  ['KG', '5–6 yrs', 'Reading, handwriting, math basics & creative expression'],
  ['Class 1', '6–7 yrs', 'Core language skills, elementary science & mathematics'],
  ['Class 2', '7–8 yrs', 'Advanced reading, arithmetic & analytical thinking'],
  ['Class 3', '8–9 yrs', 'Integrated curriculum, general science & social studies'],
  ['Class 4', '9–10 yrs', 'Concept building, computer literacy & creative writing'],
  ['Class 5', '10–11 yrs', 'Primary graduation prep, critical thinking & science lab intro'],
  ['Class 6', '11–12 yrs', 'Secondary foundation, literature, ICT & STEM intro'],
  ['Class 7', '12–13 yrs', 'Advanced science, mathematics, ICT & language fluency'],
  ['Class 8', '13–14 yrs', 'Pre-board academic rigor, research skills & leadership'],
  ['Class 9', '14–15 yrs', 'SSC / Board curriculum stream selection (Science & Business Studies prep)'],
  ['Class 10', '15–16 yrs', 'SSC Board exam preparation, model tests & career guidance'],
].map(([name, ageRange, focus], index) => ({
  _id: `class-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  _type: 'classLevel',
  name,
  ageRange,
  medium: 'English & Bangla',
  focus,
  sortOrder: (index + 1) * 10,
  isVisible: true,
}))

/* -------------------------------------------------------------------------- */
/* The Academics page singleton                                               */
/* -------------------------------------------------------------------------- */

/** An existing asset to reuse for the SEO share image, if it is present. */
const SHARE_IMAGE_SOURCE_FILENAME = 'hero-rainbow-classroom.png'

async function findExistingAsset(filename) {
  return (
    (await client.fetch(
      '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id',
      {filename},
    )) ?? null
  )
}

function image(assetId, alt) {
  return {
    _type: 'imageWithAlt',
    image: {_type: 'image', asset: {_type: 'reference', _ref: assetId}},
    alt,
  }
}

/** Section content is taken verbatim from `JIDS/classesoffered.html`. */
const buildAcademicsPage = (classIds, shareImageId) => ({
  _id: 'academicsPage',
  _type: 'academicsPage',
  internalTitle: 'Academics page',
  sections: [
    {
      _key: 'hero',
      _type: 'pageHeroSection',
      enabled: true,
      heading: 'Classes & Curriculum',
      subheading: null,
      appearance: 'solid',
      showIconWatermark: true,
      crumbs: [
        {_key: 'crumb-home', _type: 'breadcrumbItem', label: 'Home', url: '/'},
        {_key: 'crumb-current', _type: 'breadcrumbItem', label: 'Academics', url: null},
      ],
      buttons: [],
    },
    {
      _key: 'classes',
      _type: 'classTableSection',
      enabled: true,
      anchorId: 'curriculum-table',
      header: {
        _type: 'sectionHeader',
        heading: 'Classes Offered — Play Group To Class 10',
        subheading:
          'Comprehensive bilingual education from early childhood foundational learning through secondary school excellence.',
      },
      columnLabels: {
        _type: 'classTableColumns',
        class: 'Class',
        age: 'Age',
        medium: 'Medium',
        focus: 'Focus',
      },
      classes: classIds.map((id) => ({
        _key: id,
        _type: 'reference',
        _ref: id,
        _weak: false,
        _strengthenOnPublish: {type: 'classLevel'},
      })),
      emptyStateText:
        'The class list is being updated. Please contact the school for the current class structure and availability.',
    },
    {
      _key: 'highlights',
      _type: 'pillarsSection',
      enabled: true,
      header: {
        _type: 'sectionHeader',
        heading: 'Curriculum Highlights',
        subheading: null,
      },
      pillars: [
        {
          _key: 'highlight-spoken',
          _type: 'pillarCard',
          icon: 'headset',
          tone: 'pink',
          title: 'Spoken English',
          description: 'Daily conversation classes to build confidence from Play Group onwards.',
        },
        {
          _key: 'highlight-board',
          _type: 'pillarCard',
          icon: 'file-text',
          tone: 'blue',
          title: 'Board & Admission Prep',
          description:
            'Comprehensive coaching for primary milestones, SSC Board exams, and leading college admissions.',
        },
        {
          _key: 'highlight-religious',
          _type: 'pillarCard',
          icon: 'mosque',
          tone: 'amber',
          title: 'Religious & Moral Education',
          description: 'Values-based teaching woven through stories and daily routines.',
        },
        {
          _key: 'highlight-art',
          _type: 'pillarCard',
          icon: 'palette',
          tone: 'orange',
          title: 'Art & Creativity',
          description: 'Drawing, painting, craft and music as weekly highlights.',
        },
        {
          _key: 'highlight-sports',
          _type: 'pillarCard',
          icon: 'ball',
          tone: 'green',
          title: 'Sports & Movement',
          description: 'Indoor and outdoor play, annual sports day, and physical games.',
        },
        {
          _key: 'highlight-competitions',
          _type: 'pillarCard',
          icon: 'award',
          tone: 'amber',
          title: 'Competitions',
          description: 'Quiz, speech, recitation and art contests every term.',
        },
      ],
    },
    {
      _key: 'cta',
      _type: 'pageCtaSection',
      enabled: true,
      anchorId: 'enrol',
      badge: null,
      heading: 'Ready To Enrol?',
      subheading: 'Admissions are open for the 2027 session.',
      primaryButton: {
        _type: 'button',
        label: 'How To Apply',
        url: '/admissions#apply',
        newTab: false,
        variant: 'invert',
      },
      secondaryButton: null,
    },
  ],
  seo: {
    _type: 'seo',
    // The root layout appends " | Jahan International Dream School", so metaTitle
    // carries only the page-specific part.
    metaTitle: 'Classes & Curriculum | Play Group to Class 10',
    metaDescription:
      'Browse the classes Jahan International Dream School offers, from Play Group to Class 10, with age ranges, bilingual medium and the learning focus of each class.',
    shareImage: shareImageId
      ? image(shareImageId, 'J.I.D.S. students in the rainbow classroom')
      : null,
    canonicalUrl: null,
    noIndex: false,
  },
})

/* -------------------------------------------------------------------------- */
/* Run                                                                         */
/* -------------------------------------------------------------------------- */

async function run() {
  const shareImageId = await findExistingAsset(SHARE_IMAGE_SOURCE_FILENAME)
  console.log(
    shareImageId
      ? `reusing existing asset for the share image: ${shareImageId}`
      : 'no existing share image found; the page will fall back to the site default',
  )

  const page = buildAcademicsPage(
    CLASSES.map((c) => c._id),
    shareImageId,
  )

  console.log(`Writing ${1 + CLASSES.length} documents (1 page + ${CLASSES.length} classes)...`)
  const tx = client.transaction()
  tx.createOrReplace(page)
  for (const klass of CLASSES) tx.createOrReplace(klass)
  await tx.commit()

  console.log('Done. Open /studio/structure/academicsPage to review and edit the content.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
