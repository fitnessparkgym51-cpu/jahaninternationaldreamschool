# WEBSITE_SPEC.md

The page inventory, the editorial model behind each page, and the change-impact
map. Read alongside `AGENTS.md` (the contract), `SANITY_ARCHITECTURE.md`
(how the CMS is wired) and `SEO_CHECKLIST.md` (search engines).

Routes come from the **`navigation` document in Sanity**, not from this file. This
file documents them; the CMS controls them. The technical route inventory that the
sitemap, the canonicals and `scripts/verify-seo.mjs` share is
**`src/lib/routes.ts`**.

---

## 1. Route inventory

Derived from the live `navigation` document and `siteSettings.footer.quickLinks`,
cross-checked against the `JIDS/` reference pages.

| Route | Reference | Purpose | Status |
|---|---|---|---|
| `/` | `home.html` | Home | **Built** — reference implementation |
| `/about-us` | `aboutus.html` | Principal's message, teaching team, guiding philosophy | **Built** |
| `/academics` | `classesoffered.html` | Classes offered, curriculum highlights | **Built** |
| `/academics/class-routine` | `classroutine.html` | Weekly timetable per class | **Built** |
| `/admissions` | `admission.html` | How to apply, referral offer, FAQ | **Built** |
| `/contact` | `contactus.html` | Contact cards, office hours, enquiry form | **Built** |
| `/complaint-box` | `complaintbox.html` | Anonymous complaint form + tracking ID | **Built** — `noindex` |
| `/branch` | *no reference page* | Landing-page reference copy for a madrasa | **Built, wrong content** — see below |
| 404 | — | Missing pages | **Built** — `src/app/not-found.tsx` |
| `/robots.txt`, `/sitemap.xml` | — | Crawl control | **Built** — `SEO_CHECKLIST.md` |
| `/why-choose-us` | `whychooseus.html` | Alumni destinations, supporting pillars | Not built — **no reference-derived design agreed** |
| `/safety-first` | `safetyfirst.html` | Six layers of safety, pickup protocol | Not built — **orphaned: no nav link** |
| `/privacy`, `/terms` | *no reference page* | Legal pages (were linked from the footer) | Not built — **links removed 2026-09-27** |

### Gaps that need a human decision

1. **`/branch` is another institution's content.** The page renders an Islamic
   madrasa ("Welcome to Al Noor Madrasa"), not J.I.D.S. It is linked from the main
   navigation and, as instructed, left indexable with a title that describes what
   the page actually says and `seo.appendSiteName` switched off so the two
   organisations are not conflated. Either replace the copy with real branch
   content or unpublish the route. `SEO_CHECKLIST.md` §11.
2. **`/why-choose-us`** has a full reference page. The footer's "Alumni & Students"
   link and the Home page's "View All Student Success Stories" button both pointed
   at it and both 404'd; they have been removed rather than repointed. Build the
   page, then restore the links in the Studio.
3. **`/safety-first`** has a full reference page but nothing links to it. Either
   add a nav item in Sanity or leave it unbuilt — but do not quietly drop a page
   the school wrote.
4. **`/privacy` and `/terms`** are legal pages the footer linked to. The links were
   removed on 2026-09-27 because a 404 on every page is worse than no link. Legal
   copy must be supplied by the school; restore the links when it exists.
5. **`/news`** was in an earlier navigation and was replaced by the Branch page
   (commit `d3dc5eb`). The `newsPost` documents remain as home-page cards. There is
   no article route, so there is no `Article` structured data.

### Shared in-page anchors already referenced by Sanity

| Anchor | Owner | Linked from |
|---|---|---|
| `#our-teachers` | `peopleGridSection` on About | `navigation` → About us → "Our Teachers" |
| `#admission` | `admissionBannerSection` on Home | Home |
| `#contact-form` | Contact page | `navigation` header CTA, About CTA, Top bar |

---

## 2. Global chrome — owned by Sanity, reused by every page

Never re-implement. Never hardcode a school detail into a component.

| Element | Source document | Schema | Query | Pages |
|---|---|---|---|---|
| Top utility bar | `navigation` | `topBar` | `navigationQuery` | every page |
| Header + logo + menu + CTA + mobile menu | `navigation` | `header` | `navigationQuery` | every page |
| Footer (4 columns, social card, map card, copyright) | `siteSettings` | `footer` | `siteSettingsQuery` | every page |
| Floating WhatsApp button | `siteSettings` | `floatingContact` | `siteSettingsQuery` | every page |
| School name / acronym / crest | `siteSettings` | `brand` | `siteSettingsQuery` | every page |
| Address, phone, WhatsApp, email | `siteSettings` | `contactBlock` | `siteSettingsQuery` | every page |
| Site-wide SEO defaults | `siteSettings` | `seo` | `pageSeoQuery` | every page without its own |

---

## 3. Change-impact map

**Component → CMS source → Schema → Query → Pages using it → Visual Editing.**

Any change to a row must re-check every page in that row.

| Component | CMS source | Schema | Query | Pages | Click-to-edit |
|---|---|---|---|---|---|
| `Header` | Navigation + Site settings | `navigation.header`, `brand` | `navigationQuery`, `siteSettingsQuery` | all | yes — labels stega, URL/flags `data-sanity` |
| `TopBar` | Navigation | `topBar` | `navigationQuery` | all | yes |
| `Footer` | Site settings | `footer` | `siteSettingsQuery` | all | yes |
| `FloatingContact` | Site settings | `floatingContact` | `siteSettingsQuery` | all | yes |
| `HeroSection` / `HeroCarousel` | Home page | `heroSection` | `homePageQuery` | `/` | yes + slide `isVisible` |
| `StatsBarSection` | Home page | `statsBarSection` | `homePageQuery` | `/` | yes |
| `FeaturesSection` / feature card | Home page | `featuresSection` | `homePageQuery` | `/` | yes, per card |
| `AboutStorySection` | Home page | `aboutStorySection` | `homePageQuery` | `/` | yes |
| `StudentSpotlightSection` + card | **Student spotlight** | `studentSpotlight` | `homePageQuery` | `/` | yes — targets the **document** |
| `AdmissionBannerSection` | Home page | `admissionBannerSection` | `homePageQuery` | `/` | yes |
| `NewsSection` + card | **News post** | `newsPost` | `homePageQuery` | `/` | yes — targets the **document** |
| `ReviewBarSection` | Home page | `reviewBarSection` | `homePageQuery` | `/` | yes |
| `PageHeroSection` | page document | `pageHeroSection` | `aboutPageQuery` | `/about-us`, then every inner page | yes |
| `PrincipalSection` | About page + **Person** | `principalSection` | `aboutPageQuery` | `/about-us` | heading on the page; name/photo/body/quote on the **person** |
| `PeopleGridSection` + person card | About page + **Person** | `peopleGridSection` | `aboutPageQuery` | `/about-us` | header on the page; each card targets its own **person** document (12 separate ids) |
| `PillarsSection` + pillar card | About page | `pillarsSection` | `aboutPageQuery` | `/about-us` | yes, per card |
| `PageCtaSection` | page document | `pageCtaSection` | `aboutPageQuery` | `/about-us`, then every inner page | yes |
| `SectionHeader` | any card-grid section | `sectionHeader` | per page | all | yes |
| `SanityImage` | any image field | `imageWithAlt` | per page | all | yes — `data-sanity` on the image element |
| `ButtonLink` / `SmartLink` | any button/link | `button`, `link` | per page | all | label stega, URL `data-sanity` |

**Reusable documents:** `studentSpotlight` (4), `newsPost` (3), `person` (13 — 1
principal referenced by the principal section, 12 teacher placeholders referenced
by the team grid). Changing one changes every page that references it.

---

## 4. Home page (`/`) — the reference

`homePage` singleton, `sections[]` array, eight sections, each independently
reorderable and hideable. The established section vocabulary
(`heroSection`, `statsBarSection`, `featuresSection`, `aboutStorySection`,
`studentSpotlightSection`, `admissionBannerSection`, `newsSection`,
`reviewBarSection`) is what every other page should imitate.

Do not restructure it. It defines the pattern.

---

## 5. About page (`/about-us`)

Singleton `aboutPage`, fixed id `aboutPage`. Reference: `JIDS/aboutus.html`.

```
Global Header
├── Page hero              pageHeroSection     "Our Team" + breadcrumb
├── Principal profile      principalSection    photo + name + message + quote
│                                             └─ references a Person
├── Meet our teachers      peopleGridSection   anchor #our-teachers
│                                             └─ references People
├── Guiding philosophy     pillarsSection      Vision / Mission / Core Philosophy
├── Call to action         pageCtaSection      "Want To Meet The Teachers?"
Global Footer
```

### CMS ownership

| Element | Owner | Why |
|---|---|---|
| Hero heading + breadcrumb | **About page** | Page-specific copy. |
| "Meet Our Principal" heading | **About page** | Section copy, not the person. |
| Principal name, designation, photo, 4-paragraph message, quote | **Person** (referenced) | A person is an entity. Correcting the principal's name must not require editing this page. |
| "Meet Our Teachers" heading + intro | **About page** | Section copy. |
| Teacher cards | **People** (referenced) | Repeatable entity. |
| Pillar titles + text | **About page** | Unique to this page. |
| CTA heading + text + button | **About page** | Page-specific. |
| Pillar icon, icon tile colour | **About page** (design-adjacent) | Small, bounded choice — three tones. |
| Grid columns, card radii, spacing, animation | **Code** | `DESIGN_SYSTEM.md`. |

### Reused, not rebuilt

`Header`, `Footer`, `FloatingContact` from Sanity globals · `sectionHeader` ·
`imageWithAlt` · `button` · `seo` · `SanityImage`, `SmartLink`/`ButtonLink`,
`Reveal`, `Icon` · the `pageHeroSection` and `pageCtaSection` section objects,
which are deliberately generic so the other seven inner pages reuse them.

### Seeded content

Seeded from the reference verbatim: the principal (name, role, photo, four-paragraph
message, quote), three pillars, the page hero, and the closing call to action.

**The twelve teacher cards are seeded as placeholders.** The reference contains
twelve identical cards reading "Teacher Name Here / Photo Coming Soon", each
carrying a *Placeholder* badge. They exist as twelve separate `person` documents
(`person-teacher-01` … `-12`) so each card is individually click-to-edit and can
be replaced with a real teacher one at a time, without touching the page or any
other card. Every field — name, designation, bio, the corner badge and the
"no photo" label — is CMS-controlled, so replacing a placeholder is a Studio edit,
not a code change.

Do not replace the placeholder wording with invented names or biographies. The
school supplies the real people; the placeholder text is chosen to be obviously
unfinished so nobody mistakes it for fact. `peopleGridSection.emptyStateText`
covers the case where every teacher is later hidden.

### SEO

Title and description authored on the `aboutPage` document, falling back to
`siteSettings.seo`, then composed by `src/lib/metadata.ts` — the school name is
appended only when the editor's title does not already contain it. The reference
`<title>` is `About Us - Jahan International Dream School (J.I.D.S.)`; the served
title is `About Us & Our Teachers | Jahan International Dream School`, 58
characters, measured and asserted by `scripts/verify-seo.mjs`.

---

## 6. Remaining pages — notes for whoever builds them

Notes kept from the original audit. `/academics`, `/academics/class-routine`,
`/admissions`, `/contact` and `/complaint-box` have since been built on exactly
this model; read them for the pattern rather than for guidance.

- **`/academics`** — class table (Play Group → Class 10) with an age/subject
  grid (`#curriculum-table`), six curriculum-highlight cards, enrol CTA
  (`#enrol`). Cards map to a `featureCard`-style grid. → **Built.**
- **`/academics/class-routine`** — interactive per-class timetable with tabs
  (`#routineTabs`), a print button (`#routinePrint`) and a "Good To Know" block.
  The interactive part is **code**; the timetable rows are **CMS**. A timetable
  is a strong candidate for a reusable `classRoutine` document with a
  `day[]` → `periods[]` shape. → **Built** as a `classRoutine` document.
- **`/admissions`** — five-step "How To Apply" process, curriculum infographic,
  referral offer, and an FAQ accordion (`#faqAccordion`). Accordion *behaviour*
  is code; questions/answers are CMS. → **Built.**
- **`/contact`** — six contact cards (address, phone, WhatsApp, email, office
  hours), a news strip, and an enquiry form (`#contact-form`: parent name,
  WhatsApp number, child age, class/grade, message, consent checkbox). Card
  content comes from `siteSettings.contact`; the form UI is code, its labels and
  success copy are CMS. → **Built**, but the cards are currently seeded inline on
  the page document rather than read from `siteSettings.contact`; the two must be
  kept identical (`SEO_CHECKLIST.md` §10).
- **`/complaint-box`** — anonymity promise cards, a complaint form (topic, class,
  details) that returns a **tracking ID** the user can copy, a 4-step "How It
  Works", and a "would rather talk to someone" block. → **Built** as a
  `complaintPage` singleton + the `ComplaintBox` form. The heading and intro are
  CMS-controlled; the strings inside the form are still hardcoded in
  `src/components/complaint/ComplaintBox.tsx`, which is a known CMS-safety gap
  (`SEO_CHECKLIST.md` §17).
- **`/why-choose-us`** — curriculum and classroom features, safety feature,
  alumni destinations (reuses `studentSpotlight` references), supporting
  pillars, admissions banner (`#admissions`). → **Not built.**

Two pages have forms. Per `AGENTS.md` Part 18: layout and behaviour in code,
labels/placeholders/success messages in Sanity, **no secrets in Sanity**.

---

## 7. Reference file map

`JIDS/` is migration input only — never imported into runtime code.

| File | Serves |
|---|---|
| `aboutus.html` | `/about-us` |
| `classesoffered.html` | `/academics` |
| `classroutine.html` | `/academics/class-routine` |
| `admission.html` | `/admissions` |
| `contactus.html` | `/contact` |
| `complaintbox.html` | `/complaint-box` |
| `whychooseus.html` | `/why-choose-us` |
| `safetyfirst.html` | `/safety-first` (unlinked) |
| `home.html` | `/` (already migrated) |
| `assets/styles.css`, `assets/main.js` | Design + motion reference only |

Downloaded images live in the gitignored `.seed-assets/` and are uploaded to
Sanity by the seed scripts. The reference `<img src>` values are Google CDN URLs
and must never reach a component.
