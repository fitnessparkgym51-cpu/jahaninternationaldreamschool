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
      className="bg-white px-4 py-20 sm:px-8"
      data-sanity={editField('posts')}
      data-sanity-edit-target=""
    >
      <div className="mx-auto max-w-7xl">
        <Reveal
          className="mx-auto mb-14 max-w-3xl text-center"
          editAttribute={editField('header')}
        >
          {section.header?.heading ? (
            <h2 className="mb-3 text-2xl font-extrabold text-[#1a202c] sm:text-4xl">
              {section.header.heading}
            </h2>
          ) : null}
          <div className="title-accent-bar" />
          {section.header?.subheading ? (
            <p className="mt-4 text-sm text-gray-500 sm:text-base">{section.header.subheading}</p>
          ) : null}
        </Reveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {posts.map((post, index) => {
            // Like student cards, the news card belongs to its own document.
            const postField = (...rest: PathStep[]) =>
              editAttribute({id: post.id, type: 'newsPost', path: rest})

            const article = (
              <article
                className="h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:shadow-md"
                {...editTargetAttr}
              >
                <div className="relative h-56 overflow-hidden" data-sanity={postField('image')}>
                  <SanityImage
                    image={post.image}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    editAttribute={postField('image')}
                  />
                </div>
                <div className="p-6">
                  {post.category ? (
                    <div
                      className="mb-2 text-xs font-semibold uppercase tracking-wider text-jids-green"
                      data-sanity={postField('category')}
                    >
                      {post.category}
                    </div>
                  ) : null}
                  <h3
                    className="mb-2 line-clamp-2 font-bold text-lg text-gray-900"
                    data-sanity={postField('title')}
                  >
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p
                      className="line-clamp-3 text-sm leading-relaxed text-gray-500"
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
