import {Icon} from '@/components/ui/Icon'
import {LanguageToggle} from './LanguageToggle'
import {SmartLink} from '@/components/ui/SmartLink'
import {editAttribute, editTargetAttr, type PathStep} from '@/lib/editing'
import type {TopBar} from '@/sanity/types/home'

type TopBarProps = {
  /** `_id` of the Navigation singleton. */
  documentId: string
  topBar?: TopBar | null
}

/** The slim announcement strip above the header. */
export function TopBar({documentId, topBar}: TopBarProps) {
  if (!topBar || topBar.enabled === false) return null

  const links = topBar.contactLinks ?? []
  const field = (...rest: PathStep[]) =>
    editAttribute({id: documentId, type: 'navigation', path: ['topBar', ...rest]})

  return (
    <div
      className="border-b border-green-800 bg-jids-green-top px-3 py-1.5 text-[11px] font-medium text-white sm:px-8 sm:py-2 sm:text-sm"
      {...editTargetAttr}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 sm:gap-x-6">
          {links.map((link) => (
            <SmartLink
              key={link._key}
              url={link.url}
              newTab={link.newTab}
              editAttribute={field('contactLinks', {_key: link._key})}
              className="flex items-center gap-1 whitespace-nowrap transition-colors hover:text-green-200 sm:gap-1.5"
            >
              <Icon name={link.icon} size={14} className="shrink-0 text-[#25D366]" />
              <span>{link.label}</span>
            </SmartLink>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageToggle />
          {topBar.badge ? (
            <span
              className="hidden rounded-full border border-yellow-400/30 bg-yellow-400/20 px-2.5 py-0.5 text-xs font-semibold text-yellow-300 md:inline-block"
              data-sanity={field('badge')}
            >
              {topBar.badge}
            </span>
          ) : null}
          {topBar.notice?.label && topBar.notice.url ? (
            <SmartLink
              url={topBar.notice.url}
              newTab={topBar.notice.newTab}
              editAttribute={field('notice')}
              className="hidden items-center gap-1 text-xs font-semibold hover:text-amber-300 sm:flex sm:text-sm"
            >
              {topBar.notice.label}
              <span aria-hidden="true">→</span>
            </SmartLink>
          ) : null}
        </div>
      </div>
    </div>
  )
}
