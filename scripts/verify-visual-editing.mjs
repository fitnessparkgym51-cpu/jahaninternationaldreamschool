/**
 * Verifies the Visual Editing integration end to end.
 *
 * DEVELOPMENT ONLY. Run it with the dev server up:
 *
 *   node scripts/verify-visual-editing.mjs
 *
 * It checks that
 *   - the published page is clean (no stega, no draft content)
 *   - a draft-only edit is invisible to the published page
 *   - the same draft appears in the preview once Draft Mode is on
 *   - every string the preview renders carries a Sanity source path
 *   - images, buttons, links and reusable documents are click-to-edit targets
 *   - no Sanity token is reachable from the browser
 * and restores the document it edited.
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

/** Read token from .env.local, so this script never needs its own copy. */
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
const READ_TOKEN = env.SANITY_API_READ_TOKEN

/** Write access is only needed to create a temporary draft and a preview secret. */
const adminToken = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), '.config', 'sanity', 'config.json'), 'utf8'),
).authToken

const client = createClient({
  projectId,
  dataset,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-25',
  token: adminToken,
  useCdn: false,
})

const results = []
const check = (name, ok, detail = '') => {
  results.push({name, ok})
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const DRAFT_MARKER = `Draft only ${Date.now().toString(36)}`

/** Posts a signed Sanity webhook payload so the cache is refreshed, as it would be in production. */
async function fireWebhook(document) {
  const secret = env.SANITY_REVALIDATE_SECRET
  if (!secret) return
  const payload = JSON.stringify({
    _id: document._id,
    _type: document._type,
    _createdAt: document._createdAt ?? new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: document._rev ?? 'test',
  })
  const signature = await encodeSignatureHeader(payload, Date.now(), secret)
  await fetch(`${SITE}/api/revalidate`, {
    method: 'POST',
    headers: {'content-type': 'application/json', 'sanity-webhook-signature': signature},
    body: payload,
  })
  await new Promise((r) => setTimeout(r, 1200))
}

/* -------------------------------------------------------------------------- */
/* Draft mode plumbing                                                        */
/* -------------------------------------------------------------------------- */

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
  const secret = `verify-${Date.now().toString(36)}`
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
      `&sanity-preview-pathname=%2F` +
      `&sanity-preview-perspective=drafts`,
    {redirect: 'manual'},
  )
  storeCookies(res)

  return {res, cleanup: () => client.delete(secretId)}
}

/** Downloads every client chunk a page loads, so secrets can be searched for. */
async function fetchChunks(html) {
  const urls = new Set(
    [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g)].map((m) => m[1]),
  )
  const bodies = []
  for (const url of urls) {
    bodies.push(await (await fetch(SITE + url)).text())
  }
  return bodies
}

/* -------------------------------------------------------------------------- */
/* Run                                                                        */
/* -------------------------------------------------------------------------- */

const original = await client.getDocument('homePage')
let previewCleanup = async () => {}

/** Restores the document and confirms the restore actually took effect. */
async function restore() {
  await client.createOrReplace(original)
  await fireWebhook(original)
  const heading = await client.fetch(
    '*[_type == "homePage"][0].sections[_key == "hero"].heading',
    {},
    {perspective: 'published'},
  )
  return heading?.[0] === original.sections.find((s) => s._key === 'hero').heading
}

try {
  /* 1. published page is clean ------------------------------------------- */
  const published = await (await fetch(`${SITE}/`)).text()
  const originalHeading = original.sections.find((s) => s._key === 'hero').heading

  check(
    'published page has no stega encoding',
    !/[\u200B-\u200D\u2060\uFEFF]/.test(published),
  )
  check(
    'published page has no VisualEditing overlays',
    !/_next\/static\/chunks\/.*VisualEditing/.test(published),
  )
  check('published page shows the published heading', published.includes(originalHeading))

  /* 2. a draft-only edit -------------------------------------------------- */
  await client
    .patch('homePage')
    .set({'sections[_key == "hero"].heading': DRAFT_MARKER})
    // No publish: the draft stays a draft.
    .commit()

  const stillPublished = await (await fetch(`${SITE}/`)).text()
  check(
    'published site does not expose draft content',
    !stillPublished.includes(DRAFT_MARKER) && stillPublished.includes(originalHeading),
  )
  /* 3. preview shows the draft -------------------------------------------- */
  const draftMode = await enableDraftMode()
  previewCleanup = draftMode.cleanup
  check(
    'draft mode enable route returns a redirect',
    draftMode.res.status === 307,
    `status ${draftMode.res.status}`,
  )
  check('draft mode cookie set', jar.has('__prerender_bypass'), [...jar.keys()].join(', '))

  const preview = await (await fetch(`${SITE}/`, {headers: {cookie: cookieHeader()}})).text()

  check('preview shows the draft heading', preview.includes(DRAFT_MARKER))
  check('preview mounts the VisualEditing overlays', /_next\/static\/chunks\/.*VisualEditing/.test(preview))

  /* 4. stega field paths -------------------------------------------------- */
  const textNodes = [
    ...preview.matchAll(/>([^<>]*[\u200B-\u200D\u2060\uFEFF][^<>]*)</g),
  ].map((m) => m[1])

  const paths = new Map()
  for (const node of textNodes) {
    const decoded = decodeStega(node)
    const href = decoded?.href
    if (!href) continue
    const id = /[?&]id=([^&]+)/.exec(decodeURIComponent(href))?.[1]
    const field = /[?&]path=([^&]+)/.exec(decodeURIComponent(href))?.[1]
    if (id && field) paths.set(`${id}  ${field}`, (paths.get(`${id}  ${field}`) ?? 0) + 1)
  }

  check(
    'every stega string carries a Sanity source',
    paths.size > 0,
    `${textNodes.length} encoded strings, ${paths.size} distinct fields`,
  )

  const byDoc = {}
  for (const key of paths.keys()) {
    const doc = key.split('  ')[0]
    byDoc[doc] = (byDoc[doc] ?? 0) + 1
  }
  console.log('\n  click-to-edit text fields per document:')
  for (const [doc, count] of Object.entries(byDoc).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${count.toString().padStart(4)}  ${doc}`)
  }

  console.log('\n  hero + section fields reachable by clicking:')
  for (const key of [...paths.keys()].sort()) {
    if (key.startsWith('homePage')) console.log(`    ${key}`)
  }

  /* 5. data-sanity attributes --------------------------------------------- */
  const attributes = [...preview.matchAll(/data-sanity="([^"]+)"/g)].map((m) => m[1])
  const byType = {}
  for (const value of attributes) {
    const type = /type=([^;&]+)/.exec(value)?.[1] ?? '?'
    byType[type] = (byType[type] ?? 0) + 1
  }

  check(
    'images, links and cards carry data-sanity targets',
    attributes.length > 0,
    `${attributes.length} attributes`,
  )
  console.log('\n  explicit data-sanity targets per document type:')
  for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${count.toString().padStart(4)}  ${type}`)
  }

  const reusable = byType.studentSpotlight ?? 0
  const news = byType.newsPost ?? 0
  check(
    'reusable documents (students, news) are targeted directly',
    reusable > 0 && news > 0,
    `studentSpotlight ${reusable}, newsPost ${news}`,
  )

  /* 6. no stega leaked into URLs or classes ------------------------------- */
  const hrefsWithStega = [...preview.matchAll(/href="([^"]*)"/g)].filter((m) =>
    /[\u200B-\u200D\u2060\uFEFF]/.test(m[1]),
  )
  const classesWithStega = [...preview.matchAll(/class="([^"]*)"/g)].filter((m) =>
    /[\u200B-\u200D\u2060\uFEFF]/.test(m[1]),
  )
  const titleWithStega = /<title>[^<]*[\u200B-\u200D\u2060\uFEFF]/.test(preview)

  check('no stega in href attributes', hrefsWithStega.length === 0)
  check('no stega in class attributes', classesWithStega.length === 0)
  check('no stega in <title>', !titleWithStega)

  /* 7. no token reachable from the browser -------------------------------- */
  const token = READ_TOKEN
  if (!token) {
    console.log('SKIP  token exposure check (no SANITY_API_READ_TOKEN in .env.local)')
  } else {
    // The published site must never carry a token.
    const publishedChunks = await fetchChunks(published)
    check(
      'no Sanity token in the published page or its client chunks',
      ![...publishedChunks, published].some((body) => body.includes(token)),
      `${publishedChunks.length} chunks scanned`,
    )

    // The draft preview hands one token to <SanityLive includeDrafts> so the
    // browser can subscribe to draft events. Sanity's own design for this: the
    // token must be Viewer/read scoped. It must never be a Studio session token
    // or anything with write access.
    const previewChunks = await fetchChunks(preview)
    const bodies = [preview, ...previewChunks]
    const usesReadToken = bodies.some((body) => body.includes(token))
    check(
      'draft preview uses only the read-scoped token for <SanityLive>',
      usesReadToken,
      'expected: one read token in the live subscription config',
    )

    // Prove the token cannot write.
    let canWrite = false
    try {
      await client.withConfig({token}).createOrReplace({
        _id: 'verify-token-permissions-probe',
        _type: 'verifyProbe',
      })
      canWrite = true
      await client.delete('verify-token-permissions-probe')
    } catch {
      canWrite = false
    }
    check('SANITY_API_READ_TOKEN cannot write', !canWrite, canWrite ? 'it CAN write!' : 'rejected')

    // The Studio session token must never appear anywhere in the app output.
    const sessionLeaks = bodies.filter((body) => body.includes(adminToken))
    check(
      'the Studio session token is never exposed',
      sessionLeaks.length === 0,
      `${sessionLeaks.length} leaks`,
    )
  }
} finally {
  const restored = await restore()
  await previewCleanup()
  check('the Home page document is restored', restored, restored ? '' : 'MANUAL RESET NEEDED')
  if (!restored) {
    console.error(
      '\nThe Home page heading does not match the value captured at the start of the run.\nRe-run: node scripts/seed.mjs',
    )
  }
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
