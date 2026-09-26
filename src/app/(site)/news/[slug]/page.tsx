import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {
  PortableText,
  stegaClean,
  type PortableTextBlock,
  type PortableTextComponents,
} from 'next-sanity'

import {formatDate, NewsShell, newsPostEdit, type NewsChrome, type NewsListItem} from '@/components/news/news'
import {SanityImage} from '@/components/ui/SanityImage'
import type {SanityImage as SanityImageData} from '@/sanity/types/home'
import {sanityFetch} from '@/sanity/lib/live'
import {newsPostQuery} from '@/sanity/lib/queries'

/** One news post (`/news/[slug]`). */
export const dynamic = 'force-dynamic'

type PostData = NewsChrome & {post: (NewsListItem & {body?: unknown[] | null}) | null}

async function getPost(slug: string) {
  const {data} = await sanityFetch({query: newsPostQuery, params: {slug}})
  return data as unknown as PostData
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params
  const {data} = await sanityFetch({query: newsPostQuery, params: {slug}, stega: false})
  const post = (data as unknown as PostData).post
  return post ? {title: post.title ?? undefined, description: post.excerpt ?? undefined} : {}
}

const components: PortableTextComponents = {
  types: {
    imageWithAlt: ({value}: {value: SanityImageData}) =>
      value?.asset ? <SanityImage image={value} sizes="768px" className="my-6 w-full rounded-xl" /> : null,
  },
}

export default async function NewsPostPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const {post, ...chrome} = await getPost(stegaClean(slug))
  if (!post) notFound()

  return (
    <NewsShell data={chrome}>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
        <Link href="/news" className="text-sm font-bold text-jids-green hover:underline">
          {chrome.page?.backLabel}
        </Link>
        <div className="mb-3 mt-6 flex items-center gap-3 text-xs">
          {post.category ? (
            <span className="font-bold uppercase tracking-wider text-jids-orange">{post.category}</span>
          ) : null}
          <time className="text-gray-400" dateTime={post.date ?? undefined}>
            {formatDate(post.date)}
          </time>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{post.title}</h1>
        {post.excerpt ? <p className="mt-4 text-lg text-gray-600">{post.excerpt}</p> : null}
        {post.image?.asset ? (
          <SanityImage
            image={post.image}
            sizes="768px"
            priority
            className="mt-8 w-full rounded-2xl"
            editAttribute={newsPostEdit(post.id, 'image')}
          />
        ) : null}
        {post.body?.length ? (
          <div
            className="prose-jids mt-8 space-y-4 text-base leading-relaxed text-gray-700 [&_a]:text-jids-green [&_a]:underline [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:text-xl [&_h3]:font-bold [&_li]:ml-6 [&_ol]:list-decimal [&_ul]:list-disc"
            data-sanity={newsPostEdit(post.id, 'body')}
          >
            <PortableText value={post.body as PortableTextBlock[]} components={components} />
          </div>
        ) : null}
      </article>
    </NewsShell>
  )
}
