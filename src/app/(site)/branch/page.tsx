import type {Metadata} from 'next'

import {BranchLanding} from '@/components/branch/BranchLanding'
import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {buildMetadata} from '@/lib/metadata'
import {getPageSeo} from '@/sanity/lib/fetch'
import {sanityFetch} from '@/sanity/lib/live'
import {branchPageQuery} from '@/sanity/lib/queries'
import type {BranchPageQueryResult} from '@/sanity/types/sanity.types'

/** The Branch landing page (`/branch`). */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const {page, site} = await getPageSeo('branchPage')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return buildMetadata({pageSeo: page, siteSeo: site, url: siteUrl ? `${siteUrl}/branch` : undefined})
}

export default async function BranchPage() {
  const {data} = await sanityFetch({query: branchPageQuery})
  const {branch, navigation, siteSettings} = data as BranchPageQueryResult
  const settingsId = siteSettings?.id ?? 'siteSettings'

  return (
    <>
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
