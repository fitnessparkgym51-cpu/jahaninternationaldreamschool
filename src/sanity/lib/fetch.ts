import {cache} from 'react'

import type {AboutPageData, HomePageData, Navigation, PageSeo, SiteSettings} from '../types/home'

import {pageSeoQuery, homePageQuery, aboutPageQuery, navigationQuery, siteSettingsQuery} from './queries'
import {sanityFetch} from './live'

/**
 * Data access layer.
 *
 * Components never touch the Sanity client directly — the page fetches typed data
 * and passes it down as props, which keeps CMS fetching out of presentation.
 * `cache()` de-duplicates calls within a single render.
 *
 * All of these go through `sanityFetch`, which switches automatically between
 * published and draft content based on Draft Mode, and turns on stega encoding
 * only inside Draft Mode. That is what gives the Presentation Tool its
 * click-to-edit metadata and live updates without any of this plumbing leaking
 * into the components.
 */

/**
 * The whole Home page in one round trip: site chrome, navigation and content.
 *
 * Inside Draft Mode the returned strings carry invisible stega payloads. Those
 * are structurally plain strings, so the clean (non-stega) generated result type
 * is the right contract for the components. We narrow once here, at the data
 * boundary, instead of threading branded string types through every component.
 */
export const getHomePageData = cache(async (): Promise<HomePageData> => {
  const {data} = await sanityFetch({query: homePageQuery})
  return data as HomePageData
})

/**
 * SEO values for `generateMetadata`, for any page singleton.
 *
 * Stega is switched off here on purpose: invisible characters inside `<title>`
 * or `<meta content>` look fine in a browser but corrupt search engine results
 * and social scrapes.
 *
 * `cache()` is keyed on the arguments, so two pages rendering in the same request
 * still produce two distinct cache entries.
 */
export const getPageSeo = cache(async (type: string): Promise<PageSeo> => {
  const {data} = await sanityFetch({query: pageSeoQuery, params: {type}, stega: false})
  return {page: data?.page?.seo ?? null, site: data?.site?.seo ?? null}
})

export const getHomePageSeo = cache(async (): Promise<PageSeo> => getPageSeo('homePage'))

export const getAboutPageSeo = cache(async (): Promise<PageSeo> => getPageSeo('aboutPage'))

/**
 * The whole About page in one round trip: site chrome, navigation and content.
 *
 * Same stega reasoning as `getHomePageData`.
 */
export const getAboutPageData = cache(async (): Promise<AboutPageData> => {
  const {data} = await sanityFetch({query: aboutPageQuery})
  return data as AboutPageData
})

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const {data} = await sanityFetch({query: siteSettingsQuery})
  return data as SiteSettings | null
})

export const getNavigation = cache(async (): Promise<Navigation | null> => {
  const {data} = await sanityFetch({query: navigationQuery})
  return data as Navigation | null
})
