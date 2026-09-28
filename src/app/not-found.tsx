import type {Metadata} from 'next'
import Link from 'next/link'

import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {getNavigation, getSiteSettings} from '@/sanity/lib/fetch'

/**
 * The site-wide 404 page.
 *
 * Next.js renders this for any URL that matches no route, with a real HTTP 404
 * status — it is not a redirect and it is not the home page. That distinction
 * matters: sending every missing URL to `/` would be a soft-404 at best, and
 * search engines are told to ignore such URLs.
 *
 * It reuses the real site chrome, so a mistyped link still looks like the school
 * rather than a bare error string. The school name comes from `siteSettings`, and
 * the destination list follows the `navigation` document, so nothing here can
 * drift out of date or point at a page that does not exist.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Page not found',
  // A 404 must never be indexed, and it must not be indexed *as* the home page
  // either, so it deliberately carries no canonical URL.
  robots: {index: false, follow: true},
}

export default async function NotFound() {
  const [navigation, siteSettings] = await Promise.all([getNavigation(), getSiteSettings()])
  const settingsId = siteSettings?.id ?? 'siteSettings'
  // A type predicate, not .filter(Boolean): a GROQ array can hold nulls.
  const items = (navigation?.header?.items ?? []).filter(
    (item): item is NonNullable<typeof item> & {url: string} => Boolean(item?.url),
  )

  return (
    <>
      <Header
        documentId={navigation?.id ?? 'navigation'}
        siteSettingsId={settingsId}
        header={navigation?.header}
        brand={siteSettings?.brand}
        topBar={navigation?.topBar}
      />

      <main className="flex-1 bg-jids-green-tint">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-jids-green">Error 404</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-jids-green-deep sm:text-4xl">
            We could not find that page
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-600">
            The link may be out of date or mistyped. The pages below are the ones
            parents and students use most.
          </p>

          <nav aria-label="Suggested pages" className="mt-8 flex flex-wrap justify-center gap-3">
            {items.map((item) => (
              <Link
                key={item._key}
                href={item.url}
                className="rounded-lg border border-jids-green px-4 py-2 text-sm font-semibold text-jids-green transition-colors hover:bg-jids-green hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </main>

      <Footer documentId={settingsId} footer={siteSettings?.footer} brand={siteSettings?.brand} />
      <FloatingContact documentId={settingsId} floatingContact={siteSettings?.floatingContact} />
    </>
  )
}
