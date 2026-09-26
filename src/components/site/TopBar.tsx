import {Icon} from '@/components/ui/Icon'
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
      className="border-b border-green-800 bg-jids-green-top px-4 py-2 text-xs font-medium text-white sm:px-8 sm:text-sm"
      {...editTargetAttr}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
        <div className="flex items-center space-x-6">
          {links.map((link) => (
            <SmartLink
              key={link._key}
              url={link.url}
              newTab={link.newTab}
              editAttribute={field('contactLinks', {_key: link._key})}
              className="flex items-center gap-1.5 transition-colors hover:text-green-200"
            >
              <Icon name={link.icon} size={16} className="text-[#25D366]" />
              <span>{link.label}</span>
            </SmartLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
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
              className="flex items-center gap-1 text-xs font-semibold hover:text-amber-300 sm:text-sm"
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
