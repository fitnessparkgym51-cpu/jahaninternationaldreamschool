<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Jahan International Dream School — Project Contract

**This file is binding. Read it before changing any code in this repository.**

It has two parts:

1. A short **status board** describing the project as it is right now.
2. The **architecture contract** (authored as a specification, kept verbatim). Everything
   below "THE ARCHITECTURE CONTRACT" is a hard requirement, not a suggestion.

---

## Status board

| | |
|---|---|
| Framework | Next.js 16.3.6 (App Router, Turbopack, React 19.2, React Compiler on) |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/app/globals.css`) |
| CMS | Sanity `d04rgvdr` / dataset `production`, Studio mounted at `/studio` |
| Sanity packages | `sanity@5`, `next-sanity@13`, `@sanity/visual-editing@6` |
| Dev server | `npm run dev` → http://localhost:3000 |
| Studio | http://localhost:3000/studio |
| Presentation Tool | http://localhost:3000/studio/presentation |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Verify visual editing | `node scripts/verify-visual-editing.mjs` (dev server must be running) |
| Verify sections | `node scripts/verify-sections.mjs` (dev server must be running) |
| Verify About Us | `node scripts/verify-about-us.mjs` (dev server must be running) |
| Re-seed reference content | `node scripts/seed.mjs` (destructive; `--clean` wipes the dataset first) |
| Re-seed About Us only | `node scripts/seed-about-us.mjs` (additive; never touches Home) |

### Documented companions

These are required by the contract below and are expected to exist as the work proceeds.
**Check a file exists before linking to it.**

- `WEBSITE_SPEC.md` — page inventory, page-by-page editorial model, change-impact map
- `SANITY_ARCHITECTURE.md` — schemas, GROQ, types, schema-change procedure, seeding
- `DESIGN_SYSTEM.md` — tokens, patterns, and what must not be redesigned

### Current implementation state

- **Home page (`/`)** — complete and is the **gold-standard reference implementation**
  for CMS architecture, component structure and Visual Editing. Every other page must
  follow it. Do not restructure it.
- **Globals** — `Header` (incl. top bar + mobile menu), `Footer`, `FloatingContact`,
  `Navigation` and `Site settings` documents are centralised in Sanity and shared by
  every page via the `(site)` route group layout.
- **Sanity documents** — `homePage`, `aboutPage`, `siteSettings`, `navigation`
  (singletons), `studentSpotlight` ×4, `newsPost` ×3, `person` ×13 (1 principal
  + 12 teacher placeholders on About).
- **Images** — 10 image assets in Sanity. The reference `JIDS/` folder holds the source
  downloads; it is **initial content only** and must never be imported into runtime code.
- **Pages built** — `/` (Home, reference) and `/about-us`. The rest are not built;
  see the inventory and the three open questions in `WEBSITE_SPEC.md` §1.
- **Teacher cards are placeholders, on purpose.** The reference ships twelve
  "Teacher Name Here" cards, each labelled *Photo Coming Soon* / *Placeholder*.
  They are seeded as twelve separate `person` documents so each is individually
  click-to-edit and can be replaced with a real teacher one at a time. Do not
  "improve" them by inventing names, photos or bios — the school supplies the
  real people. `emptyStateText` is the fallback if every teacher is later hidden.
- The two Home-specific verification scripts above must keep passing (19/19 and 8/8
  at the time of writing). If a change makes one fail, the change is wrong.

---

## CMS SAFETY RULES FOR AI AGENTS

Required by Part 20. These are hard rules, not guidance.

1. **Never hardcode CMS-controlled content.** If a string or image can be edited
   by the school, it belongs in Sanity. This includes headings, paragraphs,
   labels, button text, button URLs, nav labels/URLs, images, alt text, names,
   contact details, addresses, social links, SEO and every card field.
2. **Never remove or rename a Sanity field without checking existing data.**
   A removed field orphans content silently — no error, just `undefined`. Query
   the affected documents first and migrate or report it.
3. **Never change a schema without checking every dependent query, type and
   component.** The chain is schema → data → GROQ → generated types → component
   → Visual Editing. Skipping a link breaks click-to-edit without breaking the
   build.
4. **Never create duplicate global content.** School identity, contact details,
   navigation and footer live in `siteSettings` / `navigation` only.
5. **Never bypass Sanity for convenience** — not for a placeholder, not for a
   demo, not "just to get it rendering".
6. **Never replace a Sanity image with a `/public` image** if it is CMS content.
   Reference assets in `.seed-assets/` are upload *sources*, not web assets.
7. **Never break Visual Editing.** Every CMS-controlled element needs either a
   stega-encoded string or a `data-sanity` attribute. Check the element's source
   before you delete it.
8. **Never assume a UI-only change is harmless.** Renaming a prop or a section
   `_type` can silently orphan content.
9. **Check shared components before modifying them.** `Header`, `TopBar`,
   `Footer`, `FloatingContact`, `SanityImage`, `SmartLink`, `ButtonLink`,
   `Reveal`, `Icon` are used by every page.
10. **Check every page that uses a shared schema or component** — use the
    change-impact map in `WEBSITE_SPEC.md` §3.
11. **Run `npx tsc --noEmit`.**
12. **Run `npm run lint`.**
13. **Run `npm run build`.**
14. **Test the Studio** at `/studio`: fields present, understandable, images and
    references resolve, validation behaves.
15. **Test the Presentation Tool** at `/studio/presentation`: the page loads and
    click-to-edit opens the right field.
16. **Test at least one edit round trip** — change a value in Sanity, confirm the
    rendered page updates.

Never suppress a problem with `any`, `@ts-ignore`, `@ts-expect-error` or
`eslint-disable` unless there is a written justification in the checkpoint report.

---

## Change-impact map

Required by Part 21. Full version, including the Home and About sections, in
`WEBSITE_SPEC.md` §3. The rows that span every page:

| Component | CMS source | Schema | Query | Pages | Click-to-edit |
|---|---|---|---|---|---|
| `Header` | Navigation + Site settings | `navigation.header`, `brand` | `navigationQuery` | every page | yes |
| `TopBar` | Navigation | `topBar` | `navigationQuery` | every page | yes |
| `Footer` | Site settings | `footer` | `siteSettingsQuery` | every page | yes |
| `FloatingContact` | Site settings | `floatingContact` | `siteSettingsQuery` | every page | yes |
| `SanityImage` | any image field | `imageWithAlt` | per page | every page | yes |
| `ButtonLink` / `SmartLink` | any button / link | `button`, `link` | per page | every page | yes |
| `SectionHeader` | card-grid sections | `sectionHeader` | per page | Home, About | yes |
| `PageHeroSection` | page document | `pageHeroSection` | `aboutPageQuery` | every inner page | yes |
| `PageCtaSection` | page document | `pageCtaSection` | `aboutPageQuery` | every inner page | yes |

Reusable documents — one edit changes every page that references them:

| Document | Count | Referenced by | Click-to-edit target |
|---|---|---|---|
| `studentSpotlight` | 4 | `/` | the document itself |
| `newsPost` | 3 | `/` | the document itself |
| `person` | 13 (1 principal + 12 teacher placeholders) | `/about-us` | the document itself |

---
---

# THE ARCHITECTURE CONTRACT

We now have the Jahan International Dream School Home page working with Sanity Visual Editing / Presentation Tool.

The Home page is the reference implementation.

From this point forward, the entire website must follow the EXACT same CMS + visual editing philosophy.

IMPORTANT:

Do NOT treat this as simply "build the remaining pages."

First establish a permanent architecture contract between:

NEXT.JS FRONTEND
↕
SANITY SCHEMAS
↕
SANITY DATA
↕
GROQ QUERIES
↕
TYPESCRIPT TYPES
↕
VISUAL EDITING / PRESENTATION TOOL
↕
SANITY STUDIO

This contract must make the project safe for future development by OpenCode or any other AI coding agent.

==================================================
PART 1 — FIRST AUDIT THE CURRENT PROJECT
========================================

Before modifying anything, inspect the entire existing project.

Understand:

* Next.js structure
* App Router
* Sanity project configuration
* Sanity schemas
* Sanity Studio structure
* Presentation Tool
* Visual Editing
* draft mode
* live preview
* GROQ queries
* image utilities
* reusable components
* existing Home page
* existing CSS/design system
* current reference HTML/assets
* existing navigation
* existing Site Settings
* existing reusable documents
* existing Home content

The Home page is the GOLD STANDARD.

Do not break or unnecessarily refactor the working Home implementation.

==================================================
PART 2 — CREATE A PERMANENT CMS ARCHITECTURE CONTRACT
=====================================================

Create a clear project-level documentation system so future AI agents understand how this project works.

Create or update:

AGENTS.md
WEBSITE_SPEC.md
SANITY_ARCHITECTURE.md
DESIGN_SYSTEM.md

If equivalent documentation already exists, improve it instead of duplicating it.

These files are extremely important.

They must explain that Sanity is the source of truth for all editable website content.

==================================================
PART 3 — THE CORE RULE
======================

PERMANENT RULE:

No user-facing content should be hardcoded into React/Next.js components if that content is intended to be editable from Sanity.

This includes:

* headings
* paragraphs
* labels
* button text
* button URLs
* navigation labels
* navigation URLs
* images
* image alt text
* teacher names
* principal information
* student information
* news
* events
* testimonials
* contact information
* phone numbers
* email addresses
* addresses
* social links
* footer content
* SEO information
* page metadata
* banners
* cards
* badges
* section content

Code controls:

* layout
* spacing
* typography system
* responsive behavior
* animations
* visual design
* component behavior
* icons where appropriate
* structural functionality

Sanity controls:

* content
* content-related images
* links
* repeated content
* visibility
* ordering
* SEO
* site information

==================================================
PART 4 — THE "CHANGE ANYTHING LATER" RULE
=========================================

This is CRITICAL.

Whenever a developer or AI agent changes the UI, it MUST first determine whether the change affects CMS-controlled content.

For EVERY future UI change, follow this process:

1. Identify what changed.
2. Determine whether the changed element contains editable content.
3. If YES:

   * verify the Sanity schema
   * verify the GROQ query
   * verify TypeScript types
   * verify the component data binding
   * verify Visual Editing source mapping
   * verify Presentation Tool click-to-edit
   * verify Studio editing
4. If the UI introduces a new content field:

   * add it to the Sanity schema
   * add validation where appropriate
   * update seed/mock data if necessary
   * update GROQ
   * update TypeScript types
   * update the frontend component
   * update Visual Editing/source maps
   * regenerate Sanity types/schema if required
5. If the UI removes a content field:

   * identify whether existing Sanity data depends on it
   * migrate/remove safely
   * do not silently orphan data
6. If the UI changes a reusable content structure:

   * check every page/component that uses it
   * update all dependent queries/types/components
7. If the UI changes a shared component:

   * check every page using that component
8. Run validation.

NO "frontend-only" CMS changes are allowed when the UI change affects editable content.

==================================================
PART 5 — SHARED COMPONENT CONTRACT
==================================

Every reusable component must have a clearly defined data contract.

For example:

Header
→ receives CMS-controlled navigation/header data

Hero
→ receives CMS-controlled hero data

SectionHeader
→ receives CMS-controlled heading/content

TeacherCard
→ receives a Teacher/Person document

StudentCard
→ receives Student Spotlight document

NewsCard
→ receives News/Event document

Footer
→ receives Site Settings/Footer data

CTA
→ receives CMS-controlled label/link/content

Do not hide CMS queries randomly inside dozens of components.

Prefer:

Sanity query/data layer
→ page data
→ typed component props
→ reusable component

unless there is a strong technical reason otherwise.

==================================================
PART 6 — REUSABLE GLOBAL CONTENT
==================================

Identify all content that should exist once and be reused across the website.

Examples:

Site Settings

* school name
* logo
* contact information
* address
* email
* phone
* social links
* WhatsApp
* footer information

Navigation

* desktop navigation
* dropdowns
* CTA
* mobile navigation

People

* Principal
* Teachers
* Staff where required

SEO / site defaults

These must NOT be duplicated separately on every page.

If the navbar changes in Sanity, every page must automatically use the updated navbar.

If the footer changes in Sanity, every page must automatically use the updated footer.

==================================================
PART 7 — NAVBAR MUST BE FUTURE-PROOF
====================================

The navbar is a shared global component.

Do NOT duplicate navbar markup/data per page.

The navbar should use centralized Sanity data.

If an AI later changes:

* navbar design
* logo placement
* mobile menu
* dropdown design
* CTA position
* navigation animation

the underlying content must still come from Sanity.

If an AI adds a new editable navbar property, it must update:

schema
→ data
→ query
→ type
→ component
→ visual editing

as required.

The UI can change independently from the content architecture.

==================================================
PART 8 — FOOTER MUST BE FUTURE-PROOF
====================================

Same rule for footer.

One reusable Footer component.

One centralized CMS source.

No hardcoded school contact details inside the component.

==================================================
PART 9 — PAGE ARCHITECTURE
==========================

Before building each page, inspect the reference HTML/design and identify:

* page purpose
* sections
* repeated content
* unique content
* global content
* images
* buttons
* links
* cards
* forms
* SEO
* reusable components

Then determine what belongs in:

GLOBAL CMS
REUSABLE DOCUMENTS
PAGE-SPECIFIC CMS
CODE/DESIGN

Do not blindly convert every HTML element into a Sanity field.

Create a clean editorial model.

==================================================
PART 10 — BUILD THE REMAINING PAGES
===================================

After the architecture contract is complete, inspect the provided reference HTML/assets and identify ALL remaining website pages.

Build the remaining pages one by one.

Do not guess page requirements.

Use the reference files already provided in the project.

For every page:

1. Analyze reference HTML.
2. Identify content.
3. Identify assets.
4. Design Sanity schema.
5. Create/reuse Sanity schema.
6. Create GROQ query.
7. Create TypeScript types.
8. Build reusable components.
9. Build page.
10. Connect Sanity.
11. Add Visual Editing support.
12. Add Presentation Tool route/location support where appropriate.
13. Add SEO.
14. Test Studio editing.
15. Test visual click-to-edit.
16. Test responsive frontend.
17. Test build.
18. Only then move to the next page.

==================================================
PART 11 — PAGE TYPES
====================

Use appropriate models.

For singleton pages:

Example:

About Page
Admissions Page
Contact Page
Academics Page

Use a singleton document when the page is unique.

For repeatable content:

News/Event
Teacher
Student Spotlight
Achievement
Gallery item
etc.

Use reusable Sanity documents.

Do not create a separate Sanity document for every tiny section unless there is a real editorial reason.

==================================================
PART 12 — EVERY PAGE MUST SUPPORT VISUAL EDITING
================================================

The Home page is the reference.

Every CMS-controlled element on every new page should participate in Sanity Visual Editing.

For example:

Page heading
→ click → corresponding Sanity field

Paragraph
→ click → corresponding Sanity field

Image
→ click → correct image field

Button
→ click → button field

Teacher card
→ click → corresponding Teacher document

News card
→ click → corresponding News document

Gallery item
→ click → corresponding Gallery data

Section
→ click → corresponding section data

The exact implementation should follow Sanity's current supported Visual Editing architecture.

Do not create a fake overlay system.

==================================================
PART 13 — IMAGES
================

All CMS-controlled images should be managed through Sanity.

Use:

* image asset
* alt text
* crop
* hotspot where appropriate

Do not hardcode image URLs inside components.

Do not randomly duplicate assets.

If two fields intentionally use the same image asset, that is fine.

But the field relationship must be understandable.

Changing:

Hero image

should NOT accidentally change:

About image

unless both fields intentionally reference the same source.

==================================================
PART 14 — CONTENT RELATIONSHIPS
===============================

Use references for reusable entities.

Example:

Home
→ Student Spotlight reference
→ Student Spotlight document

Home
→ News/Event reference
→ News/Event document

People page
→ Teacher documents

Do not duplicate the same person's information in multiple places.

If the teacher's name/photo changes in their Teacher document, every place referencing that teacher should reflect the change.

==================================================
PART 15 — SECTION VISIBILITY AND ORDER
======================================

Where a page contains reorderable sections, maintain a clean section architecture.

The editor should be able to:

* reorder sections
* hide/show sections
* edit section content

without touching code.

Do not create an overly complicated generic page-builder system.

Use typed section structures.

==================================================
PART 16 — SEO
=============

Every page must have CMS-controlled SEO fields where appropriate:

* SEO title
* meta description
* social image
* canonical URL where required
* indexing controls where appropriate

Next.js metadata must consume these Sanity values.

Do not hardcode page SEO titles/descriptions.

Site-wide defaults may come from Site Settings.

Page-specific SEO overrides should come from the page document.

==================================================
PART 17 — URL / LINK ARCHITECTURE
=================================

Create a consistent link model.

Internal links should preferably use structured references or a consistent internal-link strategy.

External links should remain editable URLs.

Do not scatter raw route strings throughout components when they represent CMS-controlled navigation.

However, technical route definitions may remain in code where appropriate.

==================================================
PART 18 — FORMS
===============

If a page contains forms:

The form UI/layout can be code.

Form labels, descriptions, success messages and configurable content should be CMS-controlled when appropriate.

Do not store secrets or API keys in Sanity.

==================================================
PART 19 — SANITY STUDIO UX
==========================

Maintain the improved visual editing workflow.

The Studio should remain understandable to a non-developer.

Use human-readable names.

Avoid exposing unnecessary technical terms.

Keep:

CONTENT

* Home
* People
* Student Spotlights
* News & Events
* etc.

WEBSITE

* Navigation
* Site Settings
* SEO/Social

as appropriate.

The Presentation Tool should remain easy to find.

==================================================
PART 20 — AI DEVELOPMENT SAFETY
===============================

AGENTS.md must contain an explicit section:

"CMS SAFETY RULES FOR AI AGENTS"

Include rules such as:

1. Never hardcode CMS-controlled content.
2. Never remove a Sanity field without checking existing data.
3. Never change a schema without checking dependent queries/components.
4. Never create duplicate global content.
5. Never bypass Sanity for convenience.
6. Never replace a Sanity image with a public-folder image if it is CMS content.
7. Never break Visual Editing.
8. Never assume a UI-only change is harmless.
9. Check shared components before modifying them.
10. Check all pages using a shared schema/component.
11. Run typecheck.
12. Run lint.
13. Run build.
14. Test Studio.
15. Test Presentation Tool.
16. Test at least one edit round-trip.

This documentation is intended for future OpenCode/AI agents.

==================================================
PART 21 — CHANGE IMPACT MAP
===========================

Create a clear documentation table showing:

Component
CMS source
Schema
Query
Pages using it
Visual Editing requirement

Example:

Header
→ Navigation + Site Settings
→ navigation / siteSettings
→ global query
→ every page
→ click-to-edit

Footer
→ Site Settings
→ siteSettings
→ global query
→ every page
→ click-to-edit

Student Card
→ Student Spotlight
→ studentSpotlight
→ page-specific query
→ Home / relevant pages
→ click-to-edit

News Card
→ News Post
→ newsPost
→ page-specific query
→ Home / News
→ click-to-edit

This is important for future AI maintenance.

==================================================
PART 22 — SCHEMA CHANGE PROCEDURE
=================================

Document the exact process for changing Sanity schemas.

When schema changes:

1. modify schema
2. regenerate schema/type definitions as required
3. update GROQ
4. update TypeScript types
5. update frontend
6. update Studio
7. check existing documents
8. test Visual Editing
9. test build

If migration is required, explicitly identify it.

Never silently break existing documents.

==================================================
PART 23 — CONTENT SEEDING
=========================

Use the existing HTML/reference content as initial CMS data where required.

But:

HTML/reference content = INITIAL CONTENT ONLY

Sanity = FINAL SOURCE OF TRUTH

After migration, frontend components must not depend on the HTML reference files.

The reference files should not be imported into runtime website code.

==================================================
PART 24 — DESIGN SYSTEM
=======================

Document the design system so future AI agents do not randomly redesign the website.

Include:

* typography
* spacing
* breakpoints
* buttons
* cards
* section headers
* containers
* colors
* border radius
* shadows
* animation principles
* image treatment
* responsive behavior

The design system controls visual consistency.

Sanity controls content.

These must remain separate.

==================================================
PART 25 — FUTURE UI CHANGE EXAMPLE
==================================

The documentation must explain this example:

Developer later says:

"Make the navbar completely different."

AI agent should:

1. inspect current Header component
2. inspect Navigation schema
3. inspect Site Settings
4. determine whether new UI requires new CMS fields
5. preserve existing CMS data
6. update schema only if necessary
7. update component
8. preserve CMS data binding
9. preserve Visual Editing
10. test all pages
11. test mobile navigation
12. test Presentation Tool
13. run typecheck/lint/build

Another example:

"Add a second CTA to the Hero."

AI must NOT simply hardcode a second button.

It must:

schema
→ button data
→ GROQ
→ types
→ component
→ Visual Editing
→ Studio

Another example:

"Add a badge to every News card."

If the badge is editable:

update News schema
→ update query
→ update type
→ update card
→ Visual Editing

If it is purely decorative:

keep it in code.

==================================================
PART 26 — BUILD QUALITY
=======================

Every page must be:

* production quality
* responsive
* accessible
* semantically structured
* visually consistent
* fast
* SEO-ready
* CMS-driven
* visually editable

Do not sacrifice frontend quality to make CMS integration easier.

Do not sacrifice CMS quality to make frontend development easier.

==================================================
PART 27 — TEST MATRIX
=====================

For every completed page test:

FRONTEND

* desktop
* tablet
* mobile
* navigation
* buttons
* links
* images
* empty states
* loading behavior
* responsive behavior

SANITY

* edit heading
* edit paragraph
* change image
* change image alt
* edit button
* edit URL
* hide section
* reorder section where supported
* edit referenced document
* verify frontend updates

VISUAL EDITING

* click heading
* click paragraph
* click image
* click button
* click reusable card
* verify correct source is targeted

TECHNICAL

* TypeScript
* ESLint
* production build

==================================================
PART 28 — DO NOT OVERENGINEER
=============================

Do not create:

* unnecessary abstraction
* unnecessary schemas
* unnecessary documents
* duplicate content
* duplicate images
* generic page-builder frameworks
* custom visual editors when Sanity provides the feature
* complicated state management
* CMS data stored in local React state unnecessarily

Prefer the simplest architecture that provides the required editorial experience.

==================================================
PART 29 — IMPORTANT DEVELOPMENT ORDER
=====================================

Do NOT immediately start coding every page.

FIRST:

A. Audit current project.

B. Establish/finalize:

* AGENTS.md
* WEBSITE_SPEC.md
* SANITY_ARCHITECTURE.md
* DESIGN_SYSTEM.md

C. Create the change-impact map.

D. Verify the Home implementation remains the reference architecture.

E. Verify global Header/Footer/Navigation/Site Settings architecture.

F. Verify Visual Editing architecture.

ONLY AFTER A-E:

Build the remaining pages one by one.

==================================================
PART 30 — PAGE-BY-PAGE CHECKPOINTS
==================================

After each page:

STOP.

Report:

PAGE:
what was built

SANITY:
what schemas were created/updated

CONTENT:
what documents were created/updated

VISUAL EDITING:
what supports click-to-edit

GLOBAL COMPONENTS:
what was reused

IMAGES:
what assets were imported/reused

TEST:
typecheck
lint
build

Then wait for approval before moving to the next major page.

Do not build the entire site in one uncontrolled operation.

==================================================
FINAL SUCCESS CRITERIA
======================

The finished website must have this architecture:

```
            SANITY
               │
      ┌────────┴────────┐
      │                 │
   GLOBAL           PAGE CONTENT
   CONTENT              │
      │                 │
 Header/Footer      Page Sections
 Navigation         Reusable Docs
 Site Settings      Images
      │                 │
      └────────┬────────┘
               │
          GROQ / TYPES
               │
         NEXT.JS PAGES
               │
        REUSABLE COMPONENTS
               │
        VISUAL EDITING
               │
       SANITY PRESENTATION
               │
          CLICK TO EDIT
```

The system must remain maintainable even if another AI agent takes over the project later.

MOST IMPORTANT:

The website should never reach a situation where:

"Frontend looks perfect, but Sanity doesn't control it."

or:

"Sanity has the content, but clicking the website doesn't know what to edit."

or:

"AI changed the UI and accidentally disconnected the CMS."

The frontend and Sanity must evolve together.

Do not delete working content.

Do not rebuild the Home page unnecessarily.

Do not build unrelated features.

Begin with the architecture audit and documentation.
Then proceed page-by-page using the reference files.

STOP after completing the first remaining page and report the checkpoint.
