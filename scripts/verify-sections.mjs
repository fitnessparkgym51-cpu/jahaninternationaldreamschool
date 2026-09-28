/**
 * Confirms the revalidation webhook route works, and that structural edits made
 * in Sanity reach the site.
 *
 * DEVELOPMENT ONLY:
 *   node scripts/verify-sections.mjs
 *
 * A publish in Sanity is normally picked up by a webhook calling
 * `/api/revalidate`. This script signs and posts that same payload so the whole
 * chain is exercised locally.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {createClient} from '@sanity/client'
import {encodeSignatureHeader} from '@sanity/webhook'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function readEnv() {
  const file = path.join(process.cwd(), '.env.local')
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

const env = readEnv()
const revalidateSecret = env.SANITY_REVALIDATE_SECRET

const adminToken = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), '.config', 'sanity', 'config.json'), 'utf8'),
).authToken

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'd04rgvdr',
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-09-25',
  token: adminToken,
  useCdn: false,
})

const results = []
const check = (name, ok, detail = '') => {
  results.push({name, ok})
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

/** Posts a signed webhook payload, exactly as Sanity would. */
async function fireWebhook(document) {
  const payload = JSON.stringify({
    _id: document._id,
    _type: document._type,
    _createdAt: document._createdAt ?? new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: document._rev ?? 'test',
  })
  // Sanity signs `${timestamp}.${body}` with HMAC-SHA256 and the shared secret.
  const signature = await encodeSignatureHeader(payload, Date.now(), revalidateSecret)

  const res = await fetch(`${SITE}/api/revalidate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'sanity-webhook-signature': signature,
    },
    body: payload,
  })
  return res
}

const page = () => fetch(SITE).then((r) => r.text())

/**
 * Polls the page until `predicate(html)` holds.
 *
 * A publish is read through the Sanity CDN, which is eventually consistent: the
 * webhook invalidates the cache, but the next read can still be served from a
 * cold edge for a few seconds. A fixed `sleep` therefore turns a real pass into a
 * coin flip. Polling makes the result deterministic, and still fails loudly if the
 * change never arrives.
 */
const waitForPage = async (predicate, {timeout = 45000, interval = 1500} = {}) => {
  const deadline = Date.now() + timeout
  let html = ''
  for (;;) {
    html = await page().catch(() => '')
    if (predicate(html)) return {ok: true, html}
    if (Date.now() >= deadline) return {ok: false, html}
    await new Promise((r) => setTimeout(r, interval))
  }
}

const original = await client.getDocument('homePage')

/**
 * Every string this script looks for is read out of the document it is testing,
 * never hardcoded.
 *
 * A test that hardcodes copy is a test that breaks the day an editor writes new
 * copy — and then it looks like the website is broken when nothing is wrong. The
 * school owns these words; the test follows them.
 */
/**
 * Every string this script looks for is read out of the document it is testing,
 * never hardcoded.
 *
 * A test that hardcodes copy breaks the day an editor writes new copy, and then it
 * looks like the website is broken when nothing is wrong. The school owns these
 * words; the test follows them.
 *
 * The markers must also be *unique* to their section, because the site header
 * repeats the school name and the "Estd" line. A marker that also appears in the
 * chrome will always be found at the top of the document, and an ordering
 * assertion built on it silently passes or fails for the wrong reason — that is
 * exactly what happened when the hero heading became the school name. So each
 * marker is verified unique below, and the test says so out loud if it is not.
 */
const textOf = (section) => section?.heading ?? section?.header?.heading ?? ''
const sectionByKey = (key) => original.sections.find((s) => s._key === key)

/** All the editable text of one section, flattened, for the uniqueness check. */
const sectionText = (section) => JSON.stringify(section ?? {})

/**
 * Every string leaf in a section, skipping Sanity's bookkeeping keys.
 *
 * `_key` and `_type` are not copy. They are skipped, because a marker like
 * "hero" appears in the markup only inside `data-sanity` attributes — the test
 * would still pass, but it would be asserting on a technical string rather than
 * on the section's actual text, which is meaningless.
 */
const stringLeaves = (value, key, out = []) => {
  if (typeof value === 'string') {
    if (value.trim() && !key.startsWith('_')) out.push(value.trim())
  } else if (Array.isArray(value)) {
    for (const item of value) stringLeaves(item, key, out)
  } else if (value && typeof value === 'object') {
    for (const [childKey, item] of Object.entries(value)) stringLeaves(item, childKey, out)
  }
  return out
}

/**
 * Picks a marker that appears in this section and in no other.
 *
 * Searched across every string the section owns — heading, description, eyebrow,
 * a stat label, a card title — so it works whatever shape the section has. The
 * section's heading is preferred when it is unique, because that is the most
 * meaningful thing to assert on.
 */
const uniqueMarker = (key) => {
  const section = sectionByKey(key)
  if (!section) return ''
  const others = original.sections.filter((s) => s._key !== key).map(sectionText).join(' ')

  const firstLines = [
    ...new Set(stringLeaves(section, '').map((value) => value.split('\n')[0].trim())),
  ].filter(Boolean)
  const heading = textOf(section).split('\n')[0].trim()
  const ordered = heading && firstLines.includes(heading) ? [heading, ...firstLines] : firstLines

  return ordered.find((value) => !others.includes(value)) ?? ''
}

const heroText = uniqueMarker('hero')
const statsText = uniqueMarker('stats')
const featuresText = uniqueMarker('features')

// A missing or shared marker would make the assertions below meaningless, so it
// is checked once, loudly, before anything relies on it.
check(
  'each section has a marker unique to that section',
  Boolean(heroText && statsText && featuresText),
  `hero "${heroText}", stats "${statsText}", features "${featuresText}"`,
)

try {
  /* 1. the webhook route rejects an unsigned request ---------------------- */
  const unsigned = await fetch(`${SITE}/api/revalidate`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({_id: 'homePage', _type: 'homePage'}),
  })
  check('revalidate route rejects unsigned requests', unsigned.status === 401, `status ${unsigned.status}`)

  /* 2. it accepts a correctly signed one --------------------------------- */
  const signed = await fireWebhook(original)
  check('revalidate route accepts a signed request', signed.ok, `status ${signed.status}`)

  /* 3. hiding a section -------------------------------------------------- */
  await client.patch('homePage').set({'sections[_key == "stats"].enabled': false}).commit()
  const changed = await client.getDocument('homePage')
  await fireWebhook(changed)

  const hiddenResult = await waitForPage((html) => !html.includes(statsText))
  const hidden = hiddenResult.html
  check(
    'hiding a section removes it from the page',
    hiddenResult.ok,
    `"${statsText}" is gone`,
  )
  check(
    'the rest of the page is unaffected',
    hidden.includes(featuresText),
    `"${featuresText}" still present`,
  )

  /* 4. reordering sections ----------------------------------------------- */
  await client.createOrReplace(original)
  const before = original.sections.map((s) => s._key)
  const swapped = [before[1], before[0], ...before.slice(2)]
  await client
    .patch('homePage')
    .set({
      sections: swapped.map((key) => original.sections.find((s) => s._key === key)),
    })
    .commit()
  const reordered = await client.getDocument('homePage')
  await fireWebhook(reordered)

  // The stats bar was swapped ahead of the hero, so its text must now come first.
  const swap = await waitForPage((html) => {
    const s = html.indexOf(statsText)
    const h = html.indexOf(heroText)
    return s > -1 && h > -1 && s < h
  })
  const statsAt = swap.html.indexOf(statsText)
  const heroAt = swap.html.indexOf(heroText)
  check(
    'reordering sections changes the rendered order',
    swap.ok,
    `stats at ${statsAt}, hero at ${heroAt}`,
  )

  /* 5. restore ------------------------------------------------------------ */
  await client.createOrReplace(original)
  await fireWebhook(original)

  const back = await waitForPage((html) => {
    const h = html.indexOf(heroText)
    const s = html.indexOf(statsText)
    return h > -1 && s > -1 && h < s
  })
  const restored = back.html
  // Compare against the stats bar's own text, not a string that also appears in
  // the site header, so the assertion cannot pass on the wrong element.
  check('restoring the document restores the original order', back.ok)
  check(
    'all original section headings are intact',
    original.sections.every((section) => {
      const heading = section.heading ?? section.header?.heading
      return !heading || restored.includes(heading)
    }),
    `${original.sections.length} sections`,
  )
  const students = await client.fetch('count(*[_type == "studentSpotlight"])')
  const posts = await client.fetch('count(*[_type == "newsPost"])')
  check('reusable documents are unchanged', students === 4 && posts === 3, `${students} students, ${posts} news`)
} finally {
  await client.createOrReplace(original)
  await fireWebhook(original).catch(() => {})
  console.log('\nRestored the Home page document.')
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
