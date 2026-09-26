import {Icon} from '@/components/ui/Icon'
import {SmartLink} from '@/components/ui/SmartLink'
import {editAttribute} from '@/lib/editing'
import type {FloatingContact} from '@/sanity/types/home'

type FloatingContactProps = {
  /** `_id` of the Site settings singleton. */
  documentId: string
  floatingContact?: FloatingContact | null
}

/** Bottom-right floating chat button. */
export function FloatingContact({documentId, floatingContact}: FloatingContactProps) {
  if (!floatingContact || floatingContact.enabled === false || !floatingContact.url) return null

  const field = (name: string) =>
    editAttribute({id: documentId, type: 'siteSettings', path: ['floatingContact', name]})

  return (
    <div
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2"
      data-sanity={editAttribute({
        id: documentId,
        type: 'siteSettings',
        path: ['floatingContact'],
      })}
      data-sanity-edit-target=""
    >
      {floatingContact.bubbleLabel ? (
        <div
          className="hidden items-center rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-800 shadow-lg sm:flex"
          data-sanity={field('bubbleLabel')}
        >
          <span>{floatingContact.bubbleLabel}</span>
        </div>
      ) : null}
      <SmartLink
        url={floatingContact.url}
        aria-label={floatingContact.ariaLabel || floatingContact.bubbleLabel || 'Chat with us'}
        editAttribute={field('url')}
        className="jid-wa-ring flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] p-3 text-white shadow-2xl transition-transform hover:scale-110 hover:bg-[#20ba5a]"
      >
        <Icon name={floatingContact.icon ?? 'whatsapp'} size={28} />
      </SmartLink>
    </div>
  )
}
