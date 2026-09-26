# WEBSITE_SPEC.md

The page inventory, the editorial model behind each page, and the change-impact
map. Read alongside `AGENTS.md` (the contract) and `SANITY_ARCHITECTURE.md`
(how the CMS is wired).

Routes come from the **`navigation` document in Sanity**, not from this file. This
file documents them; the CMS controls them.

---

## 1. Route inventory

Derived from the live `navigation` document and `siteSettings.footer.quickLinks`,
cross-checked against the `JIDS/` reference pages.

| Route | Reference | Purpose | Status |
|---|---|---|---|
| `/` | `home.html` | Home | **Built** — reference implementation |
| `/about-us` | `aboutus.html` | Principal's message, teaching team, guiding philosophy | **Built** |
| `/academics` | `classesoffered.html` | Classes offered, curriculum highlights | Not built |
| `/academics/class-routine` | `classroutine.html` | Weekly timetable per class | Not built |
| `/admissions` | `admission.html` | How to apply, referral offer, FAQ | Not built |
| `/news` | *no reference page* | News & events listing | Not built — **no reference exists** |
| `/contact` | `contactus.html` | Contact cards, office hours, enquiry form | Not built |
| `/complaint-box` | `complaintbox.html` | Anonymous complaint form + tracking ID | Not built |
| `/why-choose-us` | `whychooseus.html` | Alumni destinations, supporting pillars | Not built |
| `/privacy` | *no reference page* | Privacy policy (linked from the footer) | Not built — **no reference exists** |
| `/safety-first` | `safetyfirst.html` | Six layers of safety, pickup protocol | Not built — **orphaned: no nav link** |

### Three gaps that need a human decision

1. **`/news`** is in the navigation but there is no `news.html` reference. The
   Home page's news section is the only design precedent. Do not invent a listing
   design without asking.
2. **`/privacy`** is in the footer quick links with no reference and no content.
   Legal copy must be supplied by the school.
3. **`/safety-first`** has a full reference page but nothing links to it. Either
   add a nav item in Sanity or leave it unbuilt — but do not quietly drop a page
   the school wrote.

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
`siteSettings.seo`. The reference `<title>` is
`About Us - Jahan International Dream School (J.I.D.S.)`; a shorter variant is
seeded to stay under the 60-character guideline.

---

## 6. Remaining pages — notes for whoever builds them

Not yet designed in detail. What the audit established:

- **`/academics`** — class table (Play Group → Class 10) with an age/subject
  grid (`#curriculum-table`), six curriculum-highlight cards, enrol CTA
  (`#enrol`). Cards map to a `featureCard`-style grid.
- **`/academics/class-routine`** — interactive per-class timetable with tabs
  (`#routineTabs`), a print button (`#routinePrint`) and a "Good To Know" block.
  The interactive part is **code**; the timetable rows are **CMS**. A timetable
  is a strong candidate for a reusable `classRoutine` document with a
  `day[]` → `periods[]` shape.
- **`/admissions`** — five-step "How To Apply" process, curriculum infographic,
  referral offer, and an FAQ accordion (`#faqAccordion`). Accordion *behaviour*
  is code; questions/answers are CMS.
- **`/contact`** — six contact cards (address, phone, WhatsApp, email, office
  hours), a news strip, and an enquiry form (`#contact-form`: parent name,
  WhatsApp number, child age, class/grade, message, consent checkbox). Card
  content comes from `siteSettings.contact`; the form UI is code, its labels and
  success copy are CMS.
- **`/complaint-box`** — anonymity promise cards, a complaint form (topic, class,
  details) that returns a **tracking ID** the user can copy, a 4-step "How It
  Works", and a "would rather talk to someone" block. Needs a form action or
  route handler; the tracking-ID copy must be CMS-controlled.
- **`/why-choose-us`** — curriculum and classroom features, safety feature,
  alumni destinations (reuses `studentSpotlight` references), supporting
  pillars, admissions banner (`#admissions`).

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
