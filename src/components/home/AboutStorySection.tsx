import {Reveal} from '@/components/ui/Reveal'
import {SanityImage} from '@/components/ui/SanityImage'
import {SmartLink} from '@/components/ui/SmartLink'
import {editTargetAttr} from '@/lib/editing'
import type {EditField} from '@/components/home/HomeSections'
import type {AboutStorySection as AboutStorySectionData} from '@/sanity/types/home'

type AboutStorySectionProps = {
  section: AboutStorySectionData
  editField: EditField
}

/** Two-column heritage banner: classroom photo on the left, story on the right. */
export function AboutStorySection({section, editField}: AboutStorySectionProps) {
  const paragraphs = section.body ?? []
  if (!section.heading && !paragraphs.length && !section.image) return null

  return (
    <section
      className="border-t border-gray-100 bg-gray-50/70 px-4 py-16 sm:px-8 sm:py-20"
      {...editTargetAttr}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
        {section.image ? (
          <Reveal direction="left" className="lg:col-span-6">
            <div
              className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-gray-200 shadow-xl"
              data-sanity={editField('image')}
            >
              <SanityImage
                image={section.image}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                editAttribute={editField('image')}
              />
            </div>
          </Reveal>
        ) : null}

        <Reveal direction="right" className="space-y-6 lg:col-span-6">
          {section.eyebrow ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-jids-green-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-jids-green">
              {section.eyebrow}
            </div>
          ) : null}

          {section.heading ? (
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {section.heading}
            </h2>
          ) : null}

          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-base leading-relaxed text-gray-600 sm:text-lg"
              data-sanity={editField('body', index)}
            >
              {paragraph}
            </p>
          ))}

          {section.link || section.metaText ? (
            <div className="flex items-center gap-6 pt-2">
              {section.link ? (
                <SmartLink
                  url={section.link.url}
                  newTab={section.link.newTab}
                  editAttribute={editField('link')}
                  className="group inline-flex items-center text-base font-bold text-jids-green hover:text-jids-green-deep"
                >
                  <span>{section.link.label}</span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true">
                    â†’
                  </span>
                </SmartLink>
              ) : null}
              {section.metaText ? (
                <span className="text-sm font-semibold text-amber-700">{section.metaText}</span>
              ) : null}
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}
