// Structural guard for the CMS content itself. No dev server required, no page
// fetch, no mutation — it only reads the dataset, so it is safe to run at any
// time and safe to run while an editor is working.
//
//   node --env-file=.env.local scripts/verify-cms.mjs
//
// WHY THIS EXISTS
// On 2026-10-08 an editor removed the Home page hero by deleting it from the
// `sections` array in the Studio. There is no error and no fallback: the hero
// simply stopped rendering, and the top of the Home page became the stats bar.
// The build still passed, `tsc` still passed, and `verify-seo.mjs` — 218 checks —
// still passed, because nothing was structurally invalid. The content was just
// gone.
//
// `verify-sections.mjs` would have caught it, but it needs a running dev server
// and it *mutates* the Home page document while testing, so it cannot be the
// everyday check. This script is that check.
//
// WHAT IT ASSERTS
// Per page: the document exists, it has at least one section, and the section
// types a page needs in order to make sense are present. A page whose hero is
// empty or missing is reported as a failure, because the hero carries the
// page's `<h1>` and its primary calls to action.
//
// It deliberately asserts on *structure*, never on copy. A school is free to
// rename every heading on the site and this script will still pass.
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-09-25',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
})

/**
 * Each singleton page, and the section types it cannot do without.
 *
 * `heroSection` is required wherever the page would otherwise have no `<h1>` of
 * its own. Adding a page here is the only step needed to guard a new page.
 */
const PAGES = [
  {id: 'homePage', label: 'Home', required: ['heroSection']},
  {id: 'aboutPage', label: 'About Us', required: []},
  {id: 'academicsPage', label: 'Academics', required: []},
  {id: 'classRoutinePage', label: 'Class Routine', required: []},
  {id: 'admissionsPage', label: 'Admissions', required: []},
  {id: 'contactPage', label: 'Contact', required: []},
  {id: 'branchPage', label: 'Branch', required: []},
  {id: 'complaintPage', label: 'Complaint Box', required: []},
  {id: 'siteSettings', label: 'Site Settings', required: []},
  {id: 'navigation', label: 'Navigation', required: []},
]

const results = []
const check = (name, ok, detail = '') => {
  results.push({name, ok})
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

console.log(`Dataset: ${client.config().projectId} / ${client.config().dataset}\n`)

for (const page of PAGES) {
  const doc = await client.fetch(
    `*[_id == $id][0]{ "id": _id, "updatedAt": _updatedAt, "hasSections": defined(sections), "sectionCount": count(sections), "types": sections[]._type, "heroes": count(sections[_type == "heroSection" && defined(heading) && heading != ""]) }`,
    {id: page.id},
  )

  if (!doc) {
    check(`${page.label} document exists`, false, `no document with _id "${page.id}"`)
    continue
  }

  check(`${page.label} document exists`, true, doc.id)

  // Site settings and navigation hold content, not a `sections` array, so the
  // section assertions only apply to the pages that actually have one.
  if (!doc.hasSections) continue

  const types = doc.types ?? []

  check(`${page.label} has sections`, doc.sectionCount > 0, `${doc.sectionCount} sections`)

  for (const required of page.required) {
    if (required === 'heroSection') {
      check(
        `${page.label} has a hero section with a heading`,
        (doc.heroes ?? 0) > 0,
        doc.heroes > 0
          ? `${doc.heroes} hero(s)`
          : 'no hero with a non-empty heading — the page would render with no <h1>',
      )
    } else {
      const count = types.filter((type) => type === required).length
      check(`${page.label} has a ${required}`, count > 0, `${count} found`)
    }
  }
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)

if (failed.length) {
  console.log('')
  console.log('A page lost a section it needs. This is a content edit, not a bug:')
  console.log('open the document in the Studio and either restore the section or')
  console.log('switch its "Show this section on the website" toggle back on.')
  console.log('')
  console.log('If the section was deleted rather than hidden, the Studio document')
  console.log('history can restore the previous revision. scripts/seed.mjs must NOT be')
  console.log('used to recover: it replaces siteSettings and navigation too, which')
  console.log('would revert every other edit made since it was first run.')
}

process.exit(failed.length ? 1 : 0)
