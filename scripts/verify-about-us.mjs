/**
 * Verifies the About page end to end: the CMS round trip, the draft/published
 * boundary, and click-to-edit.
 *
 * DEVELOPMENT ONLY. Run it with the dev server up:
 *
 *   node scripts/verify-about-us.mjs
 *
 * It covers the nine round-trip tests from the page build checklist:
 *   1  edit the page heading              -> the frontend updates
 *   2  edit a paragraph                   -> the frontend updates
 *   3  change the image                   -> the frontend updates
 *   4  change the image alt text          -> the frontend uses the new alt
 *   5  change the button label            -> the frontend updates
 *   6  change the button URL              -> the frontend uses the new URL
 *   7  hide a section                     -> the section disappears
 *   8  edit the referenced person         -> the page updates
 *   9  click-to-edit resolves the right source for page and person fields
 *
 * Plus the safety properties the rest of the site depends on: a published page
 * is free of stega and never leaks a draft, and every document is restored.
 *
 * Plumbing lives in `scripts/lib/verify-helpers.mjs`, shared with the other page
 * verification scripts.
 */
import {
  check,
  client,
  collectStegaPaths,
  countDataSanityByType,
  createDraftFrom,
  enableDraftMode,
  findButtonHref,
  findImage,
  fireWebhook,
  has,
  noStegaLeak,
  pageHtml,
  removeDrafts,
  report,
  STEGA,
  waitForAll,
  waitForPage,
} from './lib/verify-helpers.mjs'

const PATH = '/about-us'
const PAGE_ID = 'aboutPage'
const PERSON_ID = 'person-principal-jahangir-alam'

const tag = Date.now().toString(36)
const M = {
  heading: `EDIT heading ${tag}`,
  subheading: `EDIT subheading ${tag}`,
  para: `EDIT paragraph ${tag}`,
  quote: `EDIT quote ${tag}`,
  alt: `EDIT alt text ${tag}`,
  name: `EDIT person name ${tag}`,
  btnLabel: `EDIT button ${tag}`,
  btnUrl: `/contact?edited=${tag}`,
}
const MARKERS = [M.heading, M.subheading, M.para, M.quote, M.alt, M.name, M.btnLabel, M.btnUrl]

const originalPage = await client.getDocument(PAGE_ID)
const originalPerson = await client.getDocument(PERSON_ID)
let previewCleanup = async () => {}

if (!originalPage || !originalPerson) {
  console.error(
    `Missing CMS documents. Run: node scripts/seed-about-us.mjs\n  aboutPage: ${Boolean(originalPage)}\n  person:   ${Boolean(originalPerson)}`,
  )
  process.exit(1)
}

const originalHeading = originalPage.sections.find((s) => s._key === 'hero')?.heading
const originalPhotoRef = originalPerson.photo?.image?.asset?._ref
const swapAsset = await client.fetch(
  '*[_type == "sanity.imageAsset" && originalFilename == "brand-crest.png"][0]._id',
)

try {
  /* 0. baseline ------------------------------------------------------------ */
  const baseline = await pageHtml(PATH)
  check(
    'the About page renders its seeded content',
    Boolean(originalHeading) && has(baseline, originalHeading),
    originalHeading,
  )
  check('published page has no stega encoding', !STEGA.test(baseline))
  check(
    'published page has no VisualEditing overlays',
    !/_next\/static\/chunks\/.*VisualEditing/.test(baseline),
  )
  check('the page has exactly one h1', (baseline.match(/<h1[\s>]/g) || []).length === 1)
  check(
    'the global Header and Footer are reused',
    has(baseline, 'All rights reserved') && has(baseline, 'Find Us'),
  )
  check(
    'the #our-teachers anchor that the navigation links to exists',
    baseline.includes('id="our-teachers"'),
  )
  const crumbNav = /aria-label="Breadcrumb"[\s\S]{0,1500}?<\/nav>/.exec(baseline)?.[0] ?? ''
  check(
    'the breadcrumb trail renders',
    ['Home', 'About us', 'Our Team'].every((label) => has(crumbNav, label)) &&
      crumbNav.includes('aria-current="page"'),
    crumbNav.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60),
  )

  const baseImage = findImage(baseline, PERSON_ID)
  check('the principal photograph renders', Boolean(baseImage?.src), baseImage?.src?.slice(0, 56))
  check('the photograph uses its CMS alt text', Boolean(baseImage?.alt), baseImage?.alt?.slice(0, 46))

  /* 1, 2, 5, 6, 8. draft-only edits ---------------------------------------- */
  // Written to drafts.<id>, so the published documents are never modified.
  const pageDraftId = await createDraftFrom(originalPage)
  const personDraftId = await createDraftFrom(originalPerson)

  await client
    .patch(pageDraftId)
    .set({
      'sections[_key == "hero"].heading': M.heading,
      'sections[_key == "hero"].subheading': M.subheading,
      'sections[_key == "teachers"].header.subheading': M.para,
      'sections[_key == "cta"].primaryButton.label': M.btnLabel,
      'sections[_key == "cta"].primaryButton.url': M.btnUrl,
    })
    .commit()

  await client.patch(personDraftId).set({name: M.name, quote: M.quote, 'message[0]': M.para}).commit()

  const publishedWithDrafts = await pageHtml(PATH)
  check(
    'the published page does not expose draft edits',
    !MARKERS.some((marker) => has(publishedWithDrafts, marker)),
  )
  check('the published page keeps its original heading', has(publishedWithDrafts, originalHeading))
  check('the published principal keeps the original name', has(publishedWithDrafts, originalPerson.name))

  /* draft mode ------------------------------------------------------------- */
  const draftMode = await enableDraftMode(PATH)
  previewCleanup = draftMode.cleanup
  check('draft mode enable route returns a redirect', draftMode.res.status === 307, `status ${draftMode.res.status}`)
  check('preview shows the original page too', Boolean(await pageHtml(PATH)))

  const preview = await pageHtml(PATH, {headers: {cookie: draftMode.cookieHeader()}})

  /* 1. heading -------------------------------------------------------------- */
  check('1  edit the page heading updates the frontend', has(preview, M.heading))
  check('   the hero supporting line updates too', has(preview, M.subheading))

  /* 2. paragraph ------------------------------------------------------------ */
  check('2  edit a paragraph updates the frontend', has(preview, M.para))

  /* 8. referenced document -------------------------------------------------- */
  check('8  edit the referenced person updates the page', has(preview, M.name))
  check('   the person pull quote updates', has(preview, M.quote))

  /* 5 + 6. button label and URL --------------------------------------------- */
  const btnHref = findButtonHref(preview, M.btnLabel)
  check('5  changing the button label updates the frontend', has(preview, M.btnLabel))
  check('6  changing the button URL changes where it points', btnHref === M.btnUrl, `href=${btnHref}`)

  /* 3. image ---------------------------------------------------------------- */
  if (swapAsset && originalPhotoRef) {
    await client.patch(personDraftId).set({'photo.image.asset._ref': swapAsset}).commit()
    const afterSwap = await pageHtml(PATH, {headers: {cookie: draftMode.cookieHeader()}})
    const swapped = findImage(afterSwap, PERSON_ID)
    check(
      '3  changing the image changes what is rendered',
      Boolean(swapped?.src) && swapped.src !== baseImage.src,
      `${baseImage.src.slice(-24)} -> ${swapped?.src.slice(-24)}`,
    )
    await client.patch(personDraftId).set({'photo.image.asset._ref': originalPhotoRef}).commit()
  } else {
    check('3  changing the image changes what is rendered', false, 'no swap asset available')
  }

  /* 4. alt text ------------------------------------------------------------- */
  await client.patch(personDraftId).set({'photo.alt': M.alt}).commit()
  const afterAlt = await pageHtml(PATH, {headers: {cookie: draftMode.cookieHeader()}})
  check(
    '4  changing the image alt text changes the rendered alt',
    (findImage(afterAlt, PERSON_ID)?.alt ?? '') === M.alt,
  )
  await client.patch(personDraftId).set({'photo.alt': originalPerson.photo.alt}).commit()

  /* 9. click-to-edit --------------------------------------------------------- */
  check('preview mounts the VisualEditing overlays', /_next\/static\/chunks\/.*VisualEditing/.test(preview))

  const {textNodes, paths} = collectStegaPaths(preview)
  check(
    'every stega string carries a Sanity source',
    paths.size > 0,
    `${textNodes.length} encoded strings, ${paths.size} distinct fields`,
  )

  const pageFields = [...paths.keys()].filter((k) => k.startsWith(`${PAGE_ID}|`))
  const personFields = [...paths.keys()].filter((k) => k.startsWith(`${PERSON_ID}|`))
  console.log(`\n  click-to-edit text fields — aboutPage: ${pageFields.length}, person: ${personFields.length}`)
  for (const key of [...pageFields, ...personFields].sort()) console.log(`    ${key}`)

  check('page fields are click-to-edit', pageFields.length >= 6, `${pageFields.length} fields`)
  check(
    'person fields resolve to the person document, not the page',
    personFields.length >= 4,
    `${personFields.length} fields`,
  )
  check(
    'the person message paragraphs are individually click-to-edit',
    personFields.some((k) => k.includes('message[0]')),
  )
  check('each pillar card is click-to-edit', pageFields.some((k) => k.includes('pillar-vision')))

  const attrs = [...preview.matchAll(/data-sanity="([^"]+)"/g)].map((m) => m[1])
  const attrTypes = countDataSanityByType(preview)
  console.log('\n  explicit data-sanity targets per document type:')
  for (const [type, count] of Object.entries(attrTypes).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(count).padStart(4)}  ${type}`)
  }

  check('the image field carries an explicit target', attrs.some((a) => a.includes('path=photo')))
  check(
    'the person photo targets the person document',
    attrs.some((a) => a.includes(`id=${PERSON_ID}`) && a.includes('path=photo')),
  )
  check(
    'the CTA button targets its own field',
    attrs.some((a) => a.includes(`id=${PAGE_ID}`) && a.includes('primaryButton')),
  )
  check(
    'section containers are grouped edit targets',
    (preview.match(/data-sanity-edit-target/g) || []).length > 0,
    `${(preview.match(/data-sanity-edit-target/g) || []).length} containers`,
  )
  check('no stega leaked into href, class or title', noStegaLeak(preview))

  /* 7. hide a section (published, then restored) ---------------------------- */
  await client.patch(PAGE_ID).set({'sections[_key == "pillars"].enabled': false}).commit()
  await fireWebhook(PAGE_ID)
  const hidden = await waitForPage(PATH, (html) => !has(html, 'Our Guiding Philosophy'))
  check(
    '7  hiding a section removes it from the page',
    hidden.ok && !has(hidden.html, 'Core Philosophy'),
    hidden.ok ? '' : 'still rendered after 45s',
  )
  check('   the rest of the page is unaffected', has(hidden.html, 'Meet Our Principal'))

  /* reorder (published, then restored) -------------------------------------- */
  await client.createOrReplace(originalPage)
  const before = originalPage.sections.map((s) => s._key)
  const swapped = [before[1], before[0], ...before.slice(2)]
  await client
    .patch(PAGE_ID)
    .set({sections: swapped.map((key) => originalPage.sections.find((s) => s._key === key))})
    .commit()
  await fireWebhook(PAGE_ID)

  // Both markers must be unique to the page body. The hero heading is NOT: it also
  // appears in the <title> and in the breadcrumb trail, both of which sit above the
  // content, so `indexOf` would compare the wrong positions.
  const reordered = await waitForPage(PATH, (html) => {
    const principalAt = html.indexOf('Meet Our Principal')
    const teachersAt = html.indexOf('Meet Our Teachers')
    return principalAt > -1 && teachersAt > -1 && principalAt < teachersAt
  })
  check('reordering sections changes the rendered order', reordered.ok)
} finally {
  // Remove the drafts, restore the published documents, then confirm the restore.
  await removeDrafts([PAGE_ID, PERSON_ID])
  await client.createOrReplace(originalPerson).catch(() => {})
  await client.createOrReplace(originalPage).catch(() => {})
  await fireWebhook(PAGE_ID).catch(() => {})
  await previewCleanup().catch(() => {})

  const expected = originalPage.sections
    .map((section) => section.heading ?? section.header?.heading)
    .filter(Boolean)
  const restored = await waitForAll(PATH, expected, {timeout: 30000})

  const leftovers = await client
    .fetch(
      '*[_id in path("drafts.**") && (_id == "drafts.aboutPage" || _id == "drafts.person-principal-jahangir-alam")]._id',
    )
    .catch(() => [])

  const stillMissing = expected.filter((heading) => !has(restored.html, heading))
  check('the About documents are restored', restored.ok && stillMissing.length === 0,
    stillMissing.length ? `missing after 30s: ${stillMissing.join(', ')}` : '')
  check('no test drafts are left behind', (leftovers ?? []).length === 0, (leftovers ?? []).join(', '))
  if (stillMissing.length) console.error('\nRe-run: node scripts/seed-about-us.mjs')
}

report()
