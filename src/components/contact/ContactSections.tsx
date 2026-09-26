import {stegaClean} from 'next-sanity'

import {ContactForm} from '@/components/contact/ContactForm'
import {PageHeroSection} from '@/components/sections/PageHeroSection'
import {Icon} from '@/components/ui/Icon'
import {ButtonLink} from '@/components/ui/SmartLink'
import {documentFieldAttribute, editTargetAttr, type PathStep} from '@/lib/editing'
import type {IconName} from '@/lib/iconNames'
import type {ContactPage} from '@/sanity/types/contact'

const CONTACT_PAGE_TYPE = 'contactPage'

/** Renders the Contact page, matching `JIDS/contactus.html`. */
export function ContactSections({page}: {page: ContactPage}) {
  const edit =
    (root: string) =>
    (...rest: PathStep[]) =>
      documentFieldAttribute({id: page.id, type: CONTACT_PAGE_TYPE, path: [root, ...rest]})

  const {hero, infoCard, mapCard, form, review} = page

  return (
    <>
      {hero && hero.enabled !== false ? <PageHeroSection section={hero} editField={edit('hero')} /> : null}

      <section className="bg-slate-50/50 px-4 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
          {infoCard ? (
            <div
              className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              {...editTargetAttr}
            >
              <div>
                <h2 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">{infoCard.heading}</h2>
                <div className="space-y-6">
                  {(infoCard.items ?? []).map((item) => (
                    <div key={item._key} className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        {item.icon ? <Icon name={stegaClean(item.icon) as IconName} size={20} /> : null}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.label}</h3>
                        <p className="mt-0.5 text-base font-semibold text-gray-900">{item.value}</p>
                        {item.note ? <p className="text-sm font-medium text-gray-500">{item.note}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-4">
                <ButtonLink
                  button={infoCard.button}
                  editAttribute={edit('infoCard')('button')}
                  className="w-full px-6 py-3.5 text-base font-bold"
                />
              </div>
            </div>
          ) : null}

          {mapCard ? (
            <div
              className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              {...editTargetAttr}
            >
              <div>
                <div className="mb-4 flex items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{mapCard.title}</h3>
                    <p className="text-xs text-gray-500">{mapCard.address}</p>
                  </div>
                  {mapCard.rating ? (
                    <div className="flex items-center gap-1.5 rounded-md border border-yellow-200 bg-yellow-50 px-2.5 py-1">
                      <span className="text-sm font-bold text-yellow-800">{mapCard.rating}</span>
                      <span className="text-xs text-amber-500" aria-hidden="true">
                        ★★★★★
                      </span>
                      <span className="text-[11px] text-gray-500">{mapCard.reviewCount}</span>
                    </div>
                  ) : null}
                </div>

                <MapCanvas mapCard={mapCard} />
              </div>
              <div className="mt-6">
                <ButtonLink
                  button={mapCard.button}
                  editAttribute={edit('mapCard')('button')}
                  className="w-full px-6 py-3 text-sm font-bold"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {form ? (
        <section id="contact-form" className="border-t border-gray-100 bg-white px-4 py-16 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{form.heading}</h2>
              <p className="mt-2 text-sm text-gray-500 sm:text-base">{form.intro}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
              <ContactForm form={form} />
            </div>
          </div>
        </section>
      ) : null}

      {review && review.enabled !== false ? (
        <section className="bg-slate-50 px-4 py-12 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <div
              className="rounded-2xl border-2 border-emerald-600/30 bg-white p-8 text-center shadow-sm sm:p-10"
              {...editTargetAttr}
            >
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="text-xl font-extrabold tracking-tight" aria-label="Google">
                  <span className="text-blue-500">G</span>
                  <span className="text-red-500">o</span>
                  <span className="text-yellow-500">o</span>
                  <span className="text-blue-500">g</span>
                  <span className="text-green-500">l</span>
                  <span className="text-red-500">e</span>
                </span>
                <span className="text-lg font-bold text-gray-800">{review.rating}</span>
                <span className="text-base text-amber-400" aria-hidden="true">
                  ★★★★★
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-jids-green sm:text-2xl">{review.headline}</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600 sm:text-base">{review.text}</p>
              <div className="mt-6">
                <ButtonLink
                  button={review.button}
                  editAttribute={edit('review')('button')}
                  className="px-6 py-3 text-sm"
                  icon={<span className="text-amber-300">★</span>}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}

/** The stylised map illustration from the reference. Decoration is code; labels are CMS. */
function MapCanvas({mapCard}: {mapCard: NonNullable<ContactPage['mapCard']>}) {
  const [first, second] = mapCard.landmarks ?? []
  const url = stegaClean(mapCard.mapUrl)

  const canvas = (
    <div
      className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200"
      style={{
        backgroundColor: '#eef2f0',
        backgroundImage:
          'linear-gradient(#e2e8e4 1px, transparent 1px), linear-gradient(90deg, #e2e8e4 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="absolute inset-0 opacity-40" aria-hidden="true">
        <div className="absolute top-16 h-2 w-full -rotate-6 bg-slate-300" />
        <div className="absolute top-40 h-3 w-full rotate-12 bg-amber-200/80" />
        <div className="absolute bottom-16 h-2 w-full -rotate-3 bg-slate-300" />
        <div className="absolute left-24 h-full w-3 rotate-3 bg-slate-300" />
        <div className="absolute right-32 h-full w-4 -rotate-6 bg-emerald-200/60" />
      </div>
      {first ? (
        <div className="absolute left-10 top-8 rounded border border-gray-200 bg-white/90 px-2 py-0.5 text-[11px] font-medium text-gray-600 shadow-sm">
          {first}
        </div>
      ) : null}
      {second ? (
        <div className="absolute bottom-10 right-10 rounded border border-gray-200 bg-white/90 px-2 py-0.5 text-[11px] font-medium text-gray-600 shadow-sm">
          {second}
        </div>
      ) : null}
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-1 flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-jids-green px-3 py-1.5 text-xs font-bold text-white shadow-lg">
          <span>{mapCard.pinLabel}</span>
          <span className="h-2 w-2 animate-ping rounded-full bg-emerald-300" />
        </div>
        <div className="text-jids-orange drop-shadow-md">
          <Icon name="pin" size={40} />
        </div>
      </div>
      {mapCard.attribution ? (
        <div className="absolute bottom-2 left-3 rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-gray-500">
          {mapCard.attribution}
        </div>
      ) : null}
    </div>
  )

  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps">
      {canvas}
    </a>
  ) : (
    canvas
  )
}
