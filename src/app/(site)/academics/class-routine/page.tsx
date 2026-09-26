import type {Metadata} from 'next'

import {ClassRoutineSections} from '@/components/routine/ClassRoutineSections'
import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {buildMetadata} from '@/lib/metadata'
import {getClassRoutinePageData, getClassRoutinePageSeo} from '@/sanity/lib/fetch'

/**
 * The Class Routine page (`/academics/class-routine`).
 *
 * Follows the same structure as every other page: the same site chrome, the same
 * section-array rendering, the same SEO pattern. It adds one new section type
 * (`routineSection`) and reuses three shared ones.
 *
 * The route matches the `Academics` → "Class Routine" item in the Navigation
 * document, so the navigation drives the URL, not the other way round.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const {page, site} = await getClassRoutinePageSeo()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

  return buildMetadata({
    pageSeo: page,
    siteSeo: site,
    url: siteUrl ? `${siteUrl}/academics/class-routine` : undefined,
  })
}

export default async function ClassRoutinePage() {
  const {routine, navigation, siteSettings} = await getClassRoutinePageData()

  const sections = routine?.sections ?? []
  const pageId = routine?.id ?? 'classRoutinePage'
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
        <ClassRoutineSections documentId={pageId} sections={sections} />
      </main>

      <Footer documentId={settingsId} footer={siteSettings?.footer} brand={siteSettings?.brand} />
      <FloatingContact documentId={settingsId} floatingContact={siteSettings?.floatingContact} />
    </>
  )
}
