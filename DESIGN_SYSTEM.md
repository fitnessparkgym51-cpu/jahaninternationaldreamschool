# DESIGN_SYSTEM.md

How this website looks, and — just as importantly — what must **not** be changed.

The design system is **code**. Content is **Sanity**. They never mix. If a request
would move a colour, font, radius or spacing value into Sanity, it is a design
change and needs a human decision, not an editor field.

The Home page (`/`) is the reference implementation. When in doubt, open a Home
section component and copy its approach. Do not invent a second visual language.

---

## 1. Tokens

All tokens live in **one** place: the `@theme inline` block at the top of
`src/app/globals.css`. They are consumed as ordinary Tailwind utilities
(`bg-jids-green`, `text-jids-orange`, …). There are no other colour definitions
anywhere in the codebase — no hex literals in components, no `tailwind.config`
colours, no CSS-module variables.

| Token | Value | Used for |
|---|---|---|
| `jids-green` | `#0d5c2e` | Primary brand. Headings, buttons, icons, hero overlays. |
| `jids-green-deep` | `#0b4724` | Hover/active state of green. |
| `jids-green-top` | `#0e4d26` | Top-bar / darkest header band. |
| `jids-green-soft` | `#eaf5ee` | Badge / pill backgrounds. |
| `jids-green-tint` | `#f0f9f3` | Alternating section background. |
| `jids-green-line` | `#d4ebd9` | Borders on soft backgrounds. |
| `jids-card-line` | `#d6ebd9` | Card borders. |
| `jids-icon-bg` | `#eaf6ee` | Icon tile background. |
| `jids-gold` | `#f5b301` | Accent in gradients, star ratings. |
| `jids-gold-dark` | `#dfa200` | Gold hover. |
| `jids-gold-light` | `#fff9e6` | Gold tint background. |
| `jids-orange` | `#f23a11` | Primary CTA. Admissions, "Book a visit". |
| `jids-orange-dark` | `#db2e08` | Orange hover. |

Neutrals come from Tailwind's default scale (`gray-*`, `white`). The body text
colour is `--foreground: #1e293b` and the page background is `--background`.

> The reference HTML used a different green ramp (`#17562f`, `#114224`,
> `#0f381e`) and a different orange (`#f24822`). The values above are the
> project's established tokens, extracted from the built Home page. **Do not
> "restore" the reference hexes** — they were superseded deliberately.

### Dark mode

`globals.css` contains a `prefers-color-scheme: dark` block that only swaps
`--background`/`--foreground`. The site has no real dark theme and the brand
greens do not adapt. Leave this alone unless a dark theme is explicitly
requested; it is not a design-system feature yet.

---

## 2. Typography

- **Font:** Plus Jakarta Sans, exposed as `--font-plus-jakarta` and mapped to
  `--font-sans` in `@theme`. Loaded by `next/font` in `src/app/layout.tsx`.
  Never add a second font family.
- **Weights in use:** 400 (body), 600 (`font-semibold`, labels), 700
  (`font-bold`, buttons/nav), 800 (`font-extrabold`, page and section headings).

Heading scale (all `font-extrabold`, `tracking-tight`, `text-gray-900` unless
noted):

| Level | Classes | Where |
|---|---|---|
| Page `h1` | `text-3xl sm:text-4xl lg:text-5xl` | Hero banner heading |
| Section `h2` | `text-2xl sm:text-3xl lg:text-4xl` | Section headings |
| Card `h3` | `text-lg` / `text-base` | Card titles, pillar titles |
| Body | `text-base sm:text-lg` (feature sections), `text-sm sm:text-base` (dense sections) | Paragraphs |
| Eyebrow / label | `text-xs font-bold uppercase tracking-wider` | Pills, meta lines, card kickers |

Body copy is `text-gray-600` with `leading-relaxed`. Never set body text in
`text-gray-900` — headings own that.

The reference used justified body text in the principal's message
(`text-justify`). This was **not** carried over: justified text with no
hyphenation produces rivers on mobile. Paragraphs are left-aligned.

---

## 3. Layout & containers

- **Container:** `mx-auto max-w-7xl` with `px-4 sm:px-8`. This exact pairing is
  used by every section on the site. Do not introduce a second max-width.
- **Narrow variant:** `max-w-4xl` for centred hero/CTA blocks, `max-w-3xl` for
  centred section headers.
- **Section padding:** `py-16 sm:py-20` for standard sections. The Home page adds
  `px-4 sm:px-8`.
- **Section rhythm:** separate sections with `border-t border-gray-100` and
  alternate `bg-white` / `bg-gray-50/70`. Do not use large arbitrary margins
  between sections; padding does that job.
- **Grid:** Tailwind `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-4` for card
  grids; `lg:grid-cols-12` for two-column image/text splits (image `col-span-5`
  or `6`, text the remainder).

---

## 4. Surfaces

**Cards** — the standard card is:

```
rounded-2xl border border-gray-100 bg-white shadow-sm
hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
```

Feature/news/student cards that use the `card-soft-hover` class get the larger
lift defined in `globals.css` (`translateY(-6px)` + green-tinted shadow). Use
`card-soft-hover` on grids; use the inline form above on single cards.

**Radii:** `rounded-lg` (inputs, small buttons, icon tiles), `rounded-xl` /
`rounded-2xl` (cards, image frames), `rounded-full` (pills, avatars, icon
circles). `rounded-3xl` is reserved for the large Home story image.

**Shadows:** `shadow-sm` at rest, `shadow-md` on hover, `shadow-xl` only on
framed photographs.

**Borders:** `border-gray-100` on white, `border-gray-200` on tinted
backgrounds, `border-white/10` inside dark bands.

**Icon tiles:** `w-12 h-12 rounded-lg` with a tinted background
(`bg-jids-icon-bg`, `bg-green-50`, `bg-red-50`, `bg-yellow-50`) and a coloured
glyph.

---

## 5. Buttons

Never hand-write a button's colours. Render CMS buttons with `ButtonLink` from
`src/components/ui/SmartLink.tsx`, which maps the CMS `variant` to a fixed class
set. The five variants and their meaning:

| Variant | Class set | Meaning |
|---|---|---|
| `primary` | orange fill | The one main action. |
| `green` | green fill | Secondary main action, brand-coloured. |
| `outline` | green border, green text | Tertiary / paired action. |
| `light` | white/80 border on a coloured band | Glassy action on a dark band (Home admissions banner). |
| `invert` | solid white border, fills white on hover | Closing-band action that inverts (About page CTA). |
| `link` | text + underline | Tertiary navigation, no border. |

Every button gets `btn-shine btn-press` (shine sweep on hover, scale-down on
press). Sizing convention: `px-6 py-2.5 text-sm` inline,
`px-8 py-2.5 text-sm sm:text-base` for a full-width CTA band.

This is a **code** decision. The editor picks *which* button and *where* it
points; they never pick colours.

---

## 6. Section headers

Centred variant (used by the teachers grid, pillars, curriculum highlights):

```tsx
<div className="mx-auto max-w-3xl text-center">
  <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">…</h2>
  <div className="title-accent-bar" />
  <p className="mt-4 text-sm text-gray-600 sm:text-base">…</p>
</div>
```

`title-accent-bar` is the green→gold gradient rule in `globals.css`. It
self-animates when a parent `.is-revealed` exists. Use it for every centred
section header; do not substitute a plain `bg-jids-orange` bar.

Left-aligned variant (used by two-column sections) has no accent bar — the
heading and an optional pill (`bg-jids-green-soft text-jids-green`) carry it.

---

## 7. Motion

All scroll reveal is the `Reveal` component (`src/components/ui/Reveal.tsx`).
Rules:

- Wrap block-level content. Never wrap a single word.
- `direction="up"` (default) for stacked content, `"left"`/`"right"` for the two
  halves of an image/text split, `"zoom"` for a single hero object.
- Stagger grids with `delay={index * 80}`.
- The component adds `is-revealed` on the DOM node directly — no React state, so
  a page of reveals costs no extra renders. It has a 4-second failsafe and
  respects `prefers-reduced-motion`.

Existing CSS animations: `jidKenBurns` (hero), `jidFadeUp` (hero content),
`jidFloat` (map pin), `jidPulseRing` (WhatsApp button), `btn-shine` sweep.
`globals.css` has a global `prefers-reduced-motion` block that neutralises all of
them. Do not add a new animation without a reduced-motion fallback.

---

## 8. Images

- Always `<SanityImage>` (`src/components/ui/SanityImage.tsx`) with `fill`; the
  **parent** owns the aspect ratio and `overflow-hidden`. Never hardcode a
  `/public` path for CMS content.
- Reference aspect ratios: hero `16/9`; about/story `4/3`; portrait cards `4/5`;
  news cards `16/10`; principal portrait `4/3.5`.
- `sizes` is mandatory on every responsive image — it is what stops the browser
  downloading a 1600px file into a 400px slot.
- Alt text is a **required** CMS field (`imageWithAlt`). If a decorative image
  genuinely carries no meaning, it should not be a CMS image field at all.
- `sourceWidth` should be the largest width the layout can actually display.

---

## 9. Responsive behaviour

Breakpoints are Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

- The desktop navigation is `hidden lg:flex`; below `lg` the header shows the
  hamburger and the slide-out `jid-mobile-menu`.
- Card grids collapse 4 → 2 → 1 at `lg` / `sm`.
- Section padding and font sizes step up at `sm` and `lg`.
- `body { overflow-x: hidden }` is set globally as a safety net. **Do not rely on
  it** — if a page scrolls horizontally, the cause is a fixed-width element and
  must be fixed properly.

---

## 10. Accessibility (non-negotiable)

- One `h1` per page; headings in order, no level skipped.
- Semantic elements: `<section>` for page regions, `<article>` for repeated
  cards, `<nav aria-label>` for navigation, `<main>` once per page.
- Every image has CMS alt text. Every icon-only control has an accessible name.
- Focus states must stay visible — do not add `outline-none` without an
  equivalent `focus-visible` ring.
- Never use an image to render text. Never convey state by colour alone (the
  `Placeholder` badge in the reference teacher cards is a known a11y smell; the
  built version does not reproduce it).
- Colour contrast: `text-gray-500` on white is the lightest permitted body tone.

---

## 11. What must NOT be redesigned

Without an explicit instruction to do otherwise:

1. The token palette in `globals.css`.
2. The font family and the heading scale.
3. The `max-w-7xl` + `px-4 sm:px-8` container.
4. The five button variants and their class mapping.
5. The `Header`, `TopBar`, `Footer` and `FloatingContact` chrome.
6. The `title-accent-bar`, `card-soft-hover`, `reveal` and `btn-*` primitives.
7. Any existing Home page section.

If a future request is "make it look different", the correct sequence is:
inspect the component, change only the classes, keep every CMS binding, keep
`data-sanity`, then re-run the checks in `AGENTS.md`. The design changes; the
content architecture does not.
