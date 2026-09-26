import type {Metadata} from 'next'

import {ContactSections} from '@/components/contact/ContactSections'
import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {buildMetadata} from '@/lib/metadata'
import {getContactPageData, getContactPageSeo} from '@/sanity/lib/fetch'

/** The Contact page (`/contact`), matching `JIDS/contactus.html`. */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const {page, site} = await getContactPageSeo()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return buildMetadata({pageSeo: page, siteSeo: site, url: siteUrl ? `${siteUrl}/contact` : undefined})
}

export default async function ContactPage() {
  const {contact, navigation, siteSettings} = await getContactPageData()
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
      <main className="flex-1">
        {contact ? (
          <ContactSections page={contact} />
        ) : (
          <p className="px-4 py-24 text-center text-gray-500">
            Open the Studio → Contact page, then click Publish.
          </p>
        )}
      </main>
      <Footer documentId={settingsId} footer={siteSettings?.footer} brand={siteSettings?.brand} />
      <FloatingContact documentId={settingsId} floatingContact={siteSettings?.floatingContact} />
    </>
  )
}
