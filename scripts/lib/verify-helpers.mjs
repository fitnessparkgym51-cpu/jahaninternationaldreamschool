/**
 * Shared helpers for the page verification scripts.
 *
 * DEVELOPMENT ONLY. Each `verify-*.mjs` script owns its own assertions; this
 * module owns the plumbing every script needs:
 *
 *   - authenticated Sanity client (admin token from the Sanity CLI store)
 *   - the pass/fail result collector
 *   - signed webhook firing, so the cache-revalidation chain is exercised
 *   - draft-mode enable / preview cookie handling
 *   - entity-safe HTML matching and CDN-tolerant polling
 *   - draft creation, so "the public site does not see it" is a real assertion
 *
 * Extract this rather than copy it: three pages will need it, and a single fix
 * (the stega character class, the entity decoder) then applies everywhere.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {createClient} from '@sanity/client'
import stega from '@vercel/stega'
import {encodeSignatureHeader} from '@sanity/webhook'

export const {vercelStegaDecode: decodeStega} = stega

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/**
 * Invisible characters Sanity uses to encode a field's source.
 *
 * Written as escapes on purpose: the literal characters are easy to corrupt when
 * a file is written, and a corrupted class silently degrades into matching
 * something common like a hyphen — which turns every stega assertion into a
 * false failure.
 */
export const STEGA = /[\u200B-\u200D\u2060\uFEFF]/

export function readEnv() {
  const file = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(file)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
      .map((line) => {
        const i = line.indexOf('=')
        return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, '')]
      }),
  )
}

export const env = readEnv()

/** Write access is needed to create temporary drafts and preview secrets. */
function adminToken() {
  return JSON.parse(
    fs.readFileSync(path.join(os.homedir(), '.config', 'sanity', 'config.json'), 'utf8'),
  ).authToken
}

export const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'd04rgvdr',
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-25',
  token: adminToken(),
  // Never read through the CDN here: a stale CDN response would mask a regression.
  useCdn: false,
})

/* -------------------------------------------------------------------------- */
/* Results                                                                    */
/* -------------------------------------------------------------------------- */

const results = []

export function check(name, ok, detail = '') {
  results.push({name, ok})
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

export function report() {
  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
  process.exit(failed.length ? 1 : 0)
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* -------------------------------------------------------------------------- */
/* Cache revalidation                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Posts a signed Sanity webhook payload to `/api/revalidate`, exactly as Sanity
 * would in production, then waits for the published read to settle.
 */
export async function fireWebhook(documentId) {
  const secret = env.SANITY_REVALIDATE_SECRET
  if (!secret) return
  const body = JSON.stringify({
    _id: documentId,
    _type: 'page',
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
  // The Sanity CDN also serves published reads, so give it a moment.
  await sleep(2500)
}

/* -------------------------------------------------------------------------- */
/* Draft mode                                                                 */
/* -------------------------------------------------------------------------- */

const jar = new Map()
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ')

function storeCookies(res) {
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const [pair] = raw.split(';')
    const i = pair.indexOf('=')
    jar.set(pair.slice(0, i), pair.slice(i + 1))
  }
}

/** Signs a preview secret, calls the draft-mode route, and keeps the cookies. */
export async function enableDraftMode(pathname) {
  const secret = `verify-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6)}`
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
      `&sanity-preview-pathname=${encodeURIComponent(pathname)}` +
      `&sanity-preview-perspective=drafts`,
    {redirect: 'manual'},
  )
  storeCookies(res)

  return {res, cookieHeader, cleanup: () => client.delete(secretId)}
}

/* -------------------------------------------------------------------------- */
/* Fetching and matching                                                      */
/* -------------------------------------------------------------------------- */

export const pageHtml = (pathname, opts) =>
  fetch(`${SITE}${pathname}`, opts).then((r) => r.text())

/**
 * Decodes the HTML entities React escapes, so a CMS string can be compared with
 * the rendered markup. Without this, content containing `&`, `<`, `>` or a quote
 * looks "missing" when it has in fact rendered correctly.
 */
export const decodeEntities = (html) =>
  html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")

/** `html.includes(text)`, but entity-safe. */
export const has = (html, text) => decodeEntities(html).includes(text)

/**
 * Polls the page until `predicate(html)` holds.
 *
 * Published content is read through the eventually-consistent Sanity CDN, so a
 * publish can take several seconds to reach the rendered page. Polling turns that
 * timing into a deterministic result rather than a flaky single check, while still
 * failing loudly if the change never arrives.
 */
export async function waitForPage(
  pathname,
  predicate,
  {timeout = 45000, interval = 2000, headers} = {},
) {
  const deadline = Date.now() + timeout
  let html = ''
  for (;;) {
    html = await pageHtml(pathname, headers ? {headers} : {}).catch(() => '')
    if (predicate(html)) return {ok: true, html}
    if (Date.now() >= deadline) return {ok: false, html}
    await sleep(interval)
  }
}

/** Polls until every string in `expected` is present. */
export async function waitForAll(pathname, expected, opts) {
  return waitForPage(pathname, (html) => expected.every((text) => has(html, text)), opts)
}

/* -------------------------------------------------------------------------- */
/* Drafts                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Creates a real draft from a published document by writing the same content to
 * the `drafts.`-prefixed id, and returns the draft id.
 *
 * A note that has bitten us before: `client.patch(id).commit()` writes to the
 * **published** document. Draft tests must target `drafts.<id>` explicitly,
 * otherwise "the public site does not see it" is not actually being tested.
 */
export async function createDraftFrom(doc) {
  const draftId = `drafts.${doc._id}`
  const draft = {...doc, _id: draftId}
  delete draft._rev
  await client.createOrReplace(draft)
  return draftId
}

/** Removes every `drafts.` document the run created. */
export async function removeDrafts(ids) {
  for (const id of ids) await client.delete(`drafts.${id}`).catch(() => {})
}

/* -------------------------------------------------------------------------- */
/* DOM inspection                                                             */
/* -------------------------------------------------------------------------- */

/** Finds the `<img>` whose data-sanity points at a given document. */
export function findImage(html, docId) {
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
export function findButtonHref(html, labelFragment) {
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    if (m[2].includes(labelFragment)) return m[1]
  }
  return null
}

/* -------------------------------------------------------------------------- */
/* Click-to-edit decoding                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Decodes every stega string in the preview into `documentId|fieldPath` keys.
 * Only strings that actually decode to a Sanity source are counted, so the
 * totals reflect real click-to-edit targets.
 */
export function collectStegaPaths(html) {
  const textNodes = [...html.matchAll(/>([^<>]*[\u200B-\u200D\u2060\uFEFF][^<>]*)</g)].map((m) => m[1])
  const paths = new Map()

  for (const node of textNodes) {
    const href = decodeStega(node)?.href
    if (!href) continue
    const decoded = decodeURIComponent(href)
    const id = /[?&]id=([^&]+)/.exec(decoded)?.[1]
    const field = /[?&]path=([^&]+)/.exec(decoded)?.[1]
    if (id && field) paths.set(`${id}|${field}`, (paths.get(`${id}|${field}`) ?? 0) + 1)
  }

  return {textNodes, paths}
}

/** Groups the `data-sanity` attributes on the page by document type. */
export function countDataSanityByType(html) {
  const byType = {}
  for (const m of html.matchAll(/data-sanity="([^"]+)"/g)) {
    const type = /type=([^;&]+)/.exec(m[1])?.[1] ?? '?'
    byType[type] = (byType[type] ?? 0) + 1
  }
  return byType
}

/** Confirms stega never leaked into an `href`, a `class` or `<title>`. */
export function noStegaLeak(html) {
  return (
    ![...html.matchAll(/href="([^"]*)"/g)].some((m) => STEGA.test(m[1])) &&
    ![...html.matchAll(/class="([^"]*)"/g)].some((m) => STEGA.test(m[1])) &&
    !/<title>[^<]*[\u200B-\u200D\u2060\uFEFF]/.test(html)
  )
}
