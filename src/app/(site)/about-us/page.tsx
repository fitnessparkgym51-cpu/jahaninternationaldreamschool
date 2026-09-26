import type {Metadata} from 'next'

import {AboutSections} from '@/components/about/AboutSections'
import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {buildMetadata} from '@/lib/metadata'
import {getAboutPageData, getAboutPageSeo} from '@/sanity/lib/fetch'

/**
 * The About page (`/about-us`).
 *
 * Follows the Home page's structure exactly: the same site chrome, the same
 * section-array rendering, the same SEO pattern. The only difference is the query
 * and the document type — which is the point of the architecture.
 *
 * The route matches the `About us` item in the Navigation document, so the
 * navigation drives the URL, not the other way round.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const {page, site} = await getAboutPageSeo()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

  return buildMetadata({pageSeo: page, siteSeo: site, url: siteUrl ? `${siteUrl}/about-us` : undefined})
}

export default async function AboutPage() {
  const {about, navigation, siteSettings} = await getAboutPageData()

  const sections = about?.sections ?? []
  const aboutId = about?.id ?? 'aboutPage'
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
        <AboutSections documentId={aboutId} sections={sections} />
      </main>

      <Footer documentId={settingsId} footer={siteSettings?.footer} brand={siteSettings?.brand} />
      <FloatingContact documentId={settingsId} floatingContact={siteSettings?.floatingContact} />
    </>
  )
}
