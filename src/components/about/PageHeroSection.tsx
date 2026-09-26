import {SmartLink} from '@/components/ui/SmartLink'
import {Reveal} from '@/components/ui/Reveal'
import {editTargetAttr} from '@/lib/editing'
import type {EditField} from '@/components/about/AboutSections'
import type {PageHeroSection as PageHeroSectionData} from '@/sanity/types/home'

type PageHeroSectionProps = {
  section: PageHeroSectionData
  editField: EditField
}

/**
 * The dark green banner that opens every inner page: one `h1`, an optional
 * supporting line, and the breadcrumb trail.
 *
 * Generic by design — the About page is the first to use it, and Academics,
 * Admissions, Contact and the rest will reuse the same section object.
 */
export function PageHeroSection({section, editField}: PageHeroSectionProps) {
  if (!section.heading) return null

  const crumbs = (section.crumbs ?? []).filter((crumb) => Boolean(crumb))

  return (
    <section
      id="page-top"
      className="bg-jids-green px-4 py-14 text-center text-white sm:px-8"
      {...editTargetAttr}
    >
      <Reveal className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold tracking-normal sm:text-4xl lg:text-5xl">
          {section.heading}
        </h1>

        {section.subheading ? (
          <p className="mx-auto mt-3 max-w-2xl text-sm text-green-50 sm:text-base">
            {section.subheading}
          </p>
        ) : null}

        {crumbs.length ? (
          <nav aria-label="Breadcrumb" className="mt-4">
            <ol className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-green-100">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1

                return (
                  <li key={crumb._key} className="flex items-center gap-2">
                    {crumb.url && !isLast ? (
                      <SmartLink
                        url={crumb.url}
                        className="transition-colors hover:text-white"
                        editAttribute={editField('crumbs', {_key: crumb._key}, 'url')}
                      >
                        {crumb.label}
                      </SmartLink>
                    ) : (
                      <span
                        className={isLast ? 'font-semibold text-white' : undefined}
                        aria-current={isLast ? 'page' : undefined}
                        data-sanity={editField('crumbs', {_key: crumb._key}, 'label')}
                      >
                        {crumb.label}
                      </span>
                    )}

                    {isLast ? null : (
                      <span className="text-green-300/60" aria-hidden="true">
                        &gt;
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        ) : null}
      </Reveal>
    </section>
  )
}
