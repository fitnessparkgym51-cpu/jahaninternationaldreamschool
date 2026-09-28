// Applies the SEO and local-SEO corrections identified in the audit of
// 2026-09-27. Every change is data only — no schema field is added, renamed or
// removed here, so nothing can be orphaned by running it.
//
//   node --env-file=.env.local scripts/seed-seo.mjs            # dry run: report only
//   node --env-file=.env.local scripts/seed-seo.mjs --apply    # write to Sanity
//
// The script is idempotent: running it twice reports no further changes.
//
// WHAT IT DOES NOT DO, deliberately: it never writes headings, paragraphs,
// eyebrows or any other page copy. Those are the school's words. This script owns
// search-engine metadata and the school's contact details, nothing else. If you
// edit a heading in the Studio, this script will not undo it.
//
// The school confirmed that the current campus is TNT, Tongi, Gazipur, with the
// phone number and email already published on the Contact page. Site settings,
// the top bar, the footer's "Find us" map and every meta description still
// carried the previous Mohammadpur, Dhaka details. A search engine cannot rank a
// business whose name, address and phone disagree with themselves, so these are
// corrected at the source — `siteSettings` — rather than typed into each page.
import {createClient} from '@sanity/client'

const APPLY = process.argv.includes('--apply')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-09-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

/* -------------------------------------------------------------------------- */
/* The confirmed facts                                                         */
/* -------------------------------------------------------------------------- */

const CAMPUS = {
  address: 'TNT, Tongi, Gazipur, Bangladesh',
  area: 'TNT, Tongi, Gazipur',
  phoneLabel: '01717-103326',
  phoneDigits: '8801717103326',
  email: 'jids21@gmail.com',
  locality: 'Tongi',
  region: 'Gazipur',
  country: 'BD',
}

/**
 * Old string → new string, applied to every string in every document.
 *
 * The retired details appear in more places than anyone would guess — a `wa.me`
 * link inside a hero button, a `tel:` inside a footer list item, a `mailto:` —
 * so each one is replaced everywhere rather than patched where it was noticed.
 * Longest first, so a number that contains another is not half-replaced.
 */
const REPLACEMENTS = [
  // Mohammadpur, Dhaka → TNT, Tongi, Gazipur
  ['Mohammadpur, Dhaka, Bangladesh', CAMPUS.address],
  ['Mohammadpur, Dhaka', CAMPUS.area],
  // The footer's "Find us" caption is "Mohammadpur • Dhaka". Written as an escape
  // so the bullet cannot be corrupted by an editor's file encoding.
  ['Mohammadpur \u2022 Dhaka', 'Tongi \u2022 Gazipur'],
  ['Mohammadpur  Dhaka', CAMPUS.area],
  // Mobile / WhatsApp
  ['8801820080080', CAMPUS.phoneDigits],
  ['018-200-80080', CAMPUS.phoneLabel],
  ['01820080080', CAMPUS.phoneDigits],
  ['01800000', '01717-103326'],
  // Email
  ['info@jids.edu.bd', CAMPUS.email],
  // Map link. A search query for the school in its town, not a claimed pin —
  // replace with the exact place link once the school provides one.
  [
    'https://maps.google.com/?q=Mohammadpur,Dhaka,Bangladesh',
    'https://www.google.com/maps/search/?api=1&query=Jahan%20International%20Dream%20School%20Tongi%2C%20Gazirpur',
  ],
]

/* -------------------------------------------------------------------------- */
/* Diffing                                                                    */
/* -------------------------------------------------------------------------- */

const changes = []
const touched = new Map()

function record(docId, path, from, to) {
  changes.push({docId, path, from, to})
  if (!touched.has(docId)) touched.set(docId, new Set())
  touched.get(docId).add(path)
}

/** Recursively rewrites every string in a value, recording each change. */
function rewrite(docId, value, path = '') {
  if (typeof value === 'string') {
    let out = value
    for (const [from, to] of REPLACEMENTS) {
      if (out.includes(from)) {
        record(docId, `${path || 'document'}`, out, out.replaceAll(from, to))
        out = out.replaceAll(from, to)
      }
    }
    return out
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => rewrite(docId, item, `${path}[${index}]`))
  }

  if (value && typeof value === 'object') {
    const out = {}
    for (const [key, item] of Object.entries(value)) {
      // Skip identity and bookkeeping: rewriting those would create a new
      // revision storm and can detach references.
      if (key === '_rev' || key === '_createdAt' || key === '_updatedAt') {
        out[key] = item
        continue
      }
      out[key] = rewrite(docId, item, path ? `${path}.${key}` : key)
    }
    return out
  }

  return value
}

/**
 * Order-insensitive comparison.
 *
 * Sanity does not preserve object key order, so comparing `JSON.stringify`
 * output would report a change every run for a field that is already correct.
 */
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value) ?? 'undefined'
}

/**
 * Sets a value on `target` and records it when it is actually different.
 *
 * `path` is relative to `target` and is only used for the report, so
 * `set(docId, doc.seo, 'metaTitle', …)` is correct even though the field lives at
 * `seo.metaTitle` on the document.
 */
function set(docId, target, path, value) {
  const current = path.split('.').reduce((node, key) => (node == null ? node : node[key]), target)
  if (stable(current) === stable(value)) return target
  record(docId, path, current, value)
  target[path] = value
  return target
}

/* -------------------------------------------------------------------------- */
/* The corrections                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Per-document edits that a string replacement cannot express.
 *
 * Titles are shortened rather than left to be truncated in the results: each one
 * is combined with " | Jahan International Dream School", and anything past about
 * 60 characters loses the school name in the search result. The composed
 * lengths are asserted by `scripts/verify-seo.mjs`.
 */
function editSiteSettings(doc) {
  // The retired Dhaka landline is unset rather than emptied: an empty label with
  // a `tel:` href would still render a dead link in the footer. Removing it is
  // also a local-SEO improvement — a number nobody can ring is a broken promise
  // to a search engine, not a listing detail.
  if (doc.contact?.phoneLabel) {
    record('siteSettings', 'contact.phoneLabel', doc.contact.phoneLabel, 'removed (no landline in service)')
    delete doc.contact.phoneLabel
  }
  if (doc.contact?.phoneHref) {
    record('siteSettings', 'contact.phoneHref', doc.contact.phoneHref, 'removed (no landline in service)')
    delete doc.contact.phoneHref
  }

  set('siteSettings', doc, 'postalAddress', {
    _type: 'postalAddress',
    addressLocality: CAMPUS.locality,
    addressRegion: CAMPUS.region,
    addressCountry: CAMPUS.country,
  })

  // Footer contact list: drop the dead landline line entirely.
  if (Array.isArray(doc.footer?.contactItems)) {
    const kept = doc.footer.contactItems.filter((item) => item?._key !== 'contact-phone')
    if (kept.length !== doc.footer.contactItems.length) {
      record(
        'siteSettings',
        'footer.contactItems',
        'landline line',
        'removed (no landline in service)',
      )
      doc.footer.contactItems = kept
    }
  }

  // The site's own WhatsApp button must reach the same number as the Contact page.
  if (doc.floatingContact?.url) {
    set('siteSettings', doc.floatingContact, 'url', `https://wa.me/${CAMPUS.phoneDigits}`)
  }

  // Broken footer links. `/privacy`, `/terms` and `/sitemap` have no route and
  // `/why-choose-us` is not built, so all four return 404 from every page. They
  // are removed rather than left as dead anchors; restoring them is a Studio
  // edit on the day those pages exist.
  if (Array.isArray(doc.footer?.legalLinks)) {
    const kept = doc.footer.legalLinks.filter((item) => !['/privacy', '/terms', '/sitemap'].includes(item?.url))
    if (kept.length !== doc.footer.legalLinks.length) {
      record('siteSettings', 'footer.legalLinks', '/privacy, /terms, /sitemap', 'removed (no route)')
      doc.footer.legalLinks = kept
    }
  }
  if (Array.isArray(doc.footer?.quickLinks)) {
    const kept = doc.footer.quickLinks.filter((item) => !['/why-choose-us', '/privacy'].includes(item?.url))
    if (kept.length !== doc.footer.quickLinks.length) {
      record('siteSettings', 'footer.quickLinks', '/why-choose-us, /privacy', 'removed (no route)')
      doc.footer.quickLinks = kept
    }
  }

  // The site-wide default description still named the old town and the old class
  // range ("Playgroup to Class V"); the school runs Play Group to Class 10.
  set(
    'siteSettings',
    doc.seo ?? (doc.seo = {_type: 'seo'}),
    'metaTitle',
    'Jahan International Dream School (J.I.D.S.) | Estd: 2021',
  )
  set(
    'siteSettings',
    doc.seo,
    'metaDescription',
    'Jahan International Dream School (J.I.D.S.) in Tongi, Gazipur — an English and Bangla medium school from Play Group to Class 10. Call, WhatsApp or send an enquiry about 2027 admissions.',
  )
  return doc
}

function editNavigation(doc) {
  // The top bar showed a truncated number ("01800000") that did not match the
  // number it linked to. `REPLACEMENTS` fixes the digits; this fixes the label.
  const phone = doc.topBar?.contactLinks?.find((link) => link?.url?.startsWith('tel:'))
  if (phone) {
    set('navigation', phone, 'label', `Phone/WhatsApp: ${CAMPUS.phoneLabel}`)
    set('navigation', phone, 'url', `tel:${CAMPUS.phoneDigits}`)
  }
  return doc
}

function editHomePage(doc) {
  // "View All Student Success Stories" pointed at /why-choose-us, which is not
  // built. A button that 404s is worse than no button, and the reference page for
  // it has never been designed — so the link is removed, not repointed at some
  // unrelated page. Restore it in the Studio the day that page exists.
  const spotlight = doc.sections?.find((section) => section?._type === 'studentSpotlightSection')
  if (spotlight?.cta?.url === '/why-choose-us') {
    record('homePage', 'sections[studentSpotlightSection].cta', spotlight.cta.label, 'removed (no route)')
    delete spotlight.cta
  }

  // The hero heading and eyebrow are deliberately NOT managed here. They are the
  // school's own words, they change whenever the school's messaging changes, and
  // a script that "corrects" them will overwrite an editor's decision the next
  // time it runs. The H1 already carries the official school name; what it says
  // beyond that is the school's call, made in the Studio.
  set(
    'homePage',
    doc.seo ?? (doc.seo = {_type: 'seo'}),
    'metaTitle',
    'Jahan International Dream School (J.I.D.S.) | Estd: 2021',
  )
  // Rewritten rather than string-substituted: the mechanical replacement produced
  // "an educare centre in TNT, Tongi, Gazipur", which reads like a form field.
  set(
    'homePage',
    doc.seo,
    'metaDescription',
    'An English and Bangla medium school in Tongi, Gazipur where creativity and character meet. Classes from Play Group to Class 10 — admissions open for 2027.',
  )
  return doc
}

function editAboutPage(doc) {
  // The page hero heading is the school's own words and is not managed here, for
  // the same reason as the Home hero heading.
  set('aboutPage', doc.seo ?? (doc.seo = {_type: 'seo'}), 'metaTitle', 'About Us & Our Teachers')
  set(
    'aboutPage',
    doc.seo,
    'metaDescription',
    'Meet the principal, the teaching team and the philosophy behind Jahan International Dream School (J.I.D.S.), an English and Bangla medium school in Gazipur.',
  )
  return doc
}

function editAcademicsPage(doc) {
  set(
    'academicsPage',
    doc.seo ?? (doc.seo = {_type: 'seo'}),
    'metaTitle',
    'Classes & Curriculum',
  )
  return doc
}

function editClassRoutinePage(doc) {
  set(
    'classRoutinePage',
    doc.seo ?? (doc.seo = {_type: 'seo'}),
    'metaTitle',
    'Class Routine & Timetable',
  )
  return doc
}

function editAdmissionsPage(doc) {
  set(
    'admissionsPage',
    doc.seo ?? (doc.seo = {_type: 'seo'}),
    'metaTitle',
    'Admissions 2027 Guide',
  )
  return doc
}

/** A page that had no SEO block at all, so it inherited the site's title. */
function editContactPage(doc) {
  set('contactPage', doc, 'seo', {
    _type: 'seo',
    metaTitle: 'Contact & Directions',
    metaDescription:
      'Visit, call or message Jahan International Dream School in Tongi, Gazipur. Address, phone, WhatsApp, email, office hours and an online enquiry form.',
    appendSiteName: true,
    noIndex: false,
  })
  return doc
}

/**
 * The Branch page.
 *
 * Its content is for a different institution — an Islamic madrasa — and that is
 * exactly why `appendSiteName` is off: appending "Jahan International Dream
 * School" to an Al Noor Madrasa title would tell a search engine the two are the
 * same organisation. The title and description describe what the page actually
 * says, and nothing more. Replacing this page's copy with real JIDS branch
 * content is an owner decision, flagged in the report.
 */
function editBranchPage(doc) {
  set('branchPage', doc, 'seo', {
    _type: 'seo',
    metaTitle: 'Al Noor Madrasa: Quran & Islamic Education',
    metaDescription:
      'Al Noor Madrasa offers Quran recitation with Tajweed, Islamic studies, Arabic language and character building in a peaceful, supportive environment.',
    appendSiteName: false,
    noIndex: false,
  })
  return doc
}

/**
 * Creates the Complaint Box document the first time, and only then.
 *
 * Once it exists its heading and intro are the school's, and this script must
 * never "restore" them — an editor who rewords the page would find their words
 * reverted the next time anybody ran this file.
 */
function editComplaintPage(doc) {
  if (doc._rev) return doc
  set('complaintPage', doc, 'internalTitle', 'Complaint Box page')
  set('complaintPage', doc, 'heading', 'Complaint Box')
  set(
    'complaintPage',
    doc,
    'intro',
    "Speak up about anything that concerns you at J.I.D.S. We do not ask for your name, your number, or your child's name. You stay anonymous for the entire process.",
  )
  return doc
}

/* -------------------------------------------------------------------------- */
/* Run                                                                        */
/* -------------------------------------------------------------------------- */

const docs = await client.fetch(
  '*[_type in ["siteSettings","navigation","homePage","aboutPage","academicsPage","classRoutinePage","admissionsPage","contactPage","branchPage","complaintPage"]]',
)

const editors = {
  siteSettings: editSiteSettings,
  navigation: editNavigation,
  homePage: editHomePage,
  aboutPage: editAboutPage,
  academicsPage: editAcademicsPage,
  classRoutinePage: editClassRoutinePage,
  admissionsPage: editAdmissionsPage,
  contactPage: editContactPage,
  branchPage: editBranchPage,
  complaintPage: editComplaintPage,
}

for (const doc of docs) {
  const before = JSON.stringify(doc)
  const rewritten = rewrite(doc._id, doc)
  editors[doc._type]?.(rewritten)
  if (JSON.stringify(rewritten) !== before) touched.set(doc._id, touched.get(doc._id) ?? new Set())
}

// The Complaint Box document is new, so the query above cannot find it. Create it
// on the first run rather than requiring a separate bootstrap script.
if (!docs.some((doc) => doc._type === 'complaintPage')) {
  const fresh = {_id: 'complaintPage', _type: 'complaintPage'}
  editComplaintPage(fresh)
  docs.push(fresh)
  record('complaintPage', 'document', 'did not exist', 'created')
}

if (!changes.length) {
  console.log('No changes needed — the dataset already matches the SEO corrections.')
  process.exit(0)
}

console.log(`\n${changes.length} change(s) across ${touched.size} document(s):\n`)
for (const change of changes) {
  console.log(`  ${change.docId} · ${change.path}`)
  console.log(`    - ${JSON.stringify(change.from)}`)
  console.log(`    + ${JSON.stringify(change.to)}`)
}

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply to write these to Sanity.\n')
  process.exit(0)
}

for (const docId of touched.keys()) {
  const doc = docs.find((candidate) => candidate._id === docId)
  const updated = editors[doc._type] ? editors[doc._type](rewrite(docId, doc)) : rewrite(docId, doc)
  delete updated._rev
  await client.createOrReplace(updated)
  // A stale draft would shadow the published fix inside the Presentation Tool.
  await client.delete(`drafts.${docId}`).catch(() => {})
  console.log(`published ${docId}`)
}

console.log(`\nDone. ${touched.size} document(s) updated.`)
