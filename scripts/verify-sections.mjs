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

const original = await client.getDocument('homePage')

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
  await new Promise((r) => setTimeout(r, 1200))

  const hidden = await page()
  check(
    'hiding a section removes it from the page',
    !hidden.includes('Dedicated to Excellence') && !hidden.includes('Parent Satisfaction'),
  )
  check(
    'the rest of the page is unaffected',
    hidden.includes('Why Parents Choose Jahan International Dream School'),
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
  await new Promise((r) => setTimeout(r, 1200))

  const html = await page()
  const statsAt = html.indexOf('Dedicated to Excellence')
  const heroAt = html.indexOf('Empowering Young Minds For Global Excellence')
  check(
    'reordering sections changes the rendered order',
    statsAt > -1 && heroAt > -1 && statsAt < heroAt,
    `stats at ${statsAt}, hero at ${heroAt}`,
  )

  /* 5. restore ------------------------------------------------------------ */
  await client.createOrReplace(original)
  await fireWebhook(original)
  await new Promise((r) => setTimeout(r, 1200))

  const restored = await page()
  // "Estd: 2021" also appears in the header, so compare against a stat label that
  // only exists inside the stats bar.
  check(
    'restoring the document restores the original order',
    restored.indexOf('Empowering Young Minds For Global Excellence') <
      restored.indexOf('Dedicated to Excellence'),
  )
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
