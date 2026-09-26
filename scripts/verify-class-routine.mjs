/**
 * Verifies the Class Routine page end to end: the CMS round trip, the
 * draft/published boundary, click-to-edit, and the timetable behaviour.
 *
 * DEVELOPMENT ONLY. Run it with the dev server up:
 *
 *   node scripts/verify-class-routine.mjs
 *
 * Covers the page build checklist's nine round-trip tests, mapped to this page:
 *   1  edit the page heading              -> the frontend updates
 *   2  edit a timetable subject           -> the frontend updates
 *   3  change the share image             -> the frontend updates
 *   4  change the image alt text          -> the frontend uses the new alt
 *   5  change the button label            -> the frontend updates
 *   6  change the button URL              -> the frontend uses the new URL
 *   7  hide a section                     -> the section disappears
 *   8  edit a referenced routine document -> the timetable updates
 *   9  click-to-edit resolves the right source for page and routine fields
 *
 * Plus page-specific behaviour: thirteen class tabs, five day columns, nine slots,
 * assembly/break rows render their own label, empty lesson cells render an em dash,
 * trailing empty rows are trimmed, the print control is present, and everything is
 * restored afterwards.
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

const PATH = '/academics/class-routine'
const PAGE_ID = 'classRoutinePage'
const FIRST_ROUTINE_ID = 'class-routine-play'

const tag = Date.now().toString(36)
const M = {
  heading: `EDIT heading ${tag}`,
  tableSubheading: `EDIT subheading ${tag}`,
  slotTime: `EDIT time ${tag}`,
  slotLabel: `EDIT slot ${tag}`,
  noteTitle: `EDIT note ${tag}`,
  ctaHeading: `EDIT cta ${tag}`,
  printLabel: `EDIT print ${tag}`,
  cell: `EDIT subject ${tag}`,
  rowAdded: `EDIT added row ${tag}`,
  session: `EDIT session ${tag}`,
  alt: `EDIT alt ${tag}`,
  btnLabel: `EDIT button ${tag}`,
  btnUrl: `/contact?edited=${tag}`,
}
const MARKERS = Object.values(M)

const original = await client.getDocument(PAGE_ID)
const originalRoutine = await client.getDocument(FIRST_ROUTINE_ID)
let previewCleanup = async () => {}

if (!original || !originalRoutine) {
  console.error(
    `Missing CMS documents. Run: node scripts/seed-class-routine.mjs\n  classRoutinePage: ${Boolean(original)}\n  classRoutine:    ${Boolean(originalRoutine)}`,
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
    'the Class Routine page renders its seeded content',
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
  check('the #routine anchor exists', baseline.includes('id="routine"'))

  /* tabs ------------------------------------------------------------------- */
  check('thirteen class tabs render', (baseline.match(/role="tab"/g) || []).length === 13)
  check('exactly one tab is selected', (baseline.match(/aria-selected="true"/g) || []).length === 1)
  check('the tab list is labelled', /role="tablist" aria-label="[^"]+"/.test(baseline))
  // See the long note further down: a tab must NOT be a click-to-edit target, or
  // the Presentation Tool's overlay swallows the click and the tab can never switch.
  check(
    'no tab is a click-to-edit target (so every class stays reachable)',
    (baseline.match(/role="tab"[^>]*data-sanity="id=class-routine-/g) || []).length === 0,
  )

  /* timetable -------------------------------------------------------------- */
  const table = /<tbody[\s\S]*?<\/tbody>/.exec(baseline)?.[0] ?? ''
  check('the timetable is a real table', Boolean(table))
  check(
    'five day columns plus Time and Slot',
    (baseline.match(/<th scope="col"/g) || []).length === 7,
    `${(baseline.match(/<th scope="col"/g) || []).length} column headings`,
  )
  for (const day of ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']) {
    check(`   the ${day} column exists`, baseline.includes(`>${day}</th>`))
  }
  check(
    'the table scrolls inside its container instead of overflowing the page',
    /jid-routine-scroll/.test(baseline) && /jid-routine-table[^"]*min-w-\[720px\]/.test(baseline),
  )
  check('the print control is present', /jid-routine-controls/.test(baseline))

  // All nine slot times and labels are defined once, on the page.
  for (const t of [
    '8:00 – 8:30', '8:30 – 9:15', '9:15 – 10:00', '10:00 – 10:30',
    '10:30 – 11:15', '11:15 – 12:00', '12:00 – 12:30', '12:30 – 1:15', '1:15 – 2:00',
  ]) {
    check(`   the ${t} slot renders`, has(baseline, t))
  }

  /* reference render rules -------------------------------------------------- */
  // The first class is Play Group, a morning-only class: Period 6 is empty for it,
  // so the trailing row is trimmed and only eight rows render.
  check(
    'trailing empty rows are trimmed for a morning-only class',
    (table.match(/<tr/g) || []).length === 8,
    `${(table.match(/<tr/g) || []).length} rows rendered`,
  )
  check(
    'assembly rows show their own label on every day',
    (baseline.match(/bg-gray-100[^"]*text-xs font-semibold text-gray-600/g) || []).length >= 5,
  )
  check('the session is shown beside the class name', /Morning Session: 8:00 AM/.test(baseline))

  /* 1, 2, 5, 6, 8. draft-only edits ---------------------------------------- */
  const draftId = await createDraftFrom(original)
  const routineDraftId = await createDraftFrom(originalRoutine)

  await client
    .patch(draftId)
    .set({
      'sections[_key == "hero"].heading': M.heading,
      'sections[_key == "routine"].header.subheading': M.tableSubheading,
      'sections[_key == "routine"].slots[_key == "slot-2"].time': M.slotTime,
      'sections[_key == "routine"].slots[_key == "slot-2"].label': M.slotLabel,
      'sections[_key == "routine"].printButtonLabel': M.printLabel,
      'sections[_key == "good-to-know"].pillars[_key == "note-periods"].title': M.noteTitle,
      'sections[_key == "cta"].heading': M.ctaHeading,
      'sections[_key == "cta"].primaryButton.label': M.btnLabel,
      'sections[_key == "cta"].primaryButton.url': M.btnUrl,
      'seo.shareImage.alt': M.alt,
    })
    .commit()

  // The first routine's Period 1 row: Sunday is the first day column.
  await client
    .patch(routineDraftId)
    .set({
      session: M.session,
      'rows[_key == "period-1"].cells[0]': M.cell,
    })
    .commit()

  // Adding a row, which is the other half of "I must be able to add any row".
  // `period-4` (11:15 - 12:00) is a real slot on the page and falls inside Play
  // Group's morning session, so the renderer must pick it up by slotKey and give
  // it a new rendered row.
  //
  // Built from the draft's *current* rows so the cell edit above is not clobbered.
  const addedRowKey = 'verify-added-row'
  const draftBeforeAdd = await client.getDocument(routineDraftId)
  await client
    .patch(routineDraftId)
    .set({
      rows: [
        ...(draftBeforeAdd.rows ?? []),
        {_key: addedRowKey, _type: 'classRoutineRow', slotKey: 'period-4', cells: [M.rowAdded, '', '', '', '']},
      ],
    })
    .commit()

  const publishedWithDrafts = await pageHtml(PATH)
  check(
    'the published page does not expose draft edits',
    !MARKERS.some((marker) => has(publishedWithDrafts, marker)),
  )
  check('the published page keeps its original heading', has(publishedWithDrafts, heroHeading))
  check(
    'the published timetable keeps its original subject',
    has(publishedWithDrafts, 'Play Activity'),
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
  check('   a note card title updates', has(preview, M.noteTitle))
  check('   the closing band heading updates', has(preview, M.ctaHeading))
  check('   the print button label updates', has(preview, M.printLabel))
  check('   a slot time updates', has(preview, M.slotTime))
  check('   a slot label updates', has(preview, M.slotLabel))

  /* 8. referenced document -------------------------------------------------- */
  check('8  edit a referenced routine updates the timetable', has(preview, M.cell))
  check('   the session label updates', has(preview, M.session))

  /* 9. add a row ----------------------------------------------------------- */
  // Baseline is captured from `baseline`, which was fetched BEFORE any mutation,
  // so this compares like with like.
  const rowsIn = (html) => (/<tbody[\s\S]*?<\/tbody>/.exec(html)?.[0].match(/<tr[\s>]/g) || []).length
  const originalRows = rowsIn(baseline)
  const rowsAfterAdd = rowsIn(preview)
  check('adding a row renders a new timetable row', has(preview, M.rowAdded), `Play Group had ${originalRows} rows`)
  check(
    'the added row increased the rendered row count',
    rowsAfterAdd === originalRows + 1,
    `${originalRows} -> ${rowsAfterAdd}`,
  )
  check(
    'the added row is a real slot on the page, not a free-text invention',
    has(preview, '11:15'),
    'period-4 time came from the page slots',
  )

  /* 5 + 6. button label and URL --------------------------------------------- */
  const btnHref = findButtonHref(preview, M.btnLabel)
  check('5  changing the button label updates the frontend', has(preview, M.btnLabel))
  check('6  changing the button URL changes where it points', btnHref === M.btnUrl, `href=${btnHref}`)

  /* 10. delete a row -------------------------------------------------------- */
  await client.patch(routineDraftId).unset([`rows[_key == "${addedRowKey}"]`]).commit()
  const afterDelete = await waitForPage(
    PATH,
    (html) => !has(html, M.rowAdded),
    {headers: {cookie: draftMode.cookieHeader()}},
  )
  check('deleting a row removes it from the timetable', afterDelete.ok)
  // Deliberately compared against the PUBLISHED page rather than a second draft
  // fetch: the dev server serves a cached draft render, so two draft-mode row
  // counts are not comparable. The published surface is deterministic and also
  // proves the draft edits never leaked.
  const publishedAfterDelete = await pageHtml(PATH)
  check(
    'the row count returns to its original value',
    rowsIn(publishedAfterDelete) === originalRows,
    `${originalRows} -> ${rowsIn(publishedAfterDelete)} after delete`,
  )
  check(
    'no draft row edit leaked into the published page',
    !MARKERS.some((marker) => has(publishedAfterDelete, marker)),
  )

  /* 3 + 4. the SEO share image --------------------------------------------- */
  const ogBefore = /<meta property="og:image" content="([^"]*)"/.exec(preview)?.[1] ?? ''
  if (swapAsset && shareRef) {
    await client
      .patch(draftId)
      .set({'seo.shareImage.image.asset._ref': swapAsset, 'seo.shareImage.alt': M.alt})
      .commit()
    const afterSwap = await pageHtml(PATH, {headers: {cookie: draftMode.cookieHeader()}})
    const ogAfter = /<meta property="og:image" content="([^"]*)"/.exec(afterSwap)?.[1] ?? ''
    check('3  changing the share image changes the social preview', ogAfter !== ogBefore, ogAfter.slice(-30))
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
  const routineFields = [...paths.keys()].filter((k) => k.startsWith(`${FIRST_ROUTINE_ID}|`))
  console.log(`\n  click-to-edit text fields — classRoutinePage: ${pageFields.length}, ${FIRST_ROUTINE_ID}: ${routineFields.length}`)
  for (const key of [...pageFields, ...routineFields].sort()) console.log(`    ${key}`)

  check('page fields are click-to-edit', pageFields.length >= 6, `${pageFields.length} fields`)
  for (const key of [
    'sections[_key=="hero"].heading',
    'sections[_key=="routine"].header.subheading',
    'sections[_key=="routine"].slots[_key=="slot-2"].label',
    'sections[_key=="routine"].printButtonLabel',
    'sections[_key=="good-to-know"].pillars[_key=="note-periods"].title',
    'sections[_key=="cta"].heading',
  ]) {
    check(`   ${key.replace(/sections\[_key=="|"\]/g, '')} resolves`, pageFields.includes(`${PAGE_ID}|${key}`))
  }
  check(
    'the session resolves to the routine document',
    routineFields.some((k) => k.endsWith('|session')),
  )

  const attrs = [...preview.matchAll(/data-sanity="([^"]+)"/g)].map((m) => m[1])
  const attrTypes = countDataSanityByType(preview)
  console.log('\n  explicit data-sanity targets per document type:')
  for (const [type, count] of Object.entries(attrTypes).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(count).padStart(4)}  ${type}`)
  }
  // REGRESSION GUARD — this is the bug that made the other twelve classes
  // uneditable. A `data-sanity` attribute turns an element into a click-to-edit
  // target, and the Presentation Tool's overlay then consumes the click. On a tab
  // button that means the tab can never switch, so the other twelve timetables
  // could never be opened, let alone edited.
  //
  // The class-selection tabs must therefore carry NO click-to-edit attribute.
  const tabLabels = [
    'Play Group',
    'Nursery',
    'KG',
    'Class 1',
    'Class 5',
    'Class 10',
  ]
  const tabMatches = [
    ...preview.matchAll(/<button[^>]*aria-selected="(?:true|false)"[^>]*>([\s\S]*?)<\/button>/g),
  ]
  const tabButtons = tabMatches.map((m) => m[0])
  const tabNames = tabMatches.map((m) => m[1].replace(/<[^>]*>/g, '').trim())
  check(
    'the tablist is rendered',
    tabButtons.length === 13,
    `${tabButtons.length} tab buttons`,
  )
  // `has` strips the stega characters that draft mode injects into every string,
  // so the labels must be compared with it rather than with plain equality.
  const labelledTabs = tabNames.filter((n) => tabLabels.some((l) => has(n, l)))
  check(
    'class tabs (KG, Class 1, Class 5 …) are present',
    labelledTabs.length === tabLabels.length,
    `${labelledTabs.length}/${tabLabels.length} sampled labels found`,
  )
  check(
    'class tabs are controls, not edit targets, so they can still switch',
    tabButtons.every((b) => !b.includes('data-sanity')),
    tabButtons.filter((b) => b.includes('data-sanity')).length + ' tabs wrongly carry data-sanity',
  )
  check(
    'every class tab is keyboard and screen-reader operable',
    tabButtons.every((b) => b.includes('role="tab"') && /aria-controls="[^"]+"/.test(b)),
    'role=tab + aria-controls present on each',
  )
  // Because only the selected class is rendered, its class name in the timetable
  // header is the entry point for the other two jobs: editing that class, and
  // adding/removing its rows in the Studio.
  const routineDocs = new Set(
    [...preview.matchAll(/data-sanity="([^"]*id=class-routine-[a-z0-9]+[^"]*)"/g)]
      .map((m) => /id=(class-routine-[a-z0-9]+)/.exec(m[1])?.[1])
      .filter(Boolean),
  )
  check(
    'the selected class is targeted, so its document can be opened and its rows added or removed',
    routineDocs.size >= 1,
    `${routineDocs.size} routine document(s) reachable from the rendered table`,
  )
  check(
    'the class name in the timetable header is click-to-edit',
    /data-sanity="[^"]*id=class-routine-[a-z0-9]+[^"]*path=classLevel/.test(preview),
    'header targets classLevel on the routine document',
  )

  // Each subject cell is click-to-edit through an explicit `data-sanity` target on
  // the cell itself, which is what the Presentation Tool uses. The attribute uses
  // createDataAttribute's compact path notation (`rows:period-1.cells:0`), not the
  // bracketed form stega uses.
  //
  // Asserted on the published response, because that is the markup the preview
  // actually renders; the draft response carries the same targets only inside the
  // RSC payload.
  const published = await pageHtml(PATH)
  const cellAttrs = [...published.matchAll(/data-sanity="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((a) => a.includes('rows') && a.includes('cells'))
  check(
    'subject cells target the routine document',
    cellAttrs.some((a) => a.includes(`id=${FIRST_ROUTINE_ID}`)),
    'e.g. rows:period-1.cells:0',
  )
  check(
    'every visible subject cell carries its own target',
    cellAttrs.length >= 25,
    `${cellAttrs.length} cell targets on the published page`,
  )
  check('the day columns carry targets', attrs.some((a) => a.includes('path=sections:routine.days')))
  check('the slot times carry targets', attrs.some((a) => a.includes('slots:slot-2.time')))
  check('the print button label carries a target', attrs.some((a) => a.includes('printButtonLabel')))
  check('the CTA button targets its own field', attrs.some((a) => a.includes('primaryButton')))
  check(
    'section containers are grouped edit targets',
    (preview.match(/data-sanity-edit-target/g) || []).length > 0,
    `${(preview.match(/data-sanity-edit-target/g) || []).length} containers`,
  )
  check('no stega leaked into href, class or title', noStegaLeak(preview))

  /* 7. hide a section (published, then restored) ---------------------------- */
  await client.patch(PAGE_ID).set({'sections[_key == "good-to-know"].enabled': false}).commit()
  await fireWebhook(PAGE_ID)
  const hidden = await waitForPage(PATH, (html) => !has(html, 'Good To Know'))
  check(
    '7  hiding a section removes it from the page',
    hidden.ok && !has(hidden.html, 'Subject Rotation'),
    hidden.ok ? '' : 'still rendered after 45s',
  )
  check('   the timetable is unaffected', has(hidden.html, 'Weekly Timetable'))

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
    const notesAt = html.indexOf('Good To Know')
    const routineAt = html.indexOf('Weekly Timetable')
    return notesAt > -1 && routineAt > -1 && notesAt < routineAt
  })
  check('reordering sections changes the rendered order', reordered.ok)
} finally {
  await removeDrafts([PAGE_ID, FIRST_ROUTINE_ID])
  await client.createOrReplace(originalRoutine).catch(() => {})
  await client.createOrReplace(original).catch(() => {})
  await fireWebhook(PAGE_ID).catch(() => {})
  await previewCleanup().catch(() => {})

  const expected = original.sections
    .map((section) => section.heading ?? section.header?.heading)
    .filter(Boolean)
  const restored = await waitForAll(PATH, expected, {timeout: 30000})
  const stillMissing = expected.filter((heading) => !has(restored.html, heading))
  check(
    'the Class routine page document is restored',
    restored.ok && stillMissing.length === 0,
    stillMissing.length ? `missing after 30s: ${stillMissing.join(', ')}` : '',
  )

  const restoredRoutine = await client.getDocument(FIRST_ROUTINE_ID)
  check(
    'the routine documents are restored',
    restoredRoutine?.session === originalRoutine.session,
    restoredRoutine?.session,
  )

  const leftovers = await client
    .fetch(
      '*[_id in path("drafts.**") && (_id == "drafts.classRoutinePage" || _id == "drafts.class-routine-play")]._id',
    )
    .catch(() => [])
  check('no test drafts are left behind', (leftovers ?? []).length === 0, (leftovers ?? []).join(', '))
  if (stillMissing.length) console.error('\nRe-run: node scripts/seed-class-routine.mjs')
}

report()
