import {PageJsonLd} from '@/components/seo/JsonLd'
import type {Metadata} from 'next'

import {AcademicsSections} from '@/components/academics/AcademicsSections'
import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {buildPageMetadata} from '@/lib/metadata'
import {getAcademicsPageData} from '@/sanity/lib/fetch'

/**
 * The Academics page (`/academics`) — classes offered and curriculum highlights.
 *
 * Follows the same structure as Home, About and Admissions: the same site chrome,
 * the same section-array rendering, the same SEO pattern. It adds one new section
 * type (`classTableSection`) and reuses three shared ones.
 *
 * The route matches the `Academics` → "Classes & Curriculum" item in the
 * Navigation document, so the navigation drives the URL, not the other way round.
 */
export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({type: 'academicsPage', pathname: '/academics'})
}

export default async function AcademicsPage() {
  const {academics, navigation, siteSettings} = await getAcademicsPageData()

  const sections = academics?.sections ?? []
  const pageId = academics?.id ?? 'academicsPage'
  const navigationId = navigation?.id ?? 'navigation'
  const settingsId = siteSettings?.id ?? 'siteSettings'

  return (
    <>
      <PageJsonLd type="academicsPage" pathname="/academics" />

      <Header
        documentId={navigationId}
        siteSettingsId={settingsId}
        header={navigation?.header}
        brand={siteSettings?.brand}
        topBar={navigation?.topBar}
      />

      <main className="flex-1">
        <AcademicsSections documentId={pageId} sections={sections} />
      </main>

      <Footer documentId={settingsId} footer={siteSettings?.footer} brand={siteSettings?.brand} />
      <FloatingContact documentId={settingsId} floatingContact={siteSettings?.floatingContact} />
    </>
  )
}
