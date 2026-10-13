// Restores the Home page hero banner that was deleted from the `homePage`
// document by a manual Studio edit on 2026-10-08T07:29:32Z.
//
//   node --env-file=.env.local scripts/restore-home-hero.mjs           # dry run: report only
//   node --env-file=.env.local scripts/restore-home-hero.mjs --apply   # write to Sanity
//
// WHY THIS EXISTS
// On 2026-10-08 the client edited `navigation` (07:24) and then `homePage`
// (07:29) in the Studio. After that edit the `sections` array held 7 entries
// and none of them was a `heroSection` — it was not hidden, it was not empty,
// it was removed from the array. `HomeSections` renders whatever is in
// `sections`, and `HeroSection` returns null when `heading` is empty, so the
// top of the Home page simply began with the stats bar.
//
// There is no draft and no release to recover from, so the section is rebuilt
// from the seeded definition in `seed.mjs` (its `buildSections()` entry
// `_key: 'hero'`), which is the content the site shipped with.
//
// WHAT IT DELIBIBERATELY DOES NOT DO
// It does not replace the `homePage` document, and it does not touch
// `siteSettings`, `navigation`, `people`, `newsPost` or any other document. The
// client edited all of those in the same session and those edits must survive.
// Running `scripts/seed.mjs` instead would have reverted every one of them.
//
// It writes a single `insert` mutation anchored to the section that currently
// sits first, so the array is only ever appended-to-at-the-front and no
// existing section value is rewritten.
//
// It is idempotent and refuses to run twice: if a `heroSection` is already
// present the script reports that and writes nothing, because at that point a
// hero exists and re-inserting would duplicate it.
import {createClient} from '@sanity/client'

const APPLY = process.argv.includes('--apply')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-09-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const HOME_ID = 'homePage'

/**
 * Source images, matched by their uploaded filename. Resolving by filename
 * instead of hard-coding an asset hash keeps this script correct if the assets
 * are ever re-uploaded, and fails loudly rather than writing a broken reference.
 */
const SLIDE_SOURCES = [
  {
    key: 'hero-classroom',
    filename: 'hero-rainbow-classroom.png',
    alt: 'J.I.D.S. Students in Rainbow Classroom',
  },
  {
    key: 'hero-awards',
    filename: 'hero-artwork-awards.png',
    alt: 'Jahan International Dream School Artwork and Awards Celebration',
  },
]

/**
 * The hero exactly as `buildSections()` in `scripts/seed.mjs` defines it. Copy
 * kept in step with that file deliberately: if the seeded hero is ever
 * reworded, update this block in the same commit.
 */
const HERO_SECTION = {
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
}

/** Builds an `imageWithAlt` value from a resolved asset id. */
function imageWithAlt(assetId, alt) {
  return {
    _type: 'imageWithAlt',
    image: {_type: 'image', asset: {_type: 'reference', _ref: assetId}},
    alt,
  }
}

/* -------------------------------------------------------------------------- */
/* Resolve + report                                                            */
/* -------------------------------------------------------------------------- */

const home = await client.fetch(`*[_id == $id][0]{ _id, _rev, internalTitle, sections[]{ _key, _type } }`, {
  id: HOME_ID,
})

if (!home) {
  console.error(`No document with _id "${HOME_ID}" in this dataset. Nothing to restore.`)
  process.exit(1)
}

const sections = home.sections ?? []
const existingHero = sections.find((section) => section?._type === 'heroSection')

console.log(`Document : ${home._id} (rev ${home._rev})`)
console.log(`Sections : ${sections.length}`)
for (const section of sections) console.log(`           - ${section._key} (${section._type})`)
console.log('')

if (existingHero) {
  console.log(`A heroSection is already present (_key: "${existingHero._key}").`)
  console.log('Nothing to restore — writing nothing. Delete this script once confirmed.')
  process.exit(0)
}

console.log('Diagnosis: no heroSection in `sections`. The hero was removed from the')
console.log('array, not hidden — `enabled` cannot hide a section that is not there.')
console.log('')

if (sections.length === 0) {
  console.log('Cannot anchor an insert: `sections` is empty. Restore the document')
  console.log('by hand in the Studio instead, so the first section is placed by a human.')
  process.exit(1)
}

const assets = await client.fetch(
  `*[_type == "sanity.imageAsset" && originalFilename in $filenames]{ _id, originalFilename }`,
  {filenames: SLIDE_SOURCES.map((source) => source.filename)},
)

const assetIdByFilename = new Map(assets.map((asset) => [asset.originalFilename, asset._id]))
const missing = SLIDE_SOURCES.filter((source) => !assetIdByFilename.has(source.filename))

if (missing.length) {
  console.error('Cannot resolve these hero images in the dataset:')
  for (const source of missing) console.error(`  ${source.key} -> ${source.filename}`)
  console.error('')
  console.error('Upload them to the Studio first, then re-run. Nothing was written.')
  process.exit(1)
}

const hero = {
  ...HERO_SECTION,
  slides: SLIDE_SOURCES.map((source, index) => ({
    _key: `hero-slide-${index + 1}`,
    _type: 'heroSlide',
    isVisible: true,
    image: imageWithAlt(assetIdByFilename.get(source.filename), source.alt),
  })),
}

console.log('Will insert the following section at position 0:')
console.log(`  _key      : ${hero._key}`)
console.log(`  _type     : ${hero._type}`)
console.log(`  heading   : ${hero.heading}`)
console.log(`  slides    : ${hero.slides.length}`)
for (const slide of hero.slides) {
  console.log(`    - ${slide.image.alt}`)
  console.log(`      ${slide.image.image.asset._ref}`)
}
console.log('')
console.log('All existing sections and every other document are left untouched.')
console.log('')

if (!APPLY) {
  console.log('Dry run. Re-run with --apply to write.')
  process.exit(0)
}

// Anchor to whichever section currently sits first. `insert.before` only adds
// an item; it never rewrites the items already in the array, so no client edit
// can be lost to this write.
const anchor = sections[0]

const transaction = client.transaction()
transaction.patch(HOME_ID, {
  insert: {
    before: `sections[_key == "${anchor._key}"]`,
    items: [hero],
  },
})

const result = await transaction.commit({autoGenerateArrayKeys: false})

console.log(`Restored. ${anchor._key} -> [hero, ${anchor._key}]`)
console.log(`New revision: ${result._rev}`)
console.log('')
console.log('Next: the dev server picks this up on the next request (the page is')
console.log('force-dynamic). Run `node scripts/verify-seo.mjs` and')
console.log('`node scripts/verify-sections.mjs` to confirm no regression.')
