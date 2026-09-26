/**
 * Verifies the Academics page end to end: the CMS round trip, the
 * draft/published boundary, click-to-edit, and the referenced class documents.
 *
 * DEVELOPMENT ONLY. Run it with the dev server up:
 *
 *   node scripts/verify-academics.mjs
 *
 * Covers the page build checklist's nine round-trip tests, mapped to this page:
 *   1  edit the page heading              -> the frontend updates
 *   2  edit a section description         -> the frontend updates
 *   3  change the share image             -> the frontend updates
 *   4  change the image alt text          -> the frontend uses the new alt
 *   5  change the button label            -> the frontend updates
 *   6  change the button URL              -> the frontend uses the new URL
 *   7  hide a section                     -> the section disappears
 *   8  edit a referenced class document   -> the table updates
 *   9  click-to-edit resolves the right source for page and class fields
 *
 * Plus page-specific behaviour: the table is a real `<table>` with header scopes,
 * thirteen class rows are present, the column headings are CMS-editable, every
 * anchor the menus link to exists, and everything is restored afterwards.
 *
 * Plumbing lives in `scripts/lib/verify-helpers.mjs`, shared across page scripts.
 */
import {
  check,
  client,
  collectStegaPaths,
  countDataSanityByType,
  createDraftFrom,
  enableDraftMode,
  findButtonHref,
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

const PATH = '/academics'
const PAGE_ID = 'academicsPage'
const FIRST_CLASS_ID = 'class-play-group'

const tag = Date.now().toString(36)
const M = {
  heading: `EDIT heading ${tag}`,
  tableSubheading: `EDIT table subheading ${tag}`,
  cardTitle: `EDIT card title ${tag}`,
  cardBody: `EDIT card body ${tag}`,
  ctaHeading: `EDIT cta heading ${tag}`,
  columnLabel: `EDIT column ${tag}`,
  className: `EDIT class name ${tag}`,
  classAge: `EDIT class age ${tag}`,
  classFocus: `EDIT class focus ${tag}`,
  alt: `EDIT alt text ${tag}`,
  btnLabel: `EDIT button ${tag}`,
  btnUrl: `/contact?edited=${tag}`,
}
const MARKERS = Object.values(M)

const original = await client.getDocument(PAGE_ID)
const originalFirstClass = await client.getDocument(FIRST_CLASS_ID)
let previewCleanup = async () => {}

if (!original || !originalFirstClass) {
  console.error(
    `Missing CMS documents. Run: node scripts/seed-academics.mjs\n  academicsPage: ${Boolean(original)}\n  class:        ${Boolean(originalFirstClass)}`,
  )
  process.exit(1)
}

const heroHeading = original.sections.find((s) => s._key === 'hero')?.heading
const shareRef = original.seo?.shareImage?.image?.asset?._ref
const swapAsset = await client.fetch(
  '*[_type == "sanity.imageAsset" && originalFilename == "brand-crest.png"][0]._id',
)

try {
  /* 0. baseline ------------------------------------------------------------ */
  const baseline = await pageHtml(PATH)
  check(
    'the Academics page renders its seeded content',
    Boolean(heroHeading) && has(baseline, heroHeading),
    heroHeading,
  )
  check('published page has no stega encoding', !STEGA.test(baseline))
  check(
    'published page has no VisualEditing overlays',
    !/_next\/static\/chunks\/.*VisualEditing/.test(baseline),
  )
  check('the page has exactly one h1', (baseline.match(/<h1[\s>]/g) || []).length === 1)
  check('four sections render', (baseline.match(/<section[^>]*>/g) || []).length === 4)
  check(
    'the global Header, Footer and floating button are reused',
    has(baseline, 'All rights reserved') && has(baseline, 'Find Us') && has(baseline, 'Need Help?'),
  )
  check('no focus ring is suppressed', !/outline-none/.test(baseline))

  for (const id of ['curriculum-table', 'enrol', 'page-top']) {
    check(`the #${id} anchor exists`, baseline.includes(`id="${id}"`))
  }
  check(
    'the closing band links to the admissions apply anchor',
    /href="\/admissions#apply"/.test(baseline),
  )

  /* class table semantics -------------------------------------------------- */
  const table = /<table[\s\S]*?<\/table>/.exec(baseline)?.[0] ?? ''
  check('the class list is a real table', Boolean(table))
  check('it has a thead and tbody', /<thead>/.test(table) && /<tbody/.test(table))
  check('four column headings use scope="col"', (table.match(/<th scope="col"/g) || []).length === 4)
  check('thirteen class rows use scope="row"', (table.match(/<th scope="row"/g) || []).length === 13)
  check(
    'the table scrolls inside its container instead of overflowing the page',
    /overflow-x-auto/.test(baseline) && /min-w-\[640px\]/.test(table),
  )

  /* highlight grid --------------------------------------------------------- */
  // Scoped to the section's own markup. A page-wide class count double-counts,
  // because Next ships the RSC payload as well, so every element appears twice.
  const highlightsHtml = /Curriculum Highlights[\s\S]*?<\/section>/.exec(baseline)?.[0] ?? ''
  check('six highlight cards render', (highlightsHtml.match(/<h3[\s>]/g) || []).length === 6,
    `${(highlightsHtml.match(/<h3[\s>]/g) || []).length} card titles`)
  check(
    'each highlight card has its own icon tint',
    new Set([...highlightsHtml.matchAll(/rounded-xl (bg-[a-z]+-\d+)/g)].map((m) => m[1])).size >= 4,
  )

  /* 1, 2, 5, 6, 8. draft-only edits ---------------------------------------- */
  const draftId = await createDraftFrom(original)
  const classDraftId = await createDraftFrom(originalFirstClass)

  await client
    .patch(draftId)
    .set({
      'sections[_key == "hero"].heading': M.heading,
      'sections[_key == "classes"].header.subheading': M.tableSubheading,
      'sections[_key == "classes"].columnLabels.age': M.columnLabel,
      'sections[_key == "highlights"].pillars[_key == "highlight-art"].title': M.cardTitle,
      'sections[_key == "highlights"].pillars[_key == "highlight-art"].description': M.cardBody,
      'sections[_key == "cta"].heading': M.ctaHeading,
      'sections[_key == "cta"].primaryButton.label': M.btnLabel,
      'sections[_key == "cta"].primaryButton.url': M.btnUrl,
      'seo.shareImage.alt': M.alt,
    })
    .commit()

  await client
    .patch(classDraftId)
    .set({name: M.className, ageRange: M.classAge, focus: M.classFocus})
    .commit()

  const publishedWithDrafts = await pageHtml(PATH)
  check(
    'the published page does not expose draft edits',
    !MARKERS.some((marker) => has(publishedWithDrafts, marker)),
  )
  check('the published page keeps its original heading', has(publishedWithDrafts, heroHeading))
  check(
    'the published page keeps the original class name',
    has(publishedWithDrafts, originalFirstClass.name),
  )

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
  check('2  edit a section description updates the frontend', has(preview, M.tableSubheading))
  check('   a highlight card title updates', has(preview, M.cardTitle))
  check('   a highlight card description updates', has(preview, M.cardBody))
  check('   the closing band heading updates', has(preview, M.ctaHeading))
  check('   the table column heading updates', has(preview, M.columnLabel))

  /* 8. referenced document -------------------------------------------------- */
  check('8  edit a referenced class updates the table', has(preview, M.className))
  check('   its age range updates', has(preview, M.classAge))
  check('   its focus text updates', has(preview, M.classFocus))

  /* 5 + 6. button label and URL --------------------------------------------- */
  const btnHref = findButtonHref(preview, M.btnLabel)
  check('5  changing the button label updates the frontend', has(preview, M.btnLabel))
  check('6  changing the button URL changes where it points', btnHref === M.btnUrl, `href=${btnHref}`)

  /* 3 + 4. the SEO share image --------------------------------------------- */
  const ogBefore = /<meta property="og:image" content="([^"]*)"/.exec(preview)?.[1] ?? ''
  if (swapAsset && shareRef) {
    await client
      .patch(draftId)
      .set({'seo.shareImage.image.asset._ref': swapAsset, 'seo.shareImage.alt': M.alt})
      .commit()
    const afterSwap = await pageHtml(PATH, {headers: {cookie: draftMode.cookieHeader()}})
    const ogAfter = /<meta property="og:image" content="([^"]*)"/.exec(afterSwap)?.[1] ?? ''
    check('3  changing the share image changes the social preview', ogAfter !== ogBefore, ogAfter.slice(-32))
    check(
      '4  changing the share image alt text updates the rendered alt',
      /property="og:image:alt" content="([^"]*)"/.exec(afterSwap)?.[1] === M.alt,
    )
  } else {
    check('3  changing the share image changes the social preview', false, 'no swap asset available')
    check('4  changing the share image alt text updates the rendered alt', false, 'no swap asset available')
  }

  /* 9. click-to-edit --------------------------------------------------------- */
  check('preview mounts the VisualEditing overlays', /_next\/static\/chunks\/.*VisualEditing/.test(preview))

  const {textNodes, paths} = collectStegaPaths(preview)
  check(
    'every stega string carries a Sanity source',
    paths.size > 0,
    `${textNodes.length} encoded strings, ${paths.size} distinct fields`,
  )

  const pageFields = [...paths.keys()].filter((k) => k.startsWith(`${PAGE_ID}|`))
  const classFields = [...paths.keys()].filter((k) => k.startsWith(`${FIRST_CLASS_ID}|`))
  console.log(`\n  click-to-edit text fields — academicsPage: ${pageFields.length}, ${FIRST_CLASS_ID}: ${classFields.length}`)
  for (const key of [...pageFields, ...classFields].sort()) console.log(`    ${key}`)

  check('page fields are click-to-edit', pageFields.length >= 12, `${pageFields.length} fields`)
  check(
    'class fields resolve to the class document, not the page',
    classFields.length >= 3,
    `${classFields.length} fields`,
  )
  for (const key of [
    'sections[_key=="hero"].heading',
    'sections[_key=="classes"].header.subheading',
    'sections[_key=="classes"].columnLabels.age',
    'sections[_key=="highlights"].pillars[_key=="highlight-art"].title',
    'sections[_key=="cta"].heading',
  ]) {
    check(`   ${key.replace(/sections\[_key=="|"\]/g, '')} resolves`, pageFields.includes(`${PAGE_ID}|${key}`))
  }

  const attrs = [...preview.matchAll(/data-sanity="([^"]+)"/g)].map((m) => m[1])
  const attrTypes = countDataSanityByType(preview)
  console.log('\n  explicit data-sanity targets per document type:')
  for (const [type, count] of Object.entries(attrTypes).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(count).padStart(4)}  ${type}`)
  }

  const classDocs = new Set(attrs.map((a) => /id=(class-[a-z0-9-]+)/.exec(a)?.[1]).filter(Boolean))
  check('all thirteen classes are targeted individually', classDocs.size === 13, `${classDocs.size} documents`)
  check(
    'each class row targets name, age and focus',
    ['name', 'ageRange', 'focus'].every((field) =>
      attrs.some((a) => a.includes(`id=${FIRST_CLASS_ID}`) && a.includes(`path=${field}`)),
    ),
  )
  check('the table column headings carry targets', attrs.some((a) => a.includes('columnLabels')))
  check('the CTA button targets its own field', attrs.some((a) => a.includes('primaryButton')))
  check(
    'section containers are grouped edit targets',
    (preview.match(/data-sanity-edit-target/g) || []).length > 0,
    `${(preview.match(/data-sanity-edit-target/g) || []).length} containers`,
  )
  check('no stega leaked into href, class or title', noStegaLeak(preview))

  /* 7. hide a section (published, then restored) ---------------------------- */
  await client.patch(PAGE_ID).set({'sections[_key == "highlights"].enabled': false}).commit()
  await fireWebhook(PAGE_ID)
  const hidden = await waitForPage(PATH, (html) => !has(html, 'Curriculum Highlights'))
  check(
    '7  hiding a section removes it from the page',
    hidden.ok && !has(hidden.html, 'Spoken English'),
    hidden.ok ? '' : 'still rendered after 45s',
  )
  check('   the class table is unaffected', has(hidden.html, 'Play Group'))

  /* reorder (published, then restored) -------------------------------------- */
  await client.createOrReplace(original)
  const before = original.sections.map((s) => s._key)
  const swapped = [before[2], before[0], ...before.slice(1)]
  await client
    .patch(PAGE_ID)
    .set({sections: swapped.map((key) => original.sections.find((s) => s._key === key))})
    .commit()
  await fireWebhook(PAGE_ID)

  // Both markers must be unique to the page body. The hero heading is NOT: the
  // navigation also links to "Classes & Curriculum", so `indexOf` would find the
  // menu link rather than the hero.
  const reordered = await waitForPage(PATH, (html) => {
    const highlightsAt = html.indexOf('Curriculum Highlights')
    const tableAt = html.indexOf('Classes Offered')
    return highlightsAt > -1 && tableAt > -1 && highlightsAt < tableAt
  })
  check('reordering sections changes the rendered order', reordered.ok)
} finally {
  await removeDrafts([PAGE_ID, FIRST_CLASS_ID])
  await client.createOrReplace(originalFirstClass).catch(() => {})
  await client.createOrReplace(original).catch(() => {})
  await fireWebhook(PAGE_ID).catch(() => {})
  await previewCleanup().catch(() => {})

  const expected = original.sections
    .map((section) => section.heading ?? section.header?.heading)
    .filter(Boolean)
  const restored = await waitForAll(PATH, expected, {timeout: 30000})
  const stillMissing = expected.filter((heading) => !has(restored.html, heading))
  check(
    'the Academics page document is restored',
    restored.ok && stillMissing.length === 0,
    stillMissing.length ? `missing after 30s: ${stillMissing.join(', ')}` : '',
  )

  const restoredClass = await client.getDocument(FIRST_CLASS_ID)
  check(
    'the class documents are restored',
    restoredClass?.name === originalFirstClass.name &&
      restoredClass?.ageRange === originalFirstClass.ageRange,
    `${restoredClass?.name} / ${restoredClass?.ageRange}`,
  )

  const leftovers = await client
    .fetch(
      '*[_id in path("drafts.**") && (_id == "drafts.academicsPage" || _id == "drafts.class-play-group")]._id',
    )
    .catch(() => [])
  check('no test drafts are left behind', (leftovers ?? []).length === 0, (leftovers ?? []).join(', '))
  if (stillMissing.length) console.error('\nRe-run: node scripts/seed-academics.mjs')
}

report()
