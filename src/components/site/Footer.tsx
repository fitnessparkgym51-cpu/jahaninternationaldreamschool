import {Icon} from '@/components/ui/Icon'
import {SanityImage} from '@/components/ui/SanityImage'
import {SmartLink} from '@/components/ui/SmartLink'
import {editAttribute, editTargetAttr, type PathStep} from '@/lib/editing'
import type {Brand, Footer} from '@/sanity/types/home'

type FooterProps = {
  /** `_id` of the Site settings singleton. */
  documentId: string
  footer?: Footer | null
  brand?: Brand | null
}

/** Site footer: identity + contact, quick links, social card, map and legal row. */
export function Footer({documentId, footer, brand}: FooterProps) {
  if (!footer || footer.enabled === false) return null

  const field = (...rest: PathStep[]) =>
    editAttribute({id: documentId, type: 'siteSettings', path: ['footer', ...rest]})
  const brandField = (...rest: string[]) =>
    editAttribute({id: documentId, type: 'siteSettings', path: ['brand', ...rest]})

  return (
    <footer
      className="jid-footer border-t border-green-950 bg-jids-green-deep px-4 pb-8 pt-16 text-white sm:px-8"
      {...editTargetAttr}
    >
      <div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        {/* Brand and contact */}
        <div className="space-y-4 lg:col-span-4">
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow"
              data-sanity={brandField('logo')}
            >
              {brand?.logo ? (
                <SanityImage
                  image={brand.logo}
                  sizes="48px"
                  className="object-contain"
                  editAttribute={brandField('logo')}
                />
              ) : null}
            </div>
            <div>
              <div
                className="text-lg font-bold leading-tight"
                data-sanity={brandField('name')}
              >
                {brand?.name}
              </div>
              <div className="text-xs font-medium text-yellow-300">
                {[brand?.acronym, brand?.establishedLabel].filter(Boolean).join(' • ')}
              </div>
            </div>
          </div>

          {footer.tagline ? (
            <p className="pt-1 text-sm font-semibold text-white/90" data-sanity={field('tagline')}>
              {footer.tagline}
            </p>
          ) : null}

          <ul className="space-y-2.5 pt-2 text-xs text-green-100/90 sm:text-sm">
            {(footer.contactItems ?? []).map((item) => {
              const body = (
                <>
                  <Icon name={item.icon} size={16} className="mt-0.5 flex-shrink-0 text-green-300" />
                  <span>{item.label}</span>
                </>
              )

              return (
                <li
                  key={item._key}
                  className="flex items-start gap-2.5"
                  data-sanity={field('contactItems', {_key: item._key})}
                >
                  {item.href ? (
                    <SmartLink
                      url={item.href}
                      className="flex items-start gap-2.5 transition-colors hover:text-white"
                    >
                      {body}
                    </SmartLink>
                  ) : (
                    <span className="flex items-start gap-2.5">{body}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Quick links */}
        {footer.quickLinks?.length ? (
          <div className="space-y-3 lg:col-span-2">
            <h4
              className="border-b border-green-800 pb-2 text-base font-bold text-white"
              data-sanity={field('quickLinksTitle')}
            >
              {footer.quickLinksTitle || 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs text-green-100 sm:text-sm">
              {footer.quickLinks.map((link) => (
                <li key={link._key} data-sanity={field('quickLinks', {_key: link._key})}>
                  <SmartLink
                    url={link.url}
                    newTab={link.newTab}
                    className="jids-footer-link transition hover:text-white"
                  >
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Social preview card */}
        {footer.socialCard ? (
          <div className="space-y-3 lg:col-span-3">
            <h4
              className="border-b border-green-800 pb-2 text-base font-bold text-white"
              data-sanity={field('socialTitle')}
            >
              {footer.socialTitle || 'Follow Us'}
            </h4>
            <div
              className="overflow-hidden rounded-xl bg-white text-gray-800 shadow-md"
              data-sanity={field('socialCard')}
              data-sanity-edit-target=""
            >
              <div className="relative flex h-24 items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-500 p-2">
                {footer.socialCard.bannerLabel ? (
                  <span
                    className="rounded bg-black/40 px-3 py-1 text-xs font-bold text-white"
                    data-sanity={field('socialCard', 'bannerLabel')}
                  >
                    {footer.socialCard.bannerLabel}
                  </span>
                ) : null}
                <span className="absolute right-2 top-2 text-white">
                  <Icon name="facebook" size={20} />
                </span>
              </div>
              <div className="flex items-start gap-3 p-4">
                <div
                  className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-0.5"
                  data-sanity={field('socialCard', 'image')}
                >
                  {footer.socialCard.image ? (
                    <SanityImage
                      image={footer.socialCard.image}
                      sizes="44px"
                      className="object-contain"
                      editAttribute={field('socialCard', 'image')}
                    />
                  ) : null}
                </div>
                <div>
                  <h5
                    className="text-sm font-bold leading-tight text-gray-900"
                    data-sanity={field('socialCard', 'title')}
                  >
                    {footer.socialCard.title}
                  </h5>
                  {footer.socialCard.subtitle ? (
                    <div
                      className="text-[11px] text-gray-500"
                      data-sanity={field('socialCard', 'subtitle')}
                    >
                      {footer.socialCard.subtitle}
                    </div>
                  ) : null}
                  {footer.socialCard.description ? (
                    <p
                      className="mt-2 line-clamp-2 text-[11px] text-gray-600"
                      data-sanity={field('socialCard', 'description')}
                    >
                      {footer.socialCard.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Map card */}
        {footer.map ? (
          <div className="space-y-3 lg:col-span-3">
            <h4
              className="border-b border-green-800 pb-2 text-base font-bold text-white"
              data-sanity={field('mapTitle')}
            >
              {footer.mapTitle || 'Find Us'}
            </h4>
            <div
              className="relative h-48 overflow-hidden rounded-xl border border-green-800 bg-[#e5e3df] shadow-md"
              data-sanity={field('map')}
              data-sanity-edit-target=""
            >
              <div className="absolute inset-0 flex flex-col justify-between p-3">
                <div className="z-10 flex items-start justify-between">
                  {footer.map.url ? (
                    <SmartLink
                      url={footer.map.url}
                      editAttribute={field('map', 'url')}
                      className="flex items-center gap-1 rounded bg-white/95 px-2 py-1 text-[11px] font-semibold text-blue-600 shadow"
                    >
                      {footer.map.buttonLabel}
                      <Icon name="external-link" size={12} />
                    </SmartLink>
                  ) : null}
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="jid-float rounded-full bg-jids-orange p-1 text-white shadow-lg">
                    <Icon name="pin" size={16} />
                  </div>
                  {footer.map.pinLabel ? (
                    <span
                      className="mt-1 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-gray-800 shadow"
                      data-sanity={field('map', 'pinLabel')}
                    >
                      {footer.map.pinLabel}
                    </span>
                  ) : null}
                </div>
                {footer.map.areaLabel ? (
                  <div
                    className="text-right text-[10px] text-gray-500"
                    data-sanity={field('map', 'areaLabel')}
                  >
                    {footer.map.areaLabel}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-green-900/80 pt-6 text-center text-xs text-green-200/80 sm:flex-row sm:text-left">
        <div data-sanity={field('copyrightText')}>{footer.copyrightText}</div>
        {footer.legalLinks?.length ? (
          <div className="flex items-center space-x-4">
            {footer.legalLinks.map((link) => (
              <SmartLink
                key={link._key}
                url={link.url}
                newTab={link.newTab}
                editAttribute={field('legalLinks', {_key: link._key})}
                className="jids-footer-link hover:text-white"
              >
                {link.label}
              </SmartLink>
            ))}
          </div>
        ) : null}
      </div>
    </footer>
  )
}
