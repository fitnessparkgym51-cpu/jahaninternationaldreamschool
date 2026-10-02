import {Reveal} from '@/components/ui/Reveal'
import {SanityImage} from '@/components/ui/SanityImage'
import {SmartLink} from '@/components/ui/SmartLink'
import {editAttribute, editTargetAttr, type PathStep} from '@/lib/editing'
import type {EditField} from '@/components/home/HomeSections'
import type {NewsSection as NewsSectionData} from '@/sanity/types/home'

type NewsSectionProps = {
  section: NewsSectionData
  editField: EditField
}

/** News & events grid. Each card renders a referenced News & event document. */
export function NewsSection({section, editField}: NewsSectionProps) {
  const posts = (section.posts ?? []).filter((post) => post.isVisible !== false)
  if (!posts.length) return null

  return (
    <section
      className="bg-white px-4 py-14 sm:px-8 sm:py-16 lg:py-20"
      data-sanity={editField('posts')}
      data-sanity-edit-target=""
    >
      <div className="mx-auto max-w-7xl">
        <Reveal
          className="mx-auto mb-8 max-w-3xl text-center sm:mb-12"
          editAttribute={editField('header')}
        >
          {section.header?.heading ? (
            <h2 className="mb-3 text-[22px] font-extrabold text-balance text-[#1a202c] sm:text-3xl lg:text-4xl">
              {section.header.heading}
            </h2>
          ) : null}
          <div className="title-accent-bar" />
          {section.header?.subheading ? (
            <p className="mt-4 text-sm text-pretty text-gray-500 sm:text-base">
              {section.header.subheading}
            </p>
          ) : null}
        </Reveal>

        {/*
          Three cards across only from `lg` (1024px). At 768px three columns are
          ~213px, which clamped every title and excerpt after two or three words,
          so tablets get two columns and the widest breakpoint gets three.
        */}
        <div className="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {posts.map((post, index) => {
            // Like student cards, the news card belongs to its own document.
            const postField = (...rest: PathStep[]) =>
              editAttribute({id: post.id, type: 'newsPost', path: rest})

            const article = (
              <article
                className="h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:shadow-md"
                {...editTargetAttr}
              >
                <div
                  className="relative h-48 overflow-hidden sm:h-52 md:h-56"
                  data-sanity={postField('image')}
                >
                  <SanityImage
                    image={post.image}
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 46vw, 100vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    editAttribute={postField('image')}
                  />
                </div>
                <div className="p-5 sm:p-6">
                  {post.category ? (
                    <div
                      className="mb-2 text-xs font-semibold uppercase tracking-wider text-jids-green"
                      data-sanity={postField('category')}
                    >
                      {post.category}
                    </div>
                  ) : null}
                  <h3
                    className="mb-2 line-clamp-2 text-pretty text-lg font-bold text-gray-900"
                    data-sanity={postField('title')}
                  >
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p
                      className="line-clamp-3 text-sm leading-relaxed text-pretty text-gray-500"
                      data-sanity={postField('excerpt')}
                    >
                      {post.excerpt}
                    </p>
                  ) : null}
                  {post.link?.label ? (
                    <span className="mt-3 inline-block text-sm font-semibold text-jids-green">
                      {post.link.label}
                    </span>
                  ) : null}
                </div>
              </article>
            )

            return (
              <Reveal key={post.id} delay={(index % 3) * 120} className="h-full">
                {post.link?.url ? (
                  <SmartLink
                    url={post.link.url}
                    newTab={post.link.newTab}
                    editAttribute={postField('link')}
                    className="block h-full transition duration-200 hover:shadow-md"
                  >
                    {article}
                  </SmartLink>
                ) : (
                  article
                )}
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
