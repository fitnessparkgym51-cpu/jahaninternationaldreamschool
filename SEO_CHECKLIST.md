# SEO_CHECKLIST.md

How search-engine behaviour is implemented on this site, what was found in the
audit of 2026-09-27, and what still needs a human.

Read alongside `AGENTS.md` (the contract), `WEBSITE_SPEC.md` (page inventory) and
`SANITY_ARCHITECTURE.md` (the CMS).

**This document does not claim any ranking, and no one can.** Google does not
accept a request, guarantee a position, or confirm indexing on demand. What *is*
implemented and verified is that the site emits technically correct, internally
consistent, honest markup. Whether a page then appears in results is decided by
Google over days to weeks, and is only observable in Search Console.

---

## 1. The shape of the system

```
                          Sanity
                             │
        ┌────────────────────┴─────────────────────┐
        │                                          │
  siteSettings.seo                          <page>.seo
  (site-wide defaults)                    (per-page overrides)
        └────────────────────┬─────────────────────┘
                             │
                   pageSeoQuery  (GROQ, stega off)
                             │
                    buildPageMetadata()          src/lib/metadata.ts
                             │
              ┌──────────────┼───────────────┐
              ▼              ▼               ▼
        <title>       <link canonical>   openGraph / twitter
              └──────────────┼───────────────┘
                             ▼
                      Next.js metadata
```

One function builds the metadata for every public page. A page component contains
no title, no description and no canonical of its own — it declares which route it
is and nothing else.

| Concern | Where it lives |
|---|---|
| Route inventory, indexability | `src/lib/routes.ts` |
| Production origin | `src/lib/site.ts` |
| Title composition, metadata, draft protection | `src/lib/metadata.ts` |
| CMS SEO fields | `src/sanity/schemaTypes/objects/shared.ts` → `seoType` |
| Site-wide SEO defaults | `siteSettings.seo` (Studio › Site settings › SEO defaults) |
| Structured data | `src/components/seo/JsonLd.tsx` |
| `robots.txt` | `src/app/robots.ts` |
| `sitemap.xml` | `src/app/sitemap.ts` + `sitemapQuery` |
| 404 page | `src/app/not-found.tsx` |
| Image delivery | `src/lib/imageLoader.ts` + `next.config.ts` |
| Analytics | `src/components/analytics/GoogleAnalytics.tsx` |
| Automated checks | `scripts/verify-seo.mjs` |

---

## 2. Metadata inheritance

Values resolve **field by field**, page first, then site:

| Field | 1st choice | 2nd choice | 3rd choice |
|---|---|---|---|
| Title | `page.seo.metaTitle` | `siteSettings.seo.metaTitle` | the school name |
| Description | `page.seo.metaDescription` | `siteSettings.seo.metaDescription` | none |
| Share image | `page.seo.shareImage` | `siteSettings.seo.shareImage` | none |
| Canonical | `page.seo.canonicalUrl` | the page's own URL | — |
| `noindex` | `page.seo.noIndex` | `siteSettings.seo.noIndex` | indexable |
| Append school name | `page.seo.appendSiteName` | `siteSettings.seo.appendSiteName` | on |

A page that sets only a title still inherits the site-wide share image and
description. A page that sets nothing is still correct — that is the point.

### Title composition

`composeTitle()` appends `| Jahan International Dream School` **only when the
editor's own title does not already name the school**. Three cases, all real on
this site:

| Page | Editor's title | Result |
|---|---|---|
| Home | `Jahan International Dream School (J.I.D.S.) \| Estd: 2021` | unchanged — already names the school |
| About | `About Us & Our Teachers` | `About Us & Our Teachers \| Jahan International Dream School` |
| Branch | `Al Noor Madrasa: Quran & Islamic Education` | unchanged — `appendSiteName` is off |

The root layout therefore has **no `title.template`**. A template would append the
school name to every title, including the ones that already contain it — which is
exactly the duplication this design removes. Each page emits `title.absolute`.

Titles are emitted through `title.absolute`, and every string passes through
`stegaClean()`. Visual Editing payloads are invisible in a browser but are copied
verbatim into search results and social scrapes, so a leak would be silent and
permanent. `getPageSeo()` already fetches with stega disabled; `clean()` is the
backstop.

### Canonical URLs

- A page's canonical is **its own URL**, built from `NEXT_PUBLIC_SITE_URL`.
- `seo.canonicalUrl` is an override for genuinely duplicated content. Leave it
  empty. It is deliberately **not** inherited from Site settings: applying one
  site's canonical to every page tells a search engine they are all the same
  document. (The old code did inherit it. That was a latent bug; the field is now
  home-page-only as a fallback.)
- The 404 page and `/complaint-box` carry **no canonical at all**. Pointing a
  canonical at a page you have asked not to be indexed is a contradiction.

### Robots directives

| Page | Directive | Why |
|---|---|---|
| All public pages | indexable, no robots meta | defaults are correct |
| `/complaint-box` | `noindex, follow` | a thin form page; `follow` still lets a crawler reach the pages it links to |
| 404 | `noindex, follow` | a 404 must never be indexed |
| `/studio` | `noindex` (from `next-sanity/studio`) | the authoring environment |
| **Any page in Draft Mode** | `noindex, nofollow` | see below |

**Draft Mode protection is automatic.** `buildPageMetadata()` reads
`draftMode()` and forces `noindex` on every preview response, so a draft can never
be indexed even if someone shares the preview URL. Verified:

```
DRAFT PAGE
  robots        : noindex, nofollow
  title         : "Jahan International Dream School (J.I.D.S.) | Estd: 2021"   (no stega)
  overlays      : present
```

`robots.txt` and the meta robots tag must never contradict each other.
`verify-seo.mjs` checks that no sitemap URL is `noindex` and that no `noindex`
route appears in the sitemap.

---

## 3. robots.txt

Generated at build time by `src/app/robots.ts` from the deployment's own origin.

```
User-Agent: *
Allow: /
Disallow: /studio
Disallow: /studio/
Disallow: /api/
Disallow: /*?

Host: <origin>
Sitemap: <origin>/sitemap.xml
```

- `Allow: /` — every public page is crawlable. Nothing blocks JavaScript, CSS,
  fonts or images, so pages can render before they are indexed.
- `/studio` and `/api/` — the authoring environment and the form/webhook
  endpoints.
- `/*?` — any URL with a query string. Draft Mode and the Presentation Tool both
  work by adding a query parameter to a normal path, and a preview must not be
  indexed. The `Sitemap:` line is not a query string, so there is no conflict.

**What robots.txt cannot do**, and why the CMS switch matters more: it cannot
remove a URL that is already indexed, and it is not a substitute for `noindex`.
A page hidden with `Disallow` can still appear in results as a bare link. That is
why `seo.noIndex` exists in Sanity and why `/complaint-box` uses a meta tag.

---

## 4. sitemap.xml

Generated by `src/app/sitemap.ts`, regenerated at most once an hour, so a newly
published page appears without a redeploy.

- Only routes in `src/lib/routes.ts` are listed — a link in the footer can never
  put a 404 into the sitemap.
- `noIndex` routes are skipped, from either the registry or Sanity.
- Data is read through the plain Sanity client with stega off and drafts
  excluded by GROQ (`!(_id in path("drafts.**"))`). **Draft content cannot reach
  a public file, even if the request carries a Draft Mode cookie.**
- `lastModified` is the document's real `_updatedAt`. It is not a publication
  date and it is not invented.
- `changeFrequency` is omitted: it is a hint Google ignores, and there is no
  honest way to know how often a school edits a page.
- `priority` is included as a relative hint only (home 1.0, main sections 0.8,
  the rest 0.6). Google ignores it.

A route with no published document is left out — an empty page does not belong in
a sitemap.

---

## 5. Structured data

`src/components/seo/JsonLd.tsx`. Every node is generated from a document the
school has already published. **Nothing is asserted that the school has not
confirmed** — no ratings, no reviews, no prices, no opening hours, no
accreditation, no staff counts.

| Node | Where | Contents |
|---|---|---|
| `EducationalOrganization` | `(site)` layout — once per page | name, `alternateName` (J.I.D.S.), url, logo, image, description, `contactPoint`, telephone, email, `PostalAddress`, `sameAs` |
| `WebSite` | `(site)` layout — once per page | name, `alternateName`, url, `publisher` by `@id`, `inLanguage` |
| `WebPage` | each public page | name, description, url, `isPartOf` the WebSite, `about` the organisation, `primaryImageOfPage` |
| `BreadcrumbList` | `PageHeroSection`, only where a trail is visible | the same `crumbs` array the page renders |

Decisions worth knowing:

- **`EducationalOrganization`, not a separate `Organization`.** It is a subtype of
  `Organization`; one node covers both. Two nodes would be duplicate markup for the
  same entity, which is a manual-action risk, not a ranking trick.
- **The organisation is described once, in the layout**, and referenced by `@id`
  from every page. `@id` values are stable absolute URLs.
- **`PostalAddress` is authored as a structured block** (`siteSettings.postalAddress`),
  not parsed out of the free-text footer address. It currently carries
  `addressLocality: Tongi`, `addressRegion: Gazipur`, `addressCountry: BD` and
  **no `streetAddress`** — a wrong street address sends parents to the wrong
  gate, which is worse than publishing only the town.
- **`sameAs` lists only genuine profile pages** (currently the Facebook page). A
  WhatsApp click-to-chat link is a contact channel, not a profile, and is
  expressed as a `contactPoint` instead.
- **No `aggregateRating`.** The Contact page displays "4.7 / 140+" in its own CMS
  fields. That is *not* reproduced in structured data: a rating is a
  review-scheme rich result, and a claim that cannot be substantiated risks a
  manual action. See §10.
- **No `openingHours`.** The Contact page shows hours in free text
  ("Sunday-Thursday: 8:00am-3:00pm"). Publishing them as structured data means
  committing to them, including term-time variations. Fill them in only once the
  school has confirmed a schedule.
- **`Article` is not emitted.** There is no news article route — the news documents
  are cards on the home page. Add it when an article page exists.
- **`FAQPage` is not emitted.** The Admissions page has an FAQ accordion, but
  Google restricted FAQ rich results to authoritative government and health sites
  in 2023, and emitting markup that cannot produce a result is noise.
- `BreadcrumbList` is generated inside `PageHeroSection` from the same array it
  renders, so the markup and the visible trail cannot disagree.

---

## 6. Environment variables

| Variable | Required | Effect |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **yes, in production** | The production origin, no trailing slash. Drives `metadataBase`, every canonical URL, `robots.txt`, the sitemap and the structured data `@id`s. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no | GA4 measurement ID (`G-XXXXXXXXXX`). Unset ⇒ no analytics script, no globals, no request. |
| `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` | — | Automatic Vercel fallback so a deploy still emits absolute URLs. Not a substitute for setting the variable above. |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | yes | Studio origin for click-to-edit. Should equal `NEXT_PUBLIC_SITE_URL` in production. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` / `_API_VERSION` | yes | CMS connection. |

> **Deployment requirement.** `NEXT_PUBLIC_SITE_URL` is currently
> `http://localhost:3000`. Before launch it must be the real production origin —
> e.g. `https://www.jids.edu.bd`. Until it is, every canonical URL, the sitemap and
> the structured data point at localhost, and Search Console cannot verify the
> property. Nothing in the code invents a domain: `src/lib/site.ts` returns
> `undefined` rather than guessing, and degrades to relative URLs.

---

## 7. Images

All CMS images are served from the Sanity CDN through a custom `next/image` loader
(`src/lib/imageLoader.ts`). The CDN resizes, re-encodes and content-negotiates;
`next.config.ts` no longer sets `images.unoptimized`.

This was the single largest performance defect found. With `unoptimized`, every
image was served at one fixed width, so **a 390px phone downloaded the 1920px
hero**. Measured on the production build with mobile throttling, the hero is now
requested at `w=828` and the CDN returns **43.6 KB of AVIF** — the same request
without `auto=format` is 1.05 MB of PNG.

Each `SanityImage` call site declares a `sizes` attribute, which is what lets the
browser choose. `deviceSizes` is a deliberately short ladder
(`480 640 828 1080 1200 1600 1920`): every entry is written into every `srcset`,
so a long ladder bloats the HTML of a page with a dozen images.

Rules that hold:

- Informative images have editor-written alt text (`imageWithAlt.alt`, required by
  the schema). Decorative images get `alt=""`.
- Filenames and the asset library stay in Sanity; the loader never rewrites them.
- Do not replace a CMS image with a `/public` path. `public/` holds only
  framework assets.
- Sanity does not upscale, so requesting more than the source is wasted markup, not
  wasted bandwidth.

---

## 8. Performance — measured, not asserted

Lighthouse 12, **production build** (`next build && next start`), **simulated
mobile throttling**, localhost, 2026-09-27:

| Category | Score |
|---|---|
| **SEO** | **100** |
| Performance | 84 |
| Best practices | 96 |
| Accessibility | 86–91 (varies run to run) |

| Metric | Value | Verdict |
|---|---|---|
| First Contentful Paint | 1.2 s | good |
| Largest Contentful Paint | 4.5 s | **needs work** |
| Total Blocking Time | 0 ms | good |
| Cumulative Layout Shift | 0 | good |
| Speed Index | 1.6 s | good |

Conditions, stated plainly: this is a **simulated** run on localhost, not field
data. There is no CrUX or Search Console data because the site is not deployed.
Re-measure on the real domain before drawing conclusions.

**LCP is the remaining problem.** The LCP element is the hero image, correctly
preloaded and not lazy-loaded. What is left is server response time (~260 ms) plus
the initial JavaScript. Two quantified opportunities, both deliberately *not*
actioned here:

1. **~300 KB of the initial JS is the visual-editing runtime** (`@sanity/visual-editing`
   and its animation, state-machine, observable and validation dependencies). It
   arrives because `next-sanity/live` is used in production so the Presentation
   Tool works against the deployed site. Gating `<SanityLive />` and
   `<VisualEditing />` behind `draftMode()` was tried and **did not reduce the
   payload** — the runtime is pulled in by `defineLive` itself, not by rendering
   the component. Removing it means giving up live preview on the deployed site,
   which is an architecture decision for the owner, not an SEO fix. The code was
   reverted to the simpler form rather than left carrying complexity that buys
   nothing.
2. **The hero source is a 2048×1536 PNG.** Re-uploading the hero slides as WebP or
   AVIF originals would cut the source weight further. The CDN already negotiates
   the format per request, so the gain is real but smaller than it looks.

Also measured and left alone: `Plus_Jakarta_Sans` loads five weights with
`display: swap`. Trimming weights would cut font bytes but changes typography, which
`DESIGN_SYSTEM.md` forbids without approval.

---

## 9. Google Search Console — not connected

**No property has been verified and no sitemap has been submitted.** Those actions
require authenticated access to a Google account that owns the domain. Do not
report either as done until they actually are.

Setup, once the domain is live:

1. Go to <https://search.google.com/search-console>.
2. **Add property → Domain**, then choose **DNS verification** (recommended: covers
   all subdomains and both `http`/`https`).
3. Sanity already owns `d04rgvdr.api.sanity.io`; add a **TXT** record at your DNS
   provider for the token Google gives you. A TXT record leaves mail and the
   www/non-www behaviour alone, which an HTML meta verification tag would not.
4. Paste the token into Search Console and wait for verification (minutes to
   48 hours).
5. **Sitemaps → `sitemap.xml`**. Submit `https://<your-domain>/sitemap.xml`. The
   `robots.txt` already advertises it.
6. Use **URL Inspection** on `/`, `/about-us`, `/admissions`, `/academics`,
   `/contact`. Check the rendered HTML, not the live page: the test tool is the
   only place a canonical or a `noindex` can be confirmed as Google sees it.
7. Optional but worth it: **Settings → Crawl stats** after a few weeks to see which
   URLs Google actually fetched, and **Performance** for queries once impressions
   start.

If a domain property cannot be used, the **URL-prefix** property
(`https://www.jids.edu.bd/`) is the fallback, verified with an HTML tag or a DNS
TXT on that host only.

---

## 10. Local SEO

### The NAP conflict (resolved 2026-09-27)

The site's contact details contradicted each other, which is the most damaging
local-SEO defect there is — a search engine cannot rank a business whose name,
address and phone disagree with themselves.

| Source | Before | After |
|---|---|---|
| `siteSettings.contact.address` | Mohammadpur, Dhaka, Bangladesh | **TNT, Tongi, Gazipur, Bangladesh** |
| `siteSettings.footer.contactItems` | Mohammadpur, Dhaka, Bangladesh | **TNT, Tongi, Gazipur, Bangladesh** |
| `siteSettings.footer.map` | `?q=Mohammadpur,Dhaka,Bangladesh`, "Mohammadpur • Dhaka" | maps search for the school in Tongi, Gazipur; "Tongi • Gazipur" |
| `siteSettings.contact.mobile*` | 018-200-80080 | **01717-103326** |
| `siteSettings.contact.email*` | info@jids.edu.bd | **jids21@gmail.com** |
| `siteSettings.contact.phone*` (landline) | 02-48111854 | **removed** — a dead line is a broken promise, not a listing detail |
| `siteSettings.floatingContact.url` | `wa.me/8801820080080` | **`wa.me/8801717103326`** |
| `navigation.topBar` | "Phone/WhatsApp: 01800000" → `tel:01820080080` | **"Phone/WhatsApp: 01717-103326"** → `tel:8801717103326` |
| Admissions + Home WhatsApp CTAs | `wa.me/8801820080080` | **`wa.me/8801717103326`** |
| Meta descriptions (Home, About, Site defaults) | "Mohammadpur, Dhaka" | **"Tongi, Gazipur"** |
| Site default description | "Playgroup to Class V" | **"Play Group to Class 10"** (matches the 13 `classLevel` documents) |

The school confirmed the Tongi, Gazipur campus is current. The old details were
replaced at the **source** (`siteSettings`) rather than typed into each page, and a
dataset-wide string sweep caught every remaining copy — including three
`wa.me` links inside Admissions buttons that no audit of the visible pages would
have found. `scripts/seed-seo.mjs` is idempotent and re-runnable; it reports any
drift back.

The footer's "Find us" link is now a Google **maps search** for the school in
Tongi, Gazipur rather than a claimed pin. Replace it with the exact place link
when the school provides one.

### Google Business Profile checklist

**No business profile has been created, viewed or changed.** Creating or editing
one requires the owner's Google account, and a profile that does not exist cannot
be created by an agent. Check off, by hand:

- [ ] Claim or create the profile for the **exact** name
      `Jahan International Dream School`. No keyword stuffing, no "J.I.D.S." in
      the name field, no extra words. (Use the acronym in the description.)
- [ ] **Primary category:** School. Secondary, if the categories genuinely apply:
      Primary school · Private school · Bilingual school.
- [ ] **Address:** the confirmed Tongi, Gazipur address, matching the website
      exactly. Google compares character by character.
- [ ] **Phone:** 01717-103326, matching the website exactly. One number, used
      consistently. The old Dhaka landline is not listed anywhere.
- [ ] **Website:** `https://<your-domain>/` (the home page URL).
- [ ] **Opening hours:** school hours, not office hours — and only once confirmed.
      Term-time and vacation differences are the usual trap.
- [ ] **Photos:** the crest, the gate or entrance, classrooms in use, an
      unmistakable shot of the notice board, and the principal. Real photographs
      from the current campus — the Tongi building, not the old Mohammadpur one.
- [ ] **Description:** 750 characters, plain prose, what the school teaches and
      which classes it runs. No awards, no claims that cannot be substantiated.
- [ ] **Verification:** complete it. An unverified profile does not rank in the
      local pack, and it is the single most common reason a school's map listing
      does not appear.
- [ ] After verification: add the classes offered as posts, and keep the hours and
      phone in step with `siteSettings`.

### Consistency is enforced by code

`scripts/verify-seo.mjs` has a **NAP consistency** section. It reads
`siteSettings.contact` and the top bar out of Sanity and asserts that the home
page, the contact page and the rendered chrome all show the *same* address, the
same phone number and the same email — and that the top bar's label matches the
number its own link points to. It also fails if `8801820080080`, `018-200-80080`,
`02-48111854`, `info@jids.edu.bd` or `Mohammadpur` appear anywhere in the rendered
site. If a retired detail ever comes back, or a second address is introduced, the
test catches it.

---

## 11. On-page state, page by page

| Route | Title (as served) | H1 | Description | Indexable |
|---|---|---|---|---|
| `/` | Jahan International Dream School (J.I.D.S.) \| Estd: 2021 | Jahan International Dream School / Empowering Young Minds For Global Excellence | 154 chars | yes |
| `/about-us` | About Us & Our Teachers \| Jahan International Dream School | Our Team at Jahan International Dream School | 151 chars | yes |
| `/academics` | Classes & Curriculum \| Jahan International Dream School | Classes & Curriculum | 160 chars | yes |
| `/academics/class-routine` | Class Routine & Timetable \| Jahan International Dream School | Class Routine | 135 chars | yes |
| `/admissions` | Admissions 2027 Guide \| Jahan International Dream School | New Admissions For 2027: Starting On Sep 21, 2026 | 148 chars | yes |
| `/contact` | Contact & Directions \| Jahan International Dream School | Contact Us | 148 chars | yes |
| `/branch` | Al Noor Madrasa: Quran & Islamic Education | Learn Quran / Build a Better Future | 148 chars | yes — see below |
| `/complaint-box` | Complaint Box | Anonymous Complaint Box (from the CMS) | inherited from Site settings | **no** |

Every page: exactly one `h1`, `<html lang="en">`, an absolute canonical matching
its own URL, Open Graph and Twitter tags generated from the same values, and
breadcrumb structured data wherever a visible trail exists.

### The Complaint Box page

Its heading and intro line come from a `complaintPage` singleton, so an editor can
change them in the Studio like any other heading. It deliberately has **no `seo`
block**: the `noindex` directive and the sitemap exclusion are both declared in
`src/lib/routes.ts` as technical policy, so there is no switch an editor could flip
to publish a page the site has agreed never to advertise — and no way for the two
to disagree. `verify-seo.mjs` asserts both.

The strings *inside* the form — labels, the honeypot, the thank-you panel — are
still hardcoded in `src/components/complaint/ComplaintBox.tsx`. That is a
pre-existing CMS-safety gap (see §17), not an SEO one.

### The Branch page needs an owner decision

`/branch` is in the main navigation, and its CMS content is for **a different
institution** — an Islamic madrasa:

> eyebrow: "Welcome to Al Noor Madrasa" · h1: "Learn Quran / Build a Better
> Future" · "Al Noor Madrasa provides a peaceful and disciplined environment for
> Islamic education…" · teachers: Maulana Rashid Ahmed, Hafiz Salman Khan, Ustaz
> Faruk Hossain

It was seeded as a landing-page reference copy. It is not a J.I.D.S. branch page.

What was done, and why:

- `appendSiteName` is **off** for this page. Appending "Jahan International Dream
  School" to an Al Noor Madrasa title would tell a search engine the two
  organisations are the same entity. The `appendSiteName` field exists for exactly
  this case.
- The title and description describe **what the page actually says** — Quran
  recitation with Tajweed, Islamic studies, Arabic, character building. Nothing
  invented, nothing claimed on the school's behalf.
- It stays indexable and in the sitemap, as instructed.

What is still wrong, and needs the school:

1. **The page content should be replaced** with real J.I.D.S. branch content, or
   the route should be removed from the navigation. Until then the site carries a
   second organisation's name in an `h1` and in its title, which muddies the
   school's own entity signals. This is the highest-value content fix outstanding.
2. Its "About Our Madrasa" button links to `/about-us`, which is J.I.D.S.'s About
   page. Resolves, so it is not a broken link, but it is the wrong destination.
3. It is a real risk to click-to-edit: an editor who opens it sees click-to-edit
   targets on content that is not about their school.

---

## 12. Language and internationalisation

The site is **English-only**. `<html lang="en">` is correct and no `hreflang` tags
are emitted — a self-referential `hreflang` set, or `en` pointing at untranslated
copy, is worse than none.

The header's language button uses **Google Translate client-side**. That is a
machine translation of the rendered page: it is not crawlable, it creates no
indexable Bangla URL, and it must never be given `hreflang`. It also rewrites text
nodes, which is why it is disabled inside the Presentation Tool iframe — that
would strip the stega encoding click-to-edit depends on.

If real Bangla pages are ever wanted, they need their own routes, their own Sanity
documents, `hreflang` pairs and their own sitemap entries. That is a content
project, not a configuration switch. Do not create fake alternate pages.

---

## 13. How to add SEO to a future page

1. Add the route to `src/lib/routes.ts` with its `path`, document `type` and
   `noIndex` flag. This is the single source of truth for the sitemap, the
   canonical and the verification script.
2. Give the page document an `seo` field of type `seo` (see
   `src/sanity/schemaTypes/documents/`), and make sure `generateMetadata` in
   `pageSeoQuery` can find it by document type.
3. In the page component:
   ```tsx
   export const dynamic = 'force-dynamic'

   export function generateMetadata(): Promise<Metadata> {
     return buildPageMetadata({type: 'myPage', pathname: '/my-page'})
   }
   ```
   That is the whole metadata implementation. Do not assemble a title, a
   description or a canonical by hand in the component.
4. Render `<PageJsonLd type="myPage" pathname="/my-page" />` as the first child of
   the page's fragment.
5. If the page has a breadcrumb trail, use `pageHeroSection` — `PageHeroSection`
   emits the matching `BreadcrumbList` from the same array.
6. Add the page to `scripts/verify-seo.mjs`'s `ROUTES`.
7. Run `node scripts/verify-seo.mjs`.

---

## 14. Testing SEO after a change

```bash
npm run dev                      # or: npm run build && npm start
node scripts/verify-seo.mjs      # 218 checks
npx tsc --noEmit
npm run lint
npm run build
```

`verify-seo.mjs` reads real HTTP responses. It checks status codes, titles,
descriptions, canonicals, robots directives, H1s, `lang`, internal links, the 404
response, `robots.txt`, the sitemap (including fetching every URL in it), the
JSON-LD graph, draft isolation, NAP consistency, and that no retired contact
detail has returned. It fails loudly; it never reports success it has not verified.

For a production-accurate performance number, use a production build — a
`next dev` number is meaningless, because the dev bundle and the HMR client
dominate every metric.

```bash
npm run build
npx next start -p 3100
npx lighthouse http://localhost:3100/ --view \
  --only-categories=performance,accessibility,seo,best-practices \
  --form-factor=mobile --screenEmulation.mobile
```

---

## 15. The rule for any future agent

> Whenever a page is added, redesigned, or its content model changes, check its
> metadata, canonical URL, structured data, internal links, sitemap eligibility and
> indexing directives — and run `node scripts/verify-seo.mjs` before reporting it
> done.

Concretely, that means:

- A new route goes into `src/lib/routes.ts` **and** `verify-seo.mjs`, or it will
  not be in the sitemap.
- A new page document gets a `seo` field, and its `generateMetadata` calls
  `buildPageMetadata`. Never hand-build a title in a component.
- A CMS link must point at a route that exists. A 404 in the footer is a crawl
  budget leak and a broken promise to a parent.
- A removed field orphans content silently. Query the affected documents first.
- Never add an SEO field without updating the schema, the GROQ projection, the
  generated types and the Studio field description together — then re-run
  `npx sanity schema extract --path schema.json` and `npx sanity typegen generate`.
- Never put stega-encoded text into a title, a description, a canonical or a
  JSON-LD value.
- Never add structured data for something the school has not confirmed.

---

## 16. Open items — a human has to do these

| # | Item | Why it is not done here |
|---|---|---|
| 1 | Set `NEXT_PUBLIC_SITE_URL` to the production origin | The real domain is not known. Nothing in the code invents one. **Blocks all indexing.** |
| 2 | Deploy, then verify the Search Console property and submit the sitemap | Needs authenticated access to the owner's Google account |
| 3 | Claim or create the Google Business Profile | Same, and a profile must not be created without authorisation |
| 4 | Decide what `/branch` is | The page is another institution's content; only the school can say whether to replace it or unpublish it |
| 5 | Confirm the "4.7 / 140+ families" claim, or remove it | It is on the Contact page and the Home page. Unverifiable review claims risk a manual action. It is deliberately **not** in structured data |
| 6 | Supply a street address, or leave `postalAddress.streetAddress` empty | A wrong one misdirects parents |
| 7 | Confirm opening hours before adding them to structured data | Free text on the Contact page only; term-time variation is unknown |
| 8 | Replace the footer's maps **search** link with the exact place link | Needs the real pin |
| 9 | Build `/privacy` and `/terms`, then restore the footer links | Legal copy must come from the school. The links were removed rather than left 404ing |
| 10 | Publish `/why-choose-us` and `/safety-first`, or drop them from the reference | The reference HTML exists; the pages were never built. Their links were removed |
| 11 | Replace the twelve placeholder teacher cards | Content gap, not SEO. Already documented in `WEBSITE_SPEC.md` |
| 12 | Decide whether the deployed site keeps live preview | ~300 KB of the initial JS depends on it. An architecture decision, not an SEO fix |
| 13 | Add a real news/article route, then `Article` structured data | There is no article page today |

---

## 17. What the audit found, and what was done about it

| # | Problem | Status |
|---|---|---|
| 1 | Home title rendered as `… \| Estd: 2021 \| Jahan International Dream School` — the school name twice | Fixed: no `title.template`; `composeTitle()` appends only when absent |
| 2 | Home, Contact and Branch all served the **same** title (site default) | Fixed: per-page SEO for Contact and Branch; composed titles now unique (asserted) |
| 3 | Five titles were 64–80 characters once the brand was appended, so the school name was truncated in results | Fixed: titles shortened so each is ≤ 60 composed |
| 4 | No `robots.txt` | Added, generated from the deployment origin |
| 5 | No `sitemap.xml` | Added, from Sanity, hourly, published-only, real `lastModified` |
| 6 | No 404 page; a missing URL returned Next's bare default | Added, with the real site chrome and a real HTTP 404 |
| 7 | No structured data anywhere | Added: `EducationalOrganization`, `WebSite`, `WebPage`, `BreadcrumbList` |
| 8 | Four footer/nav links 404'd on **every** page (`/privacy`, `/terms`, `/sitemap`, `/why-choose-us`), plus `/why-choose-us` from the Home student section | Links removed from Sanity, with instructions to restore them when the pages exist |
| 9 | NAP conflict: Mohammadpur/Dhaka vs Tongi/Gazirpur, two phone numbers, two emails | Resolved at the source; enforced by a test |
| 10 | A dead Dhaka landline was published as a contact point | Removed |
| 11 | Top bar showed "01800000" — a truncated number that did not match its own link | Fixed to the verified number |
| 12 | No image `srcset`: a phone downloaded the 1920px hero (1.05 MB PNG) | Fixed with a Sanity CDN loader: 43.6 KB AVIF at `w=828` |
| 13 | No `metadataBase`; canonicals were skipped entirely if `NEXT_PUBLIC_SITE_URL` was unset | Fixed |
| 14 | A site-level `canonicalUrl` would have been inherited by every page | Fixed: page-only override, home-page fallback |
| 15 | Draft Mode served indexable, draft-only metadata on a public URL | Fixed: every preview response is `noindex, nofollow` |
| 16 | `/complaint-box` had no `h1`, and its heading and title were hardcoded in the page component | Fixed: a `complaintPage` singleton owns the heading and intro; the indexability policy stays in code |
| 17 | Site default description claimed "Playgroup to Class V"; the school runs Play Group to Class 10 | Fixed |
| 18 | No analytics at all | GA4 integration added, inert until an ID is supplied |

### Pre-existing issues found but **not** fixed (out of scope)

- `scripts/verify-class-routine.mjs` fails 7 of 86 checks, on click-to-edit targets
  for the routine tabs, day columns and slot times. Confirmed identical on a clean
  checkout (`git stash`), so it predates this work. A Visual Editing bug, not SEO.
- Lighthouse accessibility 86–91. Failing audits observed across runs:
  `color-contrast` (amber/grey tokens in `DESIGN_SYSTEM.md`), `aria-hidden-focus`
  and `aria-prohibited-attr` (the mobile menu overlay), `target-size`. A design
  system change, which `DESIGN_SYSTEM.md` forbids without approval.
- `ComplaintBox` still renders hardcoded English copy *inside the form* — labels,
  the honeypot, the thank-you panel — with no CMS fields behind it, which breaks
  CMS safety rule 1. Its heading and intro are now CMS-controlled. Moving the form's
  own copy into Sanity needs a content model, not an SEO fix.
