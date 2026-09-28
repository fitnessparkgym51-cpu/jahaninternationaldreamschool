# SANITY_ARCHITECTURE.md

How content is modelled, queried, typed and edited. The rules here are binding —
see `AGENTS.md` for the contract they come from.

**Sanity is the source of truth for every piece of editable website content.**
Code owns layout, styling, behaviour and rendering. If you cannot name the Sanity
field a string on the page comes from, that string should not exist in code.

- Project `d04rgvdr`, dataset `production`
- Studio mounted by this app at `/studio`; Presentation Tool at `/studio/presentation`
- Schemas: `src/sanity/schemaTypes/` · Queries: `src/sanity/lib/queries.ts`
- Generated types: `src/sanity/types/sanity.types.ts` · Hand-written public
  types: `src/sanity/types/home.ts`

---

## 1. The pipeline

```
Sanity document
   ↓  GROQ projection      src/sanity/lib/queries.ts
Typed result
   ↓  sanityFetch          src/sanity/lib/live.ts   (perspective + stega + tags)
   ↓  cache()              src/sanity/lib/fetch.ts  (one round trip per render)
Page props
   ↓
Server component          src/components/**
   ↓
Client islands            only where interaction demands it
```

Three invariants:

1. **Components never query Sanity.** A component receives typed props. The page
   file is the only place that fetches. (`HomeSections` is the one deliberate
   exception in shape: it *maps* over already-fetched sections, it does not fetch.)
2. **One query per page render.** Site chrome and page content are fetched in a
   single `defineQuery` returning an object, so the whole page costs one request.
3. **Queries are projections, never `*`.** Every field the frontend reads is named
   explicitly, so the Studio's Vision plugin and the frontend cannot disagree.

---

## 2. Request pipeline: perspective, stega, tags

`src/sanity/lib/live.ts` wraps the client in `defineLive({client, serverToken,
browserToken})`. `sanityFetch` then does three things:

- **Perspective** — published content normally; drafts when `draftMode().isEnabled`.
- **Stega** — invisible characters encoding document id + field path + Studio URL.
  On **only** in Draft Mode, so published HTML stays clean.
- **Cache tags** — so `<SanityLive />` can revalidate exactly what changed.

Two consequences that are easy to get wrong:

- **Never `stegaClean` a value you render as text.** That is what makes it
  click-to-edit. `stegaClean` is only for values used as a *lookup* (`href`,
  `class`, icon name, `variant`) or written into `<title>`/`<meta>`.
- **SEO is fetched separately** with `stega: false` (`pageSeoQuery`). Stega inside
  `<title>` or `content=` is invisible in a browser and corrupts every search
  engine and social scraper.

`src/app/(site)/layout.tsx` mounts `<SanityLive />` unconditionally and
`<VisualEditing />` only inside Draft Mode. The Studio lives in the same Next app
at `/studio`, which is exactly why these are in a route-group layout and not the
root layout — initialising visual editing at the root would attach overlays to
the Studio's own context.

---

## 3. Click-to-edit: the two mechanisms

Implemented in `src/lib/editing.ts`. Both are required, for different values.

**a) Stega (free, automatic).** Any string rendered as text — or used as an `alt`
attribute — is click-to-edit with no extra code.

**b) `data-sanity` (explicit).** Required for values that carry no string: image
assets, booleans, and URLs we deliberately do not encode.

```ts
editAttribute({id, type, path})   // → data-sanity="…"
editTargetAttr                    // → data-sanity-edit-target (whole subtree)
sectionPath(key, ...rest)         // → ['sections', {_key}, ...rest]
```

`data-sanity-edit-target` on a container makes one click open the nearest shared
ancestor of everything inside it. That is how a whole section, card or person
card becomes a single click target.

Reusable documents (`studentSpotlight`, `newsPost`, `person`) are targeted
**directly at their own document id and type**, not at the referencing page. That
is what makes a click on a teacher card open the teacher document.

### Adding a field to a section

The edit path is positional, so a new field must be wired in three places or it
silently will not be clickable:

1. the GROQ projection,
2. the `data-sanity` attribute on the element,
3. the type.

There is no automatic path inference. A field that renders but has no
`data-sanity` and no stega string is invisible to the Presentation Tool.

---

## 4. Schema inventory

### Documents

| Type | Title | Model | Notes |
|---|---|---|---|
| `homePage` | Home page | singleton, fixed id `homePage` | `sections[]` array |
| `siteSettings` | Site settings | singleton, fixed id `siteSettings` | brand, contact, postal address, footer, floating button, SEO defaults |
| `complaintPage` | Complaint Box page | singleton, fixed id `complaintPage` | heading + intro only. **No `seo` block** — the page is kept out of the index by policy, declared in `src/lib/routes.ts`, so the CMS cannot publish it by accident |
| `navigation` | Navigation | singleton, fixed id `navigation` | top bar + header menu |
| `studentSpotlight` | Student spotlight | reusable | referenced by Home |
| `newsPost` | News & event | reusable | referenced by Home |
| `person` | Person | reusable | 1 principal + 12 teacher placeholders; referenced by About || `aboutPage` | About page | singleton, fixed id `aboutPage` | `sections[]` array |

### Reusable objects (`schemaTypes/objects/`)

| Type | Purpose |
|---|---|
| `imageWithAlt` | Image asset + required alt. Hotspot enabled. **Every** CMS image uses this. |
| `link` | Label + URL + new-tab. |
| `button` | Label + URL + new-tab + one of five `variant`s. |
| `sectionHeader` | Heading + subheading for card grids. |
| `seo` | metaTitle, metaDescription, shareImage, canonicalUrl, appendSiteName, noIndex. Resolution, title composition and the draft-mode `noindex` live in `src/lib/metadata.ts`; see `SEO_CHECKLIST.md` §2. |
| `brand`, `contactBlock`, `postalAddress`, `socialLink`, `footer`, `socialPreviewCard`, `mapCard`, `floatingContact` | Site settings building blocks. `postalAddress` is the structured form of `contactBlock.address`, used only for search-engine data. |
| `topBarLink`, `navChildLink`, `navItem`, `topBar`, `header` | Navigation building blocks. |

### Section objects (`schemaTypes/objects/sections.ts`)

Home sections: `heroSection` (+`heroSlide`), `statsBarSection` (+`statItem`),
`featuresSection` (+`featureCard`), `aboutStorySection`,
`studentSpotlightSection`, `admissionBannerSection`, `newsSection`,
`reviewBarSection`.

Inner-page sections: `pageHeroSection` (+`breadcrumbItem`), `principalSection`,
`peopleGridSection`, `pillarsSection` (+`pillarCard`), `pageCtaSection`.

**Every section object starts with the shared `enabled` field** ("Show this
section on the website") in a `settings` group, and the page's `sections` array
gives ordering by drag. There is no generic page-builder field; sections are
typed.

---

## 5. The singleton pattern

A singleton is a document with a **fixed `_id` equal to its type name**. That is
what lets the GROQ be `*[_type == "aboutPage"][0]` with no slug lookup, and what
stops an editor accidentally creating a second one.

In the Studio, `src/sanity/structure.ts` registers each singleton with
`singletonItem(S, 'aboutPage')`, which pins `.documentId('aboutPage')` so the
document list shows a single, stable entry instead of a "create" button.

If you add a singleton: add the type, add it to `SINGLETONS` in `structure.ts`,
use its type name as the `_id` when seeding, and query it with `[_type == "…"][0]`.

---

## 6. Reusable documents and references

Reference, never duplicate. A page holds `{_type: 'reference', _ref: id}`; GROQ
dereferences with `[]->`.

```groq
"principal": principal->{ "id": _id, name, … }
```

Dereferenced reusable documents must project `"id": _id`, because the frontend
needs the real document id to build its click-to-edit target.

Deleting or renaming a field on a reusable document affects **every** page that
references it. Check the impact map in `WEBSITE_SPEC.md` first.

---

## 7. Images

- All CMS images are `imageWithAlt`: `{image: {asset, crop, hotspot}, alt}`.
- Rendered by `<SanityImage>`, which builds a CDN URL via `@sanity/image-url` and
  `stegaClean`s the asset reference (the builder splits `_ref` on `-`, and stega
  characters would corrupt the URL).
- Uploads are de-duplicated by Sanity by content hash, so reusing the same file
  for two fields costs one asset. Two fields pointing at one asset is fine and
  often intentional — make sure it *is* intentional.
- `globals.css` and components contain no CMS image URLs. The only local images
  are `favicon.ico` and `next/font`, neither of which is CMS content.

---

## 8. Type generation

`sanity.types.ts` is **generated — never hand-edited**.

```bash
npx sanity typegen generate        # reads schema.json, queries, documents
```

`sanity.cli.ts` + `schema.json` drive it. `src/sanity/types/home.ts` derives its
public types from the generated result types via `Extract<…, {_type: '…'}>`,
which is what makes a schema/query drift a **type error** rather than a runtime
`undefined`.

Re-run typegen after changing any schema field or GROQ projection. Commit the
regenerated files.

---

## 9. Schema change procedure

Follow in order. Steps 3–5 are not optional.

1. **Edit the schema** in `src/sanity/schemaTypes/**`.
2. **Check existing data.** Query every affected document for documents that
   would break. A removed/renamed field orphans data silently — there is no
   runtime error, the field just renders as `undefined`.
3. **Decide: additive, or a migration?**
   - *Additive* (new optional field, or a field with a sensible
     `initialValue`): no migration needed. Ship it.
   - *Destructive* (rename, retype, or make required): write a migration and say
     so explicitly in the checkpoint report. Never do this silently.
   - *Required with no default*: first add it as optional, backfill, then tighten.
4. **Update the GROQ projection** in `queries.ts`. A field missing from the
   projection is `undefined` in the component no matter what the schema says.
5. **Update `sanity.types.ts`** via `npx sanity typegen generate`.
6. **Update the component**: read the field, add `data-sanity`, handle the empty
   case.
7. **Check every dependent page/component** using the impact map.
8. **Update the Studio UX** if the editor-facing wording changed.
9. **Run** `npx tsc --noEmit`, `npm run lint`, `npm run build`, and the
   verification scripts.
10. **Test a round trip** in the Presentation Tool.

---

## 10. Studio structure

`src/sanity/structure.ts` groups the sidebar the way an administrator thinks:

```
Content
  Home page            (singleton)
  ──────
  News & events        (document list)
  Student spotlights   (document list)
  People               (document list)
  ──────
  Site settings        (singleton)
  Navigation           (singleton)
  About page           (singleton)
```

Field titles are written for a non-developer: "Button text", not `label`;
"Show this section on the website", not `enabled`. Keep it that way. Developer
vocabulary (GROQ, document id, reference id) must not appear in field titles.

---

## 11. Presentation Tool

`src/presentation/resolve.ts`:

- **`mainDocuments`** — route ↔ document, so opening `/about-us` in the preview
  opens the About document in the Studio, and vice versa. **Every built page must
  be listed here.**
- **`locations`** — where a document is used. Pages and reusable documents get a
  `defineLocations` that returns real `href`s (including `#anchor`s). Global
  singletons get a `message`/`tone` pair instead, because they have no single
  URL.

When you build a page, add its resolver in the same change. A page that is not
registered is navigable but not editable from the navigator.

---

## 12. Seeding

`JIDS/` is **initial content only**. It must never be imported into runtime code.
Images are downloaded to the gitignored `.seed-assets/` and uploaded to Sanity;
after that the website reads only Sanity.

| Script | Scope | Use when |
|---|---|---|
| `node scripts/seed.mjs` | Wipes/replaces **everything** (site settings, navigation, Home, all reusable docs, all assets) | Full bootstrap only. Destructive. `--clean` deletes every document first. |
| `node scripts/seed-about-us.mjs` | **Additive.** Creates/replaces only the About page + the 13 `person` documents and uploads only the one image they need | Working on the About page. Safe to re-run; never touches Home. |
| `node --env-file=.env.local scripts/seed-seo.mjs` | **Data only, no schema change.** Applies the SEO and local-SEO corrections: page titles, the Contact and Branch SEO blocks, the hero/About headings, and the Tongi/Gazirpur NAP across every document. `--apply` writes; without it, it prints a diff | After changing site identity or contact details. Idempotent: re-run it to detect drift. |

Prefer the additive script. `seed.mjs` replaces documents wholesale, so re-running
it after hand-editing content in the Studio discards those edits.

Auth: `SANITY_API_WRITE_TOKEN`, or a stored `npx sanity login` token.

---

## 13. Draft Mode, webhooks, and the token boundary

- **Draft enable** `/api/draft-mode/enable` validates a `sanity.previewUrlSecret`
  before setting the cookie. Unauthenticated requests get 401.
- **Disable** `/api/draft-mode/disable` clears it.
- **Revalidate** `/api/revalidate` requires a valid `sanity-webhook-signature`
  (HMAC over `timestamp.body` with `SANITY_REVALIDATE_SECRET`) and rejects
  unsigned requests with 401.
- **Production needs a webhook** pointed at
  `https://<your-site>/api/revalidate`. This cannot be created for `localhost`.

Token boundary — do not regress this:

| Token | Where it may appear |
|---|---|
| `SANITY_API_READ_TOKEN` (Viewer) | Server only, plus the `<SanityLive>` browser subscription **in Draft Mode only**. It must be read-scoped. |
| Studio session token | Never in any app output. |
| `SANITY_REVALIDATE_SECRET` | Server only. |

`scripts/verify-visual-editing.mjs` proves all of this, including that the read
token cannot write. A published page and its client chunks must contain no token
at all.

---

## 14. Verification

| Script | Asserts |
|---|---|
| `node scripts/verify-visual-editing.mjs` | Published page is stega-free; drafts stay hidden; preview shows drafts and mounts overlays; stega strings carry sources; images/links/cards carry `data-sanity`; reusable docs targeted directly; no stega in `href`/`class`/`<title>`; token exposure and permissions. Mutates and restores the Home hero heading. |
| `node scripts/verify-sections.mjs` | Webhook rejects unsigned / accepts signed; hiding a section removes it; reordering changes render order; restore is exact; reusable doc counts unchanged. |
| `node scripts/verify-about-us.mjs` | About-specific round trip: heading, paragraph, image, alt text, button label, button URL, section hide, section reorder, referenced `person` edit, click-to-edit targets, published/preview stega separation. |

Both original scripts are Home-specific by design and must stay at their current
pass counts. If one fails, **the change is wrong** — not the script.
