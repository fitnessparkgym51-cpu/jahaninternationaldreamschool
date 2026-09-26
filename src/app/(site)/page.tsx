import type {Metadata} from 'next'

import {HomeContentMissing} from '@/components/home/HomeContentMissing'
import {HomeSections} from '@/components/home/HomeSections'
import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {buildMetadata} from '@/lib/metadata'
import {getHomePageData, getHomePageSeo} from '@/sanity/lib/fetch'

/**
 * Rendered on every request so Studio edits appear immediately. The data fetch
 * is tagged by Sanity, so `<SanityLive />` can also refresh it in place when an
 * editor publishes or saves a draft.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const {page, site} = await getHomePageSeo()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

  return buildMetadata({pageSeo: page, siteSeo: site, url: siteUrl ? `${siteUrl}/` : undefined})
}

export default async function HomePage() {
  const {home, navigation, siteSettings} = await getHomePageData()

  const sections = home?.sections ?? []
  const homeId = home?.id ?? 'homePage'
  const navigationId = navigation?.id ?? 'navigation'
  const settingsId = siteSettings?.id ?? 'siteSettings'

  return (
    <>
      <Header
        documentId={navigationId}
        siteSettingsId={settingsId}
        header={navigation?.header}
        brand={siteSettings?.brand}
        topBar={navigation?.topBar}
      />

      <main className="flex-1">
        {sections.length ? (
          <HomeSections documentId={homeId} sections={sections} />
        ) : (
          <HomeContentMissing />
        )}
      </main>

      <Footer documentId={settingsId} footer={siteSettings?.footer} brand={siteSettings?.brand} />
      <FloatingContact documentId={settingsId} floatingContact={siteSettings?.floatingContact} />
    </>
  )
}
