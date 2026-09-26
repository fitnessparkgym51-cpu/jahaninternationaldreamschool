'use client'

import {useId, useState} from 'react'

/**
 * A question and its answer, with click-to-edit attributes already resolved.
 *
 * This is a plain-data view model on purpose. The accordion runs in the browser,
 * and a Server Component cannot pass a *function* across that boundary, so the
 * `data-sanity` strings are built on the server and handed over ready-made.
 * Keeping CMS path logic out of here also means this component is reusable on any
 * page without knowing anything about Sanity paths.
 */
export type FaqAccordionItem = {
  key: string
  question: string
  answer: string
  isOpenByDefault: boolean
  questionEditAttribute?: string
  answerEditAttribute?: string
}

type FaqAccordionProps = {
  items: FaqAccordionItem[]
}

/**
 * The question/answer accordion.
 *
 * This is the one part of the Admissions page that has to run in the browser: open
 * and closed state is behaviour, not content, so it lives in code (see
 * `AGENTS.md` Part 3). The words themselves come from Sanity.
 *
 * Behaviour matches the reference: a strict accordion, so opening one question
 * closes the others. Accessibility is slightly stronger than the reference — every
 * trigger is a real `<button>` carrying `aria-expanded` and `aria-controls`, and
 * each answer is a labelled region hidden with the `hidden` attribute rather than
 * a CSS class (which would leave the text in the accessibility tree and reachable
 * by keyboard while visually collapsed).
 */
export function FaqAccordion({items}: FaqAccordionProps) {
  const baseId = useId()
  const [openKey, setOpenKey] = useState<string | null>(
    items.find((item) => item.isOpenByDefault)?.key ?? null,
  )

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const panelId = `${baseId}-${item.key}`
        const isOpen = openKey === item.key

        return (
          <div
            key={item.key}
            className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm"
          >
            <h3>
              <button
                type="button"
                id={`${panelId}-trigger`}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenKey(isOpen ? null : item.key)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left text-sm font-bold text-gray-900 transition hover:bg-gray-50"
              >
                <span data-sanity={item.questionEditAttribute}>{item.question}</span>
                <span
                  className="text-xl font-medium leading-none text-jids-green"
                  aria-hidden="true"
                >
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={`${panelId}-trigger`}
              hidden={!isOpen}
              className="px-6 pb-4 text-xs leading-relaxed text-gray-600 sm:text-sm"
            >
              <p data-sanity={item.answerEditAttribute}>{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
