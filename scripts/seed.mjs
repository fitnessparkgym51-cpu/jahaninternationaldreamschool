/**
 * Seeds the Sanity dataset with the initial Home page content.
 *
 * DEVELOPMENT ONLY — this is a one-off bootstrap, not part of the website.
 * The site never reads these files: once seeded, everything lives in Sanity and
 * is edited through the Studio.
 *
 * Usage:
 *   node scripts/seed.mjs            # create or replace the seeded documents
 *   node scripts/seed.mjs --clean    # delete every document and asset first
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
/* Asset upload (de-duplicated by file content)                                */
/* -------------------------------------------------------------------------- */

/**
 * Reference assets, keyed by the role they play on the Home page.
 *
 * Byte-identical source photos are de-duplicated into a single Sanity asset, so
 * the same classroom picture is stored once and referenced from the hero slide,
 * the "our story" section and the news item that reuse it.
 */
const ASSET_FILES = {
  'brand-crest': {
    filename: 'brand-crest.png',
    title: 'J.I.D.S. crest',
    description: 'School crest — used in the header, the footer and the social card.',
  },
  'hero-classroom': {
    filename: 'hero-rainbow-classroom.png',
    title: 'Students in the rainbow classroom',
    description: 'Hero slide 1, the "Our story" photo and the news post about classrooms.',
  },
  'hero-awards': {
    filename: 'hero-artwork-awards.png',
    title: 'Artwork and awards celebration',
    description: 'Hero slide 2 and the National Day art competition news post.',
  },
  'alumni-ahil': {filename: 'alumni-ahil.jpg', title: 'Student portrait — Ahil A.'},
  'alumni-tawhidur': {filename: 'alumni-tawhidur.jpg', title: 'Student portrait — Tawhidur R.'},
  'alumni-anusrito': {filename: 'alumni-anusrito.jpg', title: 'Student portrait — Anusrito K.'},
  'alumni-tahsin': {filename: 'alumni-tahsin.jpg', title: 'Student portrait — Tahsin A.'},
  'news-sports-day': {filename: 'news-sports-day.jpg', title: 'Annual sports day'},
}

/** Map of asset key -> uploaded Sanity asset document id. */
const uploaded = new Map()

/**
 * Deletes every document in the dataset, including uploaded image assets.
 *
 * The Sanity client's high-level transaction API asks for an extra `manage`
 * grant; the raw mutate endpoint only needs write access, so we call that
 * directly.
 */
async function cleanDataset() {
  const headers = {
    Authorization: `Bearer ${client.config().token}`,
    'Content-Type': 'application/json',
  }

  // The client prepends the project id, so this is /data/export/<project>/<dataset>.
  // The export endpoint returns newline-delimited JSON.
  const ndjson = await client.request({uri: `/data/export/${dataset}`})
  const ids = String(ndjson)
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line)._id)
    // `_.groups.*` and `_.retention.*` are Sanity's own system documents.
    .filter((id) => id && !id.startsWith('_.'))

  if (!ids.length) {
    console.log('Nothing to clean.')
    return
  }

  console.log(`Deleting ${ids.length} documents...`)
  for (let index = 0; index < ids.length; index += 100) {
    const mutations = ids.slice(index, index + 100).map((id) => ({delete: {id}}))
    const res = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({mutations}),
    })
    if (!res.ok) {
      throw new Error(`Delete failed: HTTP ${res.status} ${await res.text()}`)
    }
  }
}

async function uploadAssets() {
  console.log('Uploading assets...')
  for (const [key, {filename, title, description}] of Object.entries(ASSET_FILES)) {
    const file = path.join(assetsDir, filename)
    if (!fs.existsSync(file)) {
      throw new Error(`Missing ${file}. Download the reference images first.`)
    }
    const buffer = fs.readFileSync(file)
    const asset = await client.assets.upload('image', buffer, {filename, title, description})
    uploaded.set(key, asset._id)
    console.log(`  ${key.padEnd(18)} -> ${asset._id}`)
  }
}

/** Builds an `imageWithAlt` value. */
function image(key, alt) {
  return {
    _type: 'imageWithAlt',
    image: {
      _type: 'image',
      asset: {_type: 'reference', _ref: uploaded.get(key)},
    },
    alt,
  }
}

/* -------------------------------------------------------------------------- */
/* Reusable documents                                                         */
/* -------------------------------------------------------------------------- */

const buildStudents = () => [
  {
    _id: 'studentSpotlight-ahil',
    _type: 'studentSpotlight',
    name: 'Ahil A.',
    classLabel: 'Class II',
    photo: image('alumni-ahil', 'Portrait of Ahil A.'),
    cohortLabel: 'J.I.D.S. Cohort',
    schoolName: 'St. Joseph Higher Secondary School',
    note: 'Got admitted to St. Joseph Higher Secondary School in 2026',
  },
  {
    _id: 'studentSpotlight-tawhidur',
    _type: 'studentSpotlight',
    name: 'Tawhidur R.',
    classLabel: 'Class II',
    photo: image('alumni-tawhidur', 'Portrait of Tawhidur R.'),
    cohortLabel: 'J.I.D.S. Cohort',
    schoolName: 'St. Joseph Higher Secondary School',
    note: 'Got admitted to St. Joseph Higher Secondary School in 2026',
  },
  {
    _id: 'studentSpotlight-anusrito',
    _type: 'studentSpotlight',
    name: 'Anusrito K.',
    classLabel: 'Class II',
    photo: image('alumni-anusrito', 'Portrait of Anusrito K.'),
    cohortLabel: 'J.I.D.S. Cohort',
    schoolName: 'St. Joseph Higher Secondary School',
    note: 'Got admitted to St. Joseph Higher Secondary School in 2026',
  },
  {
    _id: 'studentSpotlight-tahsin',
    _type: 'studentSpotlight',
    name: 'Tahsin A.',
    classLabel: 'Class II',
    photo: image('alumni-tahsin', 'Portrait of Tahsin A.'),
    cohortLabel: 'J.I.D.S. Cohort',
    schoolName: 'St. Joseph Higher Secondary School',
    note: 'Got admitted to St. Joseph Higher Secondary School in 2026',
  },
].map((doc) => ({...doc, isVisible: true}))

const buildNewsPosts = () => [
  {
    _id: 'newsPost-national-art-competition',
    _type: 'newsPost',
    title: "National Day Art Competition & Prize Distribution",
    category: 'Art & Culture',
    excerpt:
      'Students proudly showcased their creative drawings celebrating the national heritage of Bangladesh and received special award pencil kits.',
    image: image('hero-awards', 'J.I.D.S. National Art Competition'),
  },
  {
    _id: 'newsPost-multimedia-classrooms',
    _type: 'newsPost',
    title: 'Vibrant Mural & Multimedia Classrooms Now Fully Active',
    category: 'Academics',
    excerpt:
      'Our colorful classroom environment featuring scenic rainbow murals and attentive guidance creates an inspiring space for daily learning.',
    image: image('hero-classroom', 'J.I.D.S. Rainbow Multimedia Classroom'),
  },
  {
    _id: 'newsPost-sports-day',
    _type: 'newsPost',
    title: 'A Day Of Cheers, Medals And Tiny Champions',
    category: 'Events',
    excerpt:
      "We're delighted to share that our little learners excelled in the annual sports day with exciting games, medal ceremonies, and cheerful parents.",
    image: image('news-sports-day', 'Children celebrating at the J.I.D.S. annual sports day'),
  },
].map((doc) => ({...doc, isVisible: true}))

/* -------------------------------------------------------------------------- */
/* Site settings                                                              */
/* -------------------------------------------------------------------------- */

const buildBrand = () => ({
  _type: 'brand',
  logo: image('brand-crest', 'Jahan International Dream School Crest'),
  name: 'Jahan International Dream School',
  acronym: 'J.I.D.S.',
  establishedLabel: 'Estd: 2021',
})

const buildSiteSettings = () => ({
  _id: 'siteSettings',
  _type: 'siteSettings',
  internalTitle: 'Site settings',
  brand: buildBrand(),
  contact: {
    _type: 'contactBlock',
    address: 'Mohammadpur, Dhaka, Bangladesh',
    phoneLabel: '02-48111854',
    phoneHref: 'tel:880248111854',
    mobileLabel: '018-200-80080',
    mobileHref: 'tel:8801820080080',
    emailLabel: 'info@jids.edu.bd',
    emailHref: 'mailto:info@jids.edu.bd',
  },
  socialLinks: [
    {_key: 'social-facebook', _type: 'socialLink', icon: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/JIDS.2022'},
    {_key: 'social-whatsapp', _type: 'socialLink', icon: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/8801820080080'},
  ],
  footer: {
    _type: 'footer',
    enabled: true,
    tagline: 'Best Education. The Right Investment.',
    contactItems: [
      {_key: 'contact-address', _type: 'contactListItem', icon: 'map-pin', label: 'Mohammadpur, Dhaka, Bangladesh'},
      {_key: 'contact-phone', _type: 'contactListItem', icon: 'phone', label: '02-48111854', href: 'tel:880248111854'},
      {_key: 'contact-mobile', _type: 'contactListItem', icon: 'mobile', label: '018-200-80080', href: 'tel:8801820080080'},
      {_key: 'contact-email', _type: 'contactListItem', icon: 'mail', label: 'info@jids.edu.bd', href: 'mailto:info@jids.edu.bd'},
    ],
    quickLinksTitle: 'Quick Links',
    quickLinks: [
      {_key: 'ql-about', _type: 'link', label: 'About Us', url: '/about-us'},
      {_key: 'ql-academics', _type: 'link', label: 'Academics', url: '/academics'},
      {_key: 'ql-admissions', _type: 'link', label: 'Admissions', url: '/admissions'},
      {_key: 'ql-alumni', _type: 'link', label: 'Alumni & Students', url: '/why-choose-us'},
      {_key: 'ql-calendar', _type: 'link', label: 'Calendar', url: '/admissions'},
      {_key: 'ql-news', _type: 'link', label: 'News & Events', url: '/news'},
      {_key: 'ql-contact', _type: 'link', label: 'Contact Us', url: '/contact'},
      {_key: 'ql-privacy', _type: 'link', label: 'Privacy Policy', url: '/privacy'},
    ],
    socialTitle: 'Follow Us',
    socialCard: {
      _type: 'socialPreviewCard',
      bannerLabel: '2027 Admission starts Sep 21',
      image: image('brand-crest', 'J.I.D.S. Logo'),
      title: 'Jahan International Dream School',
      subtitle: 'Official Page • J.I.D.S.',
      description:
        'Estd 2021. Empowering young minds through an inclusive bilingual curriculum...',
      url: 'https://www.facebook.com/JIDS.2022',
    },
    mapTitle: 'Find Us',
    map: {
      _type: 'mapCard',
      buttonLabel: 'Open in Maps',
      url: 'https://maps.google.com/?q=Mohammadpur,Dhaka,Bangladesh',
      pinLabel: "Jahan Int'l Dream School",
      areaLabel: 'Mohammadpur • Dhaka',
    },
    copyrightText:
      '© 2021–2026 Jahan International Dream School (J.I.D.S.). All rights reserved.',
    legalLinks: [
      {_key: 'll-privacy', _type: 'link', label: 'Privacy', url: '/privacy'},
      {_key: 'll-terms', _type: 'link', label: 'Terms of Service', url: '/terms'},
      {_key: 'll-sitemap', _type: 'link', label: 'Sitemap', url: '/sitemap'},
    ],
  },
  floatingContact: {
    _type: 'floatingContact',
    enabled: true,
    bubbleLabel: 'Need Help? Chat with J.I.D.S.',
    icon: 'whatsapp',
    url: 'https://wa.me/8801820080080',
    ariaLabel: 'Chat on WhatsApp',
  },
  seo: {
    _type: 'seo',
    metaTitle: 'Jahan International Dream School (J.I.D.S.) | Estd: 2021',
    metaDescription:
      'Jahan International Dream School in Mohammadpur, Dhaka — an inclusive bilingual primary school from Playgroup to Class V. Enquire about 2027 admissions.',
    shareImage: image(
      'hero-classroom',
      'J.I.D.S. students in the rainbow multimedia classroom',
    ),
    canonicalUrl: null,
    noIndex: false,
  },
})

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

const buildNavigation = () => ({
  _id: 'navigation',
  _type: 'navigation',
  internalTitle: 'Navigation',
  topBar: {
    _type: 'topBar',
    enabled: true,
    contactLinks: [
      {
        _key: 'tb-whatsapp',
        _type: 'topBarLink',
        icon: 'whatsapp',
        label: 'Phone/WhatsApp: 018-200-800-80',
        url: 'tel:01820080080',
      },
      {
        _key: 'tb-facebook',
        _type: 'topBarLink',
        icon: 'facebook',
        label: 'Facebook',
        url: 'https://www.facebook.com/JIDS.2022',
        newTab: true,
      },
    ],
    badge: 'Estd: 2021',
    notice: {
      _type: 'button',
      label: 'Admission For 2027',
      url: '#admission',
      newTab: false,
      variant: 'primary',
    },
  },
  header: {
    _type: 'header',
    enabled: true,
    homeUrl: '/',
    brandSubline: '',
    items: [
      {_key: 'nav-home', _type: 'navItem', label: 'Home', url: '/', highlight: true},
      {
        _key: 'nav-about',
        _type: 'navItem',
        label: 'About us',
        url: '/about-us',
        showChevron: true,
        children: [
          {_key: 'nav-about-us', _type: 'navChildLink', label: 'About Us', url: '/about-us'},
          {
            _key: 'nav-about-teachers',
            _type: 'navChildLink',
            icon: 'users',
            label: 'Our Teachers',
            url: '/about-us#our-teachers',
          },
        ],
      },
      {
        _key: 'nav-academics',
        _type: 'navItem',
        label: 'Academics',
        url: '/academics',
        showChevron: true,
        children: [
          {
            _key: 'nav-classes',
            _type: 'navChildLink',
            label: 'Classes & Curriculum',
            url: '/academics',
          },
          {
            _key: 'nav-routine',
            _type: 'navChildLink',
            icon: 'calendar',
            label: 'Class Routine',
            url: '/academics/class-routine',
          },
        ],
      },
      {
        _key: 'nav-admissions',
        _type: 'navItem',
        label: 'Admissions',
        url: '/admissions',
        showChevron: true,
      },
      {_key: 'nav-news', _type: 'navItem', label: 'News', url: '/news'},
      {_key: 'nav-contact', _type: 'navItem', label: 'Contact', url: '/contact'},
      {
        _key: 'nav-complaint',
        _type: 'navItem',
        label: 'Complaint Box',
        url: '/complaint-box',
        showChevron: true,
      },
    ],
    cta: {
      _type: 'button',
      label: 'Enquire Now',
      url: '/contact#contact-form',
      newTab: false,
      variant: 'primary',
    },
    mobileMenuTitle: 'J.I.D.S. Menu',
    mobileMenuCta: {
      _type: 'button',
      label: 'WhatsApp Us',
      url: 'https://wa.me/8801820080080',
      newTab: true,
      variant: 'green',
    },
  },
})

/* -------------------------------------------------------------------------- */
/* Home page                                                                  */
/* -------------------------------------------------------------------------- */

const buildSections = () => [
  {
    _key: 'hero',
    _type: 'heroSection',
    enabled: true,
    eyebrow: 'Jahan International Dream School • Estd: 2021',
    heading: 'Empowering Young Minds For Global Excellence',
    description:
      'An exclusive modern educare centre where English and Bangla excellence meet with creativity and character.',
    primaryButton: {
      _type: 'button',
      label: 'Enquire About Admissions',
      url: '/admissions',
      newTab: false,
      variant: 'primary',
    },
    secondaryButton: {
      _type: 'button',
      label: 'Watch School Tour',
      url: '/contact#contact-form',
      newTab: false,
      variant: 'light',
    },
    highlightBadge: 'Best Education. The Right Investment.',
    autoplaySeconds: 4.5,
    slides: [
      {
        _key: 'hero-slide-1',
        _type: 'heroSlide',
        isVisible: true,
        image: image('hero-classroom', 'J.I.D.S. Students in Rainbow Classroom'),
      },
      {
        _key: 'hero-slide-2',
        _type: 'heroSlide',
        isVisible: true,
        image: image(
          'hero-awards',
          'Jahan International Dream School Artwork and Awards Celebration',
        ),
      },
    ],
  },
  {
    _key: 'stats',
    _type: 'statsBarSection',
    enabled: true,
    items: [
      {_key: 'stat-1', _type: 'statItem', value: 'Estd. 2021', label: 'Dedicated to Excellence'},
      {_key: 'stat-2', _type: 'statItem', value: '100%', label: 'Curriculum Success & Care'},
      {
        _key: 'stat-3',
        _type: 'statItem',
        value: 'Play to Class V',
        label: 'Complete Primary Foundation',
        isSmaller: true,
      },
      {_key: 'stat-4', _type: 'statItem', value: '4.9 ★', label: 'Parent Satisfaction & Trust'},
    ],
  },
  {
    _key: 'features',
    _type: 'featuresSection',
    enabled: true,
    header: {
      _type: 'sectionHeader',
      heading: 'Why Parents Choose Jahan International Dream School',
      subheading:
        'Six foundational reasons families trust J.I.D.S. for early childhood and primary schooling excellence.',
    },
    cards: [
      {
        _key: 'feature-1',
        _type: 'featureCard',
        isVisible: true,
        icon: 'book',
        title: 'Blended Curriculum',
        description:
          'English and Bangla excellence — preparing children with bilingual fluency and intellectual agility from day one.',
      },
      {
        _key: 'feature-2',
        _type: 'featureCard',
        isVisible: true,
        icon: 'monitor-play',
        badge: 'SMART',
        title: 'Smart Multimedia Classroom',
        description:
          'Vibrant, climate-controlled multimedia classrooms with interactive visual displays and artistic learning environments.',
      },
      {
        _key: 'feature-3',
        _type: 'featureCard',
        isVisible: true,
        icon: 'shield-check',
        title: 'Safety & Care First',
        description:
          '24/7 CCTV surveillance, vigilant staff, safe drop-off/pick-up protocols, and compassionate student care at all times.',
      },
      {
        _key: 'feature-4',
        _type: 'featureCard',
        isVisible: true,
        icon: 'sparkle',
        useAmberIcon: true,
        title: 'Pathway To Top Schools',
        description:
          "Our students consistently demonstrate high academic achievement, earning spots in the capital's most prestigious institutions.",
      },
      {
        _key: 'feature-5',
        _type: 'featureCard',
        isVisible: true,
        icon: 'book-open',
        title: 'Reading & Creative Arts',
        description:
          'Dedicated spaces and art competitions that inspire young artists, passionate readers, and independent thinkers.',
      },
      {
        _key: 'feature-6',
        _type: 'featureCard',
        isVisible: true,
        icon: 'smile',
        title: 'Activities & National Celebrations',
        description:
          'National day celebrations, painting contests, speech sessions, cultural shows, and exciting annual school picnics.',
      },
    ],
  },
  {
    _key: 'about',
    _type: 'aboutStorySection',
    enabled: true,
    image: image('hero-classroom', 'Jahan International Dream School Classroom Experience'),
    eyebrow: 'About J.I.D.S. • Estd: 2021',
    heading: "Nurturing Every Child's Dream Since 2021",
    body: [
      'Jahan International Dream School (J.I.D.S.) was established in 2021 with the vision to deliver world-standard early childhood education grounded in moral values, creative expression, and strong linguistic ability.',
      'Our bilingual curriculum — English combined with Bengali cultural heritage — empowers young learners with confidence, curiosity, and critical thinking skills needed for lifelong academic triumph.',
    ],
    link: {_type: 'link', label: 'Learn More About Our Vision', url: '/about-us'},
    metaText: 'Playgroup to Primary',
  },
  {
    _key: 'students',
    _type: 'studentSpotlightSection',
    enabled: true,
    header: {
      _type: 'sectionHeader',
      heading: "Our Students Excel At Dhaka's Top Schools",
      subheading:
        'From St. Joseph, Residential Model, Viqarunnisa to Holy Cross, Jahan International Dream School learners carry excellence with them.',
    },
    students: buildStudents().map((student) => ({
      _key: student._id,
      _type: 'reference',
      _ref: student._id,
    })),
    cta: {
      _type: 'button',
      label: 'View All Student Success Stories',
      url: '/why-choose-us',
      newTab: false,
      variant: 'outline',
    },
  },
  {
    _key: 'admission',
    _type: 'admissionBannerSection',
    enabled: true,
    anchorId: 'admission',
    badge: 'Admissions Open',
    heading: 'J.I.D.S. Admissions For 2027: Starting On Sep 21, 2026',
    primaryButton: {
      _type: 'button',
      label: 'WhatsApp Us Now',
      url: 'https://wa.me/8801820080080',
      newTab: true,
      variant: 'primary',
    },
    secondaryButton: {
      _type: 'button',
      label: 'Download Admission Form',
      url: '/admissions',
      newTab: false,
      variant: 'light',
    },
  },
  {
    _key: 'news',
    _type: 'newsSection',
    enabled: true,
    header: {
      _type: 'sectionHeader',
      heading: "What's Happening At Jahan International Dream School",
      subheading:
        'A glimpse of recent classroom moments, creative art competitions and joyful celebrations.',
    },
    posts: buildNewsPosts().map((post) => ({
      _key: post._id,
      _type: 'reference',
      _ref: post._id,
    })),
  },
  {
    _key: 'reviews',
    _type: 'reviewBarSection',
    enabled: true,
    brandLabel: 'Google',
    score: '4.9',
    summary: 'Out Of 5 • Highly Recommended',
    stars: 5,
    primaryButton: {
      _type: 'button',
      label: 'Leave A Google Review →',
      url: 'https://g.page/r/review',
      newTab: true,
      variant: 'green',
    },
    secondaryButton: {
      _type: 'button',
      label: 'See All Reviews',
      url: 'https://g.page/r/review',
      newTab: true,
      variant: 'link',
    },
  },
]

const buildHomePage = () => ({
  _id: 'homePage',
  _type: 'homePage',
  internalTitle: 'Home page',
  sections: buildSections(),
  seo: {
    _type: 'seo',
    metaTitle: 'Jahan International Dream School (J.I.D.S.) | Estd: 2021',
    metaDescription:
      'An exclusive modern educare centre in Mohammadpur, Dhaka where English and Bangla excellence meet with creativity and character. Admissions open for 2027.',
    shareImage: image('hero-classroom', 'J.I.D.S. students in the rainbow classroom'),
    canonicalUrl: null,
    noIndex: false,
  },
})

/* -------------------------------------------------------------------------- */
/* Run                                                                         */
/* -------------------------------------------------------------------------- */

async function run() {
  if (process.argv.includes('--clean')) {
    await cleanDataset()
  }

  await uploadAssets()

  const documents = [
    buildSiteSettings(),
    buildNavigation(),
    buildHomePage(),
    ...buildStudents(),
    ...buildNewsPosts(),
  ]

  console.log(`Writing ${documents.length} documents...`)
  for (let index = 0; index < documents.length; index += 50) {
    const tx = client.transaction()
    for (const doc of documents.slice(index, index + 50)) tx.createOrReplace(doc)
    await tx.commit()
  }

  console.log('Done. Open /studio to review and edit the content.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
