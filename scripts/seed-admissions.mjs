/**
 * Seeds the Sanity dataset with the initial **Admissions page** content.
 *
 * DEVELOPMENT ONLY — a one-off bootstrap, not part of the website. The site never
 * reads these files: once seeded, everything lives in Sanity and is edited
 * through the Studio.
 *
 * This script is deliberately **additive**: it creates or replaces only the
 * `admissionsPage` document and uploads only the image it needs. It never touches
 * Home, About, Site settings or Navigation, so it is safe to re-run at any time —
 * including after hand-editing content in the Studio.
 *
 * Usage:
 *   node scripts/seed-admissions.mjs
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

  throw new Error('No write token found. Set SANITY_API_WRITE_TOKEN or run `npx sanity login`.')
}

const client = createClient({projectId, dataset, apiVersion, token: resolveToken(), useCdn: false})

/* -------------------------------------------------------------------------- */
/* Assets                                                                      */
/* -------------------------------------------------------------------------- */

/** The only new asset: the admission brochure shown in the framed panel. */
const NEW_ASSET_FILES = {
  'admissions-brochure': {
    filename: 'admissions-brochure.jpg',
    title: 'J.I.D.S. admission brochure',
    description: 'What is included in the yearly charges — the downloadable admission flyer.',
  },
}

/** An existing asset to reuse for the SEO share image, if it is present. */
const SHARE_IMAGE_SOURCE_FILENAME = 'hero-rainbow-classroom.png'

const uploaded = new Map()

async function uploadAssets() {
  console.log('Uploading new assets...')
  for (const [key, {filename, title, description}] of Object.entries(NEW_ASSET_FILES)) {
    const file = path.join(assetsDir, filename)
    if (!fs.existsSync(file)) throw new Error(`Missing ${file}. Download the reference image first.`)
    const asset = await client.assets.upload('image', fs.readFileSync(file), {
      filename,
      title,
      description,
    })
    uploaded.set(key, asset._id)
    console.log(`  ${key.padEnd(22)} -> ${asset._id}`)
  }
}

/** Reuses an already-uploaded asset by original filename, avoiding a duplicate. */
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

/* -------------------------------------------------------------------------- */
/* The Admissions page singleton                                              */
/* -------------------------------------------------------------------------- */

/**
 * Section content is taken verbatim from `JIDS/admission.html`, which is the
 * initial content only — Sanity is the source of truth from here on.
 *
 * Note the step numbers are **not** stored: the website generates 1…N from the
 * array order, so this list can be reordered or shortened without renumbering.
 */
const buildAdmissionsPage = (brochureId, shareImageId) => ({
  _id: 'admissionsPage',
  _type: 'admissionsPage',
  internalTitle: 'Admissions page',
  sections: [
    {
      _key: 'hero',
      _type: 'pageHeroSection',
      enabled: true,
      heading: 'New Admissions For 2027: Starting On Sep 21, 2026',
      subheading: null,
      appearance: 'pattern',
      crumbs: [
        {_key: 'crumb-home', _type: 'breadcrumbItem', label: 'Home', url: '/'},
        {_key: 'crumb-current', _type: 'breadcrumbItem', label: 'Admissions', url: null},
      ],
      buttons: [
        {
          _key: 'hero-whatsapp',
          _type: 'button',
          label: 'WhatsApp Us Now',
          url: 'https://wa.me/8801820080080',
          newTab: true,
          variant: 'primary',
        },
        {
          _key: 'hero-download',
          _type: 'button',
          label: 'Download Admission Form',
          url: '#download',
          newTab: false,
          variant: 'light',
        },
      ],
    },
    {
      _key: 'steps',
      _type: 'processStepsSection',
      enabled: true,
      anchorId: 'apply',
      header: {
        _type: 'sectionHeader',
        heading: 'How To Apply',
        subheading: "Five simple steps from enquiry to your child's first day.",
      },
      steps: [
        {
          _key: 'step-1',
          _type: 'processStep',
          title: 'Collect The Form',
          description: 'Download online or collect in person.',
          isHighlighted: false,
        },
        {
          _key: 'step-2',
          _type: 'processStep',
          title: 'Submit Documents',
          description: 'Fill the form and submit with required documents.',
          isHighlighted: false,
        },
        {
          _key: 'step-3',
          _type: 'processStep',
          title: 'School Visit / Interview',
          description: 'Visit the campus and meet principal with our child.',
          isHighlighted: false,
        },
        {
          _key: 'step-4',
          _type: 'processStep',
          title: 'Confirm Seat',
          description: "Pay the admission fee to secure your child's place.",
          isHighlighted: false,
        },
        {
          _key: 'step-5',
          _type: 'processStep',
          title: 'Welcome!',
          description: 'Join the Jahan International Dream School family.',
          isHighlighted: true,
        },
      ],
    },
    {
      _key: 'brochure',
      _type: 'featureImageSection',
      enabled: true,
      anchorId: 'download',
      image: image(
        brochureId,
        'Jahan International Dream School Admission Brochure - What is included in yearly charges',
      ),
      caption: null,
      width: 'narrow',
    },
    {
      _key: 'referral',
      _type: 'calloutSection',
      enabled: true,
      tone: 'green',
      heading: 'Refer A Friend. Both Families Save BDT 2,000',
      body:
        'Already a JIDS parent? When you refer a new family and they enrol, both you and the new family will receive a BDT 2,000 discount on admission and annual fees.',
      buttonIcon: 'whatsapp',
      button: {
        _type: 'button',
        label: 'Share On WhatsApp',
        url: 'https://wa.me/?text=Check%20out%20Jahan%20International%20Dream%20School%20Admissions!',
        newTab: true,
        variant: 'primary',
      },
    },
    {
      _key: 'faq',
      _type: 'faqSection',
      enabled: true,
      anchorId: 'faq',
      heading: 'Frequently Asked Questions',
      subheading: null,
      items: [
        {
          _key: 'faq-1',
          _type: 'faqItem',
          question: 'What Documents Are Required For Admission?',
          answer:
            'Birth certificate (photocopy), 4 passport-size photos of the child, parent/guardian NID copy, and 2 copies of passport-size photos of their guardian, and the completed admission form. A transfer certificate maybe needed for students moving from another school.',
          isOpenByDefault: true,
        },
        {
          _key: 'faq-2',
          _type: 'faqItem',
          question: 'Is There An Entrance Test?',
          answer:
            'For early kindergarten years, we conduct an informal interactive observation session with the child and parents. For senior grades, a basic foundational evaluation in English and Mathematics is conducted to ensure appropriate grade placement.',
          isOpenByDefault: false,
        },
        {
          _key: 'faq-3',
          _type: 'faqItem',
          question: 'When Does The Academic Session Start?',
          answer:
            'Our new academic session commences officially in the first week of January 2027. Early orientation sessions and parent briefings start in late December 2026.',
          isOpenByDefault: false,
        },
        {
          _key: 'faq-4',
          _type: 'faqItem',
          question: 'What Is The Admission Form Fee?',
          answer:
            'The admission form and prospectus pack is available for BDT 500 from the school admissions counter or can be downloaded and submitted online.',
          isOpenByDefault: false,
        },
        {
          _key: 'faq-5',
          _type: 'faqItem',
          question: 'Is Van Service Available?',
          answer:
            'Yes, dedicated, safe, and GPS-monitored school van transport is available across Tongi, Gazipur, Uttara, and adjacent areas with designated attendant care.',
          isOpenByDefault: false,
        },
        {
          _key: 'faq-6',
          _type: 'faqItem',
          question: 'Are There Sibling Discounts?',
          answer:
            'Yes, we provide a sibling fee waiver of 25% on the monthly tuition fee for the second child onwards while both siblings are concurrently enrolled.',
          isOpenByDefault: false,
        },
        {
          _key: 'faq-7',
          _type: 'faqItem',
          question: 'What Is The School Uniform Policy?',
          answer:
            'Students are required to wear the official school uniform Monday through Thursday. Fridays/Events have sports kits or designated theme attire. Detailed dress specifications are provided at admission.',
          isOpenByDefault: false,
        },
        {
          _key: 'faq-8',
          _type: 'faqItem',
          question: 'Do You Have Parent-Teacher Meetings?',
          answer:
            'Regular PTMs are held at the end of each term, as well as monthly academic updates. Teachers are also reachable by appointment during weekday consultation hours.',
          isOpenByDefault: false,
        },
        {
          _key: 'faq-9',
          _type: 'faqItem',
          question: 'Can My Child Join Mid-Session?',
          answer:
            "Mid-session transfers are accommodated strictly based on seat availability and evaluation of previous academic records from the candidate's prior institution.",
          isOpenByDefault: false,
        },
        {
          _key: 'faq-10',
          _type: 'faqItem',
          question: 'How Do I Pay Fees?',
          answer:
            'Tuition and charges may be settled conveniently via bKash, Nagad, direct bank transfer, or at the school accounts desk by the 10th of every calendar month.',
          isOpenByDefault: false,
        },
      ],
    },
    {
      _key: 'cta',
      _type: 'pageCtaSection',
      enabled: true,
      badge: null,
      heading: 'Still Have Questions?',
      subheading: 'Our admissions team is here to help.',
      primaryButton: {
        _type: 'button',
        label: 'WhatsApp Now',
        url: 'https://wa.me/8801820080080',
        newTab: true,
        variant: 'invert',
      },
      secondaryButton: {
        _type: 'button',
        label: 'Call +88 018 200 800 80',
        url: 'tel:01820080080',
        newTab: false,
        variant: 'white',
      },
    },
  ],
  seo: {
    _type: 'seo',
    // The root layout appends " | Jahan International Dream School", so metaTitle
    // carries only the page-specific part.
    metaTitle: 'Admissions 2027 | Apply Online',
    metaDescription:
      'Admissions open for 2027. See how to apply in five steps, download the admission form, read fees and sibling discount FAQs, and enquire on WhatsApp.',
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

  const brochureId = uploaded.get('admissions-brochure')
  const shareImageId = await findExistingAsset(SHARE_IMAGE_SOURCE_FILENAME)
  console.log(
    shareImageId
      ? `  reusing existing asset for the share image: ${shareImageId}`
      : '  no existing share image found; the page will fall back to the site default',
  )

  const page = buildAdmissionsPage(brochureId, shareImageId)

  console.log('Writing 1 document...')
  const tx = client.transaction()
  tx.createOrReplace(page)
  await tx.commit()

  console.log('Done. Open /studio/structure/admissionsPage to review and edit the content.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
