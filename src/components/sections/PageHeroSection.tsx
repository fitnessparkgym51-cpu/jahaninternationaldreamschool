import {stegaClean} from 'next-sanity'

import {BreadcrumbJsonLd} from '@/components/seo/JsonLd'
import {Icon} from '@/components/ui/Icon'
import {ButtonLink} from '@/components/ui/SmartLink'
import {Reveal} from '@/components/ui/Reveal'
import {SmartLink} from '@/components/ui/SmartLink'
import {editTargetAttr, type EditField} from '@/lib/editing'
import type {SharedPageHeroData} from '@/components/sections/types'
import type {UiButton, UiCrumb} from '@/components/ui/types'

type PageHeroSectionProps = {
  section: SharedPageHeroData
  editField: EditField
}

/**
 * The dark green banner that opens every inner page: one `h1`, an optional
 * supporting line, a breadcrumb trail, and optional buttons.
 *
 * Shared by About, Admissions and every inner page still to come — the copy,
 * the buttons and the crumbs are all CMS, so one component serves them all.
 */
export function PageHeroSection({section, editField}: PageHeroSectionProps) {
  if (!section.heading) return null

  // A type predicate, not .filter(Boolean): GROQ arrays can hold nulls and
  // TypeScript cannot narrow those away on its own.
  const crumbs = (section.crumbs ?? []).filter((crumb): crumb is UiCrumb => Boolean(crumb))
  const buttons = (section.buttons ?? []).filter((button): button is UiButton => Boolean(button))
  // `appearance` is used as a lookup key, so it must be stega-cleaned.
  const patterned = stegaClean(section.appearance) === 'pattern'

  return (
    <section
      id="page-top"
      className={`relative overflow-hidden px-4 py-14 text-center text-white sm:px-8 ${
        patterned ? 'jids-hero-pattern bg-jids-green' : 'bg-jids-green'
      }`}
      {...editTargetAttr}
    >
      {/*
        Structured data for the same crumbs rendered below. Emitted from here so
        the markup and the visible trail are generated from one array and cannot
        drift apart. Renders nothing when the page has fewer than two crumbs.
      */}
      <BreadcrumbJsonLd crumbs={crumbs} />
      {/*
        Decoration only, driven by one CMS switch. The glyph itself belongs to the
        design system, not to an editor, so it is code.
      */}
      {section.showIconWatermark ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5"
          aria-hidden="true"
        >
          <Icon name="graduation-cap" size={320} strokeWidth={0.75} />
        </div>
      ) : null}

      <Reveal className="relative z-10 mx-auto max-w-4xl">
        {section.eyebrow ? (
          <span
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-green-50"
            data-sanity={editField('eyebrow')}
          >
            {section.eyebrowIcon ? <Icon name={section.eyebrowIcon} size={16} /> : null}
            {section.eyebrow}
          </span>
        ) : null}

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[40px]">
          {section.heading}
        </h1>

        {section.subheading ? (
          <p className="mx-auto mt-3 max-w-2xl text-sm text-green-50 sm:text-base">
            {section.subheading}
          </p>
        ) : null}

        {crumbs.length ? (
          <nav aria-label="Breadcrumb" className={buttons.length ? 'mb-8' : 'mt-4'}>
            <ol className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-green-100">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1
                // A keyed GROQ path needs a real `_key`. Sanity always assigns one
                // to array items, so this is a guard rather than an expected case.
                const crumbField = (field: string) =>
                  crumb._key ? editField('crumbs', {_key: crumb._key}, field) : undefined

                return (
                  <li key={crumb._key ?? index} className="flex items-center gap-2">
                    {crumb.url && !isLast ? (
                      <SmartLink
                        url={crumb.url}
                        className="transition-colors hover:text-white"
                        editAttribute={crumbField('url')}
                      >
                        {crumb.label}
                      </SmartLink>
                    ) : (
                      <span
                        className={isLast ? 'font-semibold text-white' : undefined}
                        aria-current={isLast ? 'page' : undefined}
                        data-sanity={crumbField('label')}
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

        {buttons.length ? (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {buttons.map((button, index) => (
              <ButtonLink
                key={button._key ?? index}
                button={button}
                editAttribute={editField('buttons', index)}
                className="px-7 py-3 text-sm"
              />
            ))}
          </div>
        ) : null}
      </Reveal>
    </section>
  )
}
