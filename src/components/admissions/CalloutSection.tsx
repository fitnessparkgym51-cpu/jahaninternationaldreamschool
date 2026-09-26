import {stegaClean} from 'next-sanity'

import {Icon} from '@/components/ui/Icon'
import {Reveal} from '@/components/ui/Reveal'
import {ButtonLink} from '@/components/ui/SmartLink'
import {editTargetAttr, type EditField} from '@/lib/editing'
import type {CalloutSection as CalloutSectionData} from '@/sanity/types/home'

/** Panel colour pairs. The tone is editorial, the classes are code. */
const TONE_CLASSES: Record<string, string> = {
  green: 'border-jids-green-line bg-jids-green-tint',
  amber: 'border-amber-300 bg-amber-50',
  orange: 'border-orange-300 bg-orange-50',
}

type CalloutSectionProps = {
  section: CalloutSectionData
  editField: EditField
}

/**
 * A tinted, bordered notice panel — the referral offer on this page.
 *
 * Generic on purpose: the same component serves a fee warning, an important
 * date, or a sibling-discount notice on any other page.
 */
export function CalloutSection({section, editField}: CalloutSectionProps) {
  if (!section.heading) return null

  // `tone` is a lookup key, so it must be stega-cleaned.
  const tone = TONE_CLASSES[stegaClean(section.tone) ?? 'green'] ?? TONE_CLASSES.green

  return (
    <section className="bg-white px-4 py-8 sm:px-8" {...editTargetAttr}>
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <div
            className={`rounded-2xl border-2 p-8 text-center shadow-sm ${tone}`}
            data-sanity={editField('heading')}
          >
            <h3 className="mb-2 text-xl font-bold text-gray-900">{section.heading}</h3>

            {section.body ? (
              <p
                className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-gray-600"
                data-sanity={editField('body')}
              >
                {section.body}
              </p>
            ) : null}

            {section.button ? (
              <ButtonLink
                button={section.button}
                editAttribute={editField('button')}
                icon={section.buttonIcon ? <Icon name={section.buttonIcon} size={16} /> : null}
              />
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
