/**
 * Seeds the Sanity dataset with the initial **Class routine page** content and
 * the reusable `classRoutine` documents it references.
 *
 * DEVELOPMENT ONLY — a one-off bootstrap, not part of the website. The site never
 * reads these files: once seeded, everything lives in Sanity and is edited through
 * the Studio.
 *
 * Additive: it creates or replaces only the `classRoutinePage` document and the 13
 * `classRoutine` documents. It never touches Home, About, Academics, Admissions,
 * Site settings or Navigation, so it is safe to re-run.
 *
 * Every routine references a `classLevel` document, so **run
 * `node scripts/seed-academics.mjs` first**. This script checks and fails loudly
 * rather than creating documents with dangling references.
 *
 * Usage:
 *   node scripts/seed-class-routine.mjs
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {createClient} from '@sanity/client'

import {CLASS_ROUTINES, ROUTINE_DAYS, ROUTINE_SLOTS} from './class-routine-data.mjs'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'd04rgvdr'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-25'

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

/**
 * Each class owns its full table: expand the slot-keyed subject rows into
 * self-contained rows (time, label, kind, cells), dropping trailing empty lessons.
 */
function toRows(rows = []) {
  const bySlot = new Map(rows.map((row) => [row.slotKey, row.cells ?? []]))
  let last = -1
  ROUTINE_SLOTS.forEach((slot, i) => {
    if (slot.kind !== 'lesson' || (bySlot.get(slot.key) ?? []).some((c) => c?.trim())) last = i
  })
  return ROUTINE_SLOTS.slice(0, last + 1).map((slot) => ({
    _key: slot.key,
    _type: 'classRoutineRow',
    time: slot.time,
    label: slot.label,
    kind: slot.kind,
    ...(slot.kind === 'lesson'
      ? {cells: ROUTINE_DAYS.map((_, d) => bySlot.get(slot.key)?.[d] ?? '')}
      : {}),
  }))
}

/** An existing asset to reuse for the SEO share image, if it is present. */
const SHARE_IMAGE_SOURCE_FILENAME = 'hero-rainbow-classroom.png'

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
/* Guards                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Every routine points at a `classLevel`. If those documents are missing the
 * routine would render with no class name, so fail before writing anything.
 */
async function assertClassDocumentsExist() {
  const refs = CLASS_ROUTINES.map((r) => r.classLevel._ref)
  const found = await client.fetch(
    `*[_type == "classLevel" && _id in $refs]._id`,
    {refs},
  )
  const missing = refs.filter((id) => !found.includes(id))
  if (missing.length) {
    throw new Error(
      `Missing ${missing.length} Class document(s): ${missing.join(', ')}\n` +
        'Run "node scripts/seed-academics.mjs" first, then re-run this script.',
    )
  }
  console.log(`verified ${found.length} referenced Class documents exist`)
}

/* -------------------------------------------------------------------------- */
/* The page                                                                   */
/* -------------------------------------------------------------------------- */

/** Section content is taken verbatim from `JIDS/classroutine.html`. */
const buildClassRoutinePage = (routineIds, shareImageId) => ({
  _id: 'classRoutinePage',
  _type: 'classRoutinePage',
  internalTitle: 'Class routine page',
  sections: [
    {
      _key: 'hero',
      _type: 'pageHeroSection',
      enabled: true,
      heading: 'Class Routine',
      eyebrow: 'Effective From January 2026',
      eyebrowIcon: 'calendar',
      subheading:
        'Weekly timetable for every class from Play Group to Class 10. Pick a class to see its schedule. Routine changes are announced through the notice board and the class teacher.',
      appearance: 'solid',
      showIconWatermark: false,
      crumbs: [
        {_key: 'crumb-home', _type: 'breadcrumbItem', label: 'Home', url: '/'},
        {_key: 'crumb-academics', _type: 'breadcrumbItem', label: 'Academics', url: '/academics'},
        {_key: 'crumb-current', _type: 'breadcrumbItem', label: 'Class Routine', url: null},
      ],
      buttons: [],
    },
    {
      _key: 'routine',
      _type: 'routineSection',
      enabled: true,
      anchorId: 'routine',
      header: {
        _type: 'sectionHeader',
        heading: 'Weekly Timetable',
        subheading: 'School runs Sunday to Thursday. Friday and Saturday are the weekly holiday.',
      },
      routines: routineIds.map((id) => ({
        _key: id,
        _type: 'reference',
        _ref: id,
        _weak: false,
        _strengthenOnPublish: {type: 'classRoutine'},
      })),
      printButtonLabel: 'Print This Routine',
      footnote:
        "Timetable is indicative and may be adjusted for school events, examinations and co-curricular activities. The class teacher's verbal instruction always takes precedence.",
      emptyStateText:
        'Class timetables are being updated for the new session. Please contact the school office for the current routine.',
    },
    {
      _key: 'good-to-know',
      _type: 'pillarsSection',
      enabled: true,
      header: {_type: 'sectionHeader', heading: 'Good To Know', subheading: null},
      pillars: [
        {
          _key: 'note-periods',
          _type: 'pillarCard',
          icon: 'clock',
          tone: 'green',
          title: 'Short Periods By Design',
          description:
            'Younger classes run 45-minute periods with more play and activity breaks, while secondary classes get longer academic blocks.',
        },
        {
          _key: 'note-rotation',
          _type: 'pillarCard',
          icon: 'sparkle',
          tone: 'orange',
          title: 'Subject Rotation',
          description:
            'Core subjects rotate through the week so no child carries the same heavy subject back to back on consecutive days.',
        },
        {
          _key: 'note-change',
          _type: 'pillarCard',
          icon: 'pencil',
          tone: 'amber',
          title: 'Need A Change?',
          description:
            "Requested routine changes go through the school office and are approved by the Principal. Please do not rely on last year's routine.",
        },
      ],
    },
    {
      _key: 'cta',
      _type: 'pageCtaSection',
      enabled: true,
      anchorId: null,
      badge: null,
      heading: 'Want To See The Curriculum?',
      subheading:
        'Class-wise subjects, fees and admission details are all on the Academics and Admissions pages.',
      primaryButton: {
        _type: 'button',
        label: 'Classes & Curriculum',
        url: '/academics',
        newTab: false,
        variant: 'invert',
      },
      secondaryButton: {
        _type: 'button',
        label: 'Admissions',
        url: '/admissions',
        newTab: false,
        variant: 'white',
      },
    },
  ],
  seo: {
    _type: 'seo',
    // The root layout appends " | Jahan International Dream School", so metaTitle
    // carries only the page-specific part.
    metaTitle: 'Class Routine & Weekly Timetable',
    metaDescription:
      'See the weekly class routine for every class from Play Group to Class 10, including daily subjects, break times and the school session.',
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
  await assertClassDocumentsExist()

  const shareImageId = await findExistingAsset(SHARE_IMAGE_SOURCE_FILENAME)
  console.log(
    shareImageId
      ? `reusing existing asset for the share image: ${shareImageId}`
      : 'no existing share image found; the page will fall back to the site default',
  )

  const ordered = [...CLASS_ROUTINES].sort((a, b) => a.sortOrder - b.sortOrder)
  const page = buildClassRoutinePage(
    ordered.map((r) => r._id),
    shareImageId,
  )

  console.log(`Writing ${1 + ordered.length} documents (1 page + ${ordered.length} routines)...`)
  const tx = client.transaction()
  for (const routine of ordered) {
    const {classLevel, ...rest} = routine
    tx.createOrReplace({...rest, classLevel, days: ROUTINE_DAYS, rows: toRows(rest.rows)})
  }
  tx.createOrReplace(page)
  await tx.commit()

  console.log('Done. Open /studio/structure/classRoutinePage to review and edit the content.')
}

run().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
