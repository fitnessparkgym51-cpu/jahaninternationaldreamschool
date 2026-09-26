import {draftMode} from 'next/headers'
import {redirect} from 'next/navigation'

/**
 * Turns Draft Mode off and returns to published content.
 *
 * The Presentation Tool never calls this itself; it exists so an editor who
 * opened the preview in a normal browser tab (or a developer) has a way out.
 */
export async function GET() {
  const draft = await draftMode()
  draft.disable()
  redirect('/')
}
