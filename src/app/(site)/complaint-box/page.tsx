import type {Metadata} from 'next'

import {ComplaintBox} from '@/components/complaint/ComplaintBox'
import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {getComplaintPageData} from '@/sanity/lib/fetch'

/** Anonymous Complaint Box (`/complaint-box`). */
export const dynamic = 'force-dynamic'

/**
 * The form is deliberately kept out of the index: it holds no searchable content,
 * and a thin page in the footer of every page would compete with the real ones. It
 * stays reachable for anyone with the link, and `robots.txt` allows crawling the
 * folder.
 *
 * `index: false, follow: true` — not `follow: false` — so a crawler can still reach
 * the pages linked from here. This matches the `noIndex: true` entry for the route
 * in `src/lib/routes.ts`, which is what keeps the page out of `sitemap.xml`. Both
 * are technical policy rather than an editor's switch, so the CMS document for this
 * page deliberately has no `seo` block: there is no way for the two to disagree.
 */
export const metadata: Metadata = {
  title: 'Complaint Box',
  robots: {index: false, follow: true},
}

export default async function ComplaintBoxPage() {
  const {complaint, navigation, siteSettings} = await getComplaintPageData()
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
          {/*
            The page's single H1, and one line of explanation. Both come from the
            `complaintPage` document so an editor can change them in the Studio
            like any other heading; the heading also serves as the page title.
          */}
          <h1 className="mb-4 text-center text-2xl font-extrabold tracking-tight text-jids-green-deep sm:text-3xl">
            {complaint?.heading}
          </h1>
          {complaint?.intro ? (
            <p className="mx-auto mb-8 max-w-xl text-center text-sm text-gray-600">
              {complaint.intro}
            </p>
          ) : null}
          <ComplaintBox />
        </div>
      </main>
      <Footer documentId={settingsId} footer={siteSettings?.footer} brand={siteSettings?.brand} />
      <FloatingContact documentId={settingsId} floatingContact={siteSettings?.floatingContact} />
    </>
  )
}
