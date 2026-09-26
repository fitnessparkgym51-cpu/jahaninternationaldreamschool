import type {ReactNode} from 'react'

import {PageHeroSection} from '@/components/sections/PageHeroSection'
import type {SharedPageHeroData} from '@/components/sections/types'
import {FloatingContact} from '@/components/site/FloatingContact'
import {Footer} from '@/components/site/Footer'
import {Header} from '@/components/site/Header'
import {documentFieldAttribute, type PathStep} from '@/lib/editing'
import type {Navigation, SanityImage, SiteSettings} from '@/sanity/types/home'

/** Hand-written result types for `newsListQuery` / `newsPostQuery`. */
export type NewsPageCopy = {
  id: string
  hero?: (SharedPageHeroData & {enabled?: boolean | null}) | null
  readMoreLabel?: string | null
  backLabel?: string | null
  emptyText?: string | null
} | null

export type NewsListItem = {
  id: string
  title?: string | null
  category?: string | null
  excerpt?: string | null
  slug: string
  date?: string | null
  image?: SanityImage | null
}

export type NewsChrome = {siteSettings: SiteSettings | null; navigation: Navigation | null; page: NewsPageCopy}

export const newsPostEdit = (id: string, ...path: PathStep[]) =>
  documentFieldAttribute({id, type: 'newsPost', path})

export function formatDate(date?: string | null) {
  return date ? new Date(date).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'}) : ''
}

/** Site chrome + News page header, shared by the list and the post page. */
export function NewsShell({data, children}: {data: NewsChrome; children: ReactNode}) {
  const {siteSettings, navigation, page} = data
  const settingsId = siteSettings?.id ?? 'siteSettings'
  const hero = page?.hero

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
        {hero && hero.enabled !== false ? (
          <PageHeroSection
            section={hero}
            editField={(...rest) => documentFieldAttribute({id: page.id, type: 'newsPage', path: ['hero', ...rest]})}
          />
        ) : null}
        {children}
      </main>
      <Footer documentId={settingsId} footer={siteSettings?.footer} brand={siteSettings?.brand} />
      <FloatingContact documentId={settingsId} floatingContact={siteSettings?.floatingContact} />
    </>
  )
}
