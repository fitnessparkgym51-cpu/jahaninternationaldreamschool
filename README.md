# Jahan International Dream School

Next.js 16 (App Router) + Sanity CMS, with the Presentation Tool and click-to-edit
mounted at `/studio`.

**Read `AGENTS.md` first.** It is the binding project contract: what belongs in
Sanity, what belongs in code, and the rules that keep the two from drifting apart.

| Document | What it covers |
|---|---|
| `AGENTS.md` | The contract. Status board, CMS safety rules, change-impact map |
| `WEBSITE_SPEC.md` | Page inventory and the editorial model behind each page |
| `SANITY_ARCHITECTURE.md` | Schemas, GROQ, generated types, seeding |
| `DESIGN_SYSTEM.md` | Tokens and patterns that must not be redesigned |
| `SEO_CHECKLIST.md` | Metadata, robots, sitemap, structured data, local SEO, Search Console |

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

| | |
|---|---|
| Site | <http://localhost:3000> |
| Studio | <http://localhost:3000/studio> |
| Presentation Tool | <http://localhost:3000/studio/presentation> |

## Environment

Copy the variables below into `.env.local`.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | `d04rgvdr` |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | yes | Pinned Sanity API date |
| `NEXT_PUBLIC_SITE_URL` | **yes, in production** | The site origin. Drives `metadataBase`, every canonical URL, `robots.txt`, `sitemap.xml` and the structured data. Locally `http://localhost:3000` |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | yes | Studio origin for click-to-edit. Should equal `NEXT_PUBLIC_SITE_URL` in production |
| `SANITY_API_READ_TOKEN` | for preview | Server-only. Draft content for the Presentation Tool |
| `SANITY_REVALIDATE_SECRET` | for webhooks | Shared secret for the Sanity webhook that calls `/api/revalidate` |
| `SANITY_API_WRITE_TOKEN` | for scripts only | Server-only. Used by the `scripts/seed-*.mjs` scripts, never at runtime |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no | GA4 measurement ID. Unset ⇒ no analytics script is loaded at all |

**Before launch:** set `NEXT_PUBLIC_SITE_URL` to the real production origin. Until
it is set, every canonical URL and the sitemap point at localhost and the site
cannot be indexed. Nothing in the code invents a domain.

## Checks

```bash
npx tsc --noEmit               # types
npm run lint                   # eslint
npm run build                  # production build
node scripts/verify-seo.mjs    # 218 SEO checks (needs a running server)
```

`scripts/verify-*.mjs` all need a server running (`npm run dev`). Each one creates
real drafts, asserts against rendered HTML, and cleans up after itself.
`verify-seo.mjs` is the one that catches a metadata, robots, sitemap,
structured-data or dead-link regression.

## Regenerating the CMS types

After changing a schema or a GROQ query:

```bash
npx sanity schema extract --path schema.json
npx sanity typegen generate
```

Both are required. The second reads the configuration in `sanity-typegen.json`.

## Deploying

Vercel, with the environment variables above set on the project. The
`vercel.json` cron purges complaint submissions older than 30 days.
