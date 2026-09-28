import {PageJsonLd} from '@/components/seo/JsonLd'
import type {Metadata} from 'next'

import {BranchLanding} from '@/components/branch/BranchLanding'
import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {buildPageMetadata} from '@/lib/metadata'
import {sanityFetch} from '@/sanity/lib/live'
import {branchPageQuery} from '@/sanity/lib/queries'
import type {BranchPageQueryResult} from '@/sanity/types/sanity.types'

/** The Branch landing page (`/branch`). */
export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({type: 'branchPage', pathname: '/branch'})
}

export default async function BranchPage() {
  const {data} = await sanityFetch({query: branchPageQuery})
  const {branch, navigation, siteSettings} = data as BranchPageQueryResult
  const settingsId = siteSettings?.id ?? 'siteSettings'

  return (
    <>
      <PageJsonLd type="branchPage" pathname="/branch" />

      <Header
        documentId={navigation?.id ?? 'navigation'}
        siteSettingsId={settingsId}
        header={navigation?.header}
        brand={siteSettings?.brand}
        topBar={navigation?.topBar}
      />
      <main className="flex-1">{branch ? <BranchLanding branch={branch} /> : null}</main>
      <Footer documentId={settingsId} footer={siteSettings?.footer} brand={siteSettings?.brand} />
      <FloatingContact documentId={settingsId} floatingContact={siteSettings?.floatingContact} />
    </>
  )
}
