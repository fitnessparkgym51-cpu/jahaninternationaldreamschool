import type {Metadata} from 'next'
import Link from 'next/link'

import {formatDate, NewsShell, newsPostEdit, type NewsChrome, type NewsListItem} from '@/components/news/news'
import {SanityImage} from '@/components/ui/SanityImage'
import {buildMetadata} from '@/lib/metadata'
import {getPageSeo} from '@/sanity/lib/fetch'
import {sanityFetch} from '@/sanity/lib/live'
import {newsListQuery} from '@/sanity/lib/queries'

/** The News listing (`/news`). Posts are `newsPost` documents, newest first. */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const {page, site} = await getPageSeo('newsPage')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return buildMetadata({pageSeo: page, siteSeo: site, url: siteUrl ? `${siteUrl}/news` : undefined})
}

export default async function NewsPage() {
  const {data} = await sanityFetch({query: newsListQuery})
  const {posts, ...chrome} = data as unknown as NewsChrome & {posts: NewsListItem[]}

  return (
    <NewsShell data={chrome}>
      <section className="bg-slate-50/50 px-4 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          {posts.length ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                  data-sanity={newsPostEdit(post.id, 'title')}
                >
                  <Link href={`/news/${post.slug}`} className="block aspect-[16/10] overflow-hidden bg-jids-green-tint">
                    {post.image?.asset ? (
                      <SanityImage
                        image={post.image}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        editAttribute={newsPostEdit(post.id, 'image')}
                      />
                    ) : null}
                  </Link>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2 flex items-center gap-3 text-xs">
                      {post.category ? (
                        <span className="font-bold uppercase tracking-wider text-jids-orange">{post.category}</span>
                      ) : null}
                      <time className="text-gray-400" dateTime={post.date ?? undefined}>
                        {formatDate(post.date)}
                      </time>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      <Link href={`/news/${post.slug}`} className="hover:text-jids-green">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt ? <p className="mt-2 flex-1 text-sm text-gray-600">{post.excerpt}</p> : null}
                    <Link
                      href={`/news/${post.slug}`}
                      className="mt-4 text-sm font-bold text-jids-green hover:underline"
                    >
                      {chrome.page?.readMoreLabel}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-gray-500">{chrome.page?.emptyText}</p>
          )}
        </div>
      </section>
    </NewsShell>
  )
}
