/**
 * Seeds the Sanity dataset with the initial **About page** content.
 *
 * DEVELOPMENT ONLY — a one-off bootstrap, not part of the website. The site never
 * reads these files: once seeded, everything lives in Sanity and is edited
 * through the Studio.
 *
 * This script is deliberately **additive**: it creates or replaces only the
 * `aboutPage` document and the `person` documents it references, and uploads only
 * the images those need. It never touches Home, Site settings or Navigation, so
 * it is safe to re-run at any time — including after hand-editing content in the
 * Studio. Use `scripts/seed.mjs` for a full bootstrap.
 *
 * Usage:
 *   node scripts/seed-about-us.mjs
 *
 * Authentication: set SANITY_API_WRITE_TOKEN, or run `npx sanity login` first
 * (the script then reuses the CLI's stored token).
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'd04rgvdr'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-25'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = path.join(root, '.seed-assets')

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

  throw new Error(
    'No write token found. Set SANITY_API_WRITE_TOKEN or run `npx sanity login`.',
  )
}

const client = createClient({projectId, dataset, apiVersion, token: resolveToken(), useCdn: false})

/* -------------------------------------------------------------------------- */
/* Assets                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Only the principal's photograph is new. Everything else the About page needs is
 * either text or an asset that already exists, which is looked up by original
 * filename rather than uploaded again — see `AGENTS.md` Part 13.
 */
const NEW_ASSET_FILES = {
  'principal-portrait': {
    filename: 'principal-jahangir-alam.png',
    title: 'Md. Jahangir Alam, Principal & Founder',
    description: 'Portrait of the founder and principal of Jahan International Dream School.',
  },
}

/** An existing asset to reuse for the SEO share image, if it is present. */
const SHARE_IMAGE_SOURCE_FILENAME = 'hero-rainbow-classroom.png'

const uploaded = new Map()

async function uploadAssets() {
  console.log('Uploading new assets...')
  for (const [key, {filename, title, description}] of Object.entries(NEW_ASSET_FILES)) {
    const file = path.join(assetsDir, filename)
    if (!fs.existsSync(file)) {
      throw new Error(`Missing ${file}. Download the reference image first.`)
    }
    const buffer = fs.readFileSync(file)
    const asset = await client.assets.upload('image', buffer, {filename, title, description})
    uploaded.set(key, asset._id)
    console.log(`  ${key.padEnd(20)} -> ${asset._id}`)
  }
}

/**
 * Finds an already-uploaded asset by its original filename, so the share image
 * reuses the Home page's classroom photograph instead of duplicating it.
 * Returns `null` when the asset is not in the dataset.
 */
async function findExistingAsset(filename) {
  const asset = await client.fetch(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id',
    {filename},
  )
  return asset ?? null
}

/** Builds an `imageWithAlt` value. */
function image(assetId, alt) {
  return {
    _type: 'imageWithAlt',
    image: {_type: 'image', asset: {_type: 'reference', _ref: assetId}},
    alt,
  }
}

/* -------------------------------------------------------------------------- */
/* Reusable document: the principal                                            */
/* -------------------------------------------------------------------------- */

const PRINCIPAL_ID = 'person-principal-jahangir-alam'

const buildPrincipal = (photoId) => ({
  _id: PRINCIPAL_ID,
  _type: 'person',
  name: 'Md. Jahangir Alam',
  designation: 'Principal & Founder, Jahan International Dream School',
  role: 'principal',
  photo: image(photoId, 'Md. Jahangir Alam, Principal & Founder of Jahan International Dream School'),
  message: [
    'Welcome to Jahan International Dream School (J.I.D.S.). Since founding this institution in 2021, our primary commitment has been to cultivate a safe, intellectually inspiring, and spiritually sound environment where young minds blossom into well-rounded, capable leaders.',
    'Under our unified educational philosophy, we integrate modern global pedagogies with fundamental traditional values. Our bilingual curriculum balances international English medium benchmarks with national heritage and values, empowering students to navigate academic rigor and character-building with immense confidence.',
    'At J.I.D.S., education extends beyond textbooks. We believe that every student has unique gifts waiting to be uncovered. Through interactive classroom techniques, digital learning aids, sports, moral ethics, and vibrant co-curricular disciplines, our passionate teachers nurture curiosity, creativity, and empathy.',
    'We cordially invite parents and guardians to partner with us in this uplifting journey. Our campus doors are always open for meaningful dialogue and collaboration toward giving your children the finest foundation for their future.',
  ],
  quote: 'Nurturing Curiosity, Character, and Global Vision.',
  quoteAttribution: 'Leadership Office • Jahan International Dream School',
  isVisible: true,
})

/* -------------------------------------------------------------------------- */
/* Reusable documents: the teaching team                                      */
/* -------------------------------------------------------------------------- */

/**
 * The reference ships twelve identical teacher cards reading "Teacher Name
 * Here / Photo Coming Soon". They are seeded as **twelve separate `person`
 * documents** so that each card is individually click-to-edit and can be
 * replaced with a real teacher one at a time, without touching the page or the
 * other cards.
 *
 * The wording is copied verbatim from `JIDS/aboutus.html` and every card says
 * plainly that it is a placeholder, so nothing is presented as a real person.
 */
const TEACHER_PLACEHOLDERS = Array.from({length: 12}, (_, index) => ({
  _id: `person-teacher-${String(index + 1).padStart(2, '0')}`,
  _type: 'person',
  name: 'Teacher Name Here',
  designation: 'Designation / Subject',
  role: 'teacher',
  photo: null,
  badge: 'Placeholder',
  photoPlaceholderLabel: 'Photo Coming Soon',
  shortBio:
    'Brief bio, qualifications and years of experience will appear here once confirmed.',
  message: [],
  quote: null,
  quoteAttribution: null,
  isVisible: true,
}))

/* -------------------------------------------------------------------------- */
/* The About page singleton                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Section content is taken verbatim from `JIDS/aboutus.html`, which is the
 * initial content only — Sanity is the source of truth from here on.
 *
 * `emptyStateText` stays on the team grid as a safety net: it is what the section
 * falls back to if the school later hides or removes every teacher.
 */
const buildAboutPage = (principalId, teacherIds, shareImageId) => ({
  _id: 'aboutPage',
  _type: 'aboutPage',
  internalTitle: 'About page',
  sections: [
    {
      _key: 'hero',
      _type: 'pageHeroSection',
      enabled: true,
      heading: 'Our Team',
      subheading: null,
      crumbs: [
        {_key: 'crumb-home', _type: 'breadcrumbItem', label: 'Home', url: '/'},
        {_key: 'crumb-about', _type: 'breadcrumbItem', label: 'About us', url: '/about-us'},
        {_key: 'crumb-current', _type: 'breadcrumbItem', label: 'Our Team', url: null},
      ],
    },
    {
      _key: 'principal',
      _type: 'principalSection',
      enabled: true,
      header: {
        _type: 'sectionHeader',
        heading: 'Meet Our Principal',
        subheading: null,
      },
      principal: {_type: 'reference', _ref: principalId, _weak: false, _strengthenOnPublish: {type: 'person'}},
    },
    {
      _key: 'teachers',
      _type: 'peopleGridSection',
      enabled: true,
      anchorId: 'our-teachers',
      header: {
        _type: 'sectionHeader',
        heading: 'Meet Our Teachers',
        subheading:
          "Our educators are trained, caring professionals committed to every child's growth.",
      },
      people: teacherIds.map((id) => ({
        _key: id,
        _type: 'reference',
        _ref: id,
        _weak: false,
        _strengthenOnPublish: {type: 'person'},
      })),
      emptyStateText:
        'Individual teacher profiles, photographs and qualifications will be published here as soon as they are confirmed by the school.',
    },
    {
      _key: 'pillars',
      _type: 'pillarsSection',
      enabled: true,
      header: {
        _type: 'sectionHeader',
        heading: 'Our Guiding Philosophy & Core Pillars',
        subheading:
          'Dedicated to building strong academic roots, integrity, and future-readiness from day one.',
      },
      pillars: [
        {
          _key: 'pillar-vision',
          _type: 'pillarCard',
          icon: 'globe',
          tone: 'green',
          title: 'Our Vision',
          description:
            'To emerge as a premier educational institute developing intellectually enlightened, morally conscientious, and globally competent global citizens ready to serve the nation and the world.',
        },
        {
          _key: 'pillar-mission',
          _type: 'pillarCard',
          icon: 'sparkle',
          tone: 'orange',
          title: 'Our Mission',
          description:
            'Providing child-centered, tech-integrated, and values-oriented holistic educare. We maintain small teacher-student ratios ensuring that every single student receives personalized care.',
        },
        {
          _key: 'pillar-values',
          _type: 'pillarCard',
          icon: 'shield-check',
          tone: 'amber',
          title: 'Core Philosophy',
          description:
            'Honesty, empathy, academic discipline, and critical thinking. We encourage active exploration, open inquiry, and respectful coexistence within our vibrant school family.',
        },
      ],
    },
    {
      _key: 'cta',
      _type: 'pageCtaSection',
      enabled: true,
      badge: null,
      heading: 'Want To Meet The Teachers?',
      subheading: 'Visit us during open hours and meet the team that will look after your child.',
      primaryButton: {
        _type: 'button',
        label: 'Book A Visit',
        url: '/contact#contact-form',
        newTab: false,
        variant: 'invert',
      },
      secondaryButton: null,
    },
  ],
  seo: {
    _type: 'seo',
    // The root layout appends " | Jahan International Dream School" via a Next.js
    // title template, so metaTitle carries only the page-specific part. Writing
    // the school name into it too would render the brand twice.
    metaTitle: 'About Us, Our Team & Teaching Faculty',
    metaDescription:
      'Meet our principal, the teaching team and the philosophy behind Jahan International Dream School, an English medium educare centre in Mohammadpur, Dhaka.',
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
  await uploadAssets()

  const photoId = uploaded.get('principal-portrait')
  const shareImageId = await findExistingAsset(SHARE_IMAGE_SOURCE_FILENAME)
  console.log(
    shareImageId
      ? `  reusing existing asset for the share image: ${shareImageId}`
      : '  no existing share image found; the page will fall back to the site default',
  )

  const principal = buildPrincipal(photoId)
  const aboutPage = buildAboutPage(
    principal._id,
    TEACHER_PLACEHOLDERS.map((teacher) => teacher._id),
    shareImageId,
  )

  console.log(`Writing ${2 + TEACHER_PLACEHOLDERS.length} documents...`)
  const tx = client.transaction()
  tx.createOrReplace(principal)
  tx.createOrReplace(aboutPage)
  for (const teacher of TEACHER_PLACEHOLDERS) tx.createOrReplace(teacher)
  await tx.commit()

  console.log('Done. Open /studio/structure/aboutPage to review and edit the content.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
