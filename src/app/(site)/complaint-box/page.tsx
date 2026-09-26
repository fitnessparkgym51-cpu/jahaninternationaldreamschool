import type {Metadata} from 'next'

import {ComplaintBox} from '@/components/complaint/ComplaintBox'
import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {getNavigation, getSiteSettings} from '@/sanity/lib/fetch'

/** Anonymous Complaint Box (`/complaint-box`). */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {robots: {index: false}}

export default async function ComplaintBoxPage() {
  const [navigation, siteSettings] = await Promise.all([getNavigation(), getSiteSettings()])
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
      <main className="flex-1 bg-jids-green-tint px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <ComplaintBox />
        </div>
      </main>
      <Footer documentId={settingsId} footer={siteSettings?.footer} brand={siteSettings?.brand} />
      <FloatingContact documentId={settingsId} floatingContact={siteSettings?.floatingContact} />
    </>
  )
}
