'use client'

import {useIsPresentationTool} from 'next-sanity/hooks'

/**
 * "Leave preview" button for people who opened the draft preview in a normal
 * browser tab. Inside the Presentation Tool the Studio owns Draft Mode, so the
 * button is hidden there and the editor uses the Studio's own controls.
 */
export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool()

  if (isPresentationTool) return null

  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 left-4 z-[9999] rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg"
    >
      Leave preview
    </a>
  )
}
