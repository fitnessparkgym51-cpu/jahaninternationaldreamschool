import {PageJsonLd} from '@/components/seo/JsonLd'
import type {Metadata} from 'next'

import {AdmissionsSections} from '@/components/admissions/AdmissionsSections'
import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {buildPageMetadata} from '@/lib/metadata'
import {getAdmissionsPageData} from '@/sanity/lib/fetch'

/**
 * The Admissions page (`/admissions`).
 *
 * Follows the Home and About pages exactly: the same site chrome, the same
 * section-array rendering, the same SEO pattern. It reuses `PageHeroSection` and
 * `PageCtaSection` from the shared component system and adds four section types
 * that other pages can reuse.
 *
 * The route matches the `Admissions` item in the Navigation document, so the
 * navigation drives the URL, not the other way round.
 */
export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({type: 'admissionsPage', pathname: '/admissions'})
}

export default async function AdmissionsPage() {
  const {admissions, navigation, siteSettings} = await getAdmissionsPageData()

  const sections = admissions?.sections ?? []
  const pageId = admissions?.id ?? 'admissionsPage'
  const navigationId = navigation?.id ?? 'navigation'
  const settingsId = siteSettings?.id ?? 'siteSettings'

  return (
    <>
      <PageJsonLd type="admissionsPage" pathname="/admissions" />

      <Header
        documentId={navigationId}
        siteSettingsId={settingsId}
        header={navigation?.header}
        brand={siteSettings?.brand}
        topBar={navigation?.topBar}
      />

      <main className="flex-1">
        <AdmissionsSections documentId={pageId} sections={sections} />
      </main>

      <Footer documentId={settingsId} footer={siteSettings?.footer} brand={siteSettings?.brand} />
      <FloatingContact documentId={settingsId} floatingContact={siteSettings?.floatingContact} />
    </>
  )
}
