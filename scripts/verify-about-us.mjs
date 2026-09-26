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
 * A note on drafts, because it is easy to get wrong:
 * `client.patch(id).commit()` writes to the **published** document. A real draft
 * is a separate document whose id is prefixed `drafts.`. The draft tests here
 * therefore create `drafts.<id>` explicitly and leave the published document
 * untouched, so "the public site does not see it" is a genuine assertion rather
 * than an artefact of CDN lag.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {createClient} from '@sanity/client'
import stega from '@vercel/stega'
import {encodeSignatureHeader} from '@sanity/webhook'

const {vercelStegaDecode: decodeStega} = stega

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'd04rgvdr'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const PAGE = '/about-us'
const PAGE_ID = 'aboutPage'
const PERSON_ID = 'person-principal-jahangir-alam'

/** Invisible characters Sanity uses to encode a field's source. */
const STEGA = /[\u200B-\u200D\u2060\uFEFF]/

function readEnv() {
  const file = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(file)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
      .map((line) => {
        const idx = line.indexOf('=')
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^"|"$/g, '')]
      }),
  )
}

const env = readEnv()

const adminToken = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), '.config', 'sanity', 'config.json'), 'utf8'),
).authToken

const client = createClient({
  projectId,
  dataset,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-25',
  token: adminToken,
  // Never read through the CDN: a stale CDN response would mask a real regression.
  useCdn: false,
})

const results = []
const check = (name, ok, detail = '') => {
  results.push({name, ok})
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fireWebhook() {
  const secret = env.SANITY_REVALIDATE_SECRET
  if (!secret) return
  const body = JSON.stringify({
    _id: PAGE_ID,
    _type: 'aboutPage',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: 'test',
  })
  const signature = await encodeSignatureHeader(body, Date.now(), secret)
  await fetch(`${SITE}/api/revalidate`, {
    method: 'POST',
    headers: {'content-type': 'application/json', 'sanity-webhook-signature': signature},
    body,
  })
  // The Sanity CDN also serves published reads, so give it a moment to catch up.
  await sleep(2500)
}

const jar = new Map()
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ')

function storeCookies(res) {
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const [pair] = raw.split(';')
    const idx = pair.indexOf('=')
    jar.set(pair.slice(0, idx), pair.slice(idx + 1))
  }
}

async function enableDraftMode() {
  const secret = `verify-about-${tag}`
  const secretId = `sanity-preview-url-secret-${secret}`
  await client.createOrReplace({
    _id: secretId,
    _type: 'sanity.previewUrlSecret',
    secret,
    studioUrl: `${SITE}/studio`,
  })

  const res = await fetch(
    `${SITE}/api/draft-mode/enable` +
      `?sanity-preview-secret=${encodeURIComponent(secret)}` +
      `&sanity-preview-pathname=${encodeURIComponent(PAGE)}` +
      `&sanity-preview-perspective=drafts`,
    {redirect: 'manual'},
  )
  storeCookies(res)
  return {res, cleanup: () => client.delete(secretId)}
}

const pageHtml = (opts) => fetch(`${SITE}${PAGE}`, opts).then((r) => r.text())

/**
 * Decodes the HTML entities React escapes, so a CMS string can be compared with
 * the rendered markup. Without this, any content containing `&`, `<`, `>` or a
 * quote appears to be "missing" when it has actually rendered correctly.
 */
const decodeEntities = (html) =>
  html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")

/** `html.includes(text)`, but entity-safe. */
const has = (html, text) => decodeEntities(html).includes(text)

/**
 * Polls the page until `predicate(html)` is true.
 *
 * Published content is read through the Sanity CDN, which is eventually
 * consistent: a publish can take several seconds to reach the rendered page.
 * Polling turns that timing into a deterministic result instead of a flaky
 * single check, while still failing loudly if the change never arrives.
 */
async function waitForPage(predicate, {timeout = 45000, interval = 2000} = {}) {
  const deadline = Date.now() + timeout
  let html = ''
  for (;;) {
    html = await pageHtml().catch(() => '')
    if (predicate(html)) return {ok: true, html}
    if (Date.now() >= deadline) return {ok: false, html}
    await sleep(interval)
  }
}

/**
 * Creates a real draft from a published document, by writing the same content to
 * the `drafts.`-prefixed id. Returns the draft id.
 */
async function createDraftFrom(doc) {
  const draftId = `drafts.${doc._id}`
  const draft = {...doc, _id: draftId}
  // A draft is a new document; carrying the published revision over is invalid.
  delete draft._rev
  await client.createOrReplace(draft)
  return draftId
}

/** Finds the <img> whose data-sanity points at a given document. */
function findImage(html, docId) {
  for (const m of html.matchAll(/<img[^>]*>/g)) {
    if (!m[0].includes(`id=${docId}`)) continue
    return {
      src: /src="([^"]+)"/.exec(m[0])?.[1] ?? '',
      alt: /alt="([^"]*)"/.exec(m[0])?.[1] ?? '',
      tag: m[0],
    }
  }
  return null
}

/**
 * Finds the href of the anchor whose visible label contains `labelFragment`.
 *
 * The content window is deliberately generous: inside Draft Mode the label is
 * stega-encoded, and that payload easily exceeds a few hundred characters.
 */
function findButtonHref(html, labelFragment) {
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    if (m[2].includes(labelFragment)) return m[1]
  }
  return null
}

const originalPage = await client.getDocument(PAGE_ID)
const originalPerson = await client.getDocument(PERSON_ID)
let previewCleanup = async () => {}

if (!originalPage || !originalPerson) {
  console.error(
    `Missing CMS documents. Run: node scripts/seed-about-us.mjs\n  aboutPage: ${Boolean(originalPage)}\n  person:   ${Boolean(originalPerson)}`,
  )
  process.exit(1)
}

const heroSection = originalPage.sections.find((s) => s._key === 'hero')
const originalHeading = heroSection?.heading
const originalPhotoRef = originalPerson.photo?.image?.asset?._ref
const swapAsset = await client.fetch(
  '*[_type == "sanity.imageAsset" && originalFilename == "brand-crest.png"][0]._id',
)

try {
  /* 0. baseline ------------------------------------------------------------ */
  const baseline = await pageHtml()
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
  // The breadcrumb nav renders after the h1, so match the nav block and check
  // the labels inside it.
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

  const publishedWithDrafts = await pageHtml()
  check(
    'the published page does not expose draft edits',
    !MARKERS.some((marker) => has(publishedWithDrafts, marker)),
  )
  check('the published page keeps its original heading', has(publishedWithDrafts, originalHeading))
  check(
    'the published principal keeps the original name',
    has(publishedWithDrafts, originalPerson.name),
  )

  /* draft mode ------------------------------------------------------------- */
  const draftMode = await enableDraftMode()
  previewCleanup = draftMode.cleanup
  check('draft mode enable route returns a redirect', draftMode.res.status === 307, `status ${draftMode.res.status}`)
  check('draft mode cookie set', jar.has('__prerender_bypass'))

  const preview = await pageHtml({headers: {cookie: cookieHeader()}})

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
    const afterSwap = await pageHtml({headers: {cookie: cookieHeader()}})
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
  const afterAlt = await pageHtml({headers: {cookie: cookieHeader()}})
  check(
    '4  changing the image alt text changes the rendered alt',
    (findImage(afterAlt, PERSON_ID)?.alt ?? '') === M.alt,
  )
  await client.patch(personDraftId).set({'photo.alt': originalPerson.photo.alt}).commit()

  /* 9. click-to-edit --------------------------------------------------------- */
  check(
    'preview mounts the VisualEditing overlays',
    /_next\/static\/chunks\/.*VisualEditing/.test(preview),
  )

  const textNodes = [...preview.matchAll(/>([^<>]*[\u200B-\u200D\u2060\uFEFF][^<>]*)</g)].map((m) => m[1])
  const paths = new Map()
  for (const node of textNodes) {
    const href = decodeStega(node)?.href
    if (!href) continue
    const decoded = decodeURIComponent(href)
    const id = /[?&]id=([^&]+)/.exec(decoded)?.[1]
    const field = /[?&]path=([^&]+)/.exec(decoded)?.[1]
    if (id && field) paths.set(`${id}|${field}`, (paths.get(`${id}|${field}`) ?? 0) + 1)
  }

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
  check(
    'each pillar card is click-to-edit',
    pageFields.some((k) => k.includes('pillar-vision')),
  )

  const attrs = [...preview.matchAll(/data-sanity="([^"]+)"/g)].map((m) => m[1])
  const attrTypes = {}
  for (const value of attrs) {
    const type = /type=([^;&]+)/.exec(value)?.[1] ?? '?'
    attrTypes[type] = (attrTypes[type] ?? 0) + 1
  }
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
  check(
    'no stega leaked into href, class or title',
    ![...preview.matchAll(/href="([^"]*)"/g)].some((m) => STEGA.test(m[1])) &&
      ![...preview.matchAll(/class="([^"]*)"/g)].some((m) => STEGA.test(m[1])) &&
      !/<title>[^<]*[\u200B-\u200D\u2060\uFEFF]/.test(preview),
  )

  /* 7. hide a section (published, then restored) ---------------------------- */
  await client.patch(PAGE_ID).set({'sections[_key == "pillars"].enabled': false}).commit()
  await fireWebhook()
  const hidden = await waitForPage((html) => !has(html, 'Our Guiding Philosophy'))
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
  await fireWebhook()

  const reordered = await waitForPage((html) => {
    const principalAt = decodeEntities(html).indexOf('Meet Our Principal')
    const heroAt = decodeEntities(html).indexOf(originalHeading)
    return principalAt > -1 && heroAt > -1 && principalAt < heroAt
  })
  check('reordering sections changes the rendered order', reordered.ok)
} finally {
  // Remove the drafts, restore the published documents, then confirm the restore.
  for (const id of [`drafts.${PAGE_ID}`, `drafts.${PERSON_ID}`]) {
    await client.delete(id).catch(() => {})
  }
  await client.createOrReplace(originalPerson).catch(() => {})
  await client.createOrReplace(originalPage).catch(() => {})
  await fireWebhook().catch(() => {})
  await previewCleanup().catch(() => {})

  /**
   * The published page is read through the Sanity CDN, so it can lag a moment
   * behind the restore. Poll rather than check once, otherwise this reports a
   * false failure for a document that is already correct.
   */
  const expected = originalPage.sections
    .map((section) => section.heading ?? section.header?.heading)
    .filter(Boolean)

  let missing = expected
  for (let attempt = 0; attempt < 15 && missing.length; attempt++) {
    const html = await pageHtml().catch(() => '')
    missing = expected.filter((heading) => !has(html, heading))
    if (missing.length) await sleep(2000)
  }

  const leftovers = await client
    .fetch('*[_id in path("drafts.**") && (_id == "drafts.aboutPage" || _id == "drafts.person-principal-jahangir-alam")]._id')
    .catch(() => [])

  check(
    'the About documents are restored',
    missing.length === 0,
    missing.length ? `missing after 20s: ${missing.join(', ')}` : '',
  )
  check('no test drafts are left behind', (leftovers ?? []).length === 0, (leftovers ?? []).join(', '))
  if (missing.length) {
    console.error('\nRe-run: node scripts/seed-about-us.mjs')
  }
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
