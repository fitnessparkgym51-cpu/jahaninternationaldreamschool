/**
 * Verifies the Admissions page end to end: the CMS round trip, the
 * draft/published boundary, click-to-edit, and the FAQ accordion.
 *
 * DEVELOPMENT ONLY. Run it with the dev server up:
 *
 *   node scripts/verify-admissions.mjs
 *
 * Covers the page build checklist's nine round-trip tests, mapped to this page:
 *   1  edit the page heading              -> the frontend updates
 *   2  edit a step description            -> the frontend updates
 *   3  change the brochure image          -> the frontend updates
 *   4  change the image alt text          -> the frontend uses the new alt
 *   5  change the button label            -> the frontend updates
 *   6  change the button URL              -> the frontend uses the new URL
 *   7  hide a section                     -> the section disappears
 *   8  edit a repeated array item         -> the page updates
 *   9  click-to-edit resolves the right source for each field
 *
 * Plus page-specific behaviour: step numbers are generated rather than stored,
 * the accordion is accessible and has one item open by default, every anchor the
 * hero and menus link to exists, and everything is restored afterwards.
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

const PATH = '/admissions'
const PAGE_ID = 'admissionsPage'

const tag = Date.now().toString(36)
const M = {
  heading: `EDIT heading ${tag}`,
  stepTitle: `EDIT step title ${tag}`,
  stepDesc: `EDIT step description ${tag}`,
  calloutHeading: `EDIT callout ${tag}`,
  faqQuestion: `EDIT question ${tag}`,
  faqAnswer: `EDIT answer ${tag}`,
  alt: `EDIT alt text ${tag}`,
  btnLabel: `EDIT button ${tag}`,
  btnUrl: `/contact?edited=${tag}`,
}
const MARKERS = [
  M.heading,
  M.stepTitle,
  M.stepDesc,
  M.calloutHeading,
  M.faqQuestion,
  M.faqAnswer,
  M.alt,
  M.btnLabel,
  M.btnUrl,
]

const original = await client.getDocument(PAGE_ID)
let previewCleanup = async () => {}

if (!original) {
  console.error('Missing CMS document. Run: node scripts/seed-admissions.mjs')
  process.exit(1)
}

const heroHeading = original.sections.find((s) => s._key === 'hero')?.heading
const brochureRef = original.sections.find((s) => s._key === 'brochure')?.image?.image?.asset?._ref
const swapAsset = await client.fetch(
  '*[_type == "sanity.imageAsset" && originalFilename == "brand-crest.png"][0]._id',
)

try {
  /* 0. baseline ------------------------------------------------------------ */
  const baseline = await pageHtml(PATH)
  check(
    'the Admissions page renders its seeded content',
    Boolean(heroHeading) && has(baseline, heroHeading),
    heroHeading,
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
  check('the floating contact button is reused', has(baseline, 'Need Help?'))
  check('no focus ring is suppressed', !/outline-none/.test(baseline))

  // Every anchor a menu or hero button can target must exist.
  for (const id of ['apply', 'download', 'faq', 'page-top']) {
    check(`the #${id} anchor exists`, baseline.includes(`id="${id}"`))
  }

  // The hero's download button must point at the brochure section.
  check(
    "the hero's download button targets the brochure anchor",
    findButtonHref(baseline, 'Download Admission Form') === '#download',
  )

  /* section inventory ------------------------------------------------------ */
  const sectionTypes = [...baseline.matchAll(/<section[^>]*>/g)].length
  check('all six sections render', sectionTypes === 6, `${sectionTypes} sections`)

  /* step numbering is generated --------------------------------------------- */
  const stepsHtml = /<ol class="[^"]*lg:grid-cols-5[\s\S]*?<\/ol>/.exec(baseline)?.[0] ?? ''
  const numbers = [...stepsHtml.matchAll(/h-11 w-11[^"]*"[^>]*>\s*(\d+)\s*</g)].map((m) => m[1])
  check('step numbers are generated 1..5', numbers.join(',') === '1,2,3,4,5', numbers.join(','))
  check(
    'exactly one step is highlighted',
    (stepsHtml.match(/bg-jids-orange/g) || []).length === 1,
  )
  check(
    'no step number is stored in the document',
    !original.sections.some((s) => JSON.stringify(s.steps ?? []).includes('"number"')),
  )

  /* FAQ accordion ----------------------------------------------------------- */
  // Scoped to the FAQ section: Next.js renders its own <div hidden> at the top of
  // <body>, so a page-wide count would be off by one for an unrelated reason.
  const faqHtml = /id="faq"[\s\S]*?<\/section>/.exec(baseline)?.[0] ?? ''
  check('all ten questions render', (faqHtml.match(/aria-controls=/g) || []).length === 10)
  check('each answer is a labelled region', (faqHtml.match(/role="region"/g) || []).length === 10)
  check(
    'exactly one answer is open by default',
    (faqHtml.match(/aria-expanded="true"/g) || []).length === 1,
  )
  check(
    'the other nine are collapsed with the hidden attribute, not just a class',
    (faqHtml.match(/hidden=""/g) || []).length === 9,
    `${(faqHtml.match(/hidden=""/g) || []).length} hidden panels`,
  )
  check(
    'every answer panel is labelled by its trigger',
    (faqHtml.match(/aria-labelledby=/g) || []).length === 10,
  )

  /* brochure image ---------------------------------------------------------- */
  const baseImage = findImage(baseline, PAGE_ID)
  check('the brochure renders', Boolean(baseImage?.src), baseImage?.src?.slice(0, 56))
  check('the brochure uses its CMS alt text', Boolean(baseImage?.alt), baseImage?.alt?.slice(0, 46))

  /* 1, 2, 5, 6, 8. draft-only edits ---------------------------------------- */
  const draftId = await createDraftFrom(original)

  await client
    .patch(draftId)
    .set({
      'sections[_key == "hero"].heading': M.heading,
      'sections[_key == "steps"].steps[_key == "step-1"].title': M.stepTitle,
      'sections[_key == "steps"].steps[_key == "step-1"].description': M.stepDesc,
      'sections[_key == "referral"].heading': M.calloutHeading,
      'sections[_key == "faq"].items[_key == "faq-2"].question': M.faqQuestion,
      'sections[_key == "faq"].items[_key == "faq-2"].answer': M.faqAnswer,
      'sections[_key == "brochure"].image.alt': M.alt,
      'sections[_key == "cta"].primaryButton.label': M.btnLabel,
      'sections[_key == "cta"].primaryButton.url': M.btnUrl,
    })
    .commit()

  const publishedWithDrafts = await pageHtml(PATH)
  check(
    'the published page does not expose draft edits',
    !MARKERS.some((marker) => has(publishedWithDrafts, marker)),
  )
  check('the published page keeps its original heading', has(publishedWithDrafts, heroHeading))

  /* draft mode ------------------------------------------------------------- */
  const draftMode = await enableDraftMode(PATH)
  previewCleanup = draftMode.cleanup
  check(
    'draft mode enable route returns a redirect',
    draftMode.res.status === 307,
    `status ${draftMode.res.status}`,
  )

  const preview = await pageHtml(PATH, {headers: {cookie: draftMode.cookieHeader()}})

  /* 1. heading -------------------------------------------------------------- */
  check('1  edit the page heading updates the frontend', has(preview, M.heading))

  /* 2. paragraph ------------------------------------------------------------ */
  check('2  edit a step description updates the frontend', has(preview, M.stepDesc))
  check('   the step title updates too', has(preview, M.stepTitle))
  check('   the callout heading updates', has(preview, M.calloutHeading))

  /* 8. repeated array item -------------------------------------------------- */
  check('8  edit a repeated item updates the page', has(preview, M.faqQuestion))
  check('   its answer updates too', has(preview, M.faqAnswer))

  /* 5 + 6. button label and URL --------------------------------------------- */
  const btnHref = findButtonHref(preview, M.btnLabel)
  check('5  changing the button label updates the frontend', has(preview, M.btnLabel))
  check('6  changing the button URL changes where it points', btnHref === M.btnUrl, `href=${btnHref}`)

  /* 3. image ---------------------------------------------------------------- */
  if (swapAsset && brochureRef) {
    await client.patch(draftId).set({'sections[_key == "brochure"].image.image.asset._ref': swapAsset}).commit()
    const afterSwap = await pageHtml(PATH, {headers: {cookie: draftMode.cookieHeader()}})
    const swapped = findImage(afterSwap, PAGE_ID)
    check(
      '3  changing the image changes what is rendered',
      Boolean(swapped?.src) && swapped.src !== baseImage.src,
    )
    await client
      .patch(draftId)
      .set({'sections[_key == "brochure"].image.image.asset._ref': brochureRef})
      .commit()
  } else {
    check('3  changing the image changes what is rendered', false, 'no swap asset available')
  }

  /* 4. alt text ------------------------------------------------------------- */
  await client.patch(draftId).set({'sections[_key == "brochure"].image.alt': M.alt}).commit()
  const afterAlt = await pageHtml(PATH, {headers: {cookie: draftMode.cookieHeader()}})
  check(
    '4  changing the image alt text changes the rendered alt',
    (findImage(afterAlt, PAGE_ID)?.alt ?? '') === M.alt,
  )

  /* 9. click-to-edit --------------------------------------------------------- */
  check('preview mounts the VisualEditing overlays', /_next\/static\/chunks\/.*VisualEditing/.test(preview))

  const {textNodes, paths} = collectStegaPaths(preview)
  check(
    'every stega string carries a Sanity source',
    paths.size > 0,
    `${textNodes.length} encoded strings, ${paths.size} distinct fields`,
  )

  const pageFields = [...paths.keys()].filter((k) => k.startsWith(`${PAGE_ID}|`))
  console.log(`\n  click-to-edit text fields — admissionsPage: ${pageFields.length}`)
  for (const key of pageFields.sort()) console.log(`    ${key}`)

  check('page fields are click-to-edit', pageFields.length >= 15, `${pageFields.length} fields`)
  for (const key of [
    'sections[_key=="hero"].heading',
    'sections[_key=="steps"].steps[_key=="step-1"].title',
    'sections[_key=="faq"].items[_key=="faq-1"].question',
    'sections[_key=="faq"].items[_key=="faq-1"].answer',
    'sections[_key=="referral"].heading',
    'sections[_key=="cta"].heading',
  ]) {
    check(`   ${key.split('].')[0].replace('sections[_key==', '')} fields resolve`, pageFields.includes(`${PAGE_ID}|${key}`))
  }

  const attrs = [...preview.matchAll(/data-sanity="([^"]+)"/g)].map((m) => m[1])
  const attrTypes = countDataSanityByType(preview)
  console.log('\n  explicit data-sanity targets per document type:')
  for (const [type, count] of Object.entries(attrTypes).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(count).padStart(4)}  ${type}`)
  }
  check('the brochure image carries an explicit target', attrs.some((a) => a.includes('path=sections:brochure.image')))
  check('the step titles carry explicit targets', attrs.some((a) => a.includes('steps:step-1.title')))
  check('the CTA button targets its own field', attrs.some((a) => a.includes('primaryButton')))
  check(
    'section containers are grouped edit targets',
    (preview.match(/data-sanity-edit-target/g) || []).length > 0,
    `${(preview.match(/data-sanity-edit-target/g) || []).length} containers`,
  )
  check('no stega leaked into href, class or title', noStegaLeak(preview))

  /* 7. hide a section (published, then restored) ---------------------------- */
  await client.patch(PAGE_ID).set({'sections[_key == "faq"].enabled': false}).commit()
  await fireWebhook(PAGE_ID)
  const hidden = await waitForPage(PATH, (html) => !has(html, 'Frequently Asked Questions'))
  check(
    '7  hiding a section removes it from the page',
    hidden.ok && !has(hidden.html, 'How Do I Pay Fees?'),
    hidden.ok ? '' : 'still rendered after 45s',
  )
  check('   the rest of the page is unaffected', has(hidden.html, 'How To Apply'))

  /* reorder (published, then restored) -------------------------------------- */
  await client.createOrReplace(original)
  const before = original.sections.map((s) => s._key)
  const swapped = [before[2], before[0], ...before.slice(1)]
  await client
    .patch(PAGE_ID)
    .set({sections: swapped.map((key) => original.sections.find((s) => s._key === key))})
    .commit()
  await fireWebhook(PAGE_ID)

  const reordered = await waitForPage(PATH, (html) => {
    const brochureAt = html.indexOf('What is included in yearly charges')
    const heroAt = html.indexOf(heroHeading)
    return brochureAt > -1 && heroAt > -1 && brochureAt < heroAt
  })
  check('reordering sections changes the rendered order', reordered.ok)
} finally {
  await removeDrafts([PAGE_ID])
  await client.createOrReplace(original).catch(() => {})
  await fireWebhook(PAGE_ID).catch(() => {})
  await previewCleanup().catch(() => {})

  const expected = original.sections
    .map((section) => section.heading ?? section.header?.heading)
    .filter(Boolean)
  const restored = await waitForAll(PATH, expected, {timeout: 30000})
  const stillMissing = expected.filter((heading) => !has(restored.html, heading))
  check(
    'the Admissions document is restored',
    restored.ok && stillMissing.length === 0,
    stillMissing.length ? `missing after 30s: ${stillMissing.join(', ')}` : '',
  )

  const leftovers = await client
    .fetch('*[_id in path("drafts.**") && _id == "drafts.admissionsPage"]._id')
    .catch(() => [])
  check('no test drafts are left behind', (leftovers ?? []).length === 0, (leftovers ?? []).join(', '))
  if (stillMissing.length) console.error('\nRe-run: node scripts/seed-admissions.mjs')
}

report()
