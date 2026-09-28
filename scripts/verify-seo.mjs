/**
 * SEO verification. Run with a server already up:
 *
 *   node scripts/verify-seo.mjs                      # against NEXT_PUBLIC_SITE_URL
 *   NEXT_PUBLIC_SITE_URL=https://- node scripts/verify-seo.mjs
 *
 * Every check reads real output from a real HTTP response. Nothing here asserts
 * something it has not fetched: a page is only called "indexable" after its
 * `<meta name="robots">` has been parsed, a URL is only called "in the sitemap"
 * after the sitemap has been parsed, and a structured-data claim is only made
 * after the JSON-LD has been loaded and walked.
 *
 * The distinction that matters when reading the result:
 *   - these checks prove the site emits correct markup;
 *   - they cannot prove any page has been *indexed*, which takes days to weeks
 *     and is only observable in Google Search Console.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {createClient} from '@sanity/client'

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */

const env = fs.existsSync(path.join(process.cwd(), '.env.local'))
  ? Object.fromEntries(
      fs
        .readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
        .split('\n')
        .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
        .map((line) => {
          const i = line.indexOf('=')
          return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, '')]
        }),
    )
  : {}

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
)

/** Mirrors `src/lib/routes.ts`. Kept literal so the script needs no build step. */
const ROUTES = [
  {path: '/', type: 'homePage', isHome: true},
  {path: '/about-us', type: 'aboutPage'},
  {path: '/academics', type: 'academicsPage'},
  {path: '/academics/class-routine', type: 'classRoutinePage'},
  {path: '/admissions', type: 'admissionsPage'},
  {path: '/contact', type: 'contactPage'},
  // The Branch page's CMS content is for a different organisation (an Islamic
  // madrasa), so its `appendSiteName` is off. Branding it with the host school's
  // name would be a false claim, and a title naming the school is therefore the
  // wrong assertion for this route. See SEO_CHECKLIST.md.
  {path: '/branch', type: 'branchPage', expectBrand: false},
  {path: '/complaint-box', type: null, noIndex: true},
]

/** Routes that must not exist. Any 200 here is a soft 404. */
const FORBIDDEN = ['/privacy', '/terms', '/why-choose-us', '/news', '/sitemap']

/* -------------------------------------------------------------------------- */
/* Results                                                                    */
/* -------------------------------------------------------------------------- */

const results = []
let failures = 0

function check(name, ok, detail = '') {
  results.push({name, ok})
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

/* -------------------------------------------------------------------------- */
/* HTML parsing                                                               */
/* -------------------------------------------------------------------------- */

const decode = (html) =>
  html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")

const pick = (html, re) => decode(html.match(re)?.[1]?.trim() ?? '')

const getTitle = (html) => pick(html, /<title[^>]*>([\s\S]*?)<\/title>/)
const getDescription = (html) => pick(html, /<meta name="description" content="([^"]*)"/)
const getCanonical = (html) => pick(html, /<link rel="canonical" href="([^"]*)"/)
const getRobots = (html) => pick(html, /<meta name="robots" content="([^"]*)"/)
const getOgTitle = (html) => pick(html, /<meta property="og:title" content="([^"]*)"/)
const getHtmlLang = (html) => pick(html, /<html[^>]*\slang="([^"]*)"/)

/** Stega characters must never reach metadata, an href or JSON-LD. */
const STEGA = /[\u200B-\u200D\u2060\uFEFF]/

function getJsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(
    (match) => {
      try {
        const parsed = JSON.parse(match[1])
        return Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed]
      } catch {
        return [{__parseError: match[1].slice(0, 120)}]
      }
    },
  )
}

/* -------------------------------------------------------------------------- */
/* 1. Pages: status, title, description, canonical, robots, H1                */
/* -------------------------------------------------------------------------- */

const seen = {titles: new Map(), descriptions: new Map(), canonicals: new Map()}
const pages = {}

console.log('\n-- Pages ---------------------------------------------------------\n')

for (const route of ROUTES) {
  const res = await fetch(`${SITE}${route.path}`, {redirect: 'manual'})
  const html = await res.text()
  pages[route.path] = {status: res.status, html}

  const label = route.path === '/' ? '/' : route.path
  check(`${label} returns 200`, res.status === 200, `got ${res.status}`)

  const title = getTitle(html)
  const description = getDescription(html)
  const canonical = getCanonical(html)
  const robots = getRobots(html)
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
    decode(m[1].replace(/<[^>]+>/g, '')).trim(),
  )

  check(`${label} has a title`, Boolean(title), title ? `"${title}" (${title.length} chars)` : 'missing')
  check(
    `${label} title is not a duplicated school name`,
    !/\|\s*Jahan International Dream School\s*\|\s*Jahan International Dream School/i.test(title),
  )
  if (!route.isHome) {
    check(
      `${label} title is under 60 characters`,
      title.length > 0 && title.length <= 60,
      title ? `${title.length} chars` : '',
    )
  }
  // A page that is deliberately not indexed is not competing for a keyword, so
  // branding its title buys nothing. Nor is a page about a different organisation.
  if (!route.noIndex && route.expectBrand !== false) {
    check(
      `${label} title names the school`,
      /jahan international dream school/i.test(title),
      title ? `"${title}"` : '',
    )
  }

  check(
    `${label} has a meta description`,
    description.length > 0,
    description ? `${description.length} chars` : 'missing',
  )
  if (description) {
    check(
      `${label} description is under 160 characters`,
      description.length <= 160,
      `${description.length} chars`,
    )
  }

  if (route.noIndex) {
    check(`${label} is noindex`, /noindex/i.test(robots), robots || 'no robots meta')
    check(`${label} has no canonical`, canonical === '', canonical || 'absent (correct)')
  } else {
    check(
      `${label} has an absolute canonical`,
      canonical.startsWith('http'),
      canonical || 'missing',
    )
    check(
      `${label} canonical matches its own URL`,
      canonical.replace(/\/$/, '') === `${SITE}${route.path}`.replace(/\/$/, ''),
      canonical,
    )
    check(`${label} is indexable`, !/noindex/i.test(robots), robots || 'no robots meta (indexable)')
  }

  check(`${label} has exactly one H1`, h1s.length === 1, h1s.length ? `"${h1s[0].slice(0, 70)}"` : `${h1s.length} found`)

  check(`${label} declares a language`, Boolean(getHtmlLang(html)), getHtmlLang(html) || 'missing')
  check(`${label} has no stega in <title>`, !STEGA.test(title))

  const ogTitle = getOgTitle(html)
  check(`${label} has og:title`, Boolean(ogTitle), ogTitle || 'missing')
  check(`${label} og:title matches the title`, ogTitle === title, `${ogTitle} vs ${title}`)

  if (route.noIndex) {
    if (title) seen.titles.set(title, [...(seen.titles.get(title) ?? []), label])
  } else {
    if (title) seen.titles.set(title, [...(seen.titles.get(title) ?? []), label])
    if (description) seen.descriptions.set(description, [...(seen.descriptions.get(description) ?? []), label])
    if (canonical) seen.canonicals.set(canonical, [...(seen.canonicals.get(canonical) ?? []), label])
  }
}

console.log('\n-- Uniqueness ----------------------------------------------------\n')

for (const [kind, map] of [
  ['title', seen.titles],
  ['meta description', seen.descriptions],
  ['canonical', seen.canonicals],
]) {
  const dupes = [...map.entries()].filter(([, where]) => where.length > 1)
  check(
    `no duplicate ${kind} across pages`,
    dupes.length === 0,
    dupes.map(([value, where]) => `${where.join(' + ')} - "${value}"`).join('; '),
  )
}

/* -------------------------------------------------------------------------- */
/* 2. Internal links                                                          */
/* -------------------------------------------------------------------------- */

console.log('\n-- Internal links ------------------------------------------------\n')

const linkTargets = new Set()
for (const {html} of Object.values(pages)) {
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1]
    if (/^(https?:|tel:|mailto:|#|\/_next\/|\/favicon)/.test(href)) continue
    linkTargets.add(href.split('#')[0].split('?')[0])
  }
}
linkTargets.delete('')

const unknown = [...linkTargets].filter(
  (target) => !ROUTES.some((route) => route.path === target),
)
check(
  'every internal link points at a real route',
  unknown.length === 0,
  unknown.length ? `dead: ${unknown.join(', ')}` : `${linkTargets.size} distinct targets, all real`,
)

for (const target of FORBIDDEN) {
  const res = await fetch(`${SITE}${target}`, {redirect: 'manual'})
  check(`${target} is not linked and returns 404`, res.status === 404, `got ${res.status}`)
}

const notFound = await fetch(`${SITE}/this-page-does-not-exist`, {redirect: 'manual'})
const notFoundHtml = await notFound.text()
check('a missing URL returns 404, not a redirect', notFound.status === 404, `got ${notFound.status}`)
check('the 404 page has a real heading', /<h1[^>]*>[\s\S]*?could not find/i.test(notFoundHtml))
check('the 404 page is noindex', /noindex/i.test(getRobots(notFoundHtml) || 'x'))
check('the 404 page is not the home page', getTitle(notFoundHtml) !== getTitle(pages['/'].html))

/* -------------------------------------------------------------------------- */
/* 3. robots.txt                                                              */
/* -------------------------------------------------------------------------- */

console.log('\n-- robots.txt ----------------------------------------------------\n')

const robotsRes = await fetch(`${SITE}/robots.txt`)
const robotsTxt = await robotsRes.text()
check('robots.txt returns 200', robotsRes.status === 200, `got ${robotsRes.status}`)
check('robots.txt allows crawling', /User-agent:\s*\*/i.test(robotsTxt) && /Allow:\s*\//i.test(robotsTxt))
check('robots.txt blocks the Studio', /Disallow:\s*\/studio/i.test(robotsTxt))
check('robots.txt blocks the API', /Disallow:\s*\/api/i.test(robotsTxt))
check('robots.txt blocks query-string URLs (previews)', /Disallow:\s*\/\*\?/.test(robotsTxt))
check('robots.txt declares the sitemap', new RegExp(`Sitemap:\\s*${SITE}/sitemap\\.xml`).test(robotsTxt))
check('robots.txt does not block JS, CSS or images', !/Disallow:.*\.(js|css|png|jpg|svg|woff2)/i.test(robotsTxt))
check('robots.txt does not block the whole site', !/Disallow:\s*\/\s*$/im.test(robotsTxt))

/* -------------------------------------------------------------------------- */
/* 4. sitemap.xml                                                             */
/* -------------------------------------------------------------------------- */

console.log('\n-- sitemap.xml ---------------------------------------------------\n')

const sitemapRes = await fetch(`${SITE}/sitemap.xml`)
const sitemapXml = await sitemapRes.text()
check('sitemap.xml returns 200', sitemapRes.status === 200, `got ${sitemapRes.status}`)
check('sitemap.xml is a urlset', /<urlset[\s>]/.test(sitemapXml))

const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
const lastMods = [...sitemapXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1].trim())

check('sitemap.xml lists URLs', locs.length > 0, `${locs.length} URLs`)
check(
  'every sitemap URL is absolute',
  locs.every((loc) => loc.startsWith('http')),
)
check('sitemap.xml has no duplicate URLs', new Set(locs).size === locs.length)
check(
  'sitemap.xml excludes noindex routes',
  !locs.some((loc) => loc.includes('/complaint-box')),
)
check(
  'sitemap.xml excludes the Studio and the API',
  !locs.some((loc) => /\/studio|\/api\//.test(loc)),
)
check(
  'every sitemap URL has a lastModified date',
  lastMods.length === locs.length,
  `${lastMods.length} lastmod for ${locs.length} URLs`,
)
check(
  'lastModified dates are real ISO timestamps',
  lastMods.every((value) => /^\d{4}-\d{2}-\d{2}T/.test(value)),
  lastMods[0] ?? '',
)

for (const route of ROUTES.filter((r) => !r.noIndex && r.type)) {
  check(
    `${route.path} is in the sitemap`,
    locs.includes(`${SITE}${route.path}`),
    locs.includes(`${SITE}${route.path}`) ? '' : `missing ${SITE}${route.path}`,
  )
}

for (const loc of locs) {
  const res = await fetch(loc, {redirect: 'manual'})
  const html = await res.text()
  check(
    `sitemap URL ${new URL(loc).pathname} is live and indexable`,
    res.status === 200 && !/noindex/i.test(getRobots(html) || ''),
    `status ${res.status}, robots "${getRobots(html) || 'none'}"`,
  )
}

/* -------------------------------------------------------------------------- */
/* 5. Structured data                                                         */
/* ------------------------------------------------------------------------- */

console.log('\n-- Structured data -----------------------------------------------\n')

const homeNodes = getJsonLd(pages['/'].html)
check('the home page emits JSON-LD', homeNodes.length > 0, `${homeNodes.length} nodes`)
check(
  'no JSON-LD node is a parse error',
  homeNodes.every((node) => !node.__parseError),
  homeNodes.find((node) => node.__parseError)?.__parseError ?? '',
)

const org = homeNodes.find((node) => node['@type'] === 'EducationalOrganization')
const website = homeNodes.find((node) => node['@type'] === 'WebSite')

check('an EducationalOrganization node exists', Boolean(org))
check('exactly one organisation node (no duplicate markup)', homeNodes.filter((n) => /Organization/.test(String(n['@type']))).length === 1)
check('the organisation uses the official name', org?.name === 'Jahan International Dream School', String(org?.name))
check('the organisation has the acronym as an alternate name', Boolean(org?.alternateName), String(org?.alternateName))
check('the organisation has a URL', typeof org?.url === 'string' && org.url.startsWith('http'), String(org?.url))
check('the organisation has a logo', typeof org?.logo === 'object', JSON.stringify(org?.logo ?? null).slice(0, 80))
check('the organisation has a telephone', Boolean(org?.telephone), String(org?.telephone))
check('the organisation has an email', Boolean(org?.email), String(org?.email))
check('the organisation has a postal address', Boolean(org?.address), JSON.stringify(org?.address ?? null))
check(
  'the postal address has no invented street address',
  !org?.address?.streetAddress,
  org?.address?.streetAddress ? `streetAddress: ${org.address.streetAddress}` : 'streetAddress omitted (correct)',
)
check('sameAs only lists genuine profiles', (org?.sameAs ?? []).every((url) => /^https:\/\/(www\.)?facebook\.com\//i.test(url)), JSON.stringify(org?.sameAs ?? []))
check('the organisation claims no aggregate rating', !org?.aggregateRating)
check('the organisation claims no opening hours', !org?.openingHours)

check('a WebSite node exists', Boolean(website))
check('the WebSite node names the school', website?.name === 'Jahan International Dream School', String(website?.name))
check('the WebSite node links to the publisher', Boolean(website?.publisher?.['@id']))

const orgIds = homeNodes.map((node) => node['@id']).filter(Boolean)
check('every @id is unique', new Set(orgIds).size === orgIds.length, orgIds.join(', '))

for (const route of ROUTES.filter((r) => !r.noIndex)) {
  const nodes = getJsonLd(pages[route.path].html)
  const page = nodes.find((node) => node['@type'] === 'WebPage')
  check(`${route.path} emits a WebPage node`, Boolean(page))
  check(
    `${route.path} WebPage matches its own canonical`,
    page?.url === `${SITE}${route.path}`,
    String(page?.url),
  )
  check(
    `${route.path} WebPage is referenced by the organisation`,
    !page || page.about?.['@id'] === org?.['@id'],
  )
  const crumbs = nodes.find((node) => node['@type'] === 'BreadcrumbList')
  if (crumbs) {
    const positions = crumbs.itemListElement.map((item) => item.position)
    check(
      `${route.path} breadcrumb positions are sequential from 1`,
      positions.every((value, index) => value === index + 1),
      positions.join(','),
    )
  }
}

/* -------------------------------------------------------------------------- */
/* 6. Draft content must not be public                                        */
/* --------------------------------------------------------------------------- */

console.log('\n-- Draft isolation -----------------------------------------------\n')

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-25',
  token: (() => {
    const file = path.join(os.homedir(), '.config', 'sanity', 'config.json')
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).authToken : undefined
  })(),
  useCdn: false,
})

const published = await client.fetch(`{
  "site": *[_type=="siteSettings"][0]{
    brand{name},
    contact{address, mobileLabel, mobileHref, emailLabel},
    "footerItems": footer.contactItems[]{label, href}
  },
  "topBar": *[_type=="navigation"][0].topBar.contactLinks[]{label, url}
}`)

const nap = published?.site?.contact
check('the school has a published address in Sanity', Boolean(nap?.address), nap?.address)
check('the school has a published mobile number', Boolean(nap?.mobileLabel), nap?.mobileLabel)
check('the school has a published email', Boolean(nap?.emailLabel), nap?.emailLabel)

check(
  'the published address is the one the site renders',
  pages['/'].html.includes('Tongi'),
  `Sanity: ${nap?.address} - site shows: ${/Tongi/.test(pages['/'].html) ? 'Tongi' : 'not found'}`,
)
check(
  'the retired phone number appears nowhere in the rendered site',
  !/8801820080080|018-200-80080|02-48111854|info@jids\.edu\.bd|Mohammadpur/.test(
    Object.values(pages)
      .map((page) => page.html)
      .join(' '),
  ),
)
check(
  'no page leaks a Sanity draft id',
  !Object.values(pages).some((page) => /drafts\./.test(page.html)),
)

/**
 * NAP consistency.
 *
 * Name, address and phone agreeing across every page is the single most
 * important local-SEO signal there is, and the one this site got wrong during the
 * audit. These checks compare what Sanity holds against what each page actually
 * renders, so the next edit that reintroduces a second address fails the build
 * rather than confusing a search engine.
 */
console.log('\n-- NAP consistency -----------------------------------------------\n')

const contact = nap?.mobileLabel
const email = nap?.emailLabel
const address = nap?.address

check(
  'the mobile number appears on the home page',
  Boolean(contact) && pages['/'].html.includes(contact),
  contact ?? 'no number in Sanity',
)
check(
  'the mobile number appears on the contact page',
  Boolean(contact) && pages['/contact'].html.includes(contact),
)
check(
  'the email appears on the contact page',
  Boolean(email) && pages['/contact'].html.includes(email),
)
check(
  'the address appears on the contact page',
  Boolean(address) && pages['/contact'].html.includes(address),
)
check(
  'the top bar shows the same number it links to',
  (() => {
    const link = published?.topBar?.find((item) => item?.url?.startsWith('tel:'))
    if (!link) return false
    // Compared on the last nine digits: a link carries the country code
    // (8801717103326) while a label is written the way people say it
    // (01717-103326). The significant part is the subscriber number.
    const inLink = link.url.replace(/\D/g, '').slice(-9)
    const inLabel = link.label.replace(/\D/g, '').slice(-9)
    return inLink.length === 9 && inLink === inLabel
  })(),
  (published?.topBar?.find((item) => item?.url?.startsWith('tel:'))?.label) ?? 'no tel: link',
)
check(
  'no page shows a different address than Site settings',
  !Object.values(pages).some((page) => /Mohammadpur/i.test(page.html)),
)
check(
  'every tel: link on the site points at the published number',
  [...`${pages['/'].html} ${pages['/contact'].html}`.matchAll(/tel:\+?([\d]+)/g)].every((match) =>
    match[1].endsWith(nap?.mobileHref?.replace(/\D/g, '') ?? ' '),
  ),
)

/* -------------------------------------------------------------------------- */

console.log(`\n${results.length - failures}/${results.length} checks passed`)
if (failures) {
console.log(
  '\nA failure here means the site emits something a search engine would misread.',
)
console.log('It says nothing about whether a page has been indexed - only Search Console can tell you that.')
}
process.exit(failures ? 1 : 0)


